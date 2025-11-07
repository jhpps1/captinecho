# ==============================================
# Captain Echo Frontend Dockerfile (Production)
# ==============================================
# Multi-stage build for optimized production
# Multi-arch support: ARM64 (EC2) & x86_64 (로컬 개발)

# ==============================================
# Stage 1: Build Stage
# ==============================================
FROM node:20-alpine as build

# 메타데이터
LABEL maintainer="captain-echo-team"
LABEL description="Captain Echo React Frontend (Build Stage)"
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
RUN npm ci

# 소스 코드 복사
COPY . .

# 환경변수 설정 (빌드용 - Vite)
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
ENV VITE_API_URL=http://localhost:8080/api
ENV VITE_AI_SERVICE_URL=http://localhost:8000/api/ai
ENV VITE_GOOGLE_CLIENT_ID=354888789925-a90npa5jacksapnjgna9ok47kc8jcj7v.apps.googleusercontent.com

# 애플리케이션 빌드
RUN npm run build

# ==============================================
# Stage 2: Production Stage (Nginx)
# ==============================================
FROM nginx:alpine

# 메타데이터
LABEL maintainer="captain-echo-team"
LABEL description="Captain Echo React Frontend (난독증 치료 플랫폼)"
LABEL version="1.0.0"
LABEL project="S13P31D101"

# 타임존 설정
ENV TZ=Asia/Seoul
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo "Asia/Seoul" > /etc/timezone && \
    apk del tzdata

# 빌드된 정적 파일 복사
COPY --from=build /app/dist /usr/share/nginx/html

# 커스텀 Nginx 설정 복사 (있으면)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# 기본 Nginx 설정 (SPA 지원)
RUN echo 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    \n\
    # Gzip 압축\n\
    gzip on;\n\
    gzip_vary on;\n\
    gzip_min_length 10240;\n\
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;\n\
    \n\
    # SPA 라우팅 지원\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    \n\
    # 정적 파일 캐싱\n\
    location /assets/ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
    \n\
    # 헬스체크\n\
    location /health {\n\
        access_log off;\n\
        return 200 "healthy\\n";\n\
        add_header Content-Type text/plain;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 80

# 헬스체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
