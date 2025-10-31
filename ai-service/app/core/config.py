"""
Application Configuration
=========================
환경 변수 및 설정 관리
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    """애플리케이션 설정"""

    # 기본 설정
    PROJECT_NAME: str = "Captain Echo AI Service"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=True, env="DEBUG")

    # 서버 설정
    PORT: int = Field(default=8000, env="PORT")
    HOST: str = Field(default="0.0.0.0", env="HOST")
    WORKERS: int = Field(default=1, env="WORKERS")

    # 로깅 설정
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FILE: str = Field(default="/app/logs/ai-service.log", env="LOG_FILE")

    # CORS 설정
    ALLOWED_ORIGINS: List[str] = Field(
        default=[
            "http://localhost",
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8080",
        ],
        env="ALLOWED_ORIGINS"
    )

    # OpenAI 설정 (CrewAI용)
    OPENAI_API_KEY: str = Field(..., env="OPENAI_API_KEY")
    OPENAI_MODEL_NAME: str = Field(default="gpt-4o-mini", env="OPENAI_MODEL_NAME")
    OPENAI_MODEL: str = Field(default="openai/gpt-4.1-nano", env="OPENAI_MODEL")  # ← 꼭 추가!
    OPENAI_BASE_URL: Optional[str] = Field(default=None, env="OPENAI_BASE_URL")
    OPENAI_TEMPERATURE: float = Field(default=0.7, env="OPENAI_TEMPERATURE")
    OPENAI_MAX_TOKENS: int = Field(default=4000, env="OPENAI_MAX_TOKENS")

    # CrewAI 설정
    CREWAI_TELEMETRY_OPT_OUT: bool = Field(default=True, env="CREWAI_TELEMETRY_OPT_OUT")
    CREWAI_LOG_LEVEL: str = Field(default="WARNING", env="CREWAI_LOG_LEVEL")

    # 데이터베이스 설정
    DATABASE_URL: Optional[str] = Field(default=None, env="DATABASE_URL")
    DB_HOST: str = Field(default="localhost", env="DB_HOST")
    DB_PORT: int = Field(default=5432, env="DB_PORT")
    DB_NAME: str = Field(default="captain_echo", env="DB_NAME")
    DB_USER: str = Field(default="admin", env="DB_USER")
    DB_PASSWORD: str = Field(default="changeme", env="DB_PASSWORD")

    # Redis 설정
    REDIS_HOST: str = Field(default="localhost", env="REDIS_HOST")
    REDIS_PORT: int = Field(default=6379, env="REDIS_PORT")
    REDIS_PASSWORD: Optional[str] = Field(default="changeme", env="REDIS_PASSWORD")
    REDIS_DB: int = Field(default=0, env="REDIS_DB")

    # 백엔드 서비스 URL
    BACKEND_URL: str = Field(default="http://localhost:8080", env="BACKEND_URL")

    # 캐시 설정
    CACHE_TTL: int = Field(default=3600, env="CACHE_TTL")  # 1시간

    # 타임아웃 설정
    REQUEST_TIMEOUT: int = Field(default=30, env="REQUEST_TIMEOUT")  # 30초
    AI_PROCESSING_TIMEOUT: int = Field(default=120, env="AI_PROCESSING_TIMEOUT")  # 2분

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

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
