# AWS S3 통합 가이드

## 📋 개요

Captain Echo AI 서비스에서 생성되는 이미지 및 음성 파일을 AWS S3에 업로드하여 프로덕션 환경에서 접근 가능하도록 구성했습니다.

### 변경 사항 요약
- ✅ **로컬 저장 → S3 업로드** 전환
- ✅ **Public S3 버킷** 사용 (프론트엔드 직접 접근)
- ✅ **TTS 음성 파일** S3 업로드
- ✅ **Gemini 생성 이미지** S3 업로드
- ✅ **기존 50개 이미지** 마이그레이션 스크립트 제공

---

## 🔧 수정된 파일

### 1. 핵심 파일 (AI Service)
```
ai-service/app/src/utils/s3.py                    # S3 업로드 함수 추가
ai-service/app/src/utils/settings.py              # AWS 환경변수 추가
ai-service/app/src/api/tts_api.py                 # TTS → S3 업로드
ai-service/app/src/api/gemini_api.py              # 이미지 → S3 업로드
ai-service/app/src/service/question_service.py    # import 수정
```

### 2. 설정 파일
```
ai-service/.env.example                           # 환경변수 예제
ai-service/migrate_images_to_s3.py                # 마이그레이션 스크립트
infrastructure/docker/docker-compose.ai.yml       # Docker 환경변수 추가
```

---

## ⚙️ AWS S3 설정 가이드

### STEP 1: AWS S3 버킷 생성

#### 1-1. S3 버킷 생성
1. AWS Console → S3 → "버킷 만들기"
2. 버킷 이름: `captain-echo-files`
3. 리전: `아시아 태평양(서울) ap-northeast-2`
4. "ACL 활성화됨" 선택
5. **"모든 퍼블릭 액세스 차단" 해제** (Public 버킷)
   - ✅ 체크 해제: "새 ACL을 통해 부여된 퍼블릭 액세스 차단"
   - ✅ 체크 해제: "임의의 ACL을 통해 부여된 퍼블릭 액세스 차단"
6. 경고 확인: "현재 설정으로 인해 이 버킷과 그 안의 객체가 퍼블릭 상태가 될 수 있음을 알고 있습니다" 체크
7. "버킷 만들기" 클릭

#### 1-2. CORS 설정
버킷 선택 → 권한 → CORS(Cross-Origin Resource Sharing) 편집:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### STEP 2: IAM 사용자 생성

#### 2-1. IAM 사용자 생성
1. AWS Console → IAM → 사용자 → "사용자 생성"
2. 사용자 이름: `captain-echo-s3-uploader`
3. "다음" 클릭

#### 2-2. 권한 설정
1. "직접 정책 연결" 선택
2. 정책 검색: `AmazonS3FullAccess` 선택
3. "다음" → "사용자 생성"

#### 2-3. 액세스 키 생성
1. 생성된 사용자 클릭
2. "보안 자격 증명" 탭
3. "액세스 키 만들기"
4. 사용 사례: "로컬 코드"
5. **Access Key ID와 Secret Access Key를 안전하게 보관**
   - ⚠️ Secret Access Key는 이 시점에만 확인 가능합니다!

---

## 🔑 환경변수 설정

### STEP 3: .env 파일 생성

#### 3-1. AI Service .env 파일
```bash
cd ai-service
cp .env.example .env
nano .env  # 또는 vim/code 등으로 편집
```

#### 3-2. .env 파일 내용 수정
```bash
# AWS S3 설정 (파일 업로드용)
AWS_ACCESS_KEY_ID=<AWS Console에서 발급받은 Access Key ID>
AWS_SECRET_ACCESS_KEY=<AWS Console에서 발급받은 Secret Access Key>
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=captain-echo-files

# OpenAI API 설정
OPENAI_API_KEY=<your-gms-api-key>
OPENAI_MODEL=gpt-4o

# Gemini API (이미지 생성용)
GEMINI_API_KEY=<your-gemini-api-key>

# 데이터베이스 설정
DATABASE_URL=postgresql://doonki:changeme@postgres:5432/captain_echo
```

