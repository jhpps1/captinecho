# ==============================================
# Spring Boot Backend Dockerfile
# ==============================================
# Multi-stage build for optimized production image

# ==============================================
# Stage 1: Build Stage
# ==============================================
FROM openjdk:21-jdk-slim as build

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 설치
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Maven Wrapper와 pom.xml 먼저 복사 (캐시 최적화)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Maven Wrapper 실행 권한 부여
RUN chmod +x mvnw

# 의존성 다운로드 (캐시 레이어)
RUN ./mvnw dependency:go-offline -B

# 소스 코드 복사
COPY src src

# 애플리케이션 빌드
RUN ./mvnw clean package -DskipTests -B

# JAR 파일명 확인 및 표준화
RUN mkdir -p target/dependency && \
    cd target/dependency && \
    jar -xf ../app*.jar

# ==============================================
# Stage 2: Runtime Stage
# ==============================================
FROM openjdk:21-jre-slim

# 메타데이터
LABEL maintainer="edu-platform-team"
LABEL description="Education Platform Spring Boot Backend"
LABEL version="1.0"

# 비루트 사용자 생성
RUN groupadd -r appgroup && useradd -r -g appgroup -d /app -s /sbin/nologin appuser

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 설치 (최소화)
RUN apt-get update && apt-get install -y \
    curl \
    dumb-init \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# 로그 디렉토리 생성
RUN mkdir -p /app/logs && \
    chown -R appuser:appgroup /app

# 빌드된 애플리케이션 복사
COPY --from=build --chown=appuser:appgroup /app/target/dependency/BOOT-INF/lib /app/lib
COPY --from=build --chown=appuser:appgroup /app/target/dependency/META-INF /app/META-INF
COPY --from=build --chown=appuser:appgroup /app/target/dependency/BOOT-INF/classes /app

# 헬스체크 스크립트 추가
COPY --chown=appuser:appgroup <<EOF /app/healthcheck.sh
#!/bin/bash
curl -f http://localhost:8080/actuator/health || exit 1
EOF

RUN chmod +x /app/healthcheck.sh

# 비루트 사용자로 실행
USER appuser

# 포트 노출
EXPOSE 8080

# JVM 옵션 설정
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:G1HeapRegionSize=16m -XX:+UseStringDeduplication -XX:+OptimizeStringConcat"

# 애플리케이션 설정
ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8080

# 헬스체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD /app/healthcheck.sh

# dumb-init을 사용하여 PID 1 문제 해결
ENTRYPOINT ["dumb-init", "--"]

# 애플리케이션 실행
CMD ["java", "-cp", "/app:/app/lib/*", "com.eduplatform.EduPlatformApplication"]