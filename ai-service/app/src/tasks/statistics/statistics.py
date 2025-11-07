# app/src/tasks/statistics/statistics.py

from datetime import datetime
from sqlalchemy.orm import Session
from app.src.core.models import (
    WeeklyJamoStat, 
    JamoStat, 
    WeeklyPersonalReport
)
from sqlalchemy.exc import SQLAlchemyError

def make_weekly_report_values(student_id: int, db: Session):
    """
    주간 자모통계 데이터를 기반으로 리포트용 주요 지표 계산
    - student_id: 학생 ID
    - db: 세션
    """
    jamo_stats = db.query(WeeklyJamoStat).filter_by(student_id=student_id).all()
    total_attempts = sum(j.total_attempts for j in jamo_stats)
    total_fail = sum(j.fail_count for j in jamo_stats)


def fill_reset_and_make_weekly_report(db: Session):
    try:
        now = datetime.now()
        jamo_stats = db.query(JamoStat).all()
        student_ids = set(j.student_id for j in jamo_stats)
        weekly_stat_written = 0
        report_count = 0

        for student_id in student_ids:
            stat_dict = make_weekly_report_values(student_id, db)
            report = WeeklyPersonalReport(
                student_id=student_id,
                total_time=0,
                curriculum="",      # 실제 데이터 있으면 여기에!
                discussion_log="",  # 실제 데이터 있으면 여기에!
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

        # 금주 자모통계 전체 리셋
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