---

## 🚀 배포 및 테스트

### STEP 4: 기존 이미지 마이그레이션 (선택사항)

현재 로컬에 저장된 50개 이미지를 S3로 업로드:

```bash
cd ai-service
python migrate_images_to_s3.py
```

**예상 출력:**
```
======================================================================
🚀 S3 이미지 마이그레이션 시작
======================================================================

✅ AWS 설정:
   - Region: ap-northeast-2
   - Bucket: captain-echo-files
   - Access Key: AKIAIOSFOD... (마스킹)

📁 발견된 이미지: 50개
   총 크기: 41.23 MB

======================================================================
📤 업로드 시작...
======================================================================

[1/50] 가방_20251109152928099924.png... ✅ 성공
[2/50] 강아지_20251109152840777041.png... ✅ 성공
...
[50/50] 호랑이_20251109153210882123.png... ✅ 성공

======================================================================
📊 마이그레이션 결과
======================================================================
✅ 성공: 50개
❌ 실패: 0개
📁 총 파일: 50개

✨ S3 URL 예시:
   https://captain-echo-files.s3.ap-northeast-2.amazonaws.com/problems/images/가방_20251109152928099924.png

======================================================================
🎉 마이그레이션 완료!
======================================================================
```

### STEP 5: Docker Compose 재시작

#### 5-1. 개발 환경 (로컬)
```bash
cd ai-service
docker compose down
docker compose up -d --build
```

#### 5-2. 프로덕션 환경 (EC2 #2)
```bash
cd /home/ubuntu/projects/S13P31D101/infrastructure/docker
docker compose -f docker-compose.ai.yml down
docker compose -f docker-compose.ai.yml up -d --build
```

### STEP 6: S3 연동 테스트

#### 6-1. TTS 음성 파일 테스트
새로운 학습 문제 생성 시 TTS가 S3에 업로드되는지 확인:

```bash
# 컨테이너 로그 확인
docker logs fastapi --tail 100 -f

# 예상 로그:
# 📝 GMS TTS 생성 시작: '가방'
# ✅ TTS 파일 S3 업로드 성공: https://captain-echo-files.s3.ap-northeast-2.amazonaws.com/problems/sound/20251110143025_a3f9e2.mp3
```

#### 6-2. Gemini 이미지 테스트
새로운 학습 문제 생성 시 이미지가 S3에 업로드되는지 확인:

```bash
# 컨테이너 로그 확인
docker logs fastapi --tail 100 -f

# 예상 로그:
# ✨ Gemini 이미지 생성 요청 프롬프트: 'Subject: 가방\nstyle : simple background, bright colors'
# ✅ Gemini 이미지 S3 업로드 성공: https://captain-echo-files.s3.ap-northeast-2.amazonaws.com/problems/images/20251110143530_b7d4e1.png
```

#### 6-3. 프론트엔드 접근 테스트
브라우저에서 S3 URL 직접 접근 가능 여부 확인:

```
https://captain-echo-files.s3.ap-northeast-2.amazonaws.com/problems/images/가방_20251109152928099924.png
```

**✅ 정상:** 이미지가 브라우저에 표시됨
**❌ 오류:** 403 Forbidden → CORS 또는 Public Access 설정 재확인

---

## 📊 S3 URL 구조

### 생성되는 URL 형식
```
https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/{KEY}

예시:
https://captain-echo-files.s3.ap-northeast-2.amazonaws.com/problems/images/20251110143530_b7d4e1.png
https://captain-echo-files.s3.ap-northeast-2.amazonaws.com/problems/sound/20251110143025_a3f9e2.mp3
```

### S3 키 구조
```
problems/
├── images/              # Gemini 생성 이미지
│   └── {timestamp}_{random}.png
│
└── sound/               # TTS 생성 음성
    └── {timestamp}_{random}.mp3
```

