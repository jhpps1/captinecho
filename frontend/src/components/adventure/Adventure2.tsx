import { useState } from 'react';
import type { Problem } from '../../types/adventure';
import { MultiSyllableCard, type SyllableData } from './MultiSyllableCard';
import { ImageProblemCard } from './ImageProblemCard';
import { OptionsList } from './OptionsList';
import { FeedbackCharacter } from './FeedbackCharacter';

interface Adventure2Props {
  problem: Problem;
  onSubmit: (answer: unknown, attemptCount: number) => void;
}

/**
 * Adventure2 - 빈칸 채우기 문제 (단어)
 *
 * @description
 * - 여러 음절로 이루어진 단어에서 빈칸 찾기
 * - 이미지와 함께 제공
 * - API Problem 데이터를 SyllableData 배열로 변환
 *
 * @param problem - API에서 받은 문제 데이터
 * @param onSubmit - 정답 제출 콜백
 */
export const Adventure2 = ({ problem, onSubmit }: Adventure2Props) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);

  // API Problem → SyllableData[] 변환
  // questionPhonemes: ["ㄱ,ㅏ", "ㅂ,ㅏ,ㅇ"] → [{ initial: 'ㄱ', medial: 'ㅏ' }, { initial: 'ㅂ', medial: 'ㅏ', final: 'ㅇ', hiddenTarget: 'final' }]
  const convertToSyllables = (): SyllableData[] => {
    return problem.questionPhonemes.map((syllable, index) => {
      const phonemes = syllable.split(',').map(p => p.trim());

      const syllableData: SyllableData = {
        initial: phonemes[0] || '',
        medial: phonemes[1] || '',
      };

      if (phonemes[2]) {
        syllableData.final = phonemes[2];
      }

      // 빈칸이 이 음절에 있는지 확인 (seqNo와 index 비교 또는 blankPhoneme으로 판단)
      // 간단히 정답이 이 음절의 구성요소인지 확인
      const correctAnswer = problem.correctAnswer[0]; // 단일 정답
      if (syllableData.initial === correctAnswer || syllableData.medial === correctAnswer || syllableData.final === correctAnswer) {
        syllableData.hiddenTarget = problem.blankPosition as 'initial' | 'medial' | 'final';
      }

      return syllableData;
    });
  };

  const syllables = convertToSyllables();
  const correctAnswer = problem.correctAnswer[0]; // 빈칸 채우기는 단일 정답

  // 선택지 클릭
  const handleOptionClick = (option: string) => {
    if (isAnswered || wrongAnswers.includes(option) || isAnimating) return;

    setSelectedAnswer(option);

    if (option === correctAnswer) {
      // 정답
      setIsAnswered(true);

      setTimeout(() => {
        onSubmit(option, attemptCount);
      }, 1000);
    } else {
      // 오답
      setIsAnimating(true);
      setWrongAnswers((prev) => [...prev, option]);
      setAttemptCount((prev) => prev + 1);

      setTimeout(() => {
        setSelectedAnswer(null);
        setIsAnimating(false);
      }, 1000);
    }
  };

  return (
    <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pb-16 sm:pb-20">
      {/* 안내문 */}
      <div className="flex items-center justify-center mb-4 sm:mb-6" style={{ minHeight: '3rem' }}>
        {/* 튜토리얼 말풍선 필요 시 추가 */}
      </div>

      {/* 문제 영역: 이미지 카드 + 단어 카드 */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-10 mb-6 sm:mb-8 md:mb-10">
        <ImageProblemCard
          imageUrl={problem.imageUrl}
          alt={problem.questionText}
        />
        <MultiSyllableCard
          syllables={syllables}
          isAnswered={isAnswered}
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
        isTutorialMode={false}
        onSelect={handleOptionClick}
        variant="square"
      />

      {/* 피드백 캐릭터 */}
      <FeedbackCharacter
        visible={Boolean(isAnswered || selectedAnswer)}
        isCorrect={isAnswered && selectedAnswer === correctAnswer}
      />
    </main>
  );
};
