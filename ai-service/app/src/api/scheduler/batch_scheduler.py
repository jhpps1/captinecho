# src/api/scheduler/batch_scheduler.py

from apscheduler.schedulers.background import BackgroundScheduler
from app.src.core.database import SessionLocal
from app.src.service.question_service import generate_problems_for_one_week
from app.src.tasks.statistics.statistics import fill_and_reset_weekly_jamo_stat

from app.src.core.models import Student
import logging
logger = logging.getLogger("scheduler")


scheduler = BackgroundScheduler()

def batch_generate_problems():
    db = SessionLocal()
    try:
        student_ids = [row[0] for row in db.query(Student.student_id).all()]
        for sid in student_ids:
            result = generate_problems_for_one_week(db, sid)
            print(f"학생 {sid}: {'성공' if result else '실패'}")
        db.commit()
    finally:
        db.close()


def batch_fill_and_reset_weekly_jamo_stat():
    db = SessionLocal()
    try:
        result = fill_and_reset_weekly_jamo_stat(db)
        logger.info(f"주간 자모통계 배치 실행 완료 | 결과: {result}")
        print(f"주간 자모통계 배치 실행 완료 | 결과: {result}")
    except Exception as e:
        logger.error(f"배치 실행 실패: {e}")
        print(f"배치 실행 실패: {e}")
    finally:
        db.close()


def start_scheduler():
    # APScheduler가 여러 번 start되는 것 방지!
    if not scheduler.running:
        scheduler.start()
        logger.info("배치 스케줄러 시작")
        print("배치 스케줄러 시작")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("배치 스케줄러 종료")
        print("배치 스케줄러 종료")


# === 스케줄러에 배치작업 등록 ===
# 매주 일요일 밤 11시(23:00)에 자동 실행
scheduler.add_job(
    batch_fill_and_reset_weekly_jamo_stat, 
    'cron', 
    day_of_week='sun', 
    hour=23, 
    minute=0,
    id="weekly_jamo_stat_batch"
)
