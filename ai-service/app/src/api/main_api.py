import re
import json
import os
from datetime import datetime, timedelta
from fastapi import FastAPI, APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.src.core.database import get_db, SessionLocal
from app.src.core.models import (
    Student, WeeklyPersonalReport, ErrorPattern,
    LearningSession, LevelHistory, WeeklyJamoStat,
    DayProblem, AdventureType, SubInterest, StudentInterest
)
from app.src.tasks.statistics.statistics import fill_reset_and_make_weekly_report, get_week_boundary, calculate_weekly_total_time
from app.src.utils.hangul import decompose_word
from app.src.utils.llm import llm
from app.src.utils.normalization import normalize_blank_position
from app.src.core.config import settings
from app.src.api.gemini_api import generate_image_with_gemini_flash
from app.src.service.question_service import generate_problems_for_one_week

router = APIRouter()

def to_dict(obj):
    return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}

# [여기에 함수와 role_map 추가]
role_map = {
    "Manager": "매니저",
    "난독증 치료 전문가": "난독증 치료 전문가",
    "아동 심리 전문가": "아동 심리 전문가",
    "학부모 대리인": "학부모 대리인",
    "치료사": "난독증 치료 전문가",
    "심리코치": "아동 심리 전문가",
    "부모": "학부모 대리인",
}
# 1. 파일 상단의 함수 수정 (유니코드 이스케이프를 한글로 변환)
import ast

def decode_dialogue_list_for_db_v2(dialogue: list) -> list:
    """discussion_log의 유니코드 이스케이프를 한글로 변환한 리스트를 반환합니다. (DB 저장용)"""
    decoded_dialogue = []
    for msg in dialogue:
        new_msg = msg.copy()
        raw_message = new_msg.get("message", "")
        
        # 유니코드 이스케이프 시퀀스를 한글로 변환
        try:
            # 문자열을 파이썬 리터럴로 평가하여 올바르게 디코딩
            # ast.literal_eval은 문자열을 평가할 때 \uXXXX 시퀀스를 실제 문자로 변환합니다.
            message = ast.literal_eval(f"'{raw_message}'")
        except Exception:
            # ast.literal_eval이 실패하는 경우 (예: 큰따옴표가 포함된 경우 등)
            # 기존의 encode/decode 방식 사용
            try:
                message_bytes = raw_message.encode('latin1')
                message = message_bytes.decode('unicode_escape')
            except Exception:
                message = raw_message  # 최종 실패 시 원본 사용

        new_msg["message"] = message  # 디코딩된 한글 메시지 저장
        decoded_dialogue.append(new_msg)
        
    return decoded_dialogue


