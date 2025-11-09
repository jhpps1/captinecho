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
    monday_date = now - timedelta(days=now.weekday())
    
    # 2. 🌟 핵심 수정: 월요일 날짜를 추출하여 시간 정보를 00:00:00으로 리셋합니다.
    start = datetime(monday_date.year, monday_date.month, monday_date.day, 0, 0, 0)
    
    # 3. 다음 주 월요일 0시 0분 0초를 끝으로 설정합니다.
    end = start + timedelta(days=7) 
    return start, end

def calculate_weekly_total_time(db: Session, student_id, week_start, week_end):
    # 주간에 "조금이라도 겹치는 모든 세션을 포함"
    sessions = db.query(LearningSession).filter(
        LearningSession.student_id == student_id,
        LearningSession.end_time != None,
        LearningSession.start_time <= week_end,
        LearningSession.end_time >= week_start
    ).all()
    total_seconds = 0
    for s in sessions:
        session_start = max(s.start_time, week_start)
        session_end = min(s.end_time, week_end)
        duration = (session_end - session_start).total_seconds()
        print(f"DEBUG session: {s.start_time} ~ {s.end_time}, used: {session_start} ~ {session_end} → {duration // 60}분")
        if duration > 0:
            total_seconds += duration
    return int(total_seconds // 60)


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
            # 최신 리포트 row 찾기
            report = db.query(WeeklyPersonalReport).filter_by(student_id=student_id).order_by(WeeklyPersonalReport.created_at.desc()).first()
            if report:
                # 무조건 현재 집계값으로 업데이트
                report.total_time = total_time
                report.curriculum = values["curriculum"]
                report.discussion_log = values["discussion_log"]
                db.commit()
            else:
                # 없으면 새로 생성
                report = WeeklyPersonalReport(
                    student_id=student_id,
                    total_time=total_time,
                    curriculum=values["curriculum"],
                    discussion_log=values["discussion_log"],
                    protector_goal=ProtectorGoalType.FOCUS_ON_WEAKNESS,
                    created_at=now
                )
                db.add(report)
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
