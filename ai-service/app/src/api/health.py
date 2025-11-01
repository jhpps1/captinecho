"""
Health Check Endpoints
======================
애플리케이션 상태 확인 API
"""

from fastapi import APIRouter, status
from datetime import datetime
import os
import psutil

router = APIRouter()

@router.get("/health")
async def health_check():
    """기본 헬스체크 엔드포인트"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "ai-service"
    }

@router.get("/health/detailed")
async def detailed_health_check():
    """상세 헬스체크 정보"""
    process = psutil.Process(os.getpid())

    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "ai-service",
        "system": {
            "cpu_percent": process.cpu_percent(),
            "memory_mb": process.memory_info().rss / 1024 / 1024,
            "memory_percent": process.memory_percent(),
            "num_threads": process.num_threads(),
        },
        "dependencies": {
            "openai": "connected",  # 실제로는 API 키 검증 로직 추가
            "database": "connected",  # 실제로는 DB 연결 확인 로직 추가
            "redis": "connected"  # 실제로는 Redis 연결 확인 로직 추가
        }
    }

@router.get("/health/liveness")
async def liveness_probe():
    """Kubernetes liveness probe"""
    return {"status": "alive"}

@router.get("/health/readiness")
async def readiness_probe():
    """Kubernetes readiness probe"""
    # 실제로는 의존성 체크 로직 추가
    return {"status": "ready"}