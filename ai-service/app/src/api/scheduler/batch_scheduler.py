from apscheduler.schedulers.background import BackgroundScheduler
from app.src.core.database import SessionLocal
from app.src.core.models import Student
from app.src.core.batch_core import fill_reset_and_make_weekly_report
from app.src.utils.problem_job import generate_problems_for_one_week
import logging
from pytz import timezone


import sys

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("output.log", encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)


logger = logging.getLogger("scheduler")
scheduler = BackgroundScheduler()

def batch_generate_problems():
    """문제 생성 배치 (주간 문제 자동 생성)"""
    db = SessionLocal()
    try:
        student_ids = [row[0] for row in db.query(Student.student_id).all()]
        logger.info(f"📝 문제 생성 배치 시작: {len(student_ids)}명 학생")

        success_count = 0
        for sid in student_ids:
            try:
                result = generate_problems_for_one_week(db, sid)
                if result:
                    success_count += 1
                    logger.info(f"✅ 학생 {sid}: 문제 생성 성공")
                else:
                    logger.warning(f"⚠️ 학생 {sid}: 문제 생성 실패 (커리큘럼 없음)")
            except Exception as e:
                logger.error(f"❌ 학생 {sid}: 문제 생성 중 오류 - {e}")

        db.commit()
        logger.info(f"📝 문제 생성 배치 완료: {success_count}/{len(student_ids)}명 성공")
    except Exception as e:
        logger.error(f"❌ 문제 생성 배치 실패: {e}")
        db.rollback()
    finally:
        db.close()


def fill_reset_and_make_weekly_report_batch():
    """주간 자모통계 생성 및 초기화 배치"""
    db = SessionLocal()
    try:
        logger.info("📊 주간 자모통계 배치 시작")
        result = fill_reset_and_make_weekly_report(db)
        logger.info(f"✅ 주간 자모통계 배치 완료 | 결과: {result}")
    except Exception as e:
        logger.error(f"❌ 주간 자모통계 배치 실패: {e}")
        db.rollback()
    finally:
        db.close()


def batch_generate_crewai_reports():
    """CrewAI 커리큘럼 생성 배치 (Hierarchical 방식)"""
    db = SessionLocal()
    try:
        student_ids = [row[0] for row in db.query(Student.student_id).all()]
        logger.info(f"🤖 CrewAI 커리큘럼 생성 배치 시작: {len(student_ids)}명 학생")

        success_count = 0
        for sid in student_ids:
            try:
                # main_api.py의 generate_curriculum 함수 직접 호출
                from app.src.api.main_api import generate_curriculum

                logger.info(f"🤖 학생 {sid}: CrewAI 실행 중...")
                result = generate_curriculum(sid, db)

                if result.get("status") == "success":
                    success_count += 1
                    logger.info(f"✅ 학생 {sid}: 커리큘럼 생성 성공 (소요시간: {result.get('elapsed_time')})")
                else:
                    logger.error(f"❌ 학생 {sid}: 커리큘럼 생성 실패 - {result.get('error')}")

            except Exception as e:
                logger.error(f"❌ 학생 {sid}: CrewAI 처리 중 오류 - {e}")

        logger.info(f"🤖 CrewAI 커리큘럼 생성 배치 완료: {success_count}/{len(student_ids)}명 성공")
    except Exception as e:
        logger.error(f"❌ CrewAI 배치 실패: {e}")
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

def total_weekly_batch():
    print("주간 배치 시작!")
    fill_reset_and_make_weekly_report_batch()
    print("자모통계 완료")
    batch_generate_crewai_reports()
    print("CrewAI 대화/리포트 자동 생성 완료!")
    batch_generate_problems()
    print("문제 생성 완료")
    print("전체 주간 배치 완료!")

# 스케줄러에 등록
scheduler.add_job(
    total_weekly_batch,
    'cron',
    day_of_week='sun',
    hour=23,
    minute=00,
    id="total_weekly_batch",
    timezone=timezone('Asia/Seoul')
)
