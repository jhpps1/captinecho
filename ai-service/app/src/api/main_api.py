# app/src/api/main_api.py

import sys
import argparse
from datetime import datetime

from fastapi import FastAPI, APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

# DB 관련 임포트
from app.src.core.database import get_db, SessionLocal
from app.src.core.models import (
    Student, WeeklyPersonalReport, ErrorPattern,
    LearningSession, SessionDetail, LevelHistory, WeekelyJamoStat
)

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

    # 연결된 테이블 데이터도 몽땅 dict로 반환
    result['weekly_personal_reports'] = [to_dict(r) for r in db.query(WeeklyPersonalReport).filter_by(student_id=student_id).all()]
    result['error_patterns'] = [to_dict(e) for e in db.query(ErrorPattern).filter_by(student_id=student_id).all()]
    result['learning_sessions'] = [to_dict(s) for s in db.query(LearningSession).filter_by(student_id=student_id).all()]
    result['session_details'] = [to_dict(sd) for sd in db.query(SessionDetail).join(
        LearningSession, SessionDetail.session_id == LearningSession.learning_session_id
    ).filter(LearningSession.student_id == student_id).all()]
    result['level_history'] = [to_dict(lh) for lh in db.query(LevelHistory).filter_by(student_id=student_id).all()]
    # WeekelyJamoStat: 학생 기준 매핑 없으면 최근 것만
    result['weekely_jamo_stats'] = [to_dict(wjs) for wjs in db.query(WeekelyJamoStat).order_by(WeekelyJamoStat.created_at.desc()).limit(3).all()]
    return result

# 2. CrewAI 분석 결과 또는 외부 분석결과를 리포트로 저장 API (POST /save-report)
class ReportRequest(BaseModel):
    curriculum: str
    discussion_log: str
    protector_goal: str = None  # Optional

@router.post("/save-report")
def save_report(student_id: int, report: ReportRequest, db: Session = Depends(get_db)):
    # 최신 리포트 가져오기
    latest = db.query(WeeklyPersonalReport).filter_by(student_id=student_id).order_by(WeeklyPersonalReport.created_at.desc()).first()
    updated = False
    if latest:
        # 필드가 비어 있으면 값 채움
        if not latest.curriculum or latest.curriculum.strip() == '':
            latest.curriculum = report.curriculum
            updated = True
        if not latest.discussion_log or latest.discussion_log.strip() == '':
            latest.discussion_log = report.discussion_log
            updated = True
        if updated:
            db.commit()
            db.refresh(latest)
        return {"status": "updated", "report_id": latest.report_id}
    # 없으면 새로 생성
    new_report = WeeklyPersonalReport(
        student_id=student_id,
        total_time=0,
        error_rate=0.0,
        improvement_rate=0.0,
        curriculum=report.curriculum,
        discussion_log=report.discussion_log,
        protector_goal=report.protector_goal,
        created_at=datetime.now()
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return {"status": "created", "report_id": new_report.report_id}

# 3. 리포트 직접 저장/수정용 API (리포트ID로)
class ReportUpdateRequest(BaseModel):
    curriculum: str = None
    discussion_log: str = None
    protector_goal: str = None

@router.put("/update-report/{report_id}")
def update_report(report_id: int, report: ReportUpdateRequest, db: Session = Depends(get_db)):
    target = db.query(WeeklyPersonalReport).filter_by(report_id=report_id).first()
    if not target:
        return {"error": "리포트 없음"}
    if report.curriculum is not None:
        target.curriculum = report.curriculum
    if report.discussion_log is not None:
        target.discussion_log = report.discussion_log
    if report.protector_goal is not None:
        target.protector_goal = report.protector_goal
    db.commit()
    db.refresh(target)
    return {"status": "updated", "report_id": target.report_id}

app.include_router(router)
