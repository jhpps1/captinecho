# Captain Echo

난독증 아동의 학습 데이터로 주간 커리큘럼과 문제를 만드는 플랫폼이다. CrewAI hierarchical 프로세스로 전문가 에이전트 3명과 매니저 LLM이 커리큘럼 JSON을 만든다.

기획 문서의 기간은 2025.10.10부터 2025.11.20까지다. 이 브랜치의 개발 커밋은 2025.10.14부터 2025.12.03까지다. 주차별 산출물 목록은 이 저장소에 없다.

## 목차

- [서비스](#서비스)
- [에이전트](#에이전트)
- [기능](#기능)
- [요청 흐름](#요청-흐름)
- [기술 스택](#기술-스택)
- [디렉터리](#디렉터리)
- [실행](#실행)
- [배포](#배포)
- [모니터링](#모니터링)
- [팀](#팀)

## 서비스

난독증은 지능이나 학습 의욕과 무관하게 읽기와 쓰기에 어려움을 겪는 음운인식 장애다. 아동마다 관심사, 현재 수준, 음소 혼동 패턴이 달라서 같은 교재로는 맞추기 어렵다. 유병률과 개선율 수치는 이 저장소에 없다.

핵심 기술은 CrewAI, Spring Boot, React, FastAPI다.

- 초기 진단으로 음소 혼동 패턴을 보고 약점 위주로 학습한다.
- `build_hierarchical_crew`가 난독증 치료 전문가, 아동 심리 전문가, 학부모 대리인을 만들고, 매니저 LLM이 커리큘럼 JSON을 받는다.
- 학습 문제는 음소 맞추기, 빈칸 채우기, 단어 맞추기, 읽기 평가 네 가지다.
- 주간 정답률로 레벨을 조정한다.
- 보호자 화면에서 진행 상황, 오답 패턴, 주간 리포트를 본다.

## 에이전트

실행 경로는 `ai-service/app/src/crew.py`의 `build_hierarchical_crew`다.

에이전트는 세 명이다. 역할 이름은 난독증 치료 전문가, 아동 심리 전문가, 학부모 대리인이다. 프로세스는 `Process.hierarchical`이다. 매니저는 `settings.OPENAI_MODEL` LLM이고 기본값은 gpt-4o다. `agents` 목록에는 들어 있지 않다.

태스크는 `curriculum_task` 하나다. `agent`는 `None`이고, 기대 출력은 JSON이다. 필드는 `level_adjustment`, `curriculum_structure`, `dialogue`, `discussion_summary`다.

`agents/` 패키지에도 에이전트 빌더가 있다. `build_hierarchical_crew`는 그 패키지를 import하지 않는다.

문제 이미지는 모험 유형 2, 3이고 `GEMINI_API_KEY`가 있을 때 `imagen-4.0-generate-001`로 만든다.

`server.py`가 기동하면 APScheduler가 매주 일요일 23:00 KST에 `total_weekly_batch`를 실행한다. 순서는 주간 리포트, CrewAI 커리큘럼, 문제 생성이다. `main.py` 주석에는 배치를 Spring Boot가 관리한다고 적혀 있다.

```python
crew = Crew(
    agents=[academic_agent, wellbeing_agent, parent_agent],
    tasks=[curriculum_task],
    process=Process.hierarchical,
    manager_llm=manager_llm,
)
```

개인화 정확도, 중도 포기율, 보호자 만족도 측정값은 이 저장소에 없다.

## 기능

### 학생

초기 진단 시드 `seed_initial_diagnosis_problems.sql`은 문제를 15개 넣는다. 파일 주석의 40은 자모 개수다. 진단 결과로 학습 프로필을 만들고, AI가 약점 음소 우선순위를 정한다.

| 유형 | 하는 일 |
| --- | --- |
| 1. 음소 맞추기 | 단어를 듣고 자음이나 모음을 고른다 |
| 2. 빈칸 채우기 | 문장 맥락에 맞는 음소를 넣는다 |
| 3. 단어-이미지 매칭 | 그림을 보고 단어를 고른다 |
| 4. 읽기 평가 | 음성 인식으로 발음을 평가한다 |

레벨 이름은 아래와 같다.

| 레벨 | 범위 |
| --- | --- |
| 1 | 기본 자모 (ㄱ, ㄴ, ㄷ) |
| 2 | 쌍자음 (ㄲ, ㄸ, ㅃ) |
| 3 | 복잡한 모음 (ㅘ, ㅙ, ㅝ) |
| 4 | 받침 조합 |
| 5 | 복합 단어 |
| 6 | 문장 독해 |

`level_evaluator.should_adjust_level`은 평균 정확도 80% 이상이면 레벨을 1 올리고, 50% 이하면 1 내린다. 그 사이는 유지한다. 레벨 범위는 1에서 6이다.

회원가입 때 관심사를 고른다. 동물, 스포츠, 음식, 자연 같은 항목이 있다. AI가 그 관심사 단어로 문제를 만든다. 동물을 고르면 강아지, 고양이 같은 단어가 들어간다.

학습을 마치면 가상 화폐를 주고, 그 화폐로 앵무새 꾸미기 아이템을 산다.

### 보호자

자녀 프로필은 최대 2명이다. PIN으로 학생 프로필을 잠그고, 자녀별 학습 데이터는 따로 둔다.

보호자 목표는 약점 보완, 자신감 향상, 난이도 상승 중 하나다. 학부모 대리인 에이전트가 이 목표를 커리큘럼에 반영한다.

주간 리포트에는 정답률, 학습 시간, 연속 출석, 음소별 정답률, 문제 유형별 성과, 다음 주 학습 목표, 집에서 할 활동이 들어간다.

대시보드에는 정답률 추이, 오답 패턴, 학습 시간, 성취 배지가 있다.

## 요청 흐름

브라우저가 Nginx를 거쳐 Spring Boot(8080)와 FastAPI(8000)로 간다. 둘 다 PostgreSQL `5432`를 쓴다. Redis `6379`에는 PIN 복구 코드, 학생 데이터 5분 캐시(`student_data:{id}`), RQ 작업 큐가 있다. Prometheus와 Grafana가 메트릭을 본다.

주간 배치는 AI 서비스 APScheduler가 일요일 23:00 KST에 `total_weekly_batch`를 돌린다. 순서는 주간 리포트, CrewAI 커리큘럼, 문제 생성이고 결과는 PostgreSQL에 남는다.

진단 직후는 그 배치와 별도다. Spring이 `/api/curriculum/generate/{id}`와 `/api/problems/generate/{id}`를 호출한다.

문제 생성 API는 `POST /api/problems/generate/{student_id}`다. Redis에 캐시하는 값은 문제 JSON이 아니라 학생 데이터이고, 유지 시간은 300초다.

음성 변환은 `POST /api/stt/transcribe`, 발음 평가는 `POST /api/stt/evaluate-pronunciation`다. 변환 모델은 `whisper-1`이다.

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| 백엔드 | Java 21, Spring Boot 3.5.7, JPA, OAuth2, JWT, Spring Mail, SpringDoc, Lombok, MapStruct |
| 프론트 | React 18.2, TypeScript 4.9, Vite 5, React Router 6.30, Zustand 4.4, TanStack Query 5.8, React Hook Form, Zod, Tailwind CSS 4.1, Framer Motion, Axios, hangul-js, Recharts, Vitest |
| AI | Python, FastAPI 0.120.3, CrewAI 1.3.0, SQLAlchemy, OpenAI, Imagen, Whisper, boto3, APScheduler |
| 인프라 | Docker, Docker Compose, Nginx(`nginx:alpine`), Jenkins, Prometheus, Grafana, PostgreSQL 15, Redis 7, AWS EC2 Ubuntu 22.04, Cloudflare Origin Certificate |

AI 기본 모델 이름은 `OPENAI_MODEL`이고 예시 값은 gpt-4o다. 이미지는 모험 유형 2, 3이고 키가 있을 때 `imagen-4.0-generate-001`을 쓴다. 배치는 일요일 23:00 KST다.

`requirements.txt`에 `chromadb`, `lancedb`, `tiktoken`, `instructor`, `pdfplumber`, `python-docx`, `pytube`가 있다. 앱 코드에서 import하지 않는다.

백엔드 Redis는 PIN 복구 코드를 넣고, AI 서비스 Redis는 학생 데이터 캐시와 RQ 큐를 쓴다.

`Jenkinsfile`에서 develop는 dev, master는 prod다. dev 배포는 develop의 머지 커밋만 진행한다. 배포는 `docker-compose.prod.yml`을 내린 뒤 다시 올린다. 프론트 이미지는 `nginx:alpine`이다.

## 디렉터리

```text
backend/                 Spring Boot. adventure, ai client, auth, diagnosis, student, protector, dashboard, session
frontend/                React. pages, components, api, stores
ai-service/app/src/
  agents/                에이전트 빌더. crew.py는 import하지 않음
  api/                   gemini_api, main_api, stt_api, tts_api, scheduler
  crew.py                build_hierarchical_crew
  server.py              스케줄러를 시작
  service/, tasks/, utils/
infrastructure/
  docker/                docker-compose.ai.yml, .dev.yml, .prod.yml
  grafana/               datasources.yml, dashboards/dashboard-provider.yml
  nginx/nginx.conf
  postgres/init.sql
  prometheus/prometheus.yml
  scripts/local/
Jenkinsfile
SPRING_SCHEDULER_GUIDE.md
```

AI 설정 문서는 `ai-service/SET-AI-SERVER.md`다.

## 실행

Docker, Docker Compose, OpenAI 키, Google OAuth 클라이언트, 파일 업로드용 S3 버킷이 필요하다. S3는 없어도 코드 자체는 있다.

예시 파일은 `ai-service/.env.example` 하나다. `.env.backend`, `.env.frontend`, `.env.ai`는 없다.

Backend와 compose가 읽는 이름은 `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `REDIS_HOST`, `JWT_SECRET`, `JWT_ACCESS_TOKEN_EXPIRY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OAUTH_REDIRECT_URI`, `AI_SERVICE_URL`, `MAIL_USERNAME`, `MAIL_PASSWORD`다.

DB 이름은 `captain_echo`다. `OAUTH_REDIRECT_URI` 기본값은 `http://localhost:8080/login/oauth2/code/google`이다. `JWT_ACCESS_TOKEN_EXPIRY` 기본값은 3600000이다. 프론트가 읽는 Vite 변수는 `VITE_GOOGLE_CLIENT_ID`다. API는 Vite 프록시 `/api`가 `http://localhost:8080`으로 넘긴다. 이미지 키 이름은 `GEMINI_API_KEY`다. S3 키 이름은 `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`이다. 값의 자리는 `.env.example`과 `infrastructure/docker/docker-compose.dev.yml`을 본다.

루트에 `docker-compose.yml`은 없다.

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

| 대상 | 주소 |
| --- | --- |
| 개발 프론트 (nginx) | http://localhost (80) |
| Vite | `frontend`에서 `npm run dev`. 포트 설정이 없으면 5173 |
| Backend | http://localhost:8080 |
| Swagger | http://localhost:8080/swagger-ui.html |
| AI | http://localhost:8000 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001. 비밀번호 변수는 `GF_SECURITY_ADMIN_PASSWORD` |

Docker 없이 띄울 때는 아래를 쓴다.

```bash
cd backend
./gradlew clean build
./gradlew bootRun
```

```bash
cd frontend
npm install
npm run dev
npm run build
```

```bash
cd ai-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Windows에서는 `venv\Scripts\activate`를 쓴다.

## 배포

배포 정의는 루트 `Jenkinsfile`이다.

- `develop`는 dev, `master`는 prod다. 제한 시간은 30분이다.
- 환경 확인 단계에서 `docker`와 `docker compose version`을 출력한다.
- 체크아웃은 `checkout scm`이다. 그 단계의 echo 문장은 GitLab이라고 적혀 있다. Webhook 설정은 이 파일에 없다.
- Backend와 Frontend 이미지만 빌드한다. 이미지 이름은 `captain-echo-backend:latest`, `captain-echo-frontend:latest`다. AI 이미지 빌드 스테이지는 없다.
- dev 배포는 `develop`의 머지 커밋만 진행한다. prod 배포는 `master`에서 진행한다.
- 배포 디렉터리는 `/home/ubuntu/projects/S13P31D101`이다. `infrastructure/docker/docker-compose.prod.yml`을 `down`한 뒤 `up -d`한다.
- 헬스 체크는 `http://localhost:8080/api/health`와 `http://localhost/health`다.
- Blue-Green 단계와 Slack 알림 단계는 이 파일에 없다.

## 모니터링

Prometheus 설정은 `infrastructure/prometheus/prometheus.yml`이다. 전역 scrape 간격은 15초다.

| job | 대상 | 간격 |
| --- | --- | --- |
| prometheus | localhost:9090 | 30초 |
| spring-boot-backend | backend:8080 `/actuator/prometheus` | 15초 |
| fastapi-ai-service | ai-service:8000 `/metrics` | 15초 |
| postgres-exporter, redis-exporter, nginx-exporter | 9187, 9121, 9113 | 30초 |
| node-exporter-backend | localhost:9100 | 30초 |
| node-exporter-ai | 10.0.2.20:9100 | 30초 |
| cadvisor | cadvisor:8080 | 30초 |
| custom-edu-metrics | backend:8080 `/actuator/prometheus`, 교육 메트릭 이름 필터 | |

`docker-compose.dev.yml`과 `docker-compose.prod.yml`에는 postgres-exporter, redis-exporter, nginx-exporter, cadvisor가 없다. node-exporter는 `docker-compose.ai.yml`에 있다.

`alertmanagers`의 `alertmanager:9093`과 `rule_files`는 주석이다. Slack, Email 임계값 알림은 연결되어 있지 않다.

Grafana 파일은 `infrastructure/grafana/datasources.yml`과 `dashboards/dashboard-provider.yml`이다. 프로바이더 이름은 edu-platform, infrastructure, applications, ai-services다. 대시보드 JSON은 이 저장소에 없다. Sentry와 CloudWatch 설정은 이 저장소에 없다.

## 팀

| 이름 | 역할 | GitHub | 주요 담당 |
| --- | --- | --- | --- |
| | | | |
