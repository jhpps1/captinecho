# app/src/core/batch_core.py

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.src.core.models import (
    WeeklyJamoStat,
    JamoStat,
    WeeklyPersonalReport,
    ProtectorGoalType,
    LearningSession
)

def get_week_boundary(now=None):
    if not now:
        now = datetime.now()
    start = now - timedelta(days=now.weekday())  # 월요일 시작
    end = start + timedelta(days=7)              # 다음주 월요일 0시
    return start, end

def calculate_weekly_total_time(db: Session, student_id, week_start, week_end):
    sessions = db.query(LearningSession).filter(
        LearningSession.student_id == student_id,
        LearningSession.started_at < week_end,
        LearningSession.ended_at != None
    ).all()
    total_seconds = 0
    for s in sessions:
        session_start = max(s.started_at, week_start)
        session_end = min(s.ended_at, week_end)
        if session_end > session_start:
            duration = (session_end - session_start).total_seconds()
            total_seconds += duration
    return int(total_seconds)

def make_weekly_report_values(student_id: int, db: Session):
    jamo_stats = db.query(WeeklyJamoStat).filter_by(student_id=student_id).all()
    total_attempts = sum(j.total_attempts for j in jamo_stats)
    total_fail = sum(j.fail_count for j in jamo_stats)
    curriculum = "이번 주 커리큘럼 자동 요약" if total_attempts else ""
    discussion_log = "이번 주 논의 및 합의 요약" if total_fail else ""
    return {
        "total_attempts": total_attempts,
        "total_fail": total_fail,
        "curriculum": curriculum,
        "discussion_log": discussion_log,
    }

def fill_reset_and_make_weekly_report(db: Session):
    """
    전체 학생에 대해 한 주 리포트 생성 & 금주 자모통계 리셋
    """
    try:
        now = datetime.now()
        week_start, week_end = get_week_boundary(now)

        jamo_stats = db.query(JamoStat).all()
        student_ids = set(j.student_id for j in jamo_stats)
        weekly_stat_written = 0
        report_count = 0

        for student_id in student_ids:
            values = make_weekly_report_values(student_id, db)
            total_time = calculate_weekly_total_time(db, student_id, week_start, week_end)
            protector_goal = ProtectorGoalType.FOCUS_ON_WEAKNESS

            report = WeeklyPersonalReport(
                student_id=student_id,
                total_time=total_time,
                curriculum=values["curriculum"],
                discussion_log=values["discussion_log"],
                protector_goal=protector_goal,
                created_at=now
            )
            db.add(report)
            db.commit()
            db.refresh(report)
            report_count += 1

            jamos = db.query(JamoStat).filter_by(student_id=student_id).all()
            for jamo in jamos:
                weekly = WeeklyJamoStat(
                    student_id=jamo.student_id,
                    report_id=report.report_id,
                    jamo=jamo.jamo,
                    total_attempts=jamo.total_attempts,
                    fail_count=jamo.fail_count,
                    weekly_fail_rate=jamo.weekly_fail_rate,
                    weekly_accuracy_rate=jamo.weekly_accuracy_rate,
                    created_at=now
                )
                db.add(weekly)
                weekly_stat_written += 1
            db.commit()

        for jamo in jamo_stats:
            jamo.total_attempts = 0
            jamo.fail_count = 0
            jamo.weekly_fail_rate = 0.0
            jamo.weekly_accuracy_rate = 0.0
            jamo.updated_at = now
        db.commit()

        return {
            "weekly_stat_written": weekly_stat_written,
            "jamo_stat_reset": len(jamo_stats),
            "weekly_reports": report_count
        }
    except SQLAlchemyError as e:
        db.rollback()
        return {"error": str(e)}
