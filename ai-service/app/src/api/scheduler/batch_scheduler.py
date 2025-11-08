from apscheduler.schedulers.background import BackgroundScheduler
from app.src.core.database import SessionLocal
from app.src.core.models import Student
import logging

logger = logging.getLogger("scheduler")
scheduler = BackgroundScheduler()


def batch_generate_problems():
    from app.src.service.question_service import generate_problems_for_one_week
    db = SessionLocal()
    try:
        student_ids = [row[0] for row in db.query(Student.student_id).all()]
        for sid in student_ids:
            result = generate_problems_for_one_week(db, sid)
            print(f"학생 {sid}: {'성공' if result else '실패'}")
        db.commit()
    finally:
        db.close()


def fill_reset_and_make_weekly_report():
    from app.src.tasks.statistics.statistics import fill_reset_and_make_weekly_report
    db = SessionLocal()
    try:
        result = fill_reset_and_make_weekly_report(db)
        logger.info(f"주간 자모통계 배치 실행 완료 | 결과: {result}")
        print(f"주간 자모통계 배치 실행 완료 | 결과: {result}")
    except Exception as e:
        logger.error(f"배치 실행 실패: {e}")
        print(f"배치 실행 실패: {e}")
    finally:
        db.close()


def batch_generate_weekly_reports():
    # fill_reset_and_make_weekly_report를 여기서 import
    from app.src.main import fill_reset_and_make_weekly_report
    db = SessionLocal()
    try:
        student_ids = [row[0] for row in db.query(Student.student_id).all()]
        success_count = 0
        for sid in student_ids:
            result = fill_reset_and_make_weekly_report(db, sid)
            if result:
                print(f"학생 {sid}: 리포트 생성 성공")
                success_count += 1
            else:
                print(f"학생 {sid}: 리포트 생성 실패")
        db.commit()
        print(f"총 {success_count}명 리포트 생성 완료!")
    finally:
        db.close()


def start_scheduler():
    if not scheduler.running:
        scheduler.start()
        logger.info("배치 스케줄러 시작")
        print("배치 스케줄러 시작")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("배치 스케줄러 종료")
        print("배치 스케줄러 종료")


# === 통합 주간 배치 ===
def total_weekly_batch():
    print("주간 배치 시작!")
    fill_reset_and_make_weekly_report()
    print("자모통계 완료")

    batch_generate_weekly_reports()
    print("리포트 생성 완료")

    batch_generate_problems()
    print("문제 생성 완료")
    print("전체 주간 배치 완료!")


# 스케줄러에 등록 (원하는 시간, KST 타임존 명시 추천)
from pytz import timezone
scheduler.add_job(
    total_weekly_batch,
    'cron',
    day_of_week='sun',     # 예시: 토요일
    hour=23,
    minute=0,
    id="total_weekly_batch",
    timezone=timezone('Asia/Seoul')
)
