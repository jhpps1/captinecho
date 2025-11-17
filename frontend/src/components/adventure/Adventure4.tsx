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
  const [encouragementMessage, setEncouragementMessage] = useState<string | null>(null);
  const [showImageHint, setShowImageHint] = useState(false);

  // 🔽 새로 추가: 방금 녹음한 파일을 들을 수 있는 URL
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // 🔽 녹음 관련 ref들
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // 컴포넌트 언마운트 시 녹음/스트림 정리
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // 이미지 힌트 프리로딩 (2번째 오답 시 빠른 표시를 위해)
  useEffect(() => {
    if (problem.imageUrl) {
      const img = new Image();
      img.src = problem.imageUrl;

      img.onerror = () => {
        console.warn('⚠️ 이미지 프리로딩 실패:', problem.imageUrl);
      };
    }
  }, [problem.imageUrl]);

  // 스피커 버튼: 단어 음성 재생
  const handlePlayWordAudio = () => {
    if (problem.soundUrl) {
      const audio = new Audio(problem.soundUrl);
      audio.play().catch(err => {
        console.error('오디오 재생 실패:', err);
      });
    }
  };

  // 메아리 효과로 녹음 음성 재생
  const playAudioWithEcho = async (url: string): Promise<void> => {
    if (!url) {
      console.warn('메아리 재생 실패: URL이 없습니다');
      return;
    }

    try {
      // AudioContext 생성 (재사용)
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioContext = audioContextRef.current;

      // AudioContext가 suspended 상태면 resume
      if (audioContext.state === 'suspended') {
        console.log('AudioContext suspended 상태, resume 시도');
        await audioContext.resume();
      }

      console.log('AudioContext 상태:', audioContext.state);

      // 오디오 데이터 가져오기
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // 메아리 효과 생성 (메아리만 재생)
      const echoDelays = [0]; // 즉시 재생
      const echoGains = [0.65]; // 65% 볼륨

      // 재생 완료를 Promise로 처리
      await new Promise<void>((resolve) => {
        echoDelays.forEach((delay, index) => {
          const source = audioContext.createBufferSource();
          const gainNode = audioContext.createGain();

          source.buffer = audioBuffer;
          gainNode.gain.value = echoGains[index];

          source.connect(gainNode);
          gainNode.connect(audioContext.destination);

          // 재생 완료 이벤트 리스너
          source.onended = () => {
            console.log('메아리 효과 재생 완료');
            resolve();  // 재생 완료 시 Promise 완료
          };

          source.start(audioContext.currentTime + delay);
          // console.log(`메아리 효과 재생 시작 (delay: ${delay}s, gain: ${echoGains[index]}, duration: ${audioBuffer.duration.toFixed(2)}s)`);
        });
      });
    } catch (error) {
      console.error('메아리 효과 재생 실패:', error);
    }
  };

  // 답변 처리
  const handleAnswer = async (isCorrect: boolean, recordedAudioUrl?: string, similarity?: number) => {
    console.log(`답변 처리: ${isCorrect ? '정답' : '오답'}, 유사도: ${similarity}%`);

    if (isCorrect) {
      // 정답
      setIsSpeaking(true);
      setShowFeedback(true);
      setIsCorrectAnswer(true);

      // 힌트 상태 초기화
      setEncouragementMessage(null);
      setShowImageHint(false);

      // 🔊 메아리 효과로 녹음 음성 재생 및 완료 대기
      if (recordedAudioUrl) {
        await playAudioWithEcho(recordedAudioUrl);
        // 메아리 효과 재생 완료 후 1초 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 피드백 캐릭터 및 상태 정리
      setShowFeedback(false);
      setIsSpeaking(false);
      onSubmit('voice-answer', attemptCount);
    } else {
      // 오답
      setShowFeedback(true);
      setIsCorrectAnswer(false);

      setAttemptCount(prev => {
        const newCount = prev + 1;

        // 단계별 힌트 제공
        if (newCount === 2) {
          // 1번째 오답: 격려 메시지
          setEncouragementMessage('다시 한번 도전해보자!');
          setTimeout(() => setEncouragementMessage(null), 3000);
        } else if (newCount === 3) {
          // 2번째 오답: 이미지 힌트 (피드백 캐릭터 사라진 후 표시)
          if (problem.imageUrl) {
            setTimeout(() => setShowImageHint(true), 3000);
            setTimeout(() => setShowImageHint(false), 8000);
          }
        } else if (newCount >= 4) {
          // 3번째 오답: 스피커 버튼 (피드백 캐릭터 사라진 후 표시)
          setTimeout(() => setShowSpeakerButton(true), 3000);
        }

        return newCount;
      });

      setTimeout(() => setShowFeedback(false), 3000);
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

        // console.log('생성된 WebM 파일:', file);

        // 🔊 미리 듣기용 URL 생성 (문제마다, 녹음할 때마다 최신 걸로 바뀜)
        const previewUrl = URL.createObjectURL(file);
        setAudioUrl(previewUrl);

        // 실제 발음 평가 API 호출
        setIsAnalyzing(true);

        try {
          const result = await evaluatePronunciation(file, problem.dayProblemId, studentId);
          console.log('발음 평가 결과:', result);

          const isCorrect = result.accuracy >= 80; // 80% 이상 정답
          handleAnswer(isCorrect, previewUrl, result.accuracy);
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

  // 🔽 개발용: 5번 오답 시 넘어가기 버튼
  const handleSkip = () => {
    console.log('⏭️ 개발용 넘어가기 버튼 클릭 - 정답 처리');
    handleAnswer(true, audioUrl || undefined, 80);
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

      {/* 이미지 힌트 모달 (2번째 오답) */}
      {showImageHint && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md">
            <p className="mb-4 text-xl font-bold text-center text-orange-500">💡 힌트!</p>
            <img
              src={problem.imageUrl || '/adventurepage/no_image.png'}
              alt="힌트 이미지"
              className="w-full h-auto rounded-lg shadow-md"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/adventurepage/no_image.png';
              }}
            />
          </div>
        </div>
      )}

      {/* 피드백 캐릭터 */}
      <FeedbackCharacter
        visible={showFeedback}
        isCorrect={isCorrectAnswer}
        message={encouragementMessage || undefined}
      />

      {/* 개발용: 5번 오답 시 넘어가기 버튼 (ProblemRunner 버튼 위에 배치) */}
      {attemptCount >= 5 && !showFeedback && (
        <div className="fixed bottom-28 right-4 z-50">
          <button
            onClick={handleSkip}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 transition-colors font-semibold"
          >
            ⏭️ 넘어가기
          </button>
        </div>
      )}
    </main>
  );
};
