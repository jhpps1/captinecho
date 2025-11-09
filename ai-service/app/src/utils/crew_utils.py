#app/src/utils/crew_utils.py

import os, re, json
from datetime import datetime
from app.src.core.models import Student, WeeklyPersonalReport

from app.src.redis_conn import redis_conn


CACHE_EXPIRE_SECONDS = 300  # 5분
# 학생 정보를 Redis 캐시에 저장했다가, 일정 시간(여기서는 5분, 300초) 동안 재사용"


def get_student_data(student_id):
    cache_key = f"student_data:{student_id}"
    cached = redis_conn.get(cache_key)
    if cached:
        return json.loads(cached)

    from app.src.core.database import SessionLocal
    db = SessionLocal()
    try:
        student = db.query(Student).filter(Student.student_id == student_id).first()
        weekly_report = db.query(WeeklyPersonalReport) \
            .filter(WeeklyPersonalReport.student_id == student_id) \
            .order_by(WeeklyPersonalReport.created_at.desc()).first()
        if not student:
            return None
        data = {
            "student_id": student.student_id,
            "name": student.name,
            "level": getattr(student, "level", None),
            "protector_goal": str(weekly_report.protector_goal) if weekly_report and weekly_report.protector_goal is not None else None,  # str 변환!
            "small_interest_name": getattr(student, "small_interest_name", None)
        }
        # 🚩 캐시 저장은 return 전에 반드시 실행!
        redis_conn.setex(cache_key, CACHE_EXPIRE_SECONDS, json.dumps(data, ensure_ascii=False))
        return data
    
    finally:
        db.close()

def extract_final_results(history):
    full_text = "\n".join(history)
    # 1) 맨 마지막 [월~금 커리큘럼] 위치
    last_cur = full_text.rfind('[월~금 커리큘럼]')
    if last_cur == -1:
        return "", ""
    after_cur = full_text[last_cur:]
    # 2) 논의 및 합의 요약: 구간 찾기
    summary_pos = after_cur.find('논의 및 합의 요약:')
    if summary_pos == -1:
        curriculum = after_cur[len('[월~금 커리큘럼]'):].strip()
        discussion_log = ""
    else:
        curriculum = after_cur[len('[월~금 커리큘럼]'):summary_pos].strip()
        rest_txt = after_cur[summary_pos+len('논의 및 합의 요약:'):]
        # 다음 [월~금 커리큘럼] 나오기 전까지 or 끝까지
        next_cur = rest_txt.find('[월~금 커리큘럼]')
        if next_cur == -1:
            discussion_log = rest_txt.strip()
        else:
            discussion_log = rest_txt[:next_cur].strip()
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
