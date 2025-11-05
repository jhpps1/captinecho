#app/src/main.py

import sys
import os
import time
import argparse
from dotenv import load_dotenv
from datetime import datetime
import logging
import requests

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[
        logging.FileHandler("output.log", encoding="utf-8"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
sys.path.insert(0, PROJECT_ROOT)
load_dotenv(os.path.join(PROJECT_ROOT, '.env'))

from app.src.crew import build_conversation_flow
from app.src.core.models import Student, WeeklyPersonalReport
from app.src.core.config import settings


os.environ["OPENAI_API_KEY"] = settings.OPENAI_API_KEY
os.environ["OPENAI_MODEL"] = settings.OPENAI_MODEL
if settings.OPENAI_BASE_URL:
    os.environ["OPENAI_BASE_URL"] = settings.OPENAI_BASE_URL
os.environ["EMBEDDING_MODEL"] = settings.EMBEDDING_MODEL
os.environ["EMBEDDING_BASE_URL"] = settings.EMBEDDING_BASE_URL

def get_student_data(student_id: int):
    # 이 함수는 DB 직접 연결 필요 없으므로 API로 대체 가능 (단, 아직 API가 없으면 기존 코드 사용)
    import app.src.core.database
    db = app.src.core.database.SessionLocal()
    try:
        student = db.query(Student).filter(Student.student_id == student_id).first()
        weekly_report = db.query(WeeklyPersonalReport)\
            .filter(WeeklyPersonalReport.student_id == student_id)\
            .order_by(WeeklyPersonalReport.created_at.desc()).first()
        if not student:
            return None
        return {
            "student_id": student.student_id,
            "name": student.name,
            "level": getattr(student, "level", None),
            "protector_goal": weekly_report.protector_goal if weekly_report else None,
            "small_interest_name": getattr(student, "small_interest_name", None)
        }
    finally:
        db.close()

def run_crew_analysis(student_data=None):
    crew = build_conversation_flow(student_data=student_data)
    start_time = time.time()
    result = crew.kickoff()
    end_time = time.time()
    duration = end_time - start_time
    return {
        "result": result,
        "elapsed_seconds": duration
    }

def extract_crew_texts(result_obj):
    if hasattr(result_obj, 'raw'):
        output = str(result_obj.raw)
    elif hasattr(result_obj, 'output'):
        output = str(result_obj.output)
    else:
        output = str(result_obj)
    if "논의 및 합의 요약:" in output:
        curriculum, discussion_log = output.split("논의 및 합의 요약:", 1)
        curriculum = curriculum.replace("커리큘럼 요약:", "").strip()
        discussion_log = discussion_log.strip()
    else:
        curriculum = output.strip()
        discussion_log = "논의 및 합의 요약 없음. 프롬프트/결과 구조 점검 필요!"
    return curriculum, discussion_log

def log_agent_dialogue(result_obj):
    log_strings = []
    if hasattr(result_obj, "full_log"):
        log_strings.append(result_obj.full_log)
    elif hasattr(result_obj, "verbose_log"):
        log_strings.append(result_obj.verbose_log)
    elif hasattr(result_obj, "history"):
        log_strings.append(str(result_obj.history))
    elif hasattr(result_obj, "output"):
        log_strings.append(str(result_obj.output))
    else:
        log_strings.append(str(result_obj))
    for log_str in log_strings:
        logger.info("\n" + log_str)

def save_report_via_api(student_id, curriculum, discussion_log, protector_goal):
    API_URL = "http://localhost:8000/save-report"
    payload = {
        "student_id": student_id,
        "report": {
            "curriculum": curriculum,
            "discussion_log": discussion_log,
            "protector_goal": protector_goal
        }
    }
    try:
        resp = requests.post(API_URL, json=payload)
        resp.raise_for_status()
        logger.info(f"리포트 저장 성공: {resp.json()}")
        return resp.json()
    except Exception as e:
        logger.error(f"API 저장 오류: {e}")
        return None

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Dyslexia Crew 대화형 세션")
    parser.add_argument("--student-id", type=int, help="분석할 학생의 ID")
    args = parser.parse_args()

    student_data = get_student_data(args.student_id)
    if not student_data:
        logger.error(f"학생 ID({args.student_id})를 찾을 수 없습니다.")
        sys.exit(1)
    logger.info(f"학생 '{student_data['name']}' 대화형 분석 시작...")

    flow = build_conversation_flow(student_data=student_data)

    # ✅ 자동 입력 프롬프트 (원하는 만큼 턴만큼)
    auto_inputs = [
        "이번 주 커리큘럼 요약 알려주세요.",
        "대화 근거(주요 협의·이유)만 요약해 주세요.",
        "감사합니다!"
        "그만"
    ]

    overall_start = time.time()
    for idx, user_input in enumerate(auto_inputs):
        turn_start = time.time()
        flow.state.user_input = user_input
        result = flow.get_agent_response()
        turn_end = time.time()
        turn_duration = turn_end - turn_start
        # 사람이 읽기 좋은 출력 & 턴별 시간
        logger.info(f"\n=========== 대화 턴 {idx+1} 결과({turn_duration:.2f}초) ===========\n" + flow.state.last_output)
        print(f"[TURN {idx+1}] [INPUT] {user_input}\n[CREWAI OUTPUT]:\n{flow.state.last_output}\n[TURN 시간: {turn_duration:.2f}초]\n---")
        if flow.state.done:
            break
    overall_end = time.time()
    overall_duration = overall_end - overall_start

    logger.info(f"\n======= 전체 대화 로그 =======\n" + "\n".join(flow.state.history))
    logger.info(f"\n전체 대화 소요 시간: {overall_duration:.2f}초\n")

    print(f"\n=== 전체 대화 로그 ===\n(전체 걸린 시간: {overall_duration:.2f}초)")
    for msg in flow.state.history:
        print(msg)
    logger.info("대화형 분석 종료!")

