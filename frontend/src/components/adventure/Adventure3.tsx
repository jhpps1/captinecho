import { useState } from 'react';
import type { Problem } from '../../types/adventure';
import { ImageProblemCard } from './ImageProblemCard';
import { OptionsList } from './OptionsList';
import { FeedbackCharacter } from './FeedbackCharacter';
import { TutorialBubble } from './TutorialBubble';
import { submitSessionCorrect } from '../../api/adventureApi';

interface Adventure3Props {
  problem: Problem;
  onSubmit: (answer: unknown, attemptCount: number) => void;
  isTutorialMode: boolean;
  mode: 'daily' | 'supple';
  studentId: number;
}

/**
 * Adventure3 - 단어 선택 문제
 *
 * @description
 * - 이미지를 보고 알맞은 단어 선택
 * - questionText 필드 사용 (완성된 단어)
 *
 * @param problem - API에서 받은 문제 데이터
 * @param onSubmit - 정답 제출 콜백
 */
export const Adventure3 = ({ problem, onSubmit, isTutorialMode, mode, studentId }: Adventure3Props) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);

  const correctAnswer = problem.correctAnswer[0]; // 단어 선택은 단일 정답

  // 선택지 클릭
  const handleOptionClick = (option: string) => {
    if (isAnswered || wrongAnswers.includes(option) || isAnimating) return;

    setSelectedAnswer(option);

    if (option === correctAnswer) {
      // 정답
      setIsAnswered(true);

      setTimeout(() => {
        onSubmit(option, attemptCount);
      }, 2000);
    } else {
      // 오답
      setIsAnimating(true);
      setWrongAnswers((prev) => [...prev, option]);

      // Adventure3(단어 선택)은 오답 패턴을 수집하지 않음
      // is_completed만 ProblemRunner에서 처리됨

      setAttemptCount((prev) => prev + 1);

      setTimeout(() => {
        setSelectedAnswer(null);
        setIsAnimating(false);
      }, 2000);
    }
  };

  return (
    <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pb-16 sm:pb-20">
      {/* 안내문 */}
      <div className="flex items-center justify-center mb-4 sm:mb-6" style={{ minHeight: '3rem' }}>
        {isTutorialMode && (
          <TutorialBubble
            text="그림을 보고 알맞은 단어를 선택하세요!"
            className="max-w-[90%] text-center"
          />
        )}
      </div>

      {/* 이미지 카드 */}
      <div className="mb-6 sm:mb-8 md:mb-10">
        <ImageProblemCard
          imageUrl={problem.imageUrl}
          alt={correctAnswer}
        />
      </div>

      {/* 선택지 목록 */}
      <OptionsList
        options={problem.choices}
        correctAnswer={correctAnswer}
        selectedAnswer={selectedAnswer}
        wrongAnswers={wrongAnswers}
        isAnswered={isAnswered}
        isAnimating={isAnimating}
        isTutorialMode={isTutorialMode}
        onSelect={handleOptionClick}
        variant="rectangle"
      />

      {/* 피드백 캐릭터 */}
      <FeedbackCharacter
        visible={Boolean(isAnswered || selectedAnswer)}
        isCorrect={isAnswered && selectedAnswer === correctAnswer}
      />
    </main>
  );
};
