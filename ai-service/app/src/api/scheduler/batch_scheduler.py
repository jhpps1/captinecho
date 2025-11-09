from apscheduler.schedulers.background import BackgroundScheduler
from app.src.core.database import SessionLocal
from app.src.core.models import Student
from app.src.crew import build_conversation_flow
from app.src.utils.crew_utils import get_student_data, extract_final_results, save_report_via_api
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
    db = SessionLocal()
    try:
        student_ids = [row[0] for row in db.query(Student.student_id).all()]
        for sid in student_ids:
            result = generate_problems_for_one_week(db, sid)
            print(f"학생 {sid}: {'성공' if result else '실패'}")
        db.commit()
    finally:
        db.close()

def fill_reset_and_make_weekly_report_batch():
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

def batch_generate_crewai_reports():
    db = SessionLocal()
    try:
        student_ids = [row[0] for row in db.query(Student.student_id).all()]
        for sid in student_ids:
            try:
                student_data = get_student_data(sid)
                if not student_data:
                    logger.warning(f"학생 ID {sid} 데이터 없음, crewai 스킵")
                    continue
                flow = build_conversation_flow(student_data=student_data)
                auto_inputs = [
                    "이번 주 커리큘럼 요약과 대화 근거(주요 협의·이유)를 요약해 주세요.",
                    "감사합니다!",
                    "그만"
                ]
                for user_input in auto_inputs:
                    flow.state.user_input = user_input
                    _ = flow.get_agent_response()
                    if flow.state.done:
                        break
                curriculum, discussion_log = extract_final_results(flow.state.history)
                logger.info(f"[CrewAI 학생 {sid}] 커리큘럼: {curriculum[:80]}... / 논의: {discussion_log[:80]}...")
                save_report_via_api(sid, curriculum, discussion_log)
            except Exception as e:
                logger.error(f"CrewAI 학생 {sid} 처리 중 오류: {e}")
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
