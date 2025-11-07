"""
Application Configuration
=========================
환경 변수 및 설정 관리
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict # SettingsConfigDict 추가
from pydantic import Field

class Settings(BaseSettings):
    """애플리케이션 설정"""

    # 🚨 [Pydantic V2 스타일]: 내부 Config 클래스를 model_config 속성으로 대체
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # 기본 설정
    PROJECT_NAME: str = "Captain Echo AI Service"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = Field(default="development")
    DEBUG: bool = Field(default=True)

    # 서버 설정
    PORT: int = Field(default=8000)
    HOST: str = Field(default="0.0.0.0")
    WORKERS: int = Field(default=1)

    # 로깅 설정
    LOG_LEVEL: str = Field(default="INFO")
    LOG_FILE: str = Field(default="/app/logs/ai-service.log")

    # CORS 설정
    ALLOWED_ORIGINS: List[str] = Field(
        default=[
            "http://localhost",
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8080",
        ]
    )

    # --- 🤖 AI 설정 ---

    # OpenAI/GMS 설정 (CrewAI용 및 기존 LLM)
    OPENAI_API_KEY: str = Field(..., env="OPENAI_API_KEY") # Field(..., env="OPENAI_API_KEY")는 그대로 유지
    OPENAI_MODEL: str = Field(default="gpt-4o")
    # env 이름이 OPENAI_MODEL2인 경우, alias를 사용하여 Python 변수명을 명확하게 합니다.
    OPENAI_MODEL_2: str = Field(default="gpt-5", alias="OPENAI_MODEL2") 
    OPENAI_BASE_URL: Optional[str] = Field(default=None)
    OPENAI_TEMPERATURE: float = Field(default=0.7)
    OPENAI_MAX_TOKENS: int = Field(default=4000)
    
    # 🚨 [추가]: GEMINI API Key 필드 추가 (Validation 오류 해결)
    GEMINI_API_KEY: Optional[str] = Field(default="")

    # Embedding(임베딩) 모델/엔드포인트 (gms 기반)
    EMBEDDING_MODEL: str = Field(default="text-embedding-3-small")
    EMBEDDING_BASE_URL: str = Field(default="https://gms.ssafy.io/gmsapi/api.openai.com/v1/embeddings")

    # CrewAI 설정
    CREWAI_TELEMETRY_OPT_OUT: bool = Field(default=True)
    CREWAI_LOG_LEVEL: str = Field(default="WARNING")

    # --- 💾 인프라 설정 ---

    # 데이터베이스 설정
    DATABASE_URL: Optional[str] = Field(default=None)
    DB_HOST: str = Field(default="localhost")
    DB_PORT: int = Field(default=5432)
    DB_NAME: str = Field(default="captain_echo")
    DB_USER: str = Field(default="admin")
    DB_PASSWORD: str = Field(default="changeme")

    # Redis 설정
    REDIS_HOST: str = Field(default="localhost")
    REDIS_PORT: int = Field(default=6379)
    REDIS_PASSWORD: Optional[str] = Field(default="changeme")
    REDIS_DB: int = Field(default=0)

    # 백엔드 서비스 URL
    BACKEND_URL: str = Field(default="http://localhost:8080")

    # 캐시 설정
    CACHE_TTL: int = Field(default=3600)  # 1시간

    # 타임아웃 설정
    REQUEST_TIMEOUT: int = Field(default=30)  # 30초
    AI_PROCESSING_TIMEOUT: int = Field(default=120)  # 2분

    # --- Helper Methods ---

    def get_database_url(self) -> str:
        """데이터베이스 URL 생성"""
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    def get_redis_url(self) -> str:
        """Redis URL 생성"""
        if self.REDIS_PASSWORD:
            return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

# 설정 인스턴스 생성
settings = Settings()