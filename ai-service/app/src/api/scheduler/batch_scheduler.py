# src/api/scheduler/batch_scheduler.py

from apscheduler.schedulers.background import BackgroundScheduler
from app.src.core.database import SessionLocal
from app.src.tasks.statistics.statistics import fill_and_reset_weekly_jamo_stat

scheduler = BackgroundScheduler()

def batch_fill_and_reset_weekly_jamo_stat():
    db = SessionLocal()
    try:
        fill_and_reset_weekly_jamo_stat(db)
        print("주간 자모통계 배치 실행 완료")
    finally:
        db.close()

# 일요일 밤 11시(23:00)에 실행
scheduler.add_job(batch_fill_and_reset_weekly_jamo_stat, 'cron', day_of_week='sun', hour=23, minute=0)

def start_scheduler():
    scheduler.start()

def stop_scheduler():
    scheduler.shutdown()
