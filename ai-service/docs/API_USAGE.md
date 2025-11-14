# STT 발음 평가 API 사용 가이드

## 개요

FastAPI 서버에서 제공하는 STT(Speech-to-Text) 발음 평가 API를 사용하는 방법입니다.
프론트엔드에서 MediaRecorder API로 녹음한 후, WebM 파일을 서버로 전송하여 발음 평가를 받을 수 있습니다.

## API 엔드포인트

### 1. 발음 평가

**Endpoint:** `POST /stt/evaluate-pronunciation`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `audio_file` (file, required): 녹음된 오디오 파일 (WebM, MP3, WAV, M4A, OGG)
- `problem_id` (int, required): 문제 ID
- `student_id` (int, required): 학생 ID
- `session_id` (int, optional): 학습 세션 ID

**Response:**
```json
{
  "student_id": 456,
  "problem_id": 123,
  "correct_text": "강아지",
  "user_text": "강아지",
  "accuracy": 100.0,
  "phoneme_comparison": [
    {
      "char_position": 0,
      "phoneme_position": "INITIAL",
      "correct_jamo": "ㄱ",
      "user_jamo": "ㄱ",
      "is_correct": true
    }
  ],
  "error_patterns": [],
  "total_phonemes": 9,
  "correct_phonemes": 9,
  "timestamp": "2025-01-13T10:30:45.123456"
}
```

### 2. 헬스체크

**Endpoint:** `GET /stt/health`

**Response:**
```json
{
  "status": "healthy",
  "service": "STT Pronunciation Evaluation",
  "whisper_model": "whisper-1"
}
```

## 브라우저에서 MediaRecorder 사용하기

### Vanilla JavaScript

```javascript
let mediaRecorder;
let audioChunks = [];

// 녹음 시작
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.start();
    console.log('녹음 시작');

  } catch (error) {
    console.error('녹음 시작 실패:', error);
    alert('마이크 권한을 허용해주세요.');
  }
}

// 녹음 정지
function stopRecording() {
  return new Promise((resolve) => {
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      console.log('녹음 완료');
      resolve(audioBlob);
    };

    mediaRecorder.stop();

    // 마이크 스트림 정리
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
  });
}

// 발음 평가 요청
async function evaluatePronunciation(audioBlob, problemId, studentId, sessionId = null) {
  const formData = new FormData();
  formData.append('audio_file', audioBlob, 'recording.webm');
  formData.append('problem_id', problemId.toString());
  formData.append('student_id', studentId.toString());

  if (sessionId !== null) {
    formData.append('session_id', sessionId.toString());
  }

  try {
    const response = await fetch('http://localhost:8000/stt/evaluate-pronunciation', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '평가 요청 실패');
    }

    const result = await response.json();
    console.log('평가 결과:', result);
    return result;

  } catch (error) {
    console.error('평가 실패:', error);
    throw error;
  }
}

// 사용 예시
document.getElementById('startBtn').addEventListener('click', startRecording);

document.getElementById('stopBtn').addEventListener('click', async () => {
  const audioBlob = await stopRecording();

  // 평가 요청
  const result = await evaluatePronunciation(audioBlob, 123, 456);

  console.log('정확도:', result.accuracy + '%');
  console.log('사용자 발음:', result.user_text);
});
```

### React 예제

```jsx
import React, { useState, useRef } from 'react';

function PronunciationTest({ problemId, studentId, sessionId }) {
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);

    } catch (err) {
      console.error('녹음 시작 실패:', err);
      setError('마이크 권한을 허용해주세요.');
    }
  };

  const stopRecording = () => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm'
        });

        // 스트림 정리
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach(track => track.stop());

        setIsRecording(false);
        resolve(audioBlob);
      };

      mediaRecorderRef.current.stop();
    });
  };

  const evaluatePronunciation = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio_file', audioBlob, 'recording.webm');
    formData.append('problem_id', problemId.toString());
    formData.append('student_id', studentId.toString());

    if (sessionId) {
      formData.append('session_id', sessionId.toString());
    }

    try {
      const response = await fetch('http://localhost:8000/stt/evaluate-pronunciation', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '평가 실패');
      }

      const data = await response.json();
      setResult(data);
      setError(null);

    } catch (err) {
      console.error('평가 실패:', err);
      setError(err.message);
    }
  };

  const handleStopAndEvaluate = async () => {
    const audioBlob = await stopRecording();
    if (audioBlob) {
      await evaluatePronunciation(audioBlob);
    }
  };

  return (
    <div>
      <h2>발음 평가</h2>

      <button onClick={startRecording} disabled={isRecording}>
        녹음 시작
      </button>

      <button onClick={handleStopAndEvaluate} disabled={!isRecording}>
        녹음 정지 및 평가
      </button>

      {error && (
        <div style={{ color: 'red' }}>에러: {error}</div>
      )}

      {result && (
        <div>
          <h3>평가 결과</h3>
          <p>정확도: {result.accuracy}%</p>
          <p>정답: {result.correct_text}</p>
          <p>사용자 발음: {result.user_text}</p>
          <p>
            음소 정확도: {result.correct_phonemes} / {result.total_phonemes}
          </p>

          {result.error_patterns.length > 0 && (
            <div>
              <h4>오류 패턴</h4>
              <ul>
                {result.error_patterns.map((err, idx) => (
                  <li key={idx}>
                    {err.real_jamo} → {err.confusion_jamo} ({err.phoneme_position})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PronunciationTest;
```

