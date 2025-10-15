#!/bin/bash

# ==============================================
# 로컬 개발 환경 정리 스크립트
# ==============================================
# 모든 컨테이너, 볼륨, 네트워크를 정리합니다

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}"
echo "=================================================="
echo "🧹 교육 플랫폼 로컬 환경 정리"
echo "   Local Environment Cleanup"
echo "=================================================="
echo -e "${NC}"

# 프로젝트 루트로 이동
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/../../../"
cd "$PROJECT_ROOT"

echo -e "${BLUE}📂 프로젝트 디렉토리: $(pwd)${NC}"

# 정리 모드 선택
echo ""
echo "정리 모드를 선택하세요:"
echo "1) 기본 정리 (컨테이너만 중지/제거)"
echo "2) 완전 정리 (볼륨 포함, 데이터 삭제)"
echo "3) 전체 정리 (이미지까지 삭제)"
echo ""
read -p "선택하세요 (1-3): " -n 1 -r
echo ""

case $REPLY in
    1)
        CLEANUP_MODE="basic"
        echo -e "${BLUE}기본 정리 모드를 선택했습니다.${NC}"
        ;;
    2)
        CLEANUP_MODE="full"
        echo -e "${YELLOW}완전 정리 모드를 선택했습니다. (데이터가 삭제됩니다)${NC}"
        echo -e "${RED}⚠️  PostgreSQL 및 Redis 데이터가 삭제됩니다!${NC}"
        read -p "계속 진행하시겠습니까? (y/N) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "정리를 취소했습니다."
            exit 1
        fi
        ;;
    3)
        CLEANUP_MODE="complete"
        echo -e "${RED}전체 정리 모드를 선택했습니다. (모든 데이터와 이미지가 삭제됩니다)${NC}"
        echo -e "${RED}⚠️  다시 다운로드/빌드해야 합니다!${NC}"
        read -p "정말로 계속 진행하시겠습니까? (y/N) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "정리를 취소했습니다."
            exit 1
        fi
        ;;
    *)
        echo -e "${RED}잘못된 선택입니다. 스크립트를 종료합니다.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${YELLOW}🧹 정리 시작...${NC}"

# ==============================================
# 1. 컨테이너 중지 및 제거
# ==============================================
echo -e "\n${BLUE}1. 컨테이너 중지 및 제거...${NC}"

# Docker Compose로 서비스 중지
if [ -f "infrastructure/docker/docker-compose.dev.yml" ]; then
    echo "Docker Compose 서비스 중지..."
    docker-compose -f infrastructure/docker/docker-compose.dev.yml down --remove-orphans 2>/dev/null || true
    echo -e "${GREEN}✅ Docker Compose 서비스 중지 완료${NC}"
fi

# 개별 컨테이너 중지 (혹시 남아있는 경우)
CONTAINERS=(
    "nginx"
    "spring-boot"
    "fastapi"
    "postgres"
    "redis"
    "prometheus"
    "grafana"
)

for container in "${CONTAINERS[@]}"; do
    if docker ps -a --format "table {{.Names}}" | grep -q "^${container}$"; then
        echo "컨테이너 ${container} 중지 및 제거..."
        docker stop "$container" 2>/dev/null || true
        docker rm "$container" 2>/dev/null || true
    fi
done

echo -e "${GREEN}✅ 모든 컨테이너 정리 완료${NC}"

# ==============================================
# 2. 볼륨 정리 (full/complete 모드)
# ==============================================
if [[ "$CLEANUP_MODE" == "full" ]] || [[ "$CLEANUP_MODE" == "complete" ]]; then
    echo -e "\n${BLUE}2. 볼륨 정리...${NC}"

    # Docker Compose 볼륨 제거
    docker-compose -f infrastructure/docker/docker-compose.dev.yml down -v 2>/dev/null || true

    # 명명된 볼륨 제거
    VOLUMES=(
        "postgres-data"
        "redis-data"
        "prometheus-data"
        "grafana-data"
        "backend-logs"
        "ai-logs"
    )

    for volume in "${VOLUMES[@]}"; do
        docker volume rm "$volume" 2>/dev/null || true
    done

    # 로컬 볼륨 디렉토리 정리
    if [ -d "volumes" ]; then
        echo "로컬 볼륨 디렉토리 정리..."
        rm -rf volumes/*
    fi

    if [ -d "logs" ]; then
        echo "로그 디렉토리 정리..."
        rm -rf logs/*
    fi

    echo -e "${GREEN}✅ 볼륨 정리 완료${NC}"
fi

# ==============================================
# 3. 네트워크 정리
# ==============================================
echo -e "\n${BLUE}3. 네트워크 정리...${NC}"

# 프로젝트 관련 네트워크 제거
docker network rm edu-platform_app-network 2>/dev/null || true
docker network rm infrastructure_app-network 2>/dev/null || true

# 사용하지 않는 네트워크 제거
docker network prune -f 2>/dev/null || true

echo -e "${GREEN}✅ 네트워크 정리 완료${NC}"

# ==============================================
# 4. 이미지 정리 (complete 모드)
# ==============================================
if [[ "$CLEANUP_MODE" == "complete" ]]; then
    echo -e "\n${BLUE}4. 이미지 정리...${NC}"

    # 프로젝트 관련 이미지 제거
    PROJECT_IMAGES=(
        "infrastructure_backend"
        "infrastructure_ai-service"
        "infrastructure_nginx"
    )

    for image in "${PROJECT_IMAGES[@]}"; do
        docker rmi "$image" 2>/dev/null || true
    done

    # 사용하지 않는 이미지 제거
    docker image prune -a -f 2>/dev/null || true

    echo -e "${GREEN}✅ 이미지 정리 완료${NC}"
fi

# ==============================================
# 5. 시스템 정리
# ==============================================
echo -e "\n${BLUE}5. Docker 시스템 정리...${NC}"

# 사용하지 않는 모든 리소스 정리
docker system prune -f 2>/dev/null || true

# 빌드 캐시 정리 (complete 모드)
if [[ "$CLEANUP_MODE" == "complete" ]]; then
    docker builder prune -a -f 2>/dev/null || true
fi

echo -e "${GREEN}✅ 시스템 정리 완료${NC}"

# ==============================================
# 6. 정리 결과 출력
# ==============================================
echo ""
echo -e "${GREEN}🎉 정리 완료!${NC}"
echo ""

# 디스크 사용량 확인
DOCKER_SIZE=$(docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}" | tail -n +2)
echo -e "${CYAN}📊 Docker 리소스 사용량:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$DOCKER_SIZE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo -e "${YELLOW}💡 다음 단계:${NC}"
case $CLEANUP_MODE in
    "basic")
        echo "• setup-local.sh를 실행하여 환경을 다시 시작할 수 있습니다"
        echo "• 데이터는 보존되었습니다"
        ;;
    "full")
        echo "• setup-local.sh를 실행하여 환경을 다시 시작할 수 있습니다"
        echo "• 데이터베이스가 초기화되었습니다"
        ;;
    "complete")
        echo "• setup-local.sh를 실행하면 이미지를 다시 다운로드합니다"
        echo "• 모든 데이터가 삭제되었습니다"
        ;;
esac

echo ""
echo -e "${GREEN}정리가 완료되었습니다! 🧹✨${NC}"