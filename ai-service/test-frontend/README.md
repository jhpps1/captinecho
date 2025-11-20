# STT 발음 평가 테스트 프론트엔드

React + TypeScript + Vite로 만든 MediaRecorder API 기반 발음 평가 테스트 페이지입니다.

## 기능

- 🎙️ MediaRecorder API를 사용한 브라우저 내 녹음
- ⏺️ 토글 버튼으로 녹음 시작/중지
- 📊 STT API를 통한 발음 평가
- 📈 정확도 및 음소별 비교 결과 시각화
- ❌ 오류 패턴 분석

## 설치 및 실행

### 1. 의존성 설치

```bash
cd test-frontend
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저가 자동으로 열리며 `http://localhost:5173`에서 확인할 수 있습니다.

### 3. 빌드 (프로덕션)

```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

## 사용 방법

### 1. AI 서버 실행

먼저 STT API 서버가 실행 중이어야 합니다:

```bash
cd ../
python app/src/server.py
```

서버가 `http://localhost:8000`에서 실행됩니다.

### 2. 테스트 페이지 사용

1. **API 서버 URL** 입력 (기본값: `http://localhost:8000`)
2. **문제 ID**, **학생 ID** 입력
3. **세션 ID** 입력 (선택사항)
4. **"🎙️ 녹음 시작"** 버튼 클릭
5. 마이크 권한 허용
6. 단어 발음
7. **"⏹️ 녹음 중지"** 버튼 클릭
8. **"📊 평가 요청"** 버튼 클릭
9. 결과 확인

## 주요 컴포넌트

### App.tsx

- MediaRecorder API 통합
- 상태 관리 (녹음, 오디오 Blob, 결과)
- STT API 호출
- UI 렌더링

### App.css

- 현대적인 UI 디자인
- 반응형 레이아웃
- 애니메이션 효과

## 기술 스택

- **React 18**: UI 라이브러리
- **TypeScript**: 타입 안전성
- **Vite**: 빌드 도구
- **MediaRecorder API**: 브라우저 녹음
- **Fetch API**: HTTP 요청

## 브라우저 호환성

MediaRecorder API는 다음 브라우저에서 지원됩니다:

- ✅ Chrome 49+
- ✅ Firefox 25+
- ✅ Edge 79+
- ✅ Safari 14.1+
- ❌ IE (지원 안 함)

## 주의사항

1. **HTTPS 필요**: 프로덕션 환경에서는 HTTPS 필수 (마이크 접근)
2. **마이크 권한**: 브라우저에서 마이크 접근 허용 필요
3. **CORS 설정**: AI 서버의 CORS 설정 확인

## 문제 해결

### 마이크 권한 에러

브라우저 주소창 왼쪽의 자물쇠 아이콘 → 권한 → 마이크 허용

### CORS 에러

서버의 `.env` 파일에서 프론트엔드 도메인 추가:

```env
ALLOWED_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
```

### 녹음이 시작되지 않음

1. 마이크가 연결되어 있는지 확인
2. 다른 앱이 마이크를 사용 중인지 확인
3. 브라우저 콘솔에서 에러 메시지 확인

## 라이센스

Captain Echo AI Service
