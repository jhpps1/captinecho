#app/src/utils/crew_utils.py

import os, re, json
from datetime import datetime
from app.src.core.models import Student, WeeklyPersonalReport

def get_student_data(student_id):
    from app.src.core.database import SessionLocal
    db = SessionLocal()
    try:
        student = db.query(Student).filter(Student.student_id == student_id).first()
        weekly_report = db.query(WeeklyPersonalReport) \
            .filter(WeeklyPersonalReport.student_id == student_id) \
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

def extract_final_results(history):
    full_text = "\n".join(history)
    curriculum_match = re.search(
        r'\[월~금 커리큘럼\](.*?)(?=\n논의 및 합의 요약:)', full_text, re.DOTALL)
    curriculum = curriculum_match.group(1).strip() if curriculum_match else ""
    discussion_match = re.search(
        r'\n논의 및 합의 요약:(.*?)(?=\n\[월~금 커리큘럼\]|$)', full_text, re.DOTALL)
    discussion_log = discussion_match.group(1).strip() if discussion_match else ""
    return curriculum, discussion_log

def save_report_via_api(student_id, curriculum, discussion_log):
    import requests
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
            return resp.json()
        except Exception as e:
            from logging import getLogger
            logger = getLogger("scheduler")
            logger.error(f"API 저장 시도 {attempt+1}/{tries} 오류: {e}")
    backup_dir = "backup_reports"
    os.makedirs(backup_dir, exist_ok=True)
    filename = f"{backup_dir}/student_{student_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    try:
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.error(f"로컬 백업 저장 실패: {e}")
    return None
