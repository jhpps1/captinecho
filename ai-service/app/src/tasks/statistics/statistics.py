# app/src/tasks/statistics/statistics.py

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.src.core.models import (
    WeeklyJamoStat,
    JamoStat,
    WeeklyPersonalReport,
    ProtectorGoalType,
    LearningSession  # 반드시 import!
)

def get_week_boundary(now=None):
    """이번 주(월~월) 시작, 종료 반환"""
    if not now:
        now = datetime.now()
    start = now - timedelta(days=now.weekday())  # 월요일 0시
    end = start + timedelta(days=7)              # 다음주 월요일 0시
    return start, end

def calculate_weekly_total_time(db, student_id, week_start, week_end):
    """이번 주 실제 학습 세션 전체 시간(분) 집계"""
    sessions = db.query(LearningSession).filter(
    LearningSession.student_id == student_id,
    LearningSession.start_time >= week_start,     # <-- 추가!
    LearningSession.start_time < week_end,
    LearningSession.end_time != None
    ).all()
    total_seconds = 0
    for s in sessions:
        session_start = max(s.start_time, week_start)
        session_end = min(s.end_time, week_end)
        if session_end > session_start:
            duration = (session_end - session_start).total_seconds()
            total_seconds += duration

    # 분 단위로 변환하여 반환 (소수점 버림)
    total_minutes = int(total_seconds // 60)
    return total_minutes


def make_weekly_report_values(student_id: int, db: Session):
    """리포트용 자모 누적 집계값 반환"""
    jamo_stats = db.query(WeeklyJamoStat).filter_by(student_id=student_id).all()
    total_attempts = sum(j.total_attempts for j in jamo_stats)
    total_fail = sum(j.fail_count for j in jamo_stats)
    # 여기에 실제 커리큘럼/논의 정보 추출 로직을 추가해도 됨
    curriculum = "이번 주 커리큘럼 자동 요약" if total_attempts else ""
    discussion_log = "이번 주 논의 및 합의 요약" if total_fail else ""
    return {
        "total_attempts": total_attempts,
        "total_fail": total_fail,
        "curriculum": curriculum,
        "discussion_log": discussion_log,
    }


def fill_reset_and_make_weekly_report(db):
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

            # 리포트 row 최신 항목 찾기
            report = db.query(WeeklyPersonalReport).filter_by(student_id=student_id).order_by(WeeklyPersonalReport.created_at.desc()).first()

            if report:
                # 이미 리포트가 있으면 필요한 값만 업데이트 (비어있을 때만)
                updated = False
                if not report.total_time or report.total_time == 0:
                    report.total_time = total_time
                    updated = True
                if not report.curriculum:
                    report.curriculum = values["curriculum"]
                    updated = True
                if not report.discussion_log:
                    report.discussion_log = values["discussion_log"]
                    updated = True
                if updated:
                    db.commit()
            else:
                # 없으면 신규 row 생성 (protector_goal 반드시 포함! NOT NULL이니까)
                protector_goal = ProtectorGoalType.FOCUS_ON_WEAKNESS # 혹은 외부에서 주입된 값
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

            # 주간 자모통계 기록
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
