import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { transcribeAudio } from '../api/diagnosisApi';

interface DiagnosisProblem {
  problemId: number;
  diagnosisType: string;
  problem: string;
  choices?: string[];
  problemPhonemes?: string[];
  blankPosition?: string;
  blankPhoneme?: string;
  problemImageUrl?: string;
  problemSoundUrl?: string;
  correctAnswer: string;
}

export const InitialAssessmentPage = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<DiagnosisProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<Array<{questionId: number, answer: string}>>([]);

  // 녹음 관련 state
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 녹음 관련 ref
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 초기진단 시작
  useEffect(() => {
    const startDiagnosis = async () => {
      const studentId = parseInt(sessionStorage.getItem('studentId')!);
      const accessToken = Cookies.get('accessToken');

      if (!studentId || !accessToken) {
        alert('로그인이 필요합니다.');
        navigate('/');
        return;
      }

      try {
        // 1. 초기진단 세션 시작
        await fetch(`/api/student/${studentId}/diagnosis/start`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });

        // 2. 문제 불러오기
        const response = await fetch(
          `/api/student/${studentId}/diagnosis/initial/problems`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        if (!response.ok) {
          throw new Error('문제를 불러올 수 없습니다.');
        }

        const data = await response.json();
        console.log('문제 데이터:', data);
        setProblems(data.problems || []);
        setSessionStarted(true);
      } catch (error) {
        console.error('초기진단 시작 실패:', error);
        alert('초기진단을 시작할 수 없습니다.');
        navigate('/student');
      } finally {
        setIsLoading(false);
      }
    };

    startDiagnosis();
  }, [navigate]);

  // 컴포넌트 언마운트 시 녹음/스트림 정리
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 답변 제출 (로컬 저장만, API 호출 X)
  const handleSubmit = async () => {
    if (!selectedAnswer) {
      alert('답을 선택해주세요!');
      return;
    }

    const currentProblem = problems[currentIndex];
    const currentAnswer = {
      questionId: currentProblem.problemId,
      answer: selectedAnswer
    };

    // 다음 문제로
    if (currentIndex < problems.length - 1) {
      // 답변 저장하고 다음 문제
      setAnswers(prev => [...prev, currentAnswer]);
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer('');
    } else {
      // 마지막 문제 완료 → 전체 제출 (현재 답변 포함)
      const allAnswers = [...answers, currentAnswer];
      await handleComplete(allAnswers);
    }
  };

  // 🔽 녹음 시작 로직
  const startRecording = async () => {
    try {
      // 1) 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 2) MediaRecorder 생성 (WebM 형식)
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;

      // 3) 이전 녹음 조각 초기화
      chunksRef.current = [];

      // 4) 녹음 중 생기는 데이터 모으기
      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // 5) 녹음 종료 후 (WebM 파일 생성 + STT API 호출)
      mediaRecorder.onstop = async () => {
        // 지금까지 모은 조각들로 Blob 생성
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

        // Blob → WebM File 생성
        const file = new File([blob], 'recording.webm', {
          type: 'audio/webm',
        });

        // STT 발음 평가 API 호출
        setIsAnalyzing(true);

        try {
          // STT API 호출 (초기진단용 - 음성-텍스트 변환만)
          const result = await transcribeAudio(file);
          console.log('STT 결과:', result);

          // 변환된 텍스트를 selectedAnswer에 저장 (재녹음 시 덮어씀)
          setSelectedAnswer(result.text);

          // 자동으로 다음 문제로 이동하지 않음 - 사용자가 "다음 문제" 버튼 클릭 필요
        } catch (error) {
          console.error('STT 평가 오류:', error);
          alert('음성 인식 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
          setIsAnalyzing(false);
        }

        // 마이크 스트림 정리
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      // 6) 실제 녹음 시작
      mediaRecorder.start();
      setIsRecording(true);
      setIsAnalyzing(false);
    } catch (error) {
      console.error('마이크 권한 또는 녹음 시작 실패:', error);
      alert('마이크 권한을 허용했는지 확인해주세요.');
      setIsRecording(false);
    }
  };

  // 🔽 녹음 종료 로직
  const stopRecording = () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop(); // → onstop 콜백에서 WebM 파일 생성 + STT 호출
    }
    setIsRecording(false);
  };

  // 마이크 버튼 클릭 (녹음 시작/종료 토글)
  const handleMicClick = () => {
    // 분석 중일 때는 버튼 무시
    if (isAnalyzing) return;

    if (isRecording) {
      // 녹음 종료
      stopRecording();
    } else {
      // 녹음 시작
      startRecording();
    }
  };

  // 초기진단 완료
  const handleComplete = async (allAnswers: Array<{questionId: number, answer: string}>) => {
    const studentId = parseInt(sessionStorage.getItem('studentId')!);
    const accessToken = Cookies.get('accessToken');

    try {
      // 1. 모든 답변 제출 (한번에)
      const submitResponse = await fetch(`/api/student/${studentId}/diagnosis/result`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          results: allAnswers // 15개 답변을 results 배열로 전송
        })
      });

      if (!submitResponse.ok) {
        throw new Error('답변 제출 실패');
      }

      // 2. 진단 세션 종료
      const endResponse = await fetch(
        `/api/student/${studentId}/diagnosis/end`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );

      if (!endResponse.ok) {
        throw new Error('초기진단 완료 처리 실패');
      }

      const result = await endResponse.json();

      // 완료 메시지
      alert(`초기진단 완료!\n이제 맞춤 학습을 시작할 수 있습니다!`);
      navigate('/student');
    } catch (error) {
      console.error('초기진단 완료 처리 실패:', error);
      alert('초기진단 완료 처리에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-4">초기진단 준비 중...</div>
          <div className="text-lg text-gray-600">잠시만 기다려주세요</div>
        </div>
      </div>
    );
  }

  if (!sessionStarted || problems.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500 mb-4">문제를 불러올 수 없습니다</div>
          <button
            onClick={() => navigate('/student')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const currentProblem = problems[currentIndex];
  const progress = ((currentIndex + 1) / problems.length) * 100;

  return (
    <div className="initial-assessment min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* 상단 헤더 */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-8 px-4 shadow-lg">
        <h1 className="text-4xl font-bold text-center mb-2">초기 진단 테스트</h1>
        <p className="text-center text-blue-100">
          15개의 문제를 풀어주세요. AI가 맞춤 학습 계획을 세워드립니다!
        </p>
      </header>

      {/* 진행도 바 */}
      <div className="bg-white shadow-md">
        <div className="relative h-3 bg-gray-200">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-center py-4">
          <span className="text-2xl font-bold text-blue-600">{currentIndex + 1}</span>
          <span className="text-xl text-gray-400"> / </span>
          <span className="text-xl font-semibold text-gray-600">{problems.length}</span>
        </div>
      </div>

      {/* 문제 표시 */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* 문제 타입 표시 */}
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {currentProblem.diagnosisType === 'PHONEME_RECOGNITION' && '음소 분절'}
              {currentProblem.diagnosisType === 'SYLLABLE_DECODING' && '음소 합성'}
              {currentProblem.diagnosisType === 'WORD_READING' && '단어 읽기'}
              {currentProblem.diagnosisType === 'SENTENCE_COMPLETION' && '문장 읽기'}
            </span>
          </div>

          {/* 문제 텍스트 */}
          <div className="mb-8">
            <h2 className="text-5xl font-bold text-gray-800 text-center mb-4">
              {currentProblem.problem}
            </h2>

            {/* 음소 분절: 음소 표시 */}
            {currentProblem.diagnosisType === 'PHONEME_RECOGNITION' && currentProblem.problemPhonemes && (
              <div className="flex flex-col items-center my-6 space-y-4">
                <div className="flex gap-2 justify-center">
                  {currentProblem.problemPhonemes.map((phoneme, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 flex items-center justify-center bg-gray-200 text-gray-700 rounded-lg text-3xl font-bold"
                    >
                      {phoneme}
                    </div>
                  ))}
                </div>
                <p className="text-xl text-gray-600 font-semibold">
                  {currentProblem.blankPosition === 'INITIAL' && '이 단어의 첫 번째 소리는 무엇일까요?'}
                  {currentProblem.blankPosition === 'MEDIAL' && '이 단어의 가운데 소리(모음)는 무엇일까요?'}
                  {currentProblem.blankPosition === 'FINAL' && '이 단어의 마지막 소리(받침)는 무엇일까요?'}
                </p>
              </div>
            )}

            {/* 이미지 표시 */}
            {currentProblem.problemImageUrl && (
              <div className="flex justify-center my-6">
                <img
                  src={currentProblem.problemImageUrl}
                  alt="문제 이미지"
                  className="max-w-md rounded-2xl shadow-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* 음성 재생 */}
            {currentProblem.problemSoundUrl && (
              <div className="flex justify-center my-6">
                <audio controls className="w-full max-w-md">
                  <source src={currentProblem.problemSoundUrl} type="audio/mpeg" />
                </audio>
              </div>
            )}
          </div>

          {/* 선택지 */}
          {currentProblem.choices && currentProblem.choices.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {currentProblem.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(choice)}
                  className={`
                    py-6 px-8 rounded-2xl text-2xl font-bold transition-all duration-200
                    ${selectedAnswer === choice
                      ? 'bg-blue-500 text-white shadow-xl scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-lg'
                    }
                  `}
                >
                  {choice}
                </button>
              ))}
            </div>
          )}

          {/* SENTENCE_COMPLETION: 음성 녹음 */}
          {currentProblem.diagnosisType === 'SENTENCE_COMPLETION' && (
            <div className="mb-8 text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <p className="text-lg text-blue-800 mb-2">
                  🎤 문장을 소리내어 읽어주세요
                </p>
                <p className="text-md text-blue-700">
                  "<span className="font-bold">{currentProblem.problem}</span>"
                </p>
              </div>

              {/* 마이크 버튼 */}
              <button
                onClick={handleMicClick}
                disabled={isAnalyzing}
                className={`relative w-20 h-20 rounded-full transition-all ${
                  isRecording
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-blue-500 hover:bg-blue-600'
                } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isAnalyzing ? (
                  <span className="text-white text-sm">분석중...</span>
                ) : isRecording ? (
                  <span className="text-white text-2xl">⏹️</span>
                ) : (
                  <span className="text-white text-2xl">🎤</span>
                )}
              </button>

              <p className="text-sm text-gray-600 mt-4">
                {isAnalyzing
                  ? '음성을 분석 중...'
                  : isRecording
                    ? '녹음 중... 다시 클릭하여 종료'
                    : '마이크를 클릭하여 녹음 시작'}
              </p>
            </div>
          )}

          {/* 답변 제출 버튼 */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className={`
                px-12 py-4 rounded-2xl text-xl font-bold transition-all duration-200
                ${selectedAnswer
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {currentIndex < problems.length - 1 ? '다음 문제' : '완료하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
