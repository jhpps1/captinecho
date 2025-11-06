import { useState } from 'react';
import type { Problem } from '../../types/adventure';
import { WordCard } from './WordCard';
import { MicrophoneButton } from './MicrophoneButton';
import { FeedbackCharacter } from './FeedbackCharacter';

interface Adventure4Props {
  problem: Problem;
  onSubmit: (answer: unknown, attemptCount: number) => void;
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
export const Adventure4 = ({ problem, onSubmit }: Adventure4Props) => {
  const [isRecording, setIsRecording] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);
  const [showSpeakerButton, setShowSpeakerButton] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

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
        onSubmit('voice-answer', attemptCount);
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

  // 마이크 버튼 클릭
  const handleMicClick = async () => {
    if (isRecording) {
      // 녹음 종료
      setIsRecording(false);
      setIsAnalyzing(true);

      // TODO: 실제 음성 인식 API 연동
      // const result = await sendAudioToBackend(audioBlob, problem.questionText);
      // handleAnswer(result.isCorrect, result.similarity);

      // 임시: 2초 후 랜덤 결과
      setTimeout(() => {
        setIsAnalyzing(false);
        const randomCorrect = Math.random() > 0.5;
        handleAnswer(randomCorrect, randomCorrect ? 90 : 60);
      }, 2000);
    } else {
      // 녹음 시작
      setIsRecording(true);
      // TODO: 실제 녹음 시작
    }
  };

  return (
    <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pb-16 sm:pb-20">
      {/* 안내문 */}
      <div className="flex items-center justify-center mb-4 sm:mb-6" style={{ minHeight: '3rem' }}>
        {/* 튜토리얼 말풍선 필요 시 추가 */}
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

      {/* 피드백 캐릭터 */}
      <FeedbackCharacter
        visible={showFeedback}
        isCorrect={isCorrectAnswer}
      />
    </main>
  );
};
