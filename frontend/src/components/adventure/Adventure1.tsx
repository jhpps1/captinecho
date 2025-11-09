import { useState } from 'react';
import type { Problem } from '../../types/adventure';
import {
  splitVowelForLayout,
  getVowelLayoutType
} from '../../utils/hangulUtils';
import { SingleSyllableCard } from './SingleSyllableCard';
import { OptionsList } from './OptionsList';
import { FeedbackCharacter } from './FeedbackCharacter';
import { TutorialBubble } from './TutorialBubble';
import { submitSessionCorrect } from '../../api/adventureApi';

// Adventure1 전용 문제 데이터 타입 (기존 ProblemData 사용)
import type { ProblemData } from '../../types/problem';

interface Adventure1Props {
  problem: Problem;
  onSubmit: (answer: unknown, attemptCount: number) => void;
  isTutorialMode: boolean;
}

/**
 * Adventure1 - 음소 분해 문제 (단일 글자)
 *
 * @description
 * - 한 글자에서 빈칸(초성/중성/종성) 찾기
 * - 선택지에서 정답 고르기
 * - API Problem 데이터를 ProblemData 형식으로 변환하여 사용
 *
 * @param problem - API에서 받은 문제 데이터
 * @param onSubmit - 정답 제출 콜백
 */
export const Adventure1 = ({ problem, onSubmit, isTutorialMode }: Adventure1Props) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);

  // API Problem → ProblemData 변환
  // questionPhonemes: ["ㄱ","ㅏ"] 또는 ["ㄱ","ㅏ","ㅂ"] → { initial: 'ㄱ', medial: 'ㅏ', final?: 'ㅂ' }
  const convertToProblemData = (): ProblemData | null => {
    // questionPhonemes는 이미 배열 형태: ["ㅂ","ㅓ","ㄴ"]
    const phonemes = problem.questionPhonemes;

    // blankPosition이 null이면 문제 데이터가 유효하지 않음
    if (!problem.blankPosition) {
      return null;
    }

    return {
      id: problem.dayProblemId,
      initial: phonemes[0] || '',
      medial: phonemes[1] || '',
      final: phonemes[2], // undefined일 수 있음 (종성 없는 경우)
      hiddenTarget: problem.blankPosition,
      options: problem.choices,
    };
  };

  const currentProblem = convertToProblemData();

  // 유효하지 않은 문제 데이터 처리
  if (!currentProblem) {
    return (
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pb-16 sm:pb-20">
        <div className="text-xl text-gray-600">문제 데이터를 불러올 수 없습니다.</div>
      </main>
    );
  }

  const correctAnswer = problem.correctAnswer[0];
  const vowelLayoutType = getVowelLayoutType(currentProblem.medial);
  const vowelParts = splitVowelForLayout(currentProblem.medial);

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

      // 오답 학습 데이터 수집
      const payload = {
        isCorrect: false,
        realJamo: correctAnswer,
        confusionJamo: option,  // 사용자가 선택한 오답 자모
        phonemePosition: problem.blankPosition || null,  // falsy → null 명시적 변환
      };
      console.log('🔍 Adventure1 오답 API 전송 데이터:', payload);
      console.log('🔍 problem 객체:', problem);

      submitSessionCorrect(problem.studentId, payload).catch(error => {
        console.error('❌ 오답 학습 데이터 수집 실패:', error);
        console.error('❌ 에러 응답:', error.response?.data);
        // 에러 발생해도 문제 진행은 계속
      });

      setAttemptCount((prev) => prev + 1);

      setTimeout(() => {
        setSelectedAnswer(null);
        setIsAnimating(false);
      }, 1000);
    }
  };

  // 글자 색상 결정
  const getColorClassForPart = (
    partName: 'initial' | 'medialTop' | 'medialBottom' | 'final'
  ) => {
    const isTargetInitial =
      currentProblem.hiddenTarget === 'INITIAL' && partName === 'initial';
    const isTargetFinal =
      currentProblem.hiddenTarget === 'FINAL' && partName === 'final';
    const isTargetMedial =
      currentProblem.hiddenTarget === 'MEDIAL' &&
      (partName === 'medialTop' || partName === 'medialBottom');

    const isTarget = isTargetInitial || isTargetFinal || isTargetMedial;

    if (isTarget && !isAnswered) {
      return 'text-gray-300';
    }
    return 'text-gray-800';
  };

  return (
    <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pb-16 sm:pb-20">
      {/* 안내문 (위쪽) */}
      <div
        className="flex items-center justify-center mb-4 sm:mb-6"
        style={{ minHeight: '3rem' }}
      >
        {isTutorialMode && (
          <TutorialBubble
            text="회색 칸에 들어갈 글자를 골라보세요!"
            className="max-w-[90%]"
          />
        )}
      </div>

      {/* 문제 카드 */}
      <div className="mb-6 sm:mb-8 md:mb-10">
        <SingleSyllableCard
          problem={currentProblem}
          vowelLayoutType={vowelLayoutType}
          vowelParts={vowelParts}
          getColorClassForPart={getColorClassForPart}
        />
      </div>

      {/* 안내문 (선택지 위) */}
      <div
        className="flex items-center justify-center mb-6 sm:mb-8 md:mb-10"
        style={{ minHeight: '2.5rem' }}
      >
        {/* 필요 시 말풍선 추가 */}
      </div>

      {/* 선택지 목록 */}
      <OptionsList
        options={currentProblem.options}
        correctAnswer={correctAnswer}
        selectedAnswer={selectedAnswer}
        wrongAnswers={wrongAnswers}
        isAnswered={isAnswered}
        isAnimating={isAnimating}
        isTutorialMode={isTutorialMode}
        onSelect={handleOptionClick}
      />

      {/* 피드백 캐릭터 */}
      <FeedbackCharacter
        visible={Boolean(isAnswered || selectedAnswer)}
        isCorrect={isAnswered && selectedAnswer === correctAnswer}
      />
    </main>
  );
};
