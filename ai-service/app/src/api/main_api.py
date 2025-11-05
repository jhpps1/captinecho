from datetime import datetime
from fastapi import FastAPI, APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.src.core.database import get_db, SessionLocal
from app.src.core.models import (
    Student, WeeklyPersonalReport, ErrorPattern,
    LearningSession, SessionDetail, LevelHistory, WeeklyJamoStat
)
from app.src.tasks.statistics.statistics import fill_reset_and_make_weekly_report

app = FastAPI()
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
    result['error_patterns'] = [to_dict(e) for e in db.query(ErrorPattern).filter_by(student_id=student_id).all()]
    result['learning_sessions'] = [to_dict(s) for s in db.query(LearningSession).filter_by(student_id=student_id).all()]
    result['session_details'] = [to_dict(sd) for sd in db.query(SessionDetail).join(
        LearningSession, SessionDetail.session_id == LearningSession.learning_session_id
    ).filter(LearningSession.student_id == student_id).all()]
    result['level_history'] = [to_dict(lh) for lh in db.query(LevelHistory).filter_by(student_id=student_id).all()]
    result['weekly_jamo_stats'] = [to_dict(wjs) for wjs in db.query(WeeklyJamoStat).order_by(WeeklyJamoStat.created_at.desc()).limit(3).all()]
    return result

# 2. CrewAI/외부 리포트 저장 및 갱신 API (POST /save-report)
class ReportRequest(BaseModel):
    curriculum: str
    discussion_log: str
    protector_goal: str = None
    error_rate: float = None
    improvement_rate: float = None

@router.post("/save-report")
def save_report(student_id: int, report: ReportRequest, db: Session = Depends(get_db)):
    latest = db.query(WeeklyPersonalReport).filter_by(student_id=student_id).order_by(WeeklyPersonalReport.created_at.desc()).first()
    if latest:
        fields = ["curriculum", "discussion_log", "protector_goal", "error_rate", "improvement_rate"]
        for field in fields:
            value = getattr(report, field)
            if value is not None:
                setattr(latest, field, value)
        db.commit()
        db.refresh(latest)
        return {"status": "updated", "report_id": latest.report_id}
    new_report = WeeklyPersonalReport(
        student_id=student_id,
        total_time=0,
        error_rate=report.error_rate if report.error_rate is not None else 0.0,
        improvement_rate=report.improvement_rate if report.improvement_rate is not None else 0.0,
        curriculum=report.curriculum,
        discussion_log=report.discussion_log,
        protector_goal=report.protector_goal,
        created_at=datetime.now()
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return {"status": "created", "report_id": new_report.report_id}

# 3. 리포트 직접 update API (리포트ID 기반)
class ReportUpdateRequest(BaseModel):
    curriculum: str = None
    discussion_log: str = None
    protector_goal: str = None
    error_rate: float = None
    improvement_rate: float = None

@router.put("/update-report/{report_id}")
def update_report(report_id: int, report: ReportUpdateRequest, db: Session = Depends(get_db)):
    target = db.query(WeeklyPersonalReport).filter_by(report_id=report_id).first()
    if not target:
        return {"error": "리포트 없음"}
    fields = ["curriculum", "discussion_log", "protector_goal", "error_rate", "improvement_rate"]
    for field in fields:
        value = getattr(report, field)
        if value is not None:
            setattr(target, field, value)
    db.commit()
    db.refresh(target)
    return {"status": "updated", "report_id": target.report_id}

# 4. 주간 자모통계 자동 생성 엔드포인트
@router.post("/weekly-report/generate/")
def generate_weekly_report(db: Session = Depends(get_db)):
    """
    금주의 자모통계 -> 주간 자모통계 테이블로 복사 후 금주의 자모통계 초기화
    """
    result = fill_reset_and_make_weekly_report(db)
    return result

app.include_router(router)