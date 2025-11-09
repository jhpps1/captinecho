#app/src/utils/time_utils.py

from datetime import datetime, timedelta
from pytz import timezone

def get_week_range(dt=None):
    """
    KST 기준 주간 시작/끝 반환.
    월요일 00:00 ~ 일요일 23:59:59
    """
    tz = timezone('Asia/Seoul')
    dt = dt or datetime.now(tz)
    week_start = dt - timedelta(days=dt.weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    week_end = week_start + timedelta(days=6, hours=23, minutes=59, seconds=59)
    return week_start, week_end

def calc_weekly_total_study_time(db, student_id, week_start, week_end):
    """
    해당 student의 해당 주간 모든 세션 시간(초) 합산.
    주 경계 겹치면 겹친 부분만 카운트.
    종료 없는 세션은 무시.
    """
    from app.src.core.models import LearningSession
    sessions = db.query(LearningSession).filter(
        LearningSession.student_id == student_id,
        LearningSession.start_time < week_end,
        LearningSession.end_time != None,
        LearningSession.end_time > week_start
    ).all()
    
    total_seconds = 0
    for s in sessions:
        # 주 경계 보정
        real_start = max(s.start_time, week_start)
        real_end = min(s.end_time, week_end)
        elapsed = (real_end - real_start).total_seconds()
        if elapsed > 0:
            total_seconds += elapsed
    return int(total_seconds)