# 1. 학생ID로 모든 데이터 조회(API)
@router.get("/student-full/{student_id}")
def get_student_full(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        return {"error": "학생 정보 없음"}
    result = to_dict(student)
    result['weekly_personal_reports'] = [to_dict(r) for r in db.query(WeeklyPersonalReport).filter_by(student_id=student_id).all()]
    # error_patterns는 session을 통해 조회 (ERD 2.3에서 student_id FK 없음)
    result['error_patterns'] = [to_dict(e) for e in db.query(ErrorPattern).join(
        LearningSession, ErrorPattern.session_id == LearningSession.session_id
    ).filter(LearningSession.student_id == student_id).all()]
    result['learning_sessions'] = [to_dict(s) for s in db.query(LearningSession).filter_by(student_id=student_id).all()]
    result['level_history'] = [to_dict(lh) for lh in db.query(LevelHistory).filter_by(student_id=student_id).all()]
    result['weekly_jamo_stats'] = [to_dict(wjs) for wjs in db.query(WeeklyJamoStat).order_by(WeeklyJamoStat.created_at.desc()).limit(3).all()]
    return result



# 2. CrewAI/외부 리포트 저장 및 갱신 API (POST /save-report)
class ReportRequest(BaseModel):
    curriculum: str
    discussion_log: str


@router.post("/save-report")
def save_report(student_id: int, report: ReportRequest, db: Session = Depends(get_db)):
    latest = db.query(WeeklyPersonalReport).filter_by(student_id=student_id).order_by(WeeklyPersonalReport.created_at.desc()).first()
    if not latest:
        return {"error": "리포트가 없습니다. 먼저 리포트를 생성해주세요."}
    
    latest.curriculum = report.curriculum
    latest.discussion_log = report.discussion_log
    db.commit()
    db.refresh(latest)
    return {"status": "updated", "report_id": latest.report_id}


# 4. 주간 자모통계 자동 생성 엔드포인트
@router.post("/weekly-report/generate/")
def generate_weekly_report(db: Session = Depends(get_db)):
    """
    금주의 자모통계 -> 주간 자모통계 테이블로 복사 후 금주의 자모통계 초기화
    """
    result = fill_reset_and_make_weekly_report(db)
    return result


# 5. Hierarchical CrewAI 커리큘럼 생성 엔드포인트 (완전 재작성)
@router.post("/curriculum/generate/{student_id}")
def generate_curriculum(student_id: int, db: Session = Depends(get_db)):
    """
    Hierarchical CrewAI로 Manager + 3 Agents가 진짜 협상하여 커리큘럼 생성
    레벨 평가, curriculum_structure JSONB 저장
    """
    import time
    from app.src.crew import build_hierarchical_crew
    from app.src.core.models import JamoStat, ErrorPattern, ProtectorGoalType
    from app.src.utils.level_evaluator import update_student_level
    from collections import Counter

    try:
        # 1. 학생 데이터 조회
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            return {"error": "학생을 찾을 수 없습니다", "status": "failed"}

        # 2. 최신 주간 리포트 조회
        latest_report = db.query(WeeklyPersonalReport).filter_by(student_id=student_id).order_by(
            WeeklyPersonalReport.created_at.desc()
        ).first()

        # 3. 자모 통계 조회 (평균 정확도/실패율)
        jamo_stats = db.query(JamoStat).filter_by(student_id=student_id).all()
        if jamo_stats:
            avg_accuracy = sum(j.weekly_accuracy_rate or 0 for j in jamo_stats) / len(jamo_stats)
            avg_fail = sum(j.weekly_fail_rate or 0 for j in jamo_stats) / len(jamo_stats)
        else:
            avg_accuracy = 0.0
            avg_fail = 0.0

        # 4. 오류 패턴 분석 (가장 많이 틀린 자모)
        error_patterns = db.query(ErrorPattern).join(
            LearningSession, ErrorPattern.session_id == LearningSession.session_id
        ).filter(LearningSession.student_id == student_id).all()

        real_jamo_list = [e.real_jamo for e in error_patterns if e.real_jamo]
        confusion_jamo_list = [e.confusion_jamo for e in error_patterns if e.confusion_jamo]

        if real_jamo_list:
            jamo_counter = Counter(real_jamo_list)
            most_common = jamo_counter.most_common(2)
            real_jamo = most_common[0][0] if len(most_common) > 0 else "ㄱ"

        else:
            real_jamo = "ㄱ"

        if confusion_jamo_list:
            confusion_jamo_counter = Counter(confusion_jamo_list)
            most_confusion = confusion_jamo_counter.most_common(1)
            confusion_jamo = most_confusion[0][0] if most_confusion else 'ㄴ'
        else:
            confusion_jamo = 'ㄴ'

        # 5. Student Interest 조회 (JOIN)
        student_interests = db.query(StudentInterest).filter_by(student_id=student_id).all()
        interest_ids = [si.interest_id for si in student_interests if si.interest_id]

        if interest_ids:
            interests_info = db.query(SubInterest).filter(SubInterest.sub_interest_id.in_(interest_ids)).all()
            interest_names = [i.small_interest_name for i in interests_info]
            interest_name_str = ", ".join(interest_names) if interest_names else "동물"
        else:
            interest_name_str = "동물"

        # 6. student_data 구성
        student_data = {
            "student_id": student_id,
            "name": student.name,
            "level": student.level or 1,
            "protector_goal": latest_report.protector_goal.value if latest_report and latest_report.protector_goal else "FOCUS_ON_WEAKNESS",
            "small_interest_name": interest_name_str,
            "real_jamo": real_jamo,
            "confusion_jamo": confusion_jamo,
            "weekly_accuracy_rate": avg_accuracy,
            "weekly_fail_rate": avg_fail 
        }

        # 7. Hierarchical CrewAI 실행
        start_time = time.time()
        crew = build_hierarchical_crew(student_data)
        result = crew.kickoff(inputs=student_data)
        elapsed_time = time.time() - start_time

        # 8. JSON 파싱
        result_str = str(result.raw if hasattr(result, 'raw') else result)

        # JSON 추출 시도
        try:
            curriculum_output = json.loads(result_str)
        except json.JSONDecodeError:
            # LLM이 JSON 외 텍스트를 포함했을 경우 추출 시도
            json_match = re.search(r'\{.*\}', result_str, re.DOTALL)
            if json_match:
                curriculum_output = json.loads(json_match.group(0))
            else:
                return {"error": "JSON 파싱 실패", "raw_output": result_str[:500], "status": "failed"}

        # 9. 레벨 조정 (있으면)
        level_changed = False
        if curriculum_output.get("level_adjustment"):
            level_adj = curriculum_output["level_adjustment"]
            new_level = level_adj.get("new_level")
            current_level = level_adj.get("current_level")
            reason = level_adj.get("reason", "CrewAI 추천")

            if new_level != current_level:
                success = update_student_level(db, student_id, new_level, reason)
                if success:
                    level_changed = True

        # 10. curriculum_structure, discussion_log, curriculum 저장
        dialogue = curriculum_output.get("dialogue", [])
        discussion_summary = curriculum_output.get("discussion_summary", "")
        curriculum_structure = curriculum_output.get("curriculum_structure", {})

        # Manager가 생성한 dialogue가 비어있으면 기본 메시지 추가
        if not dialogue:
            dialogue = [{
                "role": "매니저",
                "message": "전문가들과 협의하여 최적의 커리큘럼을 설계했습니다.",
                "timestamp": datetime.now().isoformat()
            }]

        curriculum_text = discussion_summary

        # 11. DB 저장 (Manager 생성 dialogue 사용)
        if latest_report:
            latest_report.curriculum = curriculum_text
            latest_report.discussion_log = dialogue  # Manager가 생성한 A2A 대화 로그 저장
            latest_report.curriculum_structure = curriculum_structure  # JSON (dict)
            db.commit()
            db.refresh(latest_report)
            report_id = latest_report.report_id
        else:
            now = datetime.now()
            week_start, week_end = get_week_boundary(now)
            total_time = calculate_weekly_total_time(db, student_id, week_start, week_end)
            
            new_report = WeeklyPersonalReport(
                student_id=student_id,
                curriculum=curriculum_text,
                discussion_log=dialogue,  # Manager가 생성한 A2A 대화 로그 저장
                curriculum_structure=curriculum_structure,
                protector_goal=ProtectorGoalType.FOCUS_ON_WEAKNESS,
                created_at=now,
                total_time=total_time
            )
            db.add(new_report)
            db.commit()
            db.refresh(new_report)
            report_id = new_report.report_id

        return {
            "status": "success",
            "student_id": student_id,
            "report_id": report_id,
            "elapsed_time": f"{elapsed_time:.2f}초",
            "level_changed": level_changed,
            "level_adjustment": curriculum_output.get("level_adjustment"),
            "curriculum_structure": curriculum_structure,
            "dialogue_count": len(dialogue),  # Manager 생성 A2A 대화 개수
            "student_data": student_data
        }

    except Exception as e:
        db.rollback()
        return {"error": str(e), "status": "failed"}


from app.src.service.question_service import generate_problems_for_one_week, generate_problems_from_signup

@router.post("/problems/generate/{student_id}")
def generate_problems(student_id: int, db: Session = Depends(get_db)):
    """
    커리큘럼 기반으로 주간 문제 생성 (월~금, 하루 10문제)
    신규 가입 학생은 가입 요일부터 금요일까지(평일만) 예외적으로 문제 생성
    기존 학생은 월~금 전체
    """
    try:
        # 1. 학생 객체 조회 (가입일 필요)
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            return {"status": "failed", "student_id": student_id, "generated_count": 0, "week_dates": [], "problems": [], "error": "학생 정보 없음"}

        # 2. 가입일 기준 이번주 판단
        signup_date = student.created_at.date() if student.created_at else datetime.now().date()
        today = datetime.now().date()
        week_start = today - timedelta(days=today.weekday())  # 이번주 월요일
        week_end = week_start + timedelta(days=4)  # 이번주 금요일

        # 3. 만약 가입일이 이번주에 속하면 "가입일~금요일"만 생성
        if week_start <= signup_date <= week_end:
            # 신규 가입 주 = 예외 처리 함수로 문제 생성
            result = generate_problems_from_signup(db, student_id, signup_date)
        else:
            # 기존 학생 = 전체 주 문제 생성
            result = generate_problems_for_one_week(db, student_id)

        if "error" in result:
            return {
                "status": "failed",
                "student_id": student_id,
                "generated_count": 0,
                "week_dates": [],
                "problems": [],
                "error": result["error"]
            }

        return {
            "status": "success",
            "student_id": student_id,
            "generated_count": result.get("generated_count", 0),
            "week_dates": result.get("week_dates", []),
            "problems": result.get("problems", [])
        }

    except Exception as e:
        db.rollback()
        return {"error": str(e), "status": "failed", "generated_count": 0}
