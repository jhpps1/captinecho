import { useState, useRef } from 'react'
import './App.css'

interface PhonemeComparison {
  char_position: number
  phoneme_position: string
  correct_jamo: string
  user_jamo: string
  is_correct: boolean
}

interface ErrorPattern {
  real_jamo: string
  confusion_jamo: string
  phoneme_position: string
}

interface EvaluationResult {
  student_id: number
  problem_id: number
  correct_text: string
  user_text: string
  accuracy: number
  phoneme_comparison: PhonemeComparison[]
  error_patterns: ErrorPattern[]
  total_phonemes: number
  correct_phonemes: number
  timestamp: string
}

function App() {
  // State
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)

  // Form inputs
  const [apiUrl, setApiUrl] = useState('http://localhost:8000')
  const [problemId, setProblemId] = useState<number>(1)
  const [studentId, setStudentId] = useState<number>(1)
  const [sessionId, setSessionId] = useState<number | null>(null)

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // 녹음 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })

      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)

        // 스트림 정리
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      setError(null)
      setResult(null)

      console.log('🎙️ 녹음 시작')
    } catch (err) {
      console.error('녹음 시작 실패:', err)
      setError('마이크 권한을 허용해주세요.')
    }
  }

  // 녹음 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      console.log('⏹️ 녹음 중지')
    }
  }

  // 토글 버튼 핸들러
  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  // 발음 평가 요청
  const evaluatePronunciation = async () => {
    if (!audioBlob) {
      setError('녹음된 오디오가 없습니다.')
      return
    }

    setIsEvaluating(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('audio_file', audioBlob, 'recording.webm')
      formData.append('problem_id', problemId.toString())
      formData.append('student_id', studentId.toString())

      if (sessionId !== null) {
        formData.append('session_id', sessionId.toString())
      }

      console.log('📤 평가 요청 전송...')

      const response = await fetch(`${apiUrl}/stt/evaluate-pronunciation`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }

      const data: EvaluationResult = await response.json()
      setResult(data)
      console.log('✅ 평가 완료:', data)
    } catch (err) {
      console.error('평가 실패:', err)
      setError(err instanceof Error ? err.message : '평가 요청 실패')
    } finally {
      setIsEvaluating(false)
    }
  }

  return (
    <div className="container">
      <h1>🎙️ STT 발음 평가 테스트</h1>
      <p className="subtitle">MediaRecorder API + Whisper STT</p>

      {/* 설정 입력 */}
      <div className="form-section">
        <div className="form-group">
          <label>API 서버 URL</label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="http://localhost:8000"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>문제 ID</label>
            <input
              type="number"
              value={problemId}
              onChange={(e) => setProblemId(parseInt(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label>학생 ID</label>
            <input
              type="number"
              value={studentId}
              onChange={(e) => setStudentId(parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="form-group">
          <label>세션 ID (선택)</label>
          <input
            type="number"
            value={sessionId ?? ''}
            onChange={(e) =>
              setSessionId(e.target.value ? parseInt(e.target.value) : null)
            }
            placeholder="비워두면 null"
          />
        </div>
      </div>

      {/* 녹음 버튼 */}
      <div className="button-group">
        <button
          className={`btn-toggle ${isRecording ? 'recording' : ''}`}
          onClick={handleToggleRecording}
        >
          {isRecording ? (
            <>
              <span className="icon">⏹️</span>
              <span>녹음 중지</span>
            </>
          ) : (
            <>
              <span className="icon">🎙️</span>
              <span>녹음 시작</span>
            </>
          )}
        </button>

        <button
          className="btn-evaluate"
          onClick={evaluatePronunciation}
          disabled={!audioBlob || isEvaluating}
        >
          {isEvaluating ? (
            <>
              <span className="icon">⏳</span>
              <span>평가 중...</span>
            </>
          ) : (
            <>
              <span className="icon">📊</span>
              <span>평가 요청</span>
            </>
          )}
        </button>
      </div>

      {/* 녹음 상태 표시 */}
      {isRecording && (
        <div className="status recording">
          🎙️ 녹음 중... 원하는 단어를 또렷하게 발음해주세요!
        </div>
      )}

      {audioBlob && !isRecording && (
        <div className="status success">
          ✅ 녹음 완료! ({(audioBlob.size / 1024).toFixed(1)} KB)
        </div>
      )}

      {/* 에러 표시 */}
      {error && <div className="status error">❌ {error}</div>}

      {/* 평가 결과 */}
      {result && (
        <div className="result">
          <h2>📊 평가 결과</h2>

          <div className="accuracy">{result.accuracy}%</div>

          <div className="result-grid">
            <div className="result-item">
              <span className="label">정답 텍스트</span>
              <span className="value">{result.correct_text}</span>
            </div>

            <div className="result-item">
              <span className="label">사용자 발음</span>
              <span className="value">{result.user_text}</span>
            </div>

            <div className="result-item">
              <span className="label">음소 정확도</span>
              <span className="value">
                {result.correct_phonemes} / {result.total_phonemes}
              </span>
            </div>
          </div>

          {result.error_patterns.length > 0 && (
            <div className="error-patterns">
              <h3>오류 패턴 ({result.error_patterns.length}개)</h3>
              <div className="pattern-list">
                {result.error_patterns.map((err, idx) => (
                  <div key={idx} className="pattern-item">
                    <span className="phoneme">
                      {err.real_jamo} → {err.confusion_jamo}
                    </span>
                    <span className="position">{err.phoneme_position}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.error_patterns.length === 0 && (
            <div className="perfect">🎉 완벽해요!</div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
