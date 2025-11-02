import { useState, useEffect } from 'react';

// Types
import type { ProblemData } from '../types/problem';

// Utils
import {
  splitVowelForLayout,
  getVowelLayoutType,
  getCorrectAnswerForProblem
} from '../utils/hangulUtils';

// Hooks
import { useTutorialVoice } from '../hooks/useTutorialVoice';

// Components
import { TutorialOverlay } from '../components/TutorialOverlay';
import { TopActionsBar } from '../components/TopActionsBar';
import { TutorialBubble } from '../components/TutorialBubble';
import { ProblemCard } from '../components/ProblemCard';
import { OptionsList } from '../components/OptionsList';
import { FeedbackCharacter } from '../components/FeedbackCharacter';

const Adventure1Page = () => {
  // -------- 더미 문제 데이터 (실제 API 응답 형태에 가깝게) --------
  const problems: ProblemData[] = [
    {
      id: 1,
      initial: 'ㄱ',
      medial: 'ㅏ',
      final: undefined,
      hiddenTarget: 'medial',
      options: ['ㅏ', 'ㅓ', 'ㅗ'],
    },
    {
      id: 2,
      initial: 'ㅂ',
      medial: 'ㅗ',
      final: 'ㅂ',
      hiddenTarget: 'final',
      options: ['ㅂ', 'ㄴ', 'ㅇ'],
    },
    {
      id: 3,
      initial: 'ㅇ',
      medial: 'ㅘ', // 복합 모음. 백엔드는 이걸 그냥 "ㅘ"로 준다
      final: 'ㅇ',
      hiddenTarget: 'medial',
      options: ['ㅘ', 'ㅝ', 'ㅢ'],
    },
  ];

  // 현재 문제 인덱스
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentProblem = problems[currentIndex];

  // 현재 문제의 정답 음소 (초성 or 중성 or 종성)
  const correctAnswer = getCorrectAnswerForProblem(currentProblem);

  // 모음 레이아웃 정보
  const vowelLayoutType = getVowelLayoutType(currentProblem.medial);
  const vowelParts = splitVowelForLayout(currentProblem.medial);

  // 상태들
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);       // 정답 맞춘 뒤 상태
  const [isAnimating, setIsAnimating] = useState(false);     // 오답 애니메이션 중?
  const [isTutorialMode, setIsTutorialMode] = useState(false); // 튜토리얼 온/오프

  // 음성 Hook
  const { playVoice, stopVoice } = useTutorialVoice();

  // ESC 키로 튜토리얼 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTutorialMode) {
        setIsTutorialMode(false);
        stopVoice();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTutorialMode, stopVoice]);

  // 보기(선택지) 클릭 시
  const handleOptionClick = (option: string) => {
    if (isAnswered || wrongAnswers.includes(option) || isAnimating || isTutorialMode) return;

    setSelectedAnswer(option);

    // 정답인지 비교
    if (option === correctAnswer) {
      // 정답
      setIsAnswered(true);

      // 1초 뒤 다음 문제로
      setTimeout(() => {
        if (currentIndex < problems.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedAnswer(null);
          setWrongAnswers([]);
          setIsAnswered(false);
        } else {
          alert('🎉 모든 문제를 완료했습니다!');
        }
      }, 1000);
    } else {
      // 오답
      setIsAnimating(true);
      setWrongAnswers((prev) => [...prev, option]);

      setTimeout(() => {
        setSelectedAnswer(null);
        setIsAnimating(false);
      }, 1000);
    }
  };

  // 문제 카드에서 글자 색상(회색/검정) 결정
  const getColorClassForPart = (
    partName: 'initial' | 'medialTop' | 'medialBottom' | 'final'
  ) => {
    // hiddenTarget은 'initial' | 'medial' | 'final'
    // 복합 모음일 때 'medial'은 top/bottom 둘 다 빈칸 취급
    const isTargetInitial =
      currentProblem.hiddenTarget === 'initial' && partName === 'initial';
    const isTargetFinal =
      currentProblem.hiddenTarget === 'final' && partName === 'final';
    const isTargetMedial =
      currentProblem.hiddenTarget === 'medial' &&
      (partName === 'medialTop' || partName === 'medialBottom');

    const isTarget = isTargetInitial || isTargetFinal || isTargetMedial;

    // 정답 맞추기 전이면 회색, 맞춘 뒤면 검정
    if (isTarget && !isAnswered) {
      return 'text-gray-300';
    }
    return 'text-gray-800';
  };

  // 튜토리얼 버튼
  const handleTutorialClick = () => {
    const goingToTutorial = !isTutorialMode;
    setIsTutorialMode(goingToTutorial);

    if (goingToTutorial) {
      playVoice(
        'tutorial',
        '회색 칸에 들어갈 글자를 골라보세요! 아래 카드 중에서 하나를 골라요!'
      );
    } else {
      stopVoice();
    }
  };

  // ====== 렌더 시작 ======
  return (
    <div
      className="flex flex-col h-screen relative"
      style={{
        backgroundImage: 'url(/adventurepage/adventure_1_background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#D4B896',
      }}
    >
      {/* 어두운 배경 오버레이 - 튜토리얼 모드 */}
      <TutorialOverlay active={isTutorialMode} />

      {/* 상단 아이콘 영역 */}
      <TopActionsBar onTutorialClick={handleTutorialClick} />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pb-16 sm:pb-20 relative z-[2]">
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
          <ProblemCard
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
          {isTutorialMode && (
            <TutorialBubble
              text="아래 카드 중에서 하나를 골라요!"
              className="text-lg sm:text-xl md:text-2xl whitespace-nowrap max-w-none"
            />
          )}
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
      </main>

      {/* 우측 하단 캐릭터 (피드백 캐릭터) */}
      <FeedbackCharacter
        visible={Boolean(isAnswered || selectedAnswer)}
        isCorrect={isAnswered && selectedAnswer === correctAnswer}
      />

      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0) translateY(20px); opacity: 0; }
          50% { transform: scale(1.1) translateY(-10px); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Adventure1Page;
