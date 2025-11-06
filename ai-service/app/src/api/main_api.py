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

