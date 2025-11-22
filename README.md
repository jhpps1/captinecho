# 🚢 Captain Echo (꼬마선장 에코)

> **AI 멀티 에이전트가 만드는 맞춤형 난독증 학습 여정**
> CrewAI 기반 3+1 에이전트 협업으로 아동 개개인에게 최적화된 학습 커리큘럼을 자동 생성합니다.

<br />

## 📄 목차
- [📄 목차](#-목차)
- [✨ 프로젝트 소개](#-프로젝트-소개)
  - [기획 배경](#기획-배경)
  - [서비스 개요](#서비스-개요)
- [🤖 핵심 차별점: AI 멀티 에이전트 시스템](#-핵심-차별점-ai-멀티-에이전트-시스템)
- [🚀 주요 기능](#-주요-기능)
  - [학생용 기능](#학생용-기능)
  - [보호자용 기능](#보호자용-기능)
- [🏛️ 시스템 아키텍처](#️-시스템-아키텍처)
- [⚙️ 기술 스택](#️-기술-스택)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [AI Service](#ai-service)
  - [Infrastructure & DevOps](#infrastructure--devops)
- [📁 프로젝트 구조](#-프로젝트-구조)
- [🚀 설치 및 실행](#-설치-및-실행)
  - [사전 요구사항](#사전-요구사항)
  - [환경 변수 설정](#환경-변수-설정)
  - [Docker Compose 실행](#docker-compose-실행)
  - [로컬 개발 환경](#로컬-개발-환경)
- [🔄 CI/CD 파이프라인](#-cicd-파이프라인)
- [📊 모니터링 및 로깅](#-모니터링-및-로깅)
- [🧡 팀원 소개](#-팀원-소개)
- [📅 개발 기간](#-개발-기간)

<br />

---

<br />

## ✨ 프로젝트 소개

### 기획 배경

**난독증(Dyslexia)**은 지능이나 학습 의욕과 무관하게 읽기와 쓰기에 어려움을 겪는 **음운인식 장애**입니다.
- 국내 초등학생의 **약 5-10%**가 난독증으로 추정됩니다
- 조기 발견 및 개입 시 **80% 이상 개선 가능**하지만, 개인별 맞춤 학습 콘텐츠 부족이 문제입니다
- 기존 획일적인 학습 교재는 **아동의 관심사, 현재 수준, 음소 혼동 패턴**을 반영하지 못합니다

### 서비스 개요

**Captain Echo**는 AI 멀티 에이전트가 아동의 학습 데이터를 분석하여 **매주 자동으로 맞춤 커리큘럼과 문제를 생성**하는 난독증 학습 플랫폼입니다.

- **개발 기간**: 2025.10.10 ~ 2025.11.20 (6주)
- **팀 구성**: 6명 (Backend 2, Frontend 2, AI 1, Infra 1)
- **핵심 기술**: CrewAI 멀티 에이전트 시스템, Spring Boot, React, FastAPI

**주요 특징**:
- 🎯 **개인 맞춤형 학습**: 초기 진단으로 음소 혼동 패턴 분석 후 약점 집중 학습
- 🤖 **AI 에이전트 협업**: 학습전문가·심리전문가·학부모대표 에이전트가 토론하여 최적 커리큘럼 생성
- 🎮 **게임화된 학습**: 모험 컨셉의 4가지 유형 학습 문제 (음소 맞추기, 빈칸 채우기, 단어 맞추기, 읽기 평가)
- 🔄 **자동 적응형 난이도**: 주간 정답률 분석 후 자동으로 레벨 조정
- 📊 **보호자 대시보드**: 학습 진행 상황, 오답 패턴, AI 생성 주간 리포트 제공

<br />

---

<br />

## 🤖 핵심 차별점: AI 멀티 에이전트 시스템

Captain Echo의 가장 큰 기술적 차별점은 **CrewAI 기반 멀티 에이전트 협업 시스템**입니다.

### 🎭 4-Agent 협업 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    Manager Agent (조율자)                     │
│           GPT-4o 기반 최종 의사결정 및 품질 검증              │
└────────────────────┬────────────────────────────────────────┘
                     │ 조율 및 합의 도출
        ┌────────────┼────────────┐
        ↓            ↓            ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Academic     │ │ Wellbeing    │ │ Parent       │
│ Agent        │ │ Agent        │ │ Agent        │
├──────────────┤ ├──────────────┤ ├──────────────┤
│ 학습 전문가   │ │ 심리 전문가   │ │ 학부모 대표   │
│              │ │              │ │              │
│• 음소 혼동    │ │• 인지 부하    │ │• 보호자 목표  │
│  패턴 분석    │ │  모니터링     │ │  반영         │
│• 난이도 조정  │ │• 자신감 관리  │ │• 학습량 균형  │
│• 학습 효율    │ │• 학습 동기    │ │• 실용성 검증  │
│  최적화       │ │  향상         │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
        ↓            ↓            ↓
        └────────────┼────────────┘
                     ↓
          📋 맞춤형 주간 커리큘럼 생성
    (레벨, 문제 유형, 목표 음소, 학습 목표)
```

### 🔄 동작 원리

1. **데이터 수집**: 학생의 주간 학습 데이터 (정답률, 오답 패턴, 소요 시간, 현재 레벨)
2. **에이전트 토론** (Hierarchical Process):
   - Academic Agent: "ㄱ-ㄲ 혼동률 65% → 레벨 3 유지하며 집중 학습 필요"
   - Wellbeing Agent: "주간 정답률 45% → 자신감 저하 우려, 쉬운 문제 30% 포함"
   - Parent Agent: "보호자 목표: 약점 보완 → 혼동 음소 중심 구성 동의, 학습량 적정성 확인"
   - Manager Agent: "레벨 3, ㄱ-ㄲ 집중(60%), 복습(30%), 신규(10%) 배분으로 결정"
3. **커리큘럼 생성**: 에이전트 합의 결과를 JSON으로 구조화
4. **문제 자동 생성**: 커리큘럼 기반으로 LLM(GPT-4o/Gemini)이 실제 학습 문제 생성
5. **주간 재생성**: 매주 일요일 23:00 자동 실행 (APScheduler)

### 📊 학습 데이터 기반 의사결정

```python
# ai-service/app/src/crew.py 핵심 로직
class CaptainEchoCrew:
    def generate_weekly_curriculum(self, student_data):
        """
        CrewAI Hierarchical Process:
        - Manager Agent가 3개 전문가 에이전트 조율
        - 각 에이전트는 전문 영역에서 의견 제시
        - 토론 과정과 최종 결정 근거 문서화
        """
        crew = Crew(
            agents=[academic_agent, wellbeing_agent, parent_agent, manager_agent],
            tasks=[analyze_task, recommend_task, validate_task, finalize_task],
            process=Process.hierarchical,  # 계층적 의사결정
            manager_llm=ChatOpenAI(model="gpt-4o")
        )
        result = crew.kickoff(inputs=student_data)
        return result.json_dict  # 구조화된 커리큘럼
```

### 🎯 실제 적용 효과

- ✅ **개인화 정확도**: 음소별 혼동률 패턴 반영으로 학습 효율 ↑
- ✅ **학습 지속성**: 심리 전문가 에이전트의 난이도 조절로 중도 포기율 ↓
- ✅ **보호자 신뢰**: 투명한 의사결정 과정 제공으로 만족도 ↑

<br />

---

<br />

## 🚀 주요 기능

### 학생용 기능

#### 1️⃣ 초기 진단 시스템
- 40개 문항으로 **자모 혼동 패턴** 정밀 분석 (예: ㄱ-ㄲ, ㅓ-ㅕ)
- 진단 결과 기반 **개인 맞춤 학습 프로필** 생성
- AI가 약점 음소 우선순위 결정

#### 2️⃣ 4가지 유형의 학습 모험
- **Type 1: 음소 맞추기** - 단어 듣고 정확한 자음/모음 선택
- **Type 2: 빈칸 채우기** - 문장 맥락에서 알맞은 음소 채우기
- **Type 3: 단어-이미지 매칭** - 그림 보고 정확한 단어 선택
- **Type 4: 읽기 평가 (STT)** - 음성 인식으로 발음 정확도 평가

#### 3️⃣ 6단계 레벨 시스템
```
Level 1: 기본 자모 (ㄱ, ㄴ, ㄷ)
Level 2: 쌍자음 (ㄲ, ㄸ, ㅃ)
Level 3: 복잡한 모음 (ㅘ, ㅙ, ㅝ)
Level 4: 받침 조합
Level 5: 복합 단어
Level 6: 문장 독해
```
- 주간 정답률 70% 이상 시 자동 레벨업
- 50% 미만 시 레벨 유지 및 복습 강화

#### 4️⃣ 관심사 기반 학습
- 회원가입 시 관심사 선택 (동물, 스포츠, 음식, 자연 등)
- AI가 관심사 키워드로 문제 생성 → 학습 몰입도 ↑
  - 예: 동물 좋아하는 아동 → "강아지", "고양이" 단어 문제

#### 5️⃣ 보상 시스템 (앵무새 상점)
- 학습 완료 시 가상 화폐 지급
- 앵무새 꾸미기 아이템 구매
- 학습 동기 부여 및 지속성 확보

<br />

### 보호자용 기능

#### 1️⃣ 학생 관리
- 최대 **2명의 자녀** 프로필 관리
- PIN 번호로 학생 프로필 보호
- 자녀별 독립적인 학습 데이터 관리

#### 2️⃣ 학습 목표 설정
보호자가 자녀의 학습 방향을 직접 선택:
- **약점 보완**: 틀린 음소 집중 학습
- **자신감 향상**: 적정 난이도 유지로 성취감 제공
- **난이도 상승**: 도전적 문제로 빠른 성장

→ Parent Agent가 이 목표를 커리큘럼 생성에 반영

#### 3️⃣ AI 생성 주간 리포트
매주 AI가 자동 생성하는 상세 리포트:
- 📈 **학습 성과**: 정답률, 학습 시간, 연속 출석일
- 🎯 **약점 분석**: 음소별 정답률, 문제 유형별 성과
- 📋 **다음 주 계획**: AI 에이전트가 결정한 학습 목표 및 근거
- 💡 **학습 제안**: 가정에서 할 수 있는 추가 활동

#### 4️⃣ 상세 분석 대시보드
- 📊 **정답률 추이 그래프** (일간/주간/월간)
- 🔍 **오답 패턴 분석** (자주 틀리는 음소 조합)
- ⏱️ **학습 시간 통계**
- 🏆 **성취 배지 및 마일스톤**

<br />

---

<br />

## 🏛️ 시스템 아키텍처

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
│ • Business Logic            │◄──┤ • LLM Integration           │
│ • Scheduled Tasks           │   │   - OpenAI GPT-4o           │
│   (Weekly Curriculum)       │   │   - Google Gemini           │
│ • File Upload (S3)          │   │ • Vector DB (ChromaDB)      │
│ • Email Service             │   │ • STT Evaluation            │
└──────────┬──────────────────┘   └──────────┬──────────────────┘
           │                                 │
           ↓                                 ↓
┌──────────────────────┐           ┌────────────────────┐
│   PostgreSQL DB      │           │  ChromaDB          │
│   Port 5432          │           │  LanceDB           │
│                      │           │  (Vector Store)    │
│ • User Data          │           └────────────────────┘
│ • Learning Records   │
│ • Curriculum         │
│ • Problem Sets       │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│   Redis Cache        │
│   Port 6379          │
│                      │
│ • Session Store      │
│ • Rate Limiting      │
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
[Spring Scheduler] (매주 일요일 23:00 KST)
    ↓
[GET] /api/students/{id}/weekly-data
    ↓
[POST] AI Service /api/curriculum/generate
    ↓
CrewAI Multi-Agent 토론 (3-5분 소요)
    ↓
커리큘럼 JSON 반환
    ↓
[POST] /api/curriculum/save
    ↓
PostgreSQL 저장
```

#### 2. 실시간 문제 생성
```
학생 학습 시작
    ↓
[GET] /api/adventures/problems?curriculum_id=xxx
    ↓
[POST] AI Service /api/problems/generate
    ↓
LLM (GPT-4o) 문제 생성
    ↓
문제 JSON 반환 및 캐싱 (Redis)
    ↓
클라이언트 응답
```

#### 3. STT 읽기 평가
```
학생 음성 녹음
    ↓
[POST] /api/evaluation/speech (MP3 파일)
    ↓
AWS S3 업로드
    ↓
[POST] AI Service /api/stt/evaluate
    ↓
Whisper API 변환
    ↓
정답 텍스트와 비교 (음소 단위)
    ↓
정답률 및 피드백 반환
```

<br />

---

<br />

## ⚙️ 기술 스택

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
<img src="https://img.shields.io/badge/Python_3.11-3776AB?style=flat-square&logo=python&logoColor=white"/> <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white"/> <img src="https://img.shields.io/badge/CrewAI-FF6B6B?style=flat-square&logo=ai&logoColor=white"/> <img src="https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white"/> <img src="https://img.shields.io/badge/ChromaDB-FF6B6B?style=flat-square&logo=database&logoColor=white"/>

- **Framework**: FastAPI 0.120
- **AI Orchestration**: **CrewAI 1.3** (Hierarchical Multi-Agent)
- **LLM**:
  - OpenAI GPT-4o (메인)
  - Google Gemini 1.5 Pro (보조)
- **Vector Database**:
  - ChromaDB (문제 임베딩)
  - LanceDB (성능 최적화)
- **Database ORM**: SQLAlchemy 2.0
- **Scheduler**: APScheduler (주간 커리큘럼 생성)
- **ML Libraries**:
  - tiktoken (토큰 계산)
  - instructor (구조화된 LLM 출력)
  - tokenizers (텍스트 전처리)
- **Document Processing**:
  - pdfplumber (PDF 파싱)
  - python-docx (DOCX 파싱)
  - pytube (유튜브 자막 추출)
- **Cloud Storage**: boto3 (AWS S3)
- **Audio**: OpenAI Whisper API (STT)

### Infrastructure & DevOps
<img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white"/> <img src="https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white"/> <img src="https://img.shields.io/badge/Jenkins-D24939?style=flat-square&logo=jenkins&logoColor=white"/> <img src="https://img.shields.io/badge/Prometheus-E6522C?style=flat-square&logo=prometheus&logoColor=white"/> <img src="https://img.shields.io/badge/Grafana-F46800?style=flat-square&logo=grafana&logoColor=white"/>

- **Containerization**:
  - Docker 24.x
  - Docker Compose (멀티 컨테이너 오케스트레이션)
- **Web Server**:
  - Nginx 1.25 (리버스 프록시)
  - CloudFlare SSL (Origin Certificate)
- **CI/CD**:
  - Jenkins 2.x (자동 빌드/배포)
  - GitLab Webhook 연동
  - develop 브랜치 → EC2 자동 배포
- **Monitoring**:
  - Prometheus (메트릭 수집)
  - Grafana (대시보드 시각화)
  - Node Exporter (시스템 메트릭)
- **Database**:
  - PostgreSQL 15 (커스텀 init 스크립트)
  - Redis 7.x
- **Cloud**: AWS EC2 (Ubuntu 22.04)

<br />

---

<br />

## 📁 프로젝트 구조

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
│   │   ├── agents/                  # CrewAI 에이전트 정의
│   │   │   ├── academic.py          # 학습 전문가 에이전트
│   │   │   ├── wellbeing.py         # 심리 전문가 에이전트
│   │   │   ├── parent.py            # 학부모 대표 에이전트
│   │   │   └── manager_agent.py     # 관리자 에이전트 (조율)
│   │   ├── crew.py                  # CrewAI Hierarchical 설정
│   │   ├── api/                     # FastAPI 라우터
│   │   │   ├── curriculum.py        # 커리큘럼 생성 API
│   │   │   ├── problems.py          # 문제 생성 API
│   │   │   └── evaluation.py        # STT 평가 API
│   │   ├── core/                    # 핵심 설정
│   │   │   ├── database.py          # SQLAlchemy 설정
│   │   │   ├── config.py            # 환경 변수
│   │   │   └── models.py            # DB 모델
│   │   ├── llm/                     # LLM 클라이언트
│   │   │   ├── openai_client.py     # OpenAI GPT-4o
│   │   │   └── gemini_client.py     # Google Gemini
│   │   └── vectordb/                # 벡터 DB
│   │       ├── chroma.py
│   │       └── lance.py
│   ├── requirements.txt             # Python 의존성
│   ├── Dockerfile
│   └── SET-AI-SERVER.md             # AI 서버 설정 가이드
│
├── infrastructure/                   # DevOps 및 배포 설정
│   ├── docker/                      # Docker Compose 설정
│   │   ├── docker-compose.yml       # 전체 서비스 오케스트레이션
│   │   ├── docker-compose.dev.yml   # 개발 환경
│   │   └── docker-compose.prod.yml  # 프로덕션 환경
│   ├── nginx/                       # Nginx 설정
│   │   ├── nginx.conf               # 메인 설정
│   │   ├── ssl/                     # SSL 인증서 (CloudFlare)
│   │   └── conf.d/                  # 서비스별 설정
│   ├── postgres/                    # PostgreSQL 초기화
│   │   └── init.sql                 # 스키마 및 초기 데이터
│   └── prometheus/                  # 모니터링 설정
│       ├── prometheus.yml           # Prometheus 설정
│       └── grafana/                 # Grafana 대시보드
│
├── Jenkinsfile                       # Jenkins CI/CD 파이프라인
├── SPRING_SCHEDULER_GUIDE.md         # 스케줄러 구현 가이드
└── README.md                         # 이 문서
```

<br />

---

<br />

## 🚀 설치 및 실행

### 사전 요구사항

- **Docker**: 24.0 이상
- **Docker Compose**: 2.20 이상
- **OpenAI API Key**: GPT-4o 접근 권한
- **Google OAuth Client ID**: Google Cloud Console에서 발급
- **AWS S3 Bucket**: 파일 업로드용 (선택사항)

### 환경 변수 설정

#### 1. Backend 환경 변수 (`.env.backend`)

```bash
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=captainecho
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=3600000  # 1시간

# OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# AWS S3
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
AWS_S3_BUCKET=captainecho-files
AWS_REGION=ap-northeast-2

# AI Service
AI_SERVICE_URL=http://ai-service:8000

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

#### 2. Frontend 환경 변수 (`.env.frontend`)

```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

#### 3. AI Service 환경 변수 (`.env.ai`)

```bash
# Database
DATABASE_URL=postgresql://postgres:your_password@postgres:5432/captainecho

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key_here
OPENAI_MODEL=gpt-4o

# Google Gemini
GOOGLE_API_KEY=your_gemini_api_key_here

# CrewAI
CREWAI_TELEMETRY_OPT_OUT=true

# Vector DB
CHROMA_DB_PATH=/app/data/chroma
LANCE_DB_PATH=/app/data/lance

# AWS S3
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
AWS_S3_BUCKET=captainecho-files
```

### Docker Compose 실행

#### 전체 서비스 한 번에 실행

```bash
# 프로젝트 루트에서
cd infrastructure/docker

# 환경 변수 파일 생성 후 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

#### 개별 서비스 실행

```bash
# 1. 데이터베이스 먼저 실행
docker-compose up -d postgres redis

# 2. 백엔드 실행 (DB 준비 완료 후)
docker-compose up -d backend

# 3. AI 서비스 실행
docker-compose up -d ai-service

# 4. 프론트엔드 실행
docker-compose up -d frontend

# 5. Nginx 실행
docker-compose up -d nginx
```

#### 서비스 접속 URL

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **AI Service Docs**: http://localhost:8000/docs
- **Grafana**: http://localhost:3001 (admin / admin)
- **Prometheus**: http://localhost:9090

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

<br />

---

<br />

## 🔄 CI/CD 파이프라인

### GitLab → Jenkins 연동

```
┌─────────────┐         Webhook          ┌─────────────┐
│   GitLab    ├─────────────────────────►│   Jenkins   │
│  (develop)  │  Push to develop branch  │   Server    │
└─────────────┘                          └──────┬──────┘
                                                │
                                                ↓
                                    ┌───────────────────────┐
                                    │  Jenkins Pipeline     │
                                    ├───────────────────────┤
                                    │ 1. Git Clone          │
                                    │ 2. Build Backend      │
                                    │    - ./gradlew build  │
                                    │ 3. Build Frontend     │
                                    │    - npm run build    │
                                    │ 4. Docker Image Build │
                                    │ 5. Push to Registry   │
                                    │ 6. Deploy to EC2      │
                                    │    - docker-compose   │
                                    │       up -d           │
                                    └───────────┬───────────┘
                                                │
                                                ↓
                                    ┌───────────────────────┐
                                    │   AWS EC2 (Ubuntu)    │
                                    │   - Backend Container │
                                    │   - Frontend Container│
                                    │   - AI Service        │
                                    │   - Nginx             │
                                    └───────────────────────┘
```

### Jenkinsfile 주요 스테이지

```groovy
pipeline {
    agent any

    stages {
        stage('Checkout') {
            // GitLab에서 소스 코드 클론
        }

        stage('Build Backend') {
            steps {
                sh './gradlew clean build'
                sh 'docker build -t captainecho/backend:latest ./backend'
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'npm ci && npm run build'
                sh 'docker build -t captainecho/frontend:latest ./frontend'
            }
        }

        stage('Build AI Service') {
            steps {
                sh 'docker build -t captainecho/ai-service:latest ./ai-service'
            }
        }

        stage('Deploy to EC2') {
            steps {
                // SSH로 EC2 접속 후 docker-compose up -d 실행
                sh 'ssh ec2-user@your-ec2-ip "cd /app && docker-compose up -d"'
            }
        }

        stage('Health Check') {
            steps {
                // 각 서비스 헬스 체크
                sh 'curl http://your-domain/api/actuator/health'
                sh 'curl http://your-domain/ai/health'
            }
        }
    }

    post {
        success {
            // 슬랙 알림 (선택사항)
        }
        failure {
            // 배포 실패 알림
        }
    }
}
```

### 배포 자동화 프로세스

1. **개발자**: `git push origin develop`
2. **GitLab**: Webhook으로 Jenkins에 푸시 이벤트 전송
3. **Jenkins**:
   - 소스 코드 클론
   - 각 서비스 빌드 및 테스트
   - Docker 이미지 빌드
4. **EC2**:
   - 새 이미지로 컨테이너 재시작
   - Zero-downtime 배포 (Blue-Green)
5. **헬스 체크**: 모든 서비스 정상 동작 확인

<br />

---

<br />

## 📊 모니터링 및 로깅

### Prometheus + Grafana 스택

#### Prometheus 메트릭 수집 대상

1. **Backend (Spring Boot Actuator)**
   - JVM 메모리/GC 메트릭
   - HTTP 요청 수, 응답 시간, 에러율
   - DB 커넥션 풀 상태
   - 커스텀 메트릭 (예: 주간 커리큘럼 생성 성공/실패)

2. **AI Service (FastAPI)**
   - LLM API 호출 횟수 및 응답 시간
   - CrewAI 에이전트 실행 시간
   - 문제 생성 성공/실패율
   - Vector DB 쿼리 성능

3. **Infrastructure**
   - Node Exporter: CPU, 메모리, 디스크 사용률
   - PostgreSQL Exporter: 쿼리 성능, 커넥션 수
   - Redis Exporter: 캐시 히트율, 메모리 사용량

#### Grafana 대시보드

- **시스템 개요 대시보드**: 전체 서비스 상태 한눈에 보기
- **백엔드 성능 대시보드**: API 응답 시간, 에러율, TPS
- **AI 서비스 대시보드**: LLM 호출 통계, 커리큘럼 생성 성공률
- **인프라 대시보드**: 서버 리소스 사용률

### 주요 모니터링 지표

| 서비스 | 메트릭 | 임계값 | 알림 |
|-------|--------|--------|------|
| Backend | API 응답 시간 | > 1초 | Slack |
| Backend | 에러율 | > 5% | Email |
| AI Service | LLM 응답 시간 | > 10초 | Slack |
| PostgreSQL | 커넥션 수 | > 80% | Slack |
| EC2 | CPU 사용률 | > 80% | Email |

### 로깅 전략

- **Backend**: SLF4J + Logback → JSON 포맷으로 stdout 출력
- **Frontend**: Console.log (개발), Sentry (프로덕션 에러 추적)
- **AI Service**: Python logging → 구조화된 로그
- **중앙 집중 로깅**: Docker logs → CloudWatch Logs (선택사항)

<br />

---

<br />

## 🧡 팀원 소개

<!-- 이 섹션은 사용자가 직접 작성합니다 -->

| 이름 | 역할 | GitHub | 주요 담당 |
|------|------|--------|----------|
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |

<br />

---

<br />

## 📅 개발 기간

**2025.10.10 ~ 2025.11.20** (6주)

- **Week 1-2**: 기획, 요구사항 분석, 기술 스택 선정
- **Week 3**: 백엔드 API 개발, AI 에이전트 프로토타입
- **Week 4**: 프론트엔드 UI/UX 구현, AI 서비스 연동
- **Week 5**: 통합 테스트, 버그 픽스, 성능 최적화
- **Week 6**: 최종 QA, 문서화, 배포

<br />

---

<br />

<div align="center">

**Captain Echo**는 난독증 아동과 보호자를 위한 진심 어린 기술 프로젝트입니다.
모든 아이들이 읽기의 즐거움을 느낄 수 있기를 바랍니다. 📚✨

</div>
