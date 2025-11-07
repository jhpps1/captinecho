# app/src/main.py

import sys
import os
import time
import argparse
import json
import re
from dotenv import load_dotenv
from datetime import datetime
import logging
import requests

# --------------- 기본 환경 로딩 ------------------------------
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

# --------------------------------------------------------
# DB에서 학생 데이터 조회
def get_student_data(student_id: int):
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

# --------------------------------------------------------
# Crew Debate 결과에서 구조 파싱 (대화/요일/협의안)
def extract_final_results(history):
    full_text = "\n".join(history)

    # [대화] 구간 추출 (discussion_log)
    dialogue_match = re.search(r'\[대화\](.*?)(?=\[월~금|\[요일별 목표 요약\])', full_text, re.DOTALL)
    dialogue = dialogue_match.group(1).strip() if dialogue_match else ""

    # [월~금 커리큘럼] 또는 [요일별 목표 요약] (curriculum)
    daily_goals_match = re.search(r'(\[월~금.*?\]|\[요일별 목표 요약\])(.*?)(?=논의 및 합의 요약:)', full_text, re.DOTALL)
    daily_goals = daily_goals_match.group(2).strip() if daily_goals_match else ""

    # 논의 및 합의 요약
    discussion_match = re.search(r'논의 및 합의 요약:(.*)', full_text, re.DOTALL)
    discussion = discussion_match.group(1).strip() if discussion_match else ""

    curriculum = f"""\
======================== 대화 요약 ========================
{dialogue}

==================== 요일별 학습 목표 =====================
{daily_goals}

================= 논의 및 합의 요약 ======================
{discussion}
==========================================================
"""
    return curriculum, discussion

# --------------------------------------------------------
# API 저장 함수: 3회 재시도 + 로컬 JSON 백업
def save_report_via_api(student_id, curriculum, discussion_log):
    API_URL = "http://localhost:8000/save-report"
    payload = {
        "curriculum": curriculum,
        "discussion_log": discussion_log
    }
    tries = 3
    for attempt in range(tries):
        try:
            resp = requests.post(
                f"{API_URL}?student_id={student_id}",
                json=payload,
                timeout=30
            )
            resp.raise_for_status()
            logger.info(f"리포트 저장 성공: {resp.json()}")
            return resp.json()
        except Exception as e:
            logger.error(f"API 저장 시도 {attempt+1}/{tries} 오류: {e}")
            time.sleep(2)
    # 실패 시 Local Save
    backup_dir = "backup_reports"
    os.makedirs(backup_dir, exist_ok=True)
    filename = f"{backup_dir}/student_{student_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    try:
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
        logger.info(f"API 저장 실패 - 로컬 JSON 백업 저장: {filename}")
    except Exception as e:
        logger.error(f"로컬 백업 저장 실패: {e}")
    return None

# --------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Dyslexia Crew 대화형 세션")
    parser.add_argument("--student-id", type=int, help="분석할 학생의 ID")
    args = parser.parse_args()

    student_data = get_student_data(args.student_id)
    if not student_data:
        logger.error(f"학생 ID({args.student_id})를 찾을 수 없습니다.")
        sys.exit(1)

    logger.info(f"학생 '{student_data['name']}' 대화형 분석 시작...")

    # Crew Task/Agents가 Debate로 사회자 마크업에 맞춰 대화 흐름 생성
    flow = build_conversation_flow(student_data=student_data)

    # 주요 프롬프트 입력(사회자처럼 대화 자연스러움 유도)
    auto_inputs = [
        "이번 주 커리큘럼 요약과 대화 근거(주요 협의·이유)를 요약해 주세요.",
        "감사합니다!",
        "그만"
    ]

    overall_start = time.time()
    for idx, user_input in enumerate(auto_inputs):
        turn_start = time.time()
        flow.state.user_input = user_input
        result = flow.get_agent_response()
        turn_end = time.time()
        turn_duration = turn_end - turn_start
        logger.info(f"\n=========== 대화 턴 {idx+1} 결과({turn_duration:.2f}초) ===========\n" + flow.state.last_output)
        print(f"[TURN {idx+1}] [INPUT] {user_input}\n[CREWAI OUTPUT]:\n{flow.state.last_output}\n[TURN 시간: {turn_duration:.2f}초]\n---")
        if flow.state.done:
            break

    overall_end = time.time()
    overall_duration = overall_end - overall_start
    logger.info(f"\n======= 전체 대화 로그 =======\n" + "\n".join(flow.state.history))
    logger.info(f"\n전체 대화 소요 시간: {overall_duration:.2f}초\n")

    # Debate 결과 자연어 파싱 → 커리큘럼/협의안 구조화
    curriculum, discussion_log = extract_final_results(flow.state.history)
    logger.info(f"추출된 커리큘럼(150자): {curriculum[:150]}...")
    logger.info(f"추출된 논의(150자): {discussion_log[:150]}...")

    # API 저장 (재시도+백업)
    logger.info("최종 결과를 API에 저장 시도 중...")
    save_report_via_api(
        student_id=args.student_id,
        curriculum=curriculum,
        discussion_log=discussion_log
    )

    # Local 결과 백업도 별도로 저장 (커리큘럼+논의)
    backup_path = f"backup_report_{args.student_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(curriculum + "\n\n===== 논의 요약 =====\n" + discussion_log)
    logger.info(f"로컬 백업 저장: {backup_path}")

    print("\n=== 전체 대화 로그 및 커리큘럼 요약 ===")
    print(curriculum)
    print("\n=== 논의 및 합의 요약 ===")
    print(discussion_log)
