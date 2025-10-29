# settings.py

# 예시: 프로젝트 공통 설정/상수
PROJECT_NAME = "Dyslexia Debate Crew"
DEFAULT_LANGUAGE = "ko"  # 또는 "en"

# 예시: 데이터 경로 등 공용 함수
import os

def get_project_root():
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