### Vue 3 예제

```vue
<template>
  <div>
    <h2>발음 평가</h2>

    <button @click="startRecording" :disabled="isRecording">
      녹음 시작
    </button>

    <button @click="stopAndEvaluate" :disabled="!isRecording">
      녹음 정지 및 평가
    </button>

    <div v-if="error" style="color: red;">
      에러: {{ error }}
    </div>

    <div v-if="result">
      <h3>평가 결과</h3>
      <p>정확도: {{ result.accuracy }}%</p>
      <p>정답: {{ result.correct_text }}</p>
      <p>사용자 발음: {{ result.user_text }}</p>
      <p>
        음소 정확도: {{ result.correct_phonemes }} / {{ result.total_phonemes }}
      </p>

      <div v-if="result.error_patterns.length > 0">
        <h4>오류 패턴</h4>
        <ul>
          <li v-for="(err, idx) in result.error_patterns" :key="idx">
            {{ err.real_jamo }} → {{ err.confusion_jamo }} ({{ err.phoneme_position }})
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  problemId: { type: Number, required: true },
  studentId: { type: Number, required: true },
  sessionId: { type: Number, default: null }
});

const isRecording = ref(false);
const result = ref(null);
const error = ref(null);

let mediaRecorder = null;
let audioChunks = [];

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.start();
    isRecording.value = true;
    error.value = null;

  } catch (err) {
    console.error('녹음 시작 실패:', err);
    error.value = '마이크 권한을 허용해주세요.';
  }
};

const stopRecording = () => {
  return new Promise((resolve) => {
    if (!mediaRecorder) {
      resolve(null);
      return;
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      isRecording.value = false;

      resolve(audioBlob);
    };

    mediaRecorder.stop();
  });
};

const evaluatePronunciation = async (audioBlob) => {
  const formData = new FormData();
  formData.append('audio_file', audioBlob, 'recording.webm');
  formData.append('problem_id', props.problemId.toString());
  formData.append('student_id', props.studentId.toString());

  if (props.sessionId) {
    formData.append('session_id', props.sessionId.toString());
  }

  try {
    const response = await fetch('http://localhost:8000/stt/evaluate-pronunciation', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || '평가 실패');
    }

    const data = await response.json();
    result.value = data;
    error.value = null;

  } catch (err) {
    console.error('평가 실패:', err);
    error.value = err.message;
  }
};

const stopAndEvaluate = async () => {
  const audioBlob = await stopRecording();
  if (audioBlob) {
    await evaluatePronunciation(audioBlob);
  }
};
</script>
```

## cURL로 테스트

```bash
# 1. 오디오 파일을 미리 준비한 경우
curl -X POST "http://localhost:8000/stt/evaluate-pronunciation" \
  -F "audio_file=@recording.webm" \
  -F "problem_id=123" \
  -F "student_id=456" \
  -F "session_id=789"

# 2. 헬스체크
curl -X GET "http://localhost:8000/stt/health"
```

## 브라우저 호환성

MediaRecorder API는 다음 브라우저에서 지원됩니다:

- ✅ Chrome 49+
- ✅ Firefox 25+
- ✅ Edge 79+
- ✅ Safari 14.1+
- ❌ IE (지원 안 함)

## CORS 설정

프론트엔드 도메인이 서버와 다른 경우, 서버의 `.env` 파일에서 CORS를 설정해야 합니다:

```env
# .env
ALLOWED_ORIGINS=["http://localhost:3000", "https://your-frontend-domain.com"]
```

또는 `app/src/core/config.py`에서 직접 수정:

```python
ALLOWED_ORIGINS: List[str] = Field(
    default=[
        "http://localhost:3000",
        "https://your-frontend-domain.com"
    ]
)
```

## API 문서

FastAPI는 자동으로 Swagger UI를 제공합니다:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 에러 처리

### 400 Bad Request
- 파일 형식이 지원되지 않는 경우
- 필수 파라미터가 누락된 경우

### 404 Not Found
- problem_id에 해당하는 문제를 찾을 수 없는 경우

### 500 Internal Server Error
- Whisper API 호출 실패
- DB 연결 오류
- 기타 서버 오류

## 참고사항

1. **HTTPS 필요**: 프로덕션 환경에서는 HTTPS를 사용해야 마이크 접근이 가능합니다 (localhost 제외).

2. **파일 크기**: 짧은 단어/문장 발음 평가를 위한 용도이므로, 10초 이내의 녹음을 권장합니다.

3. **오디오 형식**: WebM(Opus)를 권장하지만, MP3, WAV, M4A, OGG도 지원합니다.

4. **세션 관리**: `session_id`는 선택 사항이며, 오류 패턴 추적이 필요한 경우에만 제공하면 됩니다.

## 문의

문제가 발생하거나 질문이 있으면 백엔드 팀에 문의하세요.
