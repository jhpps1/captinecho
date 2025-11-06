#src/utils/settings.py

import os
from dotenv import load_dotenv

# .env 파일 로드
dotenv_path = os.path.join(os.path.dirname(__file__), "../.env")
load_dotenv(dotenv_path)

PROJECT_NAME = "Dyslexia Debate Crew"
DEFAULT_LANGUAGE = "ko"

# 환경 변수에서 값 읽기 (.env 없을 경우 기본값)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "your-key-here")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")
OPENAI_MODE2 = os.getenv("OPENAI_MODEL", "gpt-5")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://gms.ssafy.io/gmsapi/api.openai.com/v1")


# 임베딩 환경변수 추가
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
EMBEDDING_BASE_URL = os.getenv("EMBEDDING_BASE_URL", "https://gms.ssafy.io/gmsapi/api.openai.com/v1/embeddings")

def get_project_root():
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATA_PATH = os.path.join(get_project_root(), "data")

