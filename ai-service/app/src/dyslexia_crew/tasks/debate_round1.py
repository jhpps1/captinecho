from crewai import Task
import json
from pathlib import Path

def build(agent):
    # student.json 데이터 읽기
    data_path = Path(__file__).parents[2] / 'data' / 'student.json'
    with open(data_path, encoding='utf-8') as f:
        student_data = f.read()
    return Task(
        description=(
            f"아래 학습 데이터 기반으로 다음 주 학습 목표를 상세히 기획하라.\n"
            "반드시 한국어로 답변하세요.\n\n"
            f"{student_data}\n\n"
            "제안 후 Wellbeing Agent의 피드백을 요청하고, 협의할 준비를 하세요."
        ),
        agent=agent,
        expected_output="초기 학습 목표 제안(JSON 포함) + 피드백 요청"
    )
 