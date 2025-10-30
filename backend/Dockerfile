# ==============================================
# Captain Echo Backend Dockerfile
# ==============================================
# Multi-stage build for optimized production image
# Multi-arch support: ARM64 (EC2) & x86_64 (로컬 개발)

# ==============================================
# Stage 1: Build Stage
# ==============================================
FROM eclipse-temurin:21-jdk-alpine as build

# 메타데이터
LABEL maintainer="captain-echo-team"
LABEL description="Captain Echo Spring Boot Backend (Build Stage)"
LABEL stage="build"

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 설치 (Alpine)
RUN apk add --no-cache \
    curl \
    bash

# Gradle Wrapper와 build.gradle 먼저 복사 (캐시 최적화)
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Gradle Wrapper 실행 권한 부여 및 Windows 줄바꿈 문제 해결
RUN chmod +x gradlew && \
    sed -i 's/\r$//' gradlew

# 의존성 다운로드 (캐시 레이어)
RUN ./gradlew dependencies --no-daemon

# 소스 코드 복사
COPY src src

# 애플리케이션 빌드
RUN ./gradlew clean bootJar --no-daemon

# JAR 파일 압축 해제 (레이어 캐싱 최적화)
RUN mkdir -p build/dependency && \
    cd build/dependency && \
    jar -xf ../libs/app.jar

# ==============================================
# Stage 2: Runtime Stage
# ==============================================
FROM eclipse-temurin:21-jre-alpine

# 메타데이터
LABEL maintainer="captain-echo-team"
LABEL description="Captain Echo Spring Boot Backend (난독증 치료 플랫폼)"
LABEL version="1.0.0"
LABEL project="S13P31D101"

# 비루트 사용자 생성 (Alpine)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 설치 (Alpine - 최소화)
RUN apk add --no-cache \
    curl \
    bash \
    dumb-init \
    tzdata

# 타임존 설정 (Asia/Seoul)
ENV TZ=Asia/Seoul
RUN cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo "Asia/Seoul" > /etc/timezone

# 로그 디렉토리 생성
RUN mkdir -p /app/logs && \
    chown -R appuser:appgroup /app

# 빌드된 애플리케이션 복사 (레이어별 복사로 캐싱 최적화)
COPY --from=build --chown=appuser:appgroup /app/build/dependency/BOOT-INF/lib /app/lib
COPY --from=build --chown=appuser:appgroup /app/build/dependency/META-INF /app/META-INF
COPY --from=build --chown=appuser:appgroup /app/build/dependency/BOOT-INF/classes /app

# 헬스체크 스크립트 추가
COPY --chown=appuser:appgroup <<'EOF' /app/healthcheck.sh
#!/bin/bash
curl -f http://localhost:8080/actuator/health || exit 1
EOF

RUN chmod +x /app/healthcheck.sh

# 비루트 사용자로 실행
USER appuser

# 포트 노출
EXPOSE 8080

# JVM 옵션 설정 (ARM64 & x86_64 공통 최적화)
ENV JAVA_OPTS="-Xms512m -Xmx1024m \
    -XX:+UseG1GC \
    -XX:G1HeapRegionSize=16m \
    -XX:+UseStringDeduplication \
    -XX:+OptimizeStringConcat \
    -XX:MaxMetaspaceSize=256m \
    -XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0"

# 애플리케이션 설정
ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8080

# 헬스체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD /app/healthcheck.sh

# dumb-init을 사용하여 PID 1 문제 해결
ENTRYPOINT ["dumb-init", "--"]

# 애플리케이션 실행
CMD ["sh", "-c", "java $JAVA_OPTS -cp /app:/app/lib/* com.captainecho.captainecho.CaptainechoApplication"]
