# app/src/tasks/enqueue_task.py
from rq import Queue
import redis
from app.src.crew import build_conversation_flow

def process_student(student_data):
    flow = build_conversation_flow(student_data)
    # 필요한 user_input 등 넣어서 flow 수차례 실행
    result = flow.get_agent_response()
    # 결과 저장 (DB/Redis 등)
    return result

redis_conn = redis.Redis()
q = Queue(connection=redis_conn)

# 여러 학생 작업 큐 등록
for student_data in student_data_list:
    q.enqueue(process_student, student_data)
