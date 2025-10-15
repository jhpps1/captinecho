# ==============================================
# FastAPI + CrewAI Service Dockerfile
# ==============================================
# Python 3.11 optimized for AI/ML workloads

FROM python:3.11-slim

# 메타데이터
LABEL maintainer="edu-platform-team"
LABEL description="Education Platform AI Service (FastAPI + CrewAI)"
LABEL version="1.0"

# 환경변수 설정
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    POETRY_VERSION=1.6.1

# 시스템 패키지 설치
RUN apt-get update && apt-get install -y \
    # 기본 빌드 도구
    build-essential \
    gcc \
    g++ \
    # 네트워크 및 유틸리티
    curl \
    wget \
    git \
    # PostgreSQL 클라이언트
    postgresql-client \
    libpq-dev \
    # 기타 유틸리티
    dumb-init \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 비루트 사용자 생성
RUN groupadd -r appgroup && \
    useradd -r -g appgroup -d /app -s /sbin/nologin appuser

# 작업 디렉토리 설정
WORKDIR /app

# Python 의존성 파일 복사 (캐시 최적화)
COPY requirements.txt .

# Python 패키지 설치
RUN pip install --upgrade pip && \
    pip install -r requirements.txt && \
    # 캐시 정리
    pip cache purge

# 애플리케이션 소스 복사
COPY --chown=appuser:appgroup . .

# 로그 디렉토리 생성
RUN mkdir -p /app/logs && \
    chown -R appuser:appgroup /app

# 헬스체크 스크립트 생성
RUN echo '#!/bin/bash\ncurl -f http://localhost:8000/health || exit 1' > /app/healthcheck.sh && \
    chmod +x /app/healthcheck.sh && \
    chown appuser:appgroup /app/healthcheck.sh

# 비루트 사용자로 전환
USER appuser

# 포트 노출
EXPOSE 8000

# 환경변수 설정
ENV WORKERS=2 \
    TIMEOUT=300 \
    KEEPALIVE=65 \
    MAX_REQUESTS=1000 \
    MAX_REQUESTS_JITTER=100

# CrewAI 환경변수
ENV CREWAI_TELEMETRY_OPT_OUT=true \
    CREWAI_LOG_LEVEL=WARNING

# 헬스체크
HEALTHCHECK --interval=30s --timeout=15s --start-period=90s --retries=3 \
    CMD /app/healthcheck.sh

# dumb-init을 사용하여 PID 1 문제 해결
ENTRYPOINT ["dumb-init", "--"]

# Uvicorn으로 FastAPI 실행
CMD ["python", "-m", "uvicorn", "app.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "1", \
     "--timeout-keep-alive", "65", \
     "--access-log", \
     "--log-config", "app/logging.conf"]