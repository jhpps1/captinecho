# src/utils/settings.py

import os
from dotenv import load_dotenv
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

# .env 파일 경로 설정 및 로드 (프로젝트 구조에 따라)
# 이 부분은 현재 프로젝트 구조(/ai-service/app/src/utils)를 가정하여 상대 경로를 사용합니다.
dotenv_path = os.path.join(os.path.dirname(__file__), "../../.env")
load_dotenv(dotenv_path)

# Pydantic 모델 외부에 정의되어야 하는 상수
PROJECT_NAME = "Dyslexia Debate Crew"
DEFAULT_LANGUAGE = "ko"

# ===============================================
# Pydantic BaseSettings를 사용하여 환경 변수를 정의합니다.
# ===============================================

class Settings(BaseSettings):
    """애플리케이션 환경 변수 설정을 위한 Pydantic 모델"""
    
    # 🚨 model_config: Pydantic V2 설정
    model_config = SettingsConfigDict(
        env_file=dotenv_path, # 로드할 .env 파일 경로
        env_file_encoding="utf-8",
        case_sensitive=True,
        # 'Extra inputs are not permitted' 오류 방지를 위해 'ignore'를 명시적으로 설정하여
        # 모델에 정의되지 않은 환경 변수(예: DB_HOST, DB_USER 등)가 
        # config.py의 Settings에서 로드될 때 충돌하는 것을 방지할 수 있습니다.
        # 하지만 여기서는 명시적으로 필요한 것만 정의합니다.
    )
    
    # 1. OpenAI/GMS LLM 및 임베딩 설정
    OPENAI_API_KEY: str = Field(default="your-key-here")
    OPENAI_MODEL: str = Field(default="gpt-4o")
    # Pydantic 필드명은 snake_case를 사용하고, 환경 변수명이 OPENAI_MODE2라면 alias를 사용합니다.
    OPENAI_MODEL_2: str = Field(default="gpt-5", alias="OPENAI_MODE2") 
    OPENAI_BASE_URL: str = Field(default="https://gms.ssafy.io/gmsapi/api.openai.com/v1")
    
    EMBEDDING_MODEL: str = Field(default="text-embedding-3-small")
    EMBEDDING_BASE_URL: str = Field(default="https://gms.ssafy.io/gmsapi/api.openai.com/v1/embeddings")

    # 🚨 2. Gemini API Key 추가 (이미지 생성용)
    # .env 파일에 있어야 하는 키입니다. (Validation 오류 해결)
    GEMINI_API_KEY: Optional[str] = Field(default="")

    # 🚨 3. AWS S3 설정 (파일 업로드용)
    AWS_ACCESS_KEY_ID: Optional[str] = Field(default="")
    AWS_SECRET_ACCESS_KEY: Optional[str] = Field(default="")
    AWS_REGION: str = Field(default="ap-northeast-2")
    S3_BUCKET_NAME: Optional[str] = Field(default="captain-echo-files")

    # 🚨 4. 충돌 방지를 위해 최소한의 필수 필드 정의 (다른 곳에서 사용될 수 있는 필드)
    # 이 필드들이 app/src/core/config.py와 겹치거나 누락되면 다시 오류가 발생할 수 있습니다.
    DATABASE_URL: Optional[str] = Field(default=None)


# 인스턴스화
settings = Settings()

# ===============================================
# Pydantic 모델 외부에 정의되어야 하는 함수 및 상수
# ===============================================

def get_project_root():
    # 프로젝트 루트 디렉터리를 가져옵니다.
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATA_PATH = os.path.join(get_project_root(), "data")