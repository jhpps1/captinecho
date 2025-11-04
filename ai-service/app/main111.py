"""
Captain Echo AI Service - Main Application
===========================================
FastAPI + CrewAI 기반 교육 플랫폼 AI 서비스
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_client import make_asgi_app
import structlog

from app.src.core.config import settings
from app.api import health, agents, curriculum

# 구조화된 로깅 설정
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.dev.ConsoleRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리"""
    # 시작 시
    logger.info("Starting Captain Echo AI Service", version=settings.VERSION)

    # CrewAI 초기화 (필요 시)
    # await initialize_crews()

    yield

    # 종료 시
    logger.info("Shutting down Captain Echo AI Service")
    # 정리 작업
    # await cleanup_resources()

# FastAPI 앱 인스턴스 생성
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Captain Echo AI Service - Education Platform with CrewAI",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 전역 예외 처리
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception", exc_info=exc, path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# API 라우터 등록
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(agents.router, prefix="/api/agents", tags=["AI Agents"])
app.include_router(curriculum.router, prefix="/api/curriculum", tags=["Curriculum"])

# Prometheus 메트릭 엔드포인트 추가
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# 루트 경로
@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "service": "Captain Echo AI Service",
        "version": settings.VERSION,
        "status": "running",
        "docs": "/docs" if settings.ENVIRONMENT != "production" else None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )