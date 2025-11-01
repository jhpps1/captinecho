import sys
import os
import time
import argparse
from dotenv import load_dotenv

# --- 올바른 경로 설정을 위한 수정 ---
# 이 파일이 어디서 실행되든 프로젝트 루트를 기준으로 모듈을 찾도록 경로를 설정합니다.
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
sys.path.insert(0, PROJECT_ROOT)
load_dotenv(os.path.join(PROJECT_ROOT, '.env'))
# ------------------------------------

from app.src.dyslexia_crew.crew import build_crew
from app.core.database import SessionLocal
from app.core.models import Student
from app.core.config import settings


try:
    from rich.console import Console
    from rich.markdown import Markdown
    has_rich = True
except ImportError:
    has_rich = False

def get_student_data(student_id: int):
    """DB에서 학생 데이터를 가져옵니다."""
    db = SessionLocal()
    try:
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            return None
        # 필요한 데이터만 간단한 dict 형태로 반환 (예시)
        return {
            "id": student.id,
            "name": student.name,
            # ... crew 분석에 필요한 다른 데이터 추가
        }
    finally:
        db.close()

def run_crew_analysis(student_data=None):
    """
    Crew 실행 결과(요약/합의안 등)를 딕셔너리(또는 JSON) 형태로 리턴
    """
    # crew 빌드, 학생 데이터 전달
    crew = build_crew(student_data=student_data)
    start_time = time.time()
    result = crew.kickoff()
    end_time = time.time()
    duration = end_time - start_time
    
    # 콘솔 출력은 필요하면만, 결과는 dict 형태 리턴
    if has_rich:
        console = Console()
        console.print("\n--- Dyslexia Debate Crew 시작 ---", style="bold green")
        console.print("\n--- 최종 결과 (합의/요약) ---", style="bold green")
        console.print(Markdown(str(result)))
        console.print(f"\n총 협의 소요 시간: {duration:.2f}초", style="bold yellow")
    else:
        print("\n--- Dyslexia Debate Crew 실행 결과 ---")
        print(result)
        print(f"\n총 협의 소요 시간: {duration:.2f}초")

    # 최종 결과를 dict로(=API 서버/DB 저장에 바로 활용할 수 있게)
    return {
        "result": result,
        "elapsed_seconds": duration
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Dyslexia Crew 분석을 실행합니다.")
    parser.add_argument("--student-id", type=int, help="분석할 학생의 ID")
    args = parser.parse_args()

    student_data_for_crew = None
    if args.student_id:
        print(f"학생 ID({args.student_id}) 데이터를 조회합니다...")
        # 실제 DB에서 학생 데이터를 가져오는 로직 (예시)
        # 이 부분은 실제 `Student` 모델과 DB 구조에 맞게 수정해야 합니다.
        student_data_for_crew = f"학생 ID: {args.student_id}, 이름: 김철수, 최근 학습 성공률: 65%, 출석률: 90%"
        # student_data_for_crew = get_student_data(args.student_id) # 실제 DB 조회 함수

    result_dict = run_crew_analysis(student_data=student_data_for_crew)
