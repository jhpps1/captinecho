import { useEffect, useRef, useState } from 'react';
import type { Problem } from '../../types/adventure';
import { WordCard } from './WordCard';
import { MicrophoneButton } from './MicrophoneButton';
import { FeedbackCharacter } from './FeedbackCharacter';
import { TutorialBubble } from './TutorialBubble';
import { submitSessionCorrect, evaluatePronunciation } from '../../api/adventureApi';

interface Adventure4Props {
  problem: Problem;
  onSubmit: (answer: unknown, attemptCount: number) => void;
  isTutorialMode: boolean;
  mode: 'daily' | 'supple';
  studentId: number;
}

/**
 * Adventure4 - 말하기 문제
 *
 * @description
 * - 단어를 보고 똑같이 말하기
 * - 음성 인식 후 유사도 검증
 * - questionText 필드 사용 (완성된 단어)
 *
 * @param problem - API에서 받은 문제 데이터
 * @param onSubmit - 정답 제출 콜백
 */
export const Adventure4 = ({ problem, onSubmit, isTutorialMode, mode, studentId }: Adventure4Props) => {
  const [isRecording, setIsRecording] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);
  const [showSpeakerButton, setShowSpeakerButton] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

  // 🔽 새로 추가: 방금 녹음한 파일을 들을 수 있는 URL
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // 🔽 녹음 관련 ref들
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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

  // 스피커 버튼: 단어 음성 재생
  const handlePlayWordAudio = () => {
    if (problem.soundUrl) {
      const audio = new Audio(problem.soundUrl);
      audio.play().catch(err => {
        console.error('오디오 재생 실패:', err);
      });
    }
  };

  // 답변 처리
  const handleAnswer = (isCorrect: boolean, similarity?: number) => {
    console.log(`답변 처리: ${isCorrect ? '정답' : '오답'}, 유사도: ${similarity}%`);

    if (isCorrect) {
      // 정답
      setIsSpeaking(true);
      setShowFeedback(true);
      setIsCorrectAnswer(true);

      setTimeout(() => {
        setShowFeedback(false);
        setIsSpeaking(false);
        // onSubmit('voice-answer', attemptCount);
      }, 2000);
    } else {
      // 오답
      setShowFeedback(true);
      setIsCorrectAnswer(false);

      setAttemptCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 3) setShowSpeakerButton(true);
        return newCount;
      });

      setTimeout(() => setShowFeedback(false), 2000);
    }
  };

  // 🔽 녹음 시작 로직
  const startRecording = async () => {
    try {
      // 1) 마이크 권한 요청 → 이때 브라우저 허용/차단 팝업
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

      // 5) 녹음 종료 후(WebM 파일 생성 + 미리듣기 URL 설정)
      mediaRecorder.onstop = async () => {
        // 지금까지 모은 조각들로 Blob 생성
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

        // Blob → WebM File 생성
        const file = new File([blob], 'recording.webm', {
          type: 'audio/webm',
        });

        console.log('생성된 WebM 파일:', file);

        // 🔊 미리 듣기용 URL 생성 (문제마다, 녹음할 때마다 최신 걸로 바뀜)
        const previewUrl = URL.createObjectURL(file);
        setAudioUrl(previewUrl);

        // 실제 발음 평가 API 호출
        setIsAnalyzing(true);

        try {
          const result = await evaluatePronunciation(file, problem.dayProblemId, studentId);
          console.log('발음 평가 결과:', result);

          const isCorrect = result.accuracy >= 80; // 80% 이상 정답
          handleAnswer(isCorrect, result.accuracy);
        } catch (error) {
          console.error('발음 평가 오류:', error);
          alert('발음 평가 중 오류가 발생했습니다. 다시 시도해주세요.');
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
      // 새 녹음 시작할 때 이전 분석 상태는 끄기
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
      mediaRecorder.stop(); // → onstop 콜백에서 WebM 파일 생성 + audioUrl 설정
    }
    setIsRecording(false);
  };

  // 마이크 버튼 클릭 (녹음 시작/종료 토글)
  const handleMicClick = () => {
    // 분석 중일 때는 버튼 무시 (원하면 제거 가능)
    if (isAnalyzing) return;

    if (isRecording) {
      // 단어 다 읽고 다시 누르면 녹음 종료
      stopRecording();
    } else {
      // 첫 클릭 → 녹음 시작
      startRecording();
    }
  };

  return (
    <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pb-16 sm:pb-20">
      {/* 안내문 */}
      <div className="flex items-center justify-center mb-4 sm:mb-6" style={{ minHeight: '3rem' }}>
        {isTutorialMode && (
          <TutorialBubble
            text="단어를 보고 똑같이 말해보세요!"
            className="max-w-[90%] text-center"
          />
        )}
      </div>

      {/* 단어 카드 + 스피커 버튼 */}
      <div className="mb-8 sm:mb-12 md:mb-16">
        <WordCard
          word={problem.questionText}
          showSpeaker={showSpeakerButton}
          onSpeakerClick={handlePlayWordAudio}
          isSpeaking={isSpeaking}
        />
      </div>

      {/* 마이크 버튼 */}
      <MicrophoneButton
        isRecording={isRecording}
        isAnalyzing={isAnalyzing}
        onClick={handleMicClick}
      />

      {/* 🔊 방금 녹음한 음성 미리듣기 */}
      {audioUrl && (
        <div className="mt-4 w-full max-w-xs">
          <audio controls src={audioUrl} className="w-full">
            브라우저가 audio 태그를 지원하지 않습니다.
          </audio>
        </div>
      )}

      {/* 피드백 캐릭터 */}
      <FeedbackCharacter
        visible={showFeedback}
        isCorrect={isCorrectAnswer}
      />
    </main>
  );
};
