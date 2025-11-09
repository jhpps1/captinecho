from rq import Queue
import redis
import os
from dotenv import load_dotenv
from app.src.utils.crew_utils import get_student_data
from app.src.crew import build_conversation_flow
from app.src.core.database import SessionLocal
from app.src.core.models import Student
from app.src.utils.problem_job import generate_problems_for_one_week

load_dotenv(dotenv_path="/S13P31D101/.env")

redis_conn = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    password=os.getenv("REDIS_PASSWORD"),
    db=int(os.getenv("REDIS_DB", 0)),
    decode_responses=True
)
q = Queue(connection=redis_conn)

def process_student_batch(student_id):
    student_data = get_student_data(student_id)
    if not student_data:
        return None
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
    return flow.state.history

def process_problem_generation(student_id):
    db = SessionLocal()
    try:
        res = generate_problems_for_one_week(db, student_id)
        print(f"학생 {student_id} 문제생성 결과:", res)
        return res
    finally:
        db.close()

def batch_generate_crewai_reports_parallel():
    db = SessionLocal()
    try:
        student_ids = [row[0] for row in db.query(Student.student_id).all()]
        for sid in student_ids:
            q.enqueue(process_student_batch, sid)
    finally:
        db.close()

def batch_generate_problems_parallel():
    db = SessionLocal()
    try:
        student_ids = [row[0] for row in db.query(Student.student_id).all()]
        for sid in student_ids:
            q.enqueue(process_problem_generation, sid)
    finally:
        db.close()