---

## 🔧 트러블슈팅

### 문제 1: "AWS 자격증명이 설정되지 않았습니다" 오류

**증상:**
```
ValueError: AWS 자격증명이 설정되지 않았습니다. .env 파일을 확인하세요.
```

**해결:**
1. `.env` 파일 존재 확인: `ls -la ai-service/.env`
2. 환경변수 확인: `cat ai-service/.env | grep AWS`
3. Docker Compose 재시작: `docker compose restart ai-service`

### 문제 2: "S3 업로드 실패: AccessDenied" 오류

**증상:**
```
❌ S3 업로드 실패: [AccessDenied] Access Denied
```

**해결:**
1. IAM 사용자에 S3FullAccess 권한이 있는지 확인
2. S3 버킷 이름이 정확한지 확인 (`.env` 파일)
3. Access Key ID / Secret Access Key 재생성

### 문제 3: 프론트엔드에서 이미지 로드 실패 (CORS 오류)

**증상:**
```
Access to fetch at 'https://captain-echo-files.s3...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**해결:**
1. S3 버킷 → 권한 → CORS 설정 확인
2. CORS 설정에 `AllowedOrigins: ["*"]` 포함 여부 확인
3. 브라우저 캐시 삭제 후 재시도

### 문제 4: "S3_BUCKET_NAME이 설정되지 않았습니다" 오류

**증상:**
```
ValueError: S3_BUCKET_NAME이 설정되지 않았습니다. .env 파일을 확인하세요.
```

**해결:**
1. `.env` 파일에 `S3_BUCKET_NAME=captain-echo-files` 추가
2. Docker Compose에 환경변수 전달 확인:
   ```yaml
   environment:
     - S3_BUCKET_NAME=${S3_BUCKET_NAME:-captain-echo-files}
   ```

---

## 📈 비용 예상 (AWS S3)

### 예상 사용량 (월간)
- **저장 용량:** 10GB (이미지 + 음성)
- **GET 요청:** 100,000건 (프론트엔드 접근)
- **PUT 요청:** 10,000건 (AI 생성 업로드)

### 예상 비용 (ap-northeast-2 기준)
```
저장 요금: 10GB × $0.025 = $0.25/월
GET 요청: 100,000건 × $0.0004/1,000건 = $0.04/월
PUT 요청: 10,000건 × $0.005/1,000건 = $0.05/월

총 예상 비용: 약 $0.34/월 (≈ ₩450/월)
```

**✅ 매우 저렴한 비용으로 운영 가능합니다!**

---

## 🎯 다음 단계

### 완료된 작업 ✅
- [x] S3 업로드 함수 구현
- [x] TTS 음성 파일 S3 업로드
- [x] Gemini 이미지 S3 업로드
- [x] 환경변수 설정
- [x] Docker Compose 설정
- [x] 마이그레이션 스크립트 작성

### 대기 중인 작업 ⏳
- [ ] AWS S3 버킷 생성 (사용자 작업)
- [ ] IAM 사용자 생성 및 Access Key 발급 (사용자 작업)
- [ ] .env 파일에 AWS 자격증명 추가 (사용자 작업)
- [ ] 프로덕션 환경 배포 및 테스트

### 향후 개선 사항 (선택사항)
- [ ] CloudFront CDN 연동 (이미지 캐싱 및 글로벌 배포)
- [ ] S3 Lifecycle 정책 (오래된 파일 자동 삭제)
- [ ] CloudWatch 로깅 및 모니터링
- [ ] 이미지 리사이징 (Lambda@Edge)

---

## 📚 참고 자료

- [AWS S3 공식 문서](https://docs.aws.amazon.com/s3/)
- [Boto3 S3 Client](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3.html)
- [S3 Public Access 설정 가이드](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html)
- [IAM 사용자 가이드](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users.html)

---

**마지막 업데이트:** 2025-11-10
**작성자:** Claude AI Assistant
**브랜치:** feature/pin-recovery-email
