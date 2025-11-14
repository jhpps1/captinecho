"""
Captain Echo AI Service - FastAPI Application
=============================================
난독증 어린이를 위한 AI 기반 학습 커리큘럼 생성 서비스
"""

import sys
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.src.core.config import settings
# from app.src.api.scheduler.batch_scheduler import start_scheduler, stop_scheduler  # Spring 스케줄러로 이전
from app.src.api import main_api
from app.src.api.stt_api import router as stt_router  # develop 브랜치에서 추가된 STT API

# ============================================
# 로깅 설정
# ============================================
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

# ============================================
# 애플리케이션 라이프사이클 (배치 스케줄러)
# ============================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI 앱 시작/종료 시 실행되는 라이프사이클 이벤트
    - 시작: 배치 스케줄러 시작 (일요일 23:00 자동 실행)
    - 종료: 배치 스케줄러 정리
    """
    # Startup
    logger.info("[STARTUP] Captain Echo AI Service started")
    logger.info(f"[ENV] Environment: {settings.ENVIRONMENT}")
    logger.info(f"[AI] OpenAI Model: {settings.OPENAI_MODEL}")
    logger.info(f"[DB] Database: {settings.DB_NAME}@{settings.DB_HOST}:{settings.DB_PORT}")
    logger.info("[SCHEDULER] Batch scheduling moved to Spring Boot service")

    # 배치 스케줄러는 Spring Boot 서버에서 처리 (매주 일요일 23:00)
    # Spring이 다음 API를 호출:
    # - POST /api/curriculum/generate/{student_id}
    # - POST /api/problems/generate/{student_id}

    yield

    # Shutdown
    logger.info("[SHUTDOWN] Captain Echo AI Service stopping...")
    # Batch scheduler는 Spring Boot에서 관리

# ============================================
# FastAPI 앱 생성
# ============================================
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=__doc__,
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

# ============================================
# CORS 설정 (프론트엔드 연동)
# ============================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# 라우터 등록
# ============================================
app.include_router(
    main_api.router,
    prefix="/api",
    tags=["AI Service"]
)
app.include_router(
    stt_router,
    prefix="/api",
    tags=["STT Service"]
)

# ============================================
# 기본 엔드포인트
# ============================================
@app.get("/")
async def root():
    """서비스 정보 및 상태 확인"""
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "running",
        "environment": settings.ENVIRONMENT,
        "features": {
            "crewai_hierarchical": True,
            "curriculum_generation": True,
            "problem_generation": True,
            "image_generation": "Gemini Imagen 3.0",
            "tts": "OpenAI GMS TTS",
            "batch_scheduler": "Sunday 23:00 KST"
        },
        "endpoints": {
            "docs": "/docs" if settings.DEBUG else "disabled",
            "health": "/health",
            "api": "/api"
        }
    }


@app.get("/health")
async def health_check():
    """
    헬스체크 엔드포인트 (Docker healthcheck, 모니터링용)
    """
    try:
        # DB 연결 확인 (선택사항)
        from app.src.core.database import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        db_status = "healthy"
    except Exception as e:
        logger.error(f"DB 헬스체크 실패: {e}")
        db_status = "unhealthy"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "components": {
            "api": "healthy",
            "database": db_status,
            "scheduler": "running"
        }
    }


@app.get("/api/info")
async def api_info():
    """API 상세 정보"""
    return {
        "openai": {
            "model": settings.OPENAI_MODEL,
            "base_url": settings.OPENAI_BASE_URL or "default",
            "temperature": settings.OPENAI_TEMPERATURE
        },
        "crewai": {
            "telemetry": not settings.CREWAI_TELEMETRY_OPT_OUT,
            "log_level": settings.CREWAI_LOG_LEVEL
        },
        "database": {
            "host": settings.DB_HOST,
            "port": settings.DB_PORT,
            "name": settings.DB_NAME
        },
        "cache": {
            "redis_host": settings.REDIS_HOST,
            "redis_port": settings.REDIS_PORT
        }
    }


# ============================================
# 에러 핸들러
# ============================================
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """전역 예외 처리"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": str(exc) if settings.DEBUG else "An error occurred",
            "type": type(exc).__name__
        }
    )


# ============================================
# 개발 환경 실행 (uvicorn)
# ============================================
if __name__ == "__main__":
    import uvicorn

    logger.info(f"[START] Starting {settings.PROJECT_NAME} in development mode...")
    logger.info(f"[URL] http://{settings.HOST}:{settings.PORT}")
    logger.info(f"[DOCS] http://{settings.HOST}:{settings.PORT}/docs")

    uvicorn.run(
        "app.src.server:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
        timeout_keep_alive=300
    )
