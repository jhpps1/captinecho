# ==============================================
# React Frontend Dockerfile
# ==============================================
# Multi-stage build for optimized production

# ==============================================
# Stage 1: Build Stage
# ==============================================
FROM node:18-alpine as build

# 메타데이터
LABEL maintainer="edu-platform-team"
LABEL description="Education Platform React Frontend"
LABEL stage="build"

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 설치 (Alpine)
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# package.json과 package-lock.json 먼저 복사 (캐시 최적화)
COPY package*.json ./

# Node.js 의존성 설치
RUN npm ci --only=production --silent

# 소스 코드 복사
COPY . .

# 환경변수 설정 (빌드용)
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
ENV REACT_APP_API_URL=http://localhost:8080/api
ENV REACT_APP_AI_SERVICE_URL=http://localhost:8000/api/ai

# 애플리케이션 빌드
RUN npm run build

# ==============================================
# Stage 2: Production Stage (Nginx)
# ==============================================
FROM nginx:alpine

# 메타데이터
LABEL maintainer="edu-platform-team"
LABEL description="Education Platform React Frontend (Production)"
LABEL version="1.0"

# 빌드된 정적 파일 복사
COPY --from=build /app/dist /usr/share/nginx/html

# 커스텀 Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 헬스체크 페이지 추가
RUN echo '<!DOCTYPE html><html><head><title>Health Check</title></head><body><h1>Frontend is healthy</h1></body></html>' \
    > /usr/share/nginx/html/health.html

# 포트 노출
EXPOSE 80

# 헬스체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost/health.html || exit 1

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]