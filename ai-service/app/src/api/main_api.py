# app/src/api/main_api.py


from datetime import datetime
from fastapi import APIRouter, Depends, FastAPI
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.src.core.database import get_db
from app.src.core.models import (
    Student, WeeklyPersonalReport, ErrorPattern,
    LearningSession, SessionDetail, LevelHistory, WeeklyJamoStat,
    StudentInterest, SubInterest
)
from app.src.tasks.statistics.statistics import fill_reset_and_make_weekly_report
from app.src.service.question_service import generate_problems_for_one_week
from app.src.api.scheduler.batch_scheduler import start_scheduler

start_scheduler()

router = APIRouter()

def to_dict(obj):
    return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}

# 1. 학생ID로 모든 데이터 조회
@router.get("/student-full/{student_id}")
def get_student_full(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        return {"error": "학생 정보 없음"}
    result = to_dict(student)

    result['weekly_personal_reports'] = [to_dict(r) for r in db.query(WeeklyPersonalReport).filter_by(student_id=student_id).all()]
    result['error_patterns'] = [to_dict(e) for e in db.query(ErrorPattern).filter_by(student_id=student_id).all()]
    result['learning_sessions'] = [to_dict(s) for s in db.query(LearningSession).filter_by(student_id=student_id).all()]
    result['session_details'] = [to_dict(sd) for sd in db.query(SessionDetail).join(
        LearningSession, SessionDetail.session_id == LearningSession.learning_session_id
    ).filter(LearningSession.student_id == student_id).all()]
    result['level_history'] = [to_dict(lh) for lh in db.query(LevelHistory).filter_by(student_id=student_id).all()]
    result['weekly_jamo_stats'] = [to_dict(wjs) for wjs in db.query(WeeklyJamoStat).order_by(WeeklyJamoStat.created_at.desc()).limit(3).all()]

    # 🔽 관심사 및 소분류명 함께 반환
    student_interests = db.query(StudentInterest, SubInterest) \
        .join(SubInterest, StudentInterest.interest_id == SubInterest.sub_interest_id) \
        .filter(StudentInterest.student_id == student_id) \
        .all()
    result['student_interests'] = [
        {
            **to_dict(si),
            'small_interest_name': sub.small_interest_name
        }
        for si, sub in student_interests
    ]

    return result

# 2. CrewAI/외부 리포트 저장 및 갱신 API
class ReportRequest(BaseModel):
    curriculum: str
    discussion_log: str

@router.post("/save-report")
def save_report(student_id: int, report: ReportRequest, db: Session = Depends(get_db)):
    latest = db.query(WeeklyPersonalReport).filter_by(student_id=student_id).order_by(WeeklyPersonalReport.created_at.desc()).first()
    if not latest:
        # 신규 생성
        latest = WeeklyPersonalReport(
            student_id=student_id,
            curriculum=report.curriculum,
            discussion_log=report.discussion_log,
            created_at=datetime.utcnow()
        )
        db.add(latest)
        db.commit()
        db.refresh(latest)
        return {"status": "created", "report_id": latest.report_id}

    # 갱신
    latest.curriculum = report.curriculum
    latest.discussion_log = report.discussion_log
    db.commit()
    db.refresh(latest)
    return {"status": "updated", "report_id": latest.report_id}

# 3. 주간 자모통계 자동 생성 엔드포인트
@router.post("/weekly-report/generate/")
def generate_weekly_report(db: Session = Depends(get_db)):
    result = fill_reset_and_make_weekly_report(db)
    return result

# 4. DayProblem 문제 자동생성 API(LLM)
@router.post("/problems/generate/{student_id}")
def generate_problems(student_id: int, db: Session = Depends(get_db)):
    result = generate_problems_for_one_week(db, student_id)
    if result is None:
        return {"success": False, "message": "커리큘럼을 찾지 못했어요."}
    return {"success": True, "message": "문제 자동 생성 완료!"}

# === FastAPI 앱 선언 및 라우터 등록 ===
app = FastAPI()
app.include_router(router)
