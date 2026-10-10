# Captain Echo (꼬마선장 에코)

> **AI 멀티 에이전트가 만드는 맞춤형 난독증 학습 여정**
> CrewAI hierarchical 프로세스로 전문가 에이전트 3명과 매니저 LLM이 주간 커리큘럼을 만듭니다.

## 목차
- [목차](#목차)
- [프로젝트 소개](#프로젝트-소개)
  - [기획 배경](#기획-배경)
  - [서비스 개요](#서비스-개요)
- [핵심 차별점: AI 멀티 에이전트 시스템](#핵심-차별점-ai-멀티-에이전트-시스템)
- [주요 기능](#주요-기능)
  - [학생용 기능](#학생용-기능)
  - [보호자용 기능](#보호자용-기능)
- [시스템 아키텍처](#시스템-아키텍처)
- [기술 스택](#기술-스택)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [AI Service](#ai-service)
  - [Infrastructure & DevOps](#infrastructure--devops)
- [프로젝트 구조](#프로젝트-구조)
- [설치 및 실행](#설치-및-실행)
  - [사전 요구사항](#사전-요구사항)
  - [환경 변수 설정](#환경-변수-설정)
  - [Docker Compose 실행](#docker-compose-실행)
  - [로컬 개발 환경](#로컬-개발-환경)
- [CI/CD 파이프라인](#cicd-파이프라인)
- [모니터링 및 로깅](#모니터링-및-로깅)
- [개발 기간](#개발-기간)

## 프로젝트 소개

### 기획 배경

**난독증(Dyslexia)**은 지능이나 학습 의욕과 무관하게 읽기와 쓰기에 어려움을 겪는 **음운인식 장애**입니다.
- 아동마다 관심사, 현재 수준, 음소 혼동 패턴이 다르다. 같은 교재로는 그 차이를 반영하기 어렵다.
- 유병률과 개선율 수치는 이 저장소에 없다.

### 서비스 개요

**Captain Echo**는 AI 멀티 에이전트가 아동의 학습 데이터를 분석하여 **매주 자동으로 맞춤 커리큘럼과 문제를 생성**하는 난독증 학습 플랫폼입니다.

- **기획 기간**: 2025.10.10 ~ 2025.11.20
- **개발 커밋**: 2025.10.14 ~ 2025.12.03
- **핵심 기술**: CrewAI, Spring Boot, React, FastAPI

**주요 특징**:
- 🎯 **개인 맞춤형 학습**: 초기 진단으로 음소 혼동 패턴 분석 후 약점 집중 학습
- 🤖 **AI 에이전트 협업**: `build_hierarchical_crew`가 난독증 치료 전문가, 아동 심리 전문가, 학부모 대리인을 만들고, 매니저 LLM이 커리큘럼 JSON을 받는다
- 🎮 **게임화된 학습**: 모험 컨셉의 4가지 유형 학습 문제 (음소 맞추기, 빈칸 채우기, 단어 맞추기, 읽기 평가)
- 🔄 **자동 적응형 난이도**: 주간 정답률 분석 후 자동으로 레벨 조정
- 📊 **보호자 대시보드**: 학습 진행 상황, 오답 패턴, AI 생성 주간 리포트 제공

## 핵심 차별점: AI 멀티 에이전트 시스템

Captain Echo의 가장 큰 기술적 차별점은 **CrewAI 기반 멀티 에이전트 협업 시스템**입니다.

### 에이전트 구성

실행 경로는 `ai-service/app/src/crew.py`의 `build_hierarchical_crew`다.

- 에이전트는 세 명이다. 역할 이름은 난독증 치료 전문가, 아동 심리 전문가, 학부모 대리인이다.
- 프로세스는 `Process.hierarchical`이다. 매니저는 `settings.OPENAI_MODEL` LLM이고 기본값은 gpt-4o다. `agents` 목록에는 들어 있지 않다.
- 태스크는 `curriculum_task` 하나다. `agent`는 `None`이고, 기대 출력은 JSON이다. 필드에는 `level_adjustment`, `curriculum_structure`, `dialogue`, `discussion_summary`가 있다.
- `agents/` 패키지에도 에이전트 빌더가 있다. `build_hierarchical_crew`는 그 패키지를 import하지 않는다.
- 문제 이미지는 모험 유형 2, 3이고 `GEMINI_API_KEY`가 있을 때 `imagen-4.0-generate-001`로 만든다.
- `server.py`가 기동하면 APScheduler가 매주 일요일 23:00 KST에 `total_weekly_batch`를 실행한다. 순서는 주간 리포트, CrewAI 커리큘럼, 문제 생성이다. `main.py` 주석에는 배치를 Spring Boot가 관리한다고 적혀 있다.

```python
crew = Crew(
    agents=[academic_agent, wellbeing_agent, parent_agent],
    tasks=[curriculum_task],
    process=Process.hierarchical,
    manager_llm=manager_llm,
)
```

개인화 정확도, 중도 포기율, 보호자 만족도 측정값은 이 저장소에 없다.

## 주요 기능

### 학생용 기능

#### 초기 진단 시스템
- 초기 진단 시드 `seed_initial_diagnosis_problems.sql`은 문제를 15개 넣는다. 파일 주석의 40은 자모 개수다.
- 진단 결과 기반 **개인 맞춤 학습 프로필** 생성
- AI가 약점 음소 우선순위 결정

#### 4가지 유형의 학습 모험
- **Type 1: 음소 맞추기** - 단어 듣고 정확한 자음/모음 선택
- **Type 2: 빈칸 채우기** - 문장 맥락에서 알맞은 음소 채우기
- **Type 3: 단어-이미지 매칭** - 그림 보고 정확한 단어 선택
- **Type 4: 읽기 평가 (STT)** - 음성 인식으로 발음 정확도 평가

#### 6단계 레벨 시스템
```
Level 1: 기본 자모 (ㄱ, ㄴ, ㄷ)
Level 2: 쌍자음 (ㄲ, ㄸ, ㅃ)
Level 3: 복잡한 모음 (ㅘ, ㅙ, ㅝ)
Level 4: 받침 조합
Level 5: 복합 단어
Level 6: 문장 독해
```
- `level_evaluator.should_adjust_level`: 평균 정확도 80% 이상이면 레벨을 1 올리고, 50% 이하면 1 내린다. 그 사이는 유지한다. 레벨 범위는 1에서 6이다.

#### 관심사 기반 학습
- 회원가입 시 관심사 선택 (동물, 스포츠, 음식, 자연 등)
- AI가 관심사 키워드로 문제 생성 → 학습 몰입도 ↑
  - 예: 동물 좋아하는 아동 → "강아지", "고양이" 단어 문제

#### 보상 시스템 (앵무새 상점)
- 학습 완료 시 가상 화폐 지급
- 앵무새 꾸미기 아이템 구매
- 학습 동기 부여 및 지속성 확보

### 보호자용 기능

#### 학생 관리
- 최대 **2명의 자녀** 프로필 관리
- PIN 번호로 학생 프로필 보호
- 자녀별 독립적인 학습 데이터 관리

#### 학습 목표 설정
보호자가 자녀의 학습 방향을 직접 선택:
- **약점 보완**: 틀린 음소 집중 학습
- **자신감 향상**: 적정 난이도 유지로 성취감 제공
- **난이도 상승**: 도전적 문제로 빠른 성장

→ Parent Agent가 이 목표를 커리큘럼 생성에 반영

#### AI 생성 주간 리포트
매주 AI가 자동 생성하는 상세 리포트:
- 📈 **학습 성과**: 정답률, 학습 시간, 연속 출석일
- 🎯 **약점 분석**: 음소별 정답률, 문제 유형별 성과
- 📋 **다음 주 계획**: AI 에이전트가 결정한 학습 목표 및 근거
- 💡 **학습 제안**: 가정에서 할 수 있는 추가 활동

#### 상세 분석 대시보드
- 📊 **정답률 추이 그래프** (일간/주간/월간)
- 🔍 **오답 패턴 분석** (자주 틀리는 음소 조합)
- ⏱️ **학습 시간 통계**
- 🏆 **성취 배지 및 마일스톤**

## 시스템 아키텍처

### 전체 시스템 구조

```
┌──────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                          │
│                    React 18 + TypeScript + Vite                   │
└───────────────────────────┬──────────────────────────────────────┘
                            │ HTTPS
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy + SSL                      │
│                   (CloudFlare Origin Certificate)                 │
└────────────┬─────────────────────────────────┬───────────────────┘
             │                                 │
             ↓                                 ↓
┌─────────────────────────────┐   ┌─────────────────────────────┐
│   Backend (Spring Boot)     │   │   AI Service (FastAPI)      │
│         Port 8080           │   │         Port 8000           │
├─────────────────────────────┤   ├─────────────────────────────┤
│ • REST API                  │   │ • CrewAI Multi-Agent        │
│ • JWT Authentication        │   │ • Curriculum Generation     │
│ • OAuth2 (Google)           │   │ • Problem Generation        │
│ • Business Logic            │◄──┤ • OpenAI (기본 gpt-4o)      │
│ • File Upload (S3)          │   │ • Imagen 이미지             │
│ • Email Service             │   │ • STT Evaluation            │
└──────────┬──────────────────┘   └──────────┬──────────────────┘
           │                                 │
           └──────────────┬──────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│                    PostgreSQL                            │
│                    Port 5432                             │
│  User Data · Learning Records · Curriculum · Problems    │
└──────────┬───────────────────────────────────────────────┘
           │
           ↓
┌──────────────────────┐
│   Redis Cache        │
│   Port 6379          │
│                      │
│ • PIN 복구 코드      │
│ • 학생 데이터 5분 캐시 │
│ • RQ 작업 큐         │
└──────────────────────┘

           ↓ Metrics

┌─────────────────────────────────────────────────────────────────┐
│              Monitoring Stack (Prometheus + Grafana)             │
│  • Backend Actuator Metrics  • AI Service Metrics  • DB Stats   │
└─────────────────────────────────────────────────────────────────┘
```

### 주요 통신 흐름

#### 1. 주간 커리큘럼 자동 생성
```
[AI Service APScheduler] 매주 일요일 23:00 KST
    ↓
total_weekly_batch
    ↓
주간 리포트 → CrewAI 커리큘럼 → 문제 생성
    ↓
PostgreSQL 저장
```

진단 직후의 커리큘럼 요청은 Spring이 AI 서비스의 `/api/curriculum/generate/{id}`와 `/api/problems/generate/{id}`를 호출하는 경로가 따로 있다.

#### 2. 문제 생성

문제 생성 API는 `POST /api/problems/generate/{student_id}`다. Redis에 넣는 캐시는 문제 JSON이 아니라 `student_data:{id}`이고, 유지 시간은 300초다.

#### 3. STT

음성 변환은 `POST /api/stt/transcribe`, 발음 평가는 `POST /api/stt/evaluate-pronunciation`다. 변환 모델은 `whisper-1`이다.

## 기술 스택

### Backend
<img src="https://img.shields.io/badge/Java_21-007396?style=flat-square&logo=openjdk&logoColor=white"/> <img src="https://img.shields.io/badge/Spring_Boot_3.5.7-6DB33F?style=flat-square&logo=springboot&logoColor=white"/> <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white"/> <img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white"/> <img src="https://img.shields.io/badge/AWS_S3-569A31?style=flat-square&logo=amazons3&logoColor=white"/>

- **Framework**: Spring Boot 3.5.7 (Java 21)
- **Database**: PostgreSQL (JPA/Hibernate ORM)
- **Cache**: Redis (세션 관리, Rate Limiting)
- **Authentication**:
  - OAuth2 (Google Login)
  - JWT Token (Access + Refresh)
- **Storage**: AWS S3 (음성 파일, 이미지)
- **Email**: Spring Mail (SMTP)
- **Monitoring**:
  - Spring Boot Actuator
  - Prometheus Metrics
  - Grafana Dashboard
- **API Docs**: SpringDoc OpenAPI 3.0 (Swagger UI)
- **Libraries**:
  - Lombok (보일러플레이트 제거)
  - MapStruct (DTO 변환)

### Frontend
<img src="https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black"/> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white"/> <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white"/> <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white"/> <img src="https://img.shields.io/badge/Zustand-000000?style=flat-square&logo=zustand&logoColor=white"/>

- **Framework**: React 18.2 + TypeScript 4.9
- **Build Tool**: Vite 5.0 (빠른 HMR)
- **Routing**: React Router 6.30
- **State Management**:
  - Zustand 4.4 (전역 상태)
  - TanStack React Query 5.8 (서버 상태)
- **Form Handling**: React Hook Form + Zod (스키마 검증)
- **Styling**:
  - Tailwind CSS 4.1
  - Framer Motion (애니메이션)
- **HTTP Client**: Axios + React Query
- **Authentication**: @react-oauth/google
- **Korean Text**: hangul-js (자모 분리/조합)
- **Charts**: Recharts (학습 분석 그래프)
- **Testing**: Vitest + React Testing Library

### AI Service
<img src="https://img.shields.io/badge/Python_3.11-3776AB?style=flat-square&logo=python&logoColor=white"/> <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white"/> <img src="https://img.shields.io/badge/CrewAI-FF6B6B?style=flat-square&logo=ai&logoColor=white"/> <img src="https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white"/>

- **Framework**: FastAPI 0.120.3
- **AI Orchestration**: CrewAI 1.3.0. 에이전트 3명과 매니저 LLM
- **LLM**: OpenAI. 기본 모델 이름은 `OPENAI_MODEL`이고 예시 값은 gpt-4o
- **이미지**: 모험 유형 2·3이고 키가 있을 때 Imagen `imagen-4.0-generate-001`
- **Scheduler**: APScheduler. 일요일 23:00 KST
- `requirements.txt`에 `chromadb`, `lancedb`, `tiktoken`, `instructor`, `pdfplumber`, `python-docx`, `pytube`가 있다. 앱 코드에서 import하지 않는다.
- **Database ORM**: SQLAlchemy
- **Cloud Storage**: boto3 (AWS S3)
- **Audio**: OpenAI Whisper API. 모델 이름은 `whisper-1`. 경로는 `/api/stt/transcribe`, `/api/stt/evaluate-pronunciation`

### Infrastructure & DevOps
<img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white"/> <img src="https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white"/> <img src="https://img.shields.io/badge/Jenkins-D24939?style=flat-square&logo=jenkins&logoColor=white"/> <img src="https://img.shields.io/badge/Prometheus-E6522C?style=flat-square&logo=prometheus&logoColor=white"/> <img src="https://img.shields.io/badge/Grafana-F46800?style=flat-square&logo=grafana&logoColor=white"/>

- **Containerization**:
  - Docker 24.x
  - Docker Compose (멀티 컨테이너 오케스트레이션)
- **Web Server**:
  - Nginx. 프론트 이미지는 `nginx:alpine`
  - CloudFlare SSL (Origin Certificate)
- **CI/CD**:
  - `Jenkinsfile`: develop는 dev, master는 prod
  - dev 배포는 develop의 머지 커밋만 진행한다
  - 배포는 `docker-compose.prod.yml`을 down한 뒤 up한다
- **Monitoring**:
  - Prometheus (메트릭 수집)
  - Grafana (대시보드 시각화)
  - Node Exporter (시스템 메트릭)
- **Database**:
  - PostgreSQL 15 (커스텀 init 스크립트)
  - Redis 7.x
- **Cloud**: AWS EC2 (Ubuntu 22.04)

## 프로젝트 구조

```
S13P31D101/
├── backend/                          # Spring Boot 백엔드
│   ├── src/main/java/com/captainecho/captainecho/
│   │   ├── adventure/               # 학습 모험/문제 도메인
│   │   │   ├── domain/              # Adventure, Problem 엔티티
│   │   │   ├── application/         # 비즈니스 로직
│   │   │   ├── presentation/        # REST API 컨트롤러
│   │   │   └── persistence/         # Repository
│   │   ├── ai/                      # AI 서비스 연동
│   │   │   ├── client/              # FastAPI 클라이언트
│   │   │   └── dto/                 # AI 요청/응답 DTO
│   │   ├── auth/                    # OAuth2 + JWT 인증
│   │   │   ├── oauth/               # Google OAuth 설정
│   │   │   └── jwt/                 # JWT 토큰 발급/검증
│   │   ├── diagnosis/               # 초기 진단 시스템
│   │   ├── student/                 # 학생 관리
│   │   ├── protector/               # 보호자 관리
│   │   ├── dashboard/               # 학습 분석 대시보드
│   │   ├── session/                 # 학습 세션 추적
│   │   └── scheduler/               # 주간 커리큘럼 스케줄러
│   ├── build.gradle                 # Gradle 의존성
│   ├── Dockerfile                   # 백엔드 도커 이미지
│   └── docs/                        # API 명세서
│
├── frontend/                         # React 프론트엔드
│   ├── src/
│   │   ├── pages/                   # 페이지 컴포넌트
│   │   │   ├── Login/               # 로그인 (Google OAuth)
│   │   │   ├── Diagnosis/           # 초기 진단
│   │   │   ├── Adventure/           # 학습 모험 (4가지 유형)
│   │   │   ├── Dashboard/           # 학습 분석
│   │   │   ├── Protector/           # 보호자 대시보드
│   │   │   └── Store/               # 앵무새 상점
│   │   ├── components/              # 재사용 컴포넌트
│   │   │   ├── common/              # 공통 UI
│   │   │   └── charts/              # 차트 컴포넌트
│   │   ├── api/                     # Axios 인스턴스 및 API 호출
│   │   ├── stores/                  # Zustand 스토어
│   │   ├── hooks/                   # 커스텀 훅
│   │   ├── router/                  # React Router 설정
│   │   └── utils/                   # 유틸리티 (hangul-js 등)
│   ├── package.json
│   ├── vite.config.ts               # Vite 설정
│   ├── tailwind.config.js           # Tailwind CSS 설정
│   └── Dockerfile
│
├── ai-service/                       # FastAPI AI 서비스
│   ├── app/src/
│   │   ├── agents/                  # 에이전트 빌더. crew.py는 import하지 않음
│   │   ├── api/                     # gemini_api, main_api, stt_api, tts_api, scheduler
│   │   ├── core/
│   │   ├── crew.py                  # build_hierarchical_crew
│   │   ├── server.py                # 스케줄러를 시작
│   │   ├── service/
│   │   ├── tasks/
│   │   └── utils/                   # level_evaluator, problem_job, llm
│   ├── requirements.txt
│   ├── Dockerfile
│   └── SET-AI-SERVER.md
│
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.ai.yml
│   │   ├── docker-compose.dev.yml
│   │   └── docker-compose.prod.yml
│   ├── grafana/
│   │   ├── datasources.yml
│   │   └── dashboards/dashboard-provider.yml
│   ├── nginx/
│   │   └── nginx.conf
│   ├── postgres/
│   │   └── init.sql
│   ├── prometheus/
│   │   └── prometheus.yml
│   └── scripts/local/
│
├── Jenkinsfile                       # Jenkins CI/CD 파이프라인
├── SPRING_SCHEDULER_GUIDE.md         # 스케줄러 구현 가이드
└── README.md                         # 이 문서
```

## 설치 및 실행

### 사전 요구사항

- **Docker**: 24.0 이상
- **Docker Compose**: 2.20 이상
- **OpenAI API Key**: GPT-4o 접근 권한
- **Google OAuth Client ID**: Google Cloud Console에서 발급
- **AWS S3 Bucket**: 파일 업로드용 (선택사항)

### 환경 변수 설정

예시 파일은 `ai-service/.env.example` 하나다. `.env.backend`, `.env.frontend`, `.env.ai`는 없다.

Backend와 compose가 읽는 이름은 `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `REDIS_HOST`, `JWT_SECRET`, `JWT_ACCESS_TOKEN_EXPIRY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OAUTH_REDIRECT_URI`, `AI_SERVICE_URL`, `MAIL_USERNAME`, `MAIL_PASSWORD`다.

- DB 이름은 `captain_echo`다.
- `OAUTH_REDIRECT_URI` 기본값은 `http://localhost:8080/login/oauth2/code/google`이다.
- `JWT_ACCESS_TOKEN_EXPIRY` 기본값은 3600000이다.
- 프론트 코드가 읽는 Vite 변수는 `VITE_GOOGLE_CLIENT_ID`다. API 호출은 Vite 프록시 `/api`가 `http://localhost:8080`으로 넘긴다.
- 이미지 키 이름은 `GEMINI_API_KEY`다. S3 키 이름은 `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`이다.
- 값의 자리는 `.env.example`과 `infrastructure/docker/docker-compose.dev.yml`을 본다. 비밀번호는 그 파일의 예시 값이다.

### Docker Compose 실행

루트에 `docker-compose.yml`은 없다. 파일은 `infrastructure/docker/`에 세 개다.

```bash
cd infrastructure/docker

# nginx, backend, postgres, redis, prometheus, grafana.
# ai-service 블록은 주석이다.
docker compose -f docker-compose.dev.yml up -d

# ai-service, node-exporter, redis-local.
docker compose -f docker-compose.ai.yml up -d

# Jenkins 배포가 사용하는 파일.
docker compose -f docker-compose.prod.yml up -d
```

#### 접속

- 개발 compose의 프론트(nginx): http://localhost (80)
- Vite 개발 서버: `frontend`에서 `npm run dev`. 포트 설정이 없으면 Vite 기본 5173이다.
- Backend: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html
- AI Service: http://localhost:8000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001. 비밀번호 환경 변수는 `GF_SECURITY_ADMIN_PASSWORD`다.

### 로컬 개발 환경

Docker 없이 로컬에서 개발하는 경우:

#### Backend

```bash
cd backend

# Gradle 빌드
./gradlew clean build

# 애플리케이션 실행 (application.yml 설정 필요)
./gradlew bootRun
```

#### Frontend

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행 (Vite HMR)
npm run dev

# 프로덕션 빌드
npm run build
```

#### AI Service

```bash
cd ai-service

# Python 가상환경 생성
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# FastAPI 서버 실행 (Hot Reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## CI/CD 파이프라인

배포 정의는 저장소 루트의 `Jenkinsfile`이다.

- `develop`는 dev, `master`는 prod다. 제한 시간은 30분이다.
- 환경 확인 단계에서 `docker`와 `docker compose version`을 출력한다.
- 체크아웃은 `checkout scm`이다. 그 단계의 echo 문장은 GitLab이라고 적혀 있다. Webhook 설정은 이 파일에 없다.
- Backend와 Frontend 이미지만 빌드한다. 이미지 이름은 `captain-echo-backend:latest`, `captain-echo-frontend:latest`다. AI 이미지 빌드 스테이지는 없다.
- dev 배포는 `develop`의 머지 커밋만 진행한다. prod 배포는 `master`에서 진행한다.
- 배포 디렉터리는 `/home/ubuntu/projects/S13P31D101`이다. `infrastructure/docker/docker-compose.prod.yml`을 `down`한 뒤 `up -d`한다.
- 헬스 체크는 `http://localhost:8080/api/health`와 `http://localhost/health`다.
- Blue-Green 단계와 Slack 알림 단계는 이 파일에 없다.

## 모니터링 및 로깅

Prometheus 설정은 `infrastructure/prometheus/prometheus.yml`이다. 전역 scrape 간격은 15초다.

수집 대상:

- `prometheus` `localhost:9090` (30초)
- `spring-boot-backend` `backend:8080` `/actuator/prometheus` (15초)
- `fastapi-ai-service` `ai-service:8000` `/metrics` (15초)
- `postgres-exporter:9187`, `redis-exporter:9121`, `nginx-exporter:9113` (30초)
- `node-exporter-backend` `localhost:9100`, `node-exporter-ai` `10.0.2.20:9100` (30초)
- `cadvisor:8080` (30초)
- `custom-edu-metrics`도 `backend:8080` `/actuator/prometheus`를 긁는다. 교육 메트릭 이름 필터가 있다.

`docker-compose.dev.yml`과 `docker-compose.prod.yml`의 서비스에는 postgres-exporter, redis-exporter, nginx-exporter, cadvisor가 없다. node-exporter는 `docker-compose.ai.yml`에 있다.

`alertmanagers`의 `alertmanager:9093`과 `rule_files`는 주석이다. Slack, Email 임계값 알림은 연결되어 있지 않다.

Grafana 파일은 `infrastructure/grafana/datasources.yml`과 `dashboards/dashboard-provider.yml`이다. 프로바이더 이름은 edu-platform, infrastructure, applications, ai-services다. 대시보드 JSON은 이 저장소에 없다.

Sentry와 CloudWatch 설정은 이 저장소에 없다.

## 개발 기간

기획 문서에 적힌 기간은 **2025.10.10 ~ 2025.11.20**이다.

이 브랜치의 개발 커밋은 **2025.10.14 ~ 2025.12.03**이다.

주차별 산출물 목록은 이 저장소에 없다.

<div align="center">

**Captain Echo**는 난독증 아동과 보호자를 위한 진심 어린 기술 프로젝트입니다.
모든 아이들이 읽기의 즐거움을 느낄 수 있기를 바랍니다.

</div>
