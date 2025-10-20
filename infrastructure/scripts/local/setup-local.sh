#!/bin/bash

# ==============================================
# 교육 플랫폼 로컬 개발 환경 셋업 스크립트
# ==============================================
# 이 스크립트는 로컬에서 전체 시스템을 실행합니다
# Docker Compose를 사용하여 모든 서비스를 한 번에 시작

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 로고 출력
echo -e "${PURPLE}"
echo "=================================================="
echo "🎓 교육 플랫폼 로컬 개발 환경"
echo "   Local Development Environment Setup"
echo "=================================================="
echo -e "${NC}"

# 프로젝트 루트 디렉토리로 이동
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/../../../"
cd "$PROJECT_ROOT"

echo -e "${BLUE}📂 프로젝트 디렉토리: $(pwd)${NC}"

# ==============================================
# 1. 환경 체크
# ==============================================
echo -e "\n${YELLOW}🔍 시스템 환경 체크...${NC}"

# Docker 설치 확인
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker가 설치되지 않았습니다!${NC}"
    echo "Docker Desktop을 설치하고 다시 실행해주세요."
    echo "다운로드: https://www.docker.com/products/docker-desktop"
    exit 1
else
    echo -e "${GREEN}✅ Docker: $(docker --version)${NC}"
fi

# Docker Compose 설치 확인
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose가 설치되지 않았습니다!${NC}"
    echo "Docker Desktop에 포함되어 있어야 합니다."
    exit 1
else
    echo -e "${GREEN}✅ Docker Compose: $(docker-compose --version)${NC}"
fi

# Docker 실행 상태 확인
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker가 실행되지 않았습니다!${NC}"
    echo "Docker Desktop을 실행하고 다시 시도해주세요."
    exit 1
else
    echo -e "${GREEN}✅ Docker 데몬: 실행 중${NC}"
fi

# ==============================================
# 2. 환경변수 파일 체크
# ==============================================
echo -e "\n${YELLOW}📋 환경변수 설정 체크...${NC}"

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo -e "${YELLOW}⚠️  .env 파일이 없습니다. .env.example을 복사합니다.${NC}"
        cp .env.example .env
        echo -e "${GREEN}✅ .env 파일이 생성되었습니다.${NC}"
        echo -e "${CYAN}💡 필요한 환경변수를 수정하세요:${NC}"
        echo "   - OPENAI_API_KEY: OpenAI API 키"
        echo "   - JWT_SECRET: JWT 시크릿 키"
        echo "   - DB_PASSWORD: 데이터베이스 비밀번호"
        echo ""
        read -p "환경변수 설정을 완료했습니다. 계속 진행하시겠습니까? (y/N) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}환경변수를 설정한 후 다시 실행해주세요.${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ .env.example 파일이 없습니다!${NC}"
        echo "프로젝트 루트에 .env.example 파일이 있는지 확인해주세요."
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env 파일: 존재함${NC}"
fi

# 필수 환경변수 체크
source .env
if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" == "sk-your-openai-api-key-here" ]; then
    echo -e "${YELLOW}⚠️  OpenAI API 키가 설정되지 않았습니다.${NC}"
    echo "AI 서비스는 정상 동작하지 않을 수 있습니다."
fi

# ==============================================
# 3. 필요한 디렉토리 생성
# ==============================================
echo -e "\n${YELLOW}📁 필요한 디렉토리 생성...${NC}"

mkdir -p infrastructure/nginx/ssl
mkdir -p infrastructure/postgres/backup
mkdir -p logs/{backend,ai-service,nginx}
mkdir -p volumes/{postgres,redis,grafana,prometheus}

echo -e "${GREEN}✅ 디렉토리 생성 완료${NC}"

# ==============================================
# 4. 기존 컨테이너 정리
# ==============================================
echo -e "\n${YELLOW}🧹 기존 컨테이너 정리...${NC}"

# 기존 컨테이너 중지 및 제거
docker-compose -f infrastructure/docker/docker-compose.dev.yml down --remove-orphans 2>/dev/null || true

# 사용하지 않는 네트워크 제거
docker network prune -f 2>/dev/null || true

echo -e "${GREEN}✅ 정리 완료${NC}"

# ==============================================
# 5. Docker 이미지 빌드/다운로드
# ==============================================
echo -e "\n${YELLOW}🔨 Docker 이미지 준비...${NC}"

# 기본 이미지들 미리 다운로드
echo "Base images 다운로드 중..."
docker pull nginx:alpine &
docker pull postgres:15-alpine &
docker pull redis:7-alpine &
docker pull prom/prometheus:latest &
docker pull grafana/grafana:latest &

# 백그라운드 작업 완료 대기
wait

echo -e "${GREEN}✅ 기본 이미지 다운로드 완료${NC}"

# ==============================================
# 6. 컨테이너 시작
# ==============================================
echo -e "\n${YELLOW}🚀 컨테이너 시작...${NC}"

# 인프라 서비스부터 시작 (순서 중요)
echo "데이터베이스 및 캐시 서비스 시작..."
docker-compose -f infrastructure/docker/docker-compose.dev.yml up -d postgres redis

echo "데이터베이스 준비 대기 중..."
sleep 15

# 나머지 서비스 시작
echo "애플리케이션 및 모니터링 서비스 시작..."
docker-compose -f infrastructure/docker/docker-compose.dev.yml up -d

# ==============================================
# 7. 헬스체크
# ==============================================
echo -e "\n${YELLOW}🏥 서비스 헬스체크...${NC}"

sleep 10

# PostgreSQL 체크
echo -n "PostgreSQL 상태 체크... "
if docker exec postgres pg_isready -U admin -d edudb > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

# Redis 체크
echo -n "Redis 상태 체크... "
if docker exec redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

# Backend 체크 (빌드되어 있는 경우만)
if docker ps --format "table {{.Names}}" | grep -q "spring-boot"; then
    echo -n "Backend 상태 체크... "
    # 30초 대기 후 체크 (빌드 시간 고려)
    for i in {1..6}; do
        if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ OK${NC}"
            break
        else
            if [ $i -eq 6 ]; then
                echo -e "${YELLOW}⏳ 아직 준비 중 (빌드 진행중일 수 있음)${NC}"
            else
                echo -n "."
                sleep 5
            fi
        fi
    done
fi

# AI Service 체크 (빌드되어 있는 경우만)
if docker ps --format "table {{.Names}}" | grep -q "fastapi"; then
    echo -n "AI Service 상태 체크... "
    for i in {1..6}; do
        if curl -f http://localhost:8000/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ OK${NC}"
            break
        else
            if [ $i -eq 6 ]; then
                echo -e "${YELLOW}⏳ 아직 준비 중 (빌드 진행중일 수 있음)${NC}"
            else
                echo -n "."
                sleep 5
            fi
        fi
    done
fi

# Prometheus 체크
echo -n "Prometheus 상태 체크... "
if curl -f http://localhost:9090/-/healthy > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⏳ 시작 중...${NC}"
fi

# Grafana 체크
echo -n "Grafana 상태 체크... "
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⏳ 시작 중...${NC}"
fi

# ==============================================
# 8. 결과 출력
# ==============================================
echo -e "\n${GREEN}🎉 로컬 개발 환경 설정 완료!${NC}"
echo ""
echo -e "${CYAN}📊 접속 정보:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "🌐 ${BLUE}Nginx:${NC}           http://localhost"
echo -e "🖥️  ${BLUE}Backend API:${NC}     http://localhost:8080"
echo -e "🤖 ${BLUE}AI Service:${NC}      http://localhost:8000"
echo -e "📈 ${BLUE}Grafana:${NC}         http://localhost:3001 (admin/admin123)"
echo -e "📊 ${BLUE}Prometheus:${NC}      http://localhost:9090"
echo -e "🗄️  ${BLUE}PostgreSQL:${NC}      localhost:5432 (admin/password123)"
echo -e "🔴 ${BLUE}Redis:${NC}           localhost:6379"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo -e "${CYAN}🛠️  유용한 명령어:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "• 로그 확인:     docker-compose -f infrastructure/docker/docker-compose.dev.yml logs -f"
echo "• 특정 서비스:   docker logs <container_name> -f"
echo "• 컨테이너 상태: docker ps"
echo "• 중지:         docker-compose -f infrastructure/docker/docker-compose.dev.yml down"
echo "• 재시작:       docker-compose -f infrastructure/docker/docker-compose.dev.yml restart"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo -e "${YELLOW}💡 참고 사항:${NC}"
echo "• Backend/AI Service는 처음 실행시 빌드 시간이 필요할 수 있습니다"
echo "• OpenAI API 키가 없으면 AI 서비스가 제한적으로 작동합니다"
echo "• 문제 발생시 'infrastructure/scripts/local/cleanup.sh'를 실행 후 재시도하세요"

echo ""
echo -e "${GREEN}Happy Coding! 🚀${NC}"

# 실시간 로그 표시 옵션
echo ""
read -p "실시간 로그를 확인하시겠습니까? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}실시간 로그 시작 (Ctrl+C로 종료)...${NC}"
    docker-compose -f infrastructure/docker/docker-compose.dev.yml logs -f
fi