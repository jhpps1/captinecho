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
from app.src.tasks.statistics.statistics import fill_reset_and_make_weekly_report
from app.src.utils.hangul import decompose_word
from app.src.utils.llm import llm
from app.src.utils.normalization import normalize_blank_position
from app.src.core.config import settings
from app.src.api.gemini_api import generate_image_with_gemini_flash

router = APIRouter()

def to_dict(obj):
    return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}

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

        if real_jamo_list:
            jamo_counter = Counter(real_jamo_list)
            most_common = jamo_counter.most_common(2)
            real_jamo = most_common[0][0] if len(most_common) > 0 else "ㄱ"
            confusion_jamo = most_common[1][0] if len(most_common) > 1 else "ㄴ"
        else:
            real_jamo = "ㄱ"
            confusion_jamo = "ㄴ"

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

        # 사람이 읽을 curriculum 텍스트 생성
        curriculum_text = f"""
======================== 협의 대화 ========================
"""
        for msg in dialogue:
            curriculum_text += f"{msg.get('role', '참여자')}: {msg.get('message', '')}\n"

        curriculum_text += f"""
================= 협의 요약 ======================
{discussion_summary}

================= 주간 커리큘럼 구조 ======================
"""
        for day, adventures in curriculum_structure.items():
            curriculum_text += f"{day}: {adventures}\n"

        # 11. DB 저장 (Manager 생성 dialogue 사용)
        if latest_report:
            latest_report.curriculum = curriculum_text
            latest_report.discussion_log = dialogue  # Manager가 생성한 A2A 대화 로그 저장
            latest_report.curriculum_structure = curriculum_structure  # JSON (dict)
            db.commit()
            db.refresh(latest_report)
            report_id = latest_report.report_id
        else:
            new_report = WeeklyPersonalReport(
                student_id=student_id,
                curriculum=curriculum_text,
                discussion_log=dialogue,  # Manager가 생성한 A2A 대화 로그 저장
                curriculum_structure=curriculum_structure,
                protector_goal=ProtectorGoalType.FOCUS_ON_WEAKNESS,
                created_at=datetime.now()
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


# 6. 문제 생성 엔드포인트
@router.post("/problems/generate/{student_id}")
def generate_problems(student_id: int, db: Session = Depends(get_db)):
    """
    커리큘럼 기반으로 주간 문제 생성 (월~금, 하루 10문제)
    """
    # 1. 학생 및 커리큘럼 조회
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        return {"error": "학생을 찾을 수 없습니다"}

    latest_report = db.query(WeeklyPersonalReport).filter_by(student_id=student_id).order_by(
        WeeklyPersonalReport.created_at.desc()
    ).first()

    if not latest_report or not latest_report.curriculum_structure:
        return {"error": "커리큘럼이 없습니다. 먼저 커리큘럼을 생성해주세요."}

    # 2. curriculum_structure JSON 직접 읽기 (파싱 불필요)
    curriculum_structure = latest_report.curriculum_structure

    if not curriculum_structure or not isinstance(curriculum_structure, dict):
        return {"error": "커리큘럼 구조가 올바르지 않습니다."}

    # 3. 학생 관심사 조회
    student_interests = db.query(StudentInterest).filter_by(student_id=student_id).all()
    if not student_interests:
        return {"error": "학생 관심사가 없습니다. 관심사를 먼저 설정해주세요."}

    interest_ids = [si.interest_id for si in student_interests if si.interest_id]
    if not interest_ids:
        return {"error": "학생에게 등록된 관심사가 없습니다."}

    interests_info = db.query(SubInterest).filter(SubInterest.sub_interest_id.in_(interest_ids)).all()
    interest_names = [i.small_interest_name for i in interests_info]

    # 4. 다음 주 월요일부터 금요일까지 날짜 계산
    today = datetime.now().date()
    days_until_monday = (7 - today.weekday()) % 7
    if days_until_monday == 0:
        days_until_monday = 7  # 오늘이 월요일이면 다음 주 월요일

    next_monday = today + timedelta(days=days_until_monday)
    week_dates = [next_monday + timedelta(days=i) for i in range(5)]  # 월~금

    # 5. 문제 생성
    generated_problems = []
    interest_idx = 0  # 관심사 로테이션 인덱스

    for day_idx, (day_name, adventures) in enumerate(curriculum_structure.items()):
        assigned_date = week_dates[day_idx]
        seq_no = 1

        for adventure_info in adventures:
            adventure_type_id = adventure_info['type_id']
            problem_count = adventure_info['count']

            # OpenAI로 문제 생성
            problems = generate_problems_with_openai(
                student_level=student.level or 1,
                adventure_type_id=adventure_type_id,
                problem_count=problem_count,
                interest_names=interest_names,
                student_name=student.name
            )

            # DB 저장
            for problem_data in problems:
                interest_id = interest_ids[interest_idx % len(interest_ids)]
                interest_idx += 1

                # problem_phonemes 변환 (2D → 1D 평탄화)
                problem_phonemes_2d = decompose_word(problem_data['problem_text'])
                problem_phonemes = [phoneme for syllable in problem_phonemes_2d for phoneme in syllable]

                # [필수] blank_position 정규화 (소문자 → 대문자, 숫자 → 문자열 변환)
                blank_pos = normalize_blank_position(
                    problem_data.get('blank_position'),
                    adventure_type_id=adventure_type_id
                )
                print(f"[DEBUG] blank_position 정규화 결과: {blank_pos}")  # DEBUG

                # [이미지 생성] 탐험 2, 3일 경우 Gemini API 호출
                generated_image_url = ""
                if adventure_type_id in [2, 3] and problem_data.get('problem_text'):
                    problem_text = problem_data['problem_text']
                    print(f"[IMAGE] Gemini API call started: '{problem_text}'")

                    if settings.GEMINI_API_KEY:
                        try:
                            generated_image_url = generate_image_with_gemini_flash(problem_text, settings.GEMINI_API_KEY)
                            if generated_image_url:
                                print(f"[IMAGE] Success! URL: {generated_image_url}")
                            else:
                                print(f"[IMAGE] Failed! Empty URL returned")
                        except Exception as e:
                            # CP949 encoding 에러 방지: 예외 메시지를 ASCII로 변환
                            error_msg = str(e).encode('ascii', errors='replace').decode('ascii')
                            print(f"[IMAGE] Error occurred: {error_msg}")
                            generated_image_url = ""
                    else:
                        print("[IMAGE] GEMINI_API_KEY is not set")

                day_problem = DayProblem(
                    student_id=student_id,
                    interest_id=interest_id,
                    adventure_type_id=adventure_type_id,
                    assigned_date=assigned_date,
                    seq_no=seq_no,
                    level=student.level or 1,
                    problem_text=problem_data['problem_text'],
                    image_url=generated_image_url or problem_data.get('image_url') or "",
                    sound_url=problem_data.get('sound_url'),
                    problem_phonemes=problem_phonemes,
                    blank_position=blank_pos,
                    blank_phoneme=problem_data.get('blank_phoneme'),
                    choices=problem_data.get('choices'),
                    correct_answer=problem_data.get('correct_answer'),
                    created_at=datetime.now(),
                    is_completed=False
                )

                db.add(day_problem)
                generated_problems.append({
                    "date": str(assigned_date),
                    "seq_no": seq_no,
                    "adventure_type": adventure_type_id,
                    "problem": problem_data['problem_text']
                })
                seq_no += 1

    db.commit()

    return {
        "status": "success",
        "student_id": student_id,
        "generated_count": len(generated_problems),
        "week_dates": [str(d) for d in week_dates],
        "problems": generated_problems
    }


def generate_problems_with_openai(
    student_level: int,
    adventure_type_id: int,
    problem_count: int,
    interest_names: list,
    student_name: str
) -> list:
    """
    OpenAI를 사용해 탐험 유형별 문제 생성
    """
    adventure_descriptions = {
        1: "자모(음소) 맞추기 - 한 음절 단어 제시, 회색 표시된 음소를 선택지 3개 중에서 선택",
        2: "빈칸 맞추기 - 이미지와 단어 제시, 빠진 음소를 선택지 3개 중에서 선택",
        3: "단어 맞추기 - 이미지만 제시, 알맞은 단어를 선택지 3개 중에서 선택",
        4: "단어 읽기 - 단어 제시, 마이크로 발음하여 STT로 정확도 평가"
    }

    # 관심사 문자열 생성
    interests_str = ", ".join(interest_names)

    prompt = f"""당신은 난독증 어린이를 위한 학습 문제를 생성하는 전문가입니다.

학생 정보:
- 이름: {student_name}
- 레벨: {student_level}
- 관심사: {interests_str}

문제 유형: {adventure_descriptions[adventure_type_id]}
생성할 문제 수: {problem_count}개

요구사항:
1. 학생의 관심사를 활용하여 흥미로운 단어/문장 선택
2. 레벨에 맞는 난이도 (레벨이 낮을수록 쉬운 단어)
3. 각 문제는 JSON 형식으로 반환

**중요: blank_position 필드 규칙 (반드시 준수!)**
- 탐험1, 탐험2: blank_position은 반드시 대문자 문자열만 사용
  - 허용: "INITIAL", "MEDIAL", "FINAL" (대문자만!)
  - 금지: "initial", "medial", "final" (소문자 절대 금지!)
  - 금지: 0, 1, 2, 3 (숫자 절대 금지!)
- 탐험3, 탐험4: blank_position 필드를 JSON에 포함하지 마세요 (null도 포함하지 말 것)

JSON 형식 (탐험 유형별):

탐험1 (자모 맞추기):
{{
  "problem_text": "사과",
  "blank_position": "MEDIAL",
  "blank_phoneme": "ㄱ",
  "choices": ["ㄱ", "ㄴ", "ㄷ"]
}}

탐험2 (빈칸 맞추기):
{{
  "problem_text": "사과",
  "image_url": "apple.jpg",
  "blank_position": "MEDIAL",
  "blank_phoneme": "과",
  "choices": ["과", "가", "놔"]
}}

탐험3 (단어 맞추기):
{{
  "problem_text": "사과",
  "image_url": "apple.jpg",
  "choices": ["사과", "수박", "포도"],
  "correct_answer": "사과"
}}

탐험4 (단어 읽기):
{{
  "problem_text": "강아지"
}}

반드시 JSON 배열로 {problem_count}개 문제를 반환하세요. 다른 설명 없이 JSON만 반환하세요."""

    try:
        response = llm.call(prompt)
        # CrewAI LLM.call()은 문자열을 직접 반환합니다
        content = response.strip() if isinstance(response, str) else str(response).strip()

        # JSON 추출 (```json ... ``` 형태로 올 수 있음)
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        problems = json.loads(content)

        return problems if isinstance(problems, list) else [problems]

    except Exception as e:
        # 에러 발생 시 기본 문제 반환
        print(f"OpenAI 문제 생성 실패: {e}")
        return generate_fallback_problems(adventure_type_id, problem_count)


def generate_fallback_problems(adventure_type_id: int, problem_count: int) -> list:
    """
    OpenAI 실패 시 기본 문제 생성
    """
    fallback_data = {
        1: [  # 자모(음소) 맞추기
            {"problem_text": "사과", "blank_position": "MEDIAL", "blank_phoneme": "ㄱ", "choices": ["ㄱ", "ㄴ", "ㄷ"]},
            {"problem_text": "고양이", "blank_position": "INITIAL", "blank_phoneme": "ㄱ", "choices": ["ㄱ", "ㄴ", "ㄷ"]},
            {"problem_text": "토끼", "blank_position": "INITIAL", "blank_phoneme": "ㅌ", "choices": ["ㅌ", "ㄷ", "ㅈ"]},
        ],
        2: [  # 빈칸 맞추기
            {"problem_text": "사과", "image_url": "apple.jpg", "blank_position": "MEDIAL", "blank_phoneme": "ㅘ", "choices": ["ㅘ", "ㅏ", "ㅗ"]},
            {"problem_text": "나무", "image_url": "tree.jpg", "blank_position": "INITIAL", "blank_phoneme": "ㄴ", "choices": ["ㄴ", "ㄷ", "ㅁ"]},
            {"problem_text": "별", "image_url": "star.jpg", "blank_position": "FINAL", "blank_phoneme": "ㄹ", "choices": ["ㄹ", "ㅁ", "ㄴ"]},
        ],
        3: [  # 단어 맞추기
            {"problem_text": "사과", "image_url": "apple.jpg", "choices": ["사과", "수박", "포도"], "correct_answer": "사과"},
            {"problem_text": "바다", "image_url": "sea.jpg", "choices": ["바다", "산", "강"], "correct_answer": "바다"},
            {"problem_text": "하늘", "image_url": "sky.jpg", "choices": ["하늘", "땅", "구름"], "correct_answer": "하늘"},
        ],
        4: [  # 단어 읽기
            {"problem_text": "강아지"},
            {"problem_text": "고양이"},
            {"problem_text": "토끼"},
        ]
    }

    base_problems = fallback_data.get(adventure_type_id, fallback_data[1])
    result = []

    for i in range(problem_count):
        result.append(base_problems[i % len(base_problems)])

    return result

