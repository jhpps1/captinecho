import { useState, useEffect } from 'react';

// Types
// TODO: 실제 타입/데이터 구조는 백엔드 연동 시 수정
interface Adventure3Problem {
  id: number;
  // TODO: Adventure3에 맞는 문제 타입 정의
}

// Hooks
import { useTutorialVoice } from '../hooks/useTutorialVoice';

// Components
import { TutorialOverlay } from '../components/adventure/TutorialOverlay';
import { TopActionsBar } from '../components/adventure/TopActionsBar';
import { TutorialBubble } from '../components/adventure/TutorialBubble';
import { FeedbackCharacter } from '../components/adventure/FeedbackCharacter';

const Adventure3Page = () => {
  // -------- 완료 상태 관리 --------
  const [isAllCompleted, setIsAllCompleted] = useState(false);

  // -------- 더미 문제 데이터 --------
  const problems: Adventure3Problem[] = [
    {
      id: 1,
      // TODO: 문제 데이터 정의
    },
    {
      id: 2,
      // TODO: 문제 데이터 정의
    },
  ];

  // 현재 문제 인덱스
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentProblem = problems[currentIndex];

  // 튜토리얼 상태
  const [isTutorialMode, setIsTutorialMode] = useState(false);

  // 정답 여부 상태
  const [isAnswered, setIsAnswered] = useState(false);

  // 피드백 표시 상태
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

  // 음성 Hook
  const { playVoice, stopVoice } = useTutorialVoice();

  // 문제 전환 시 상태 초기화
  useEffect(() => {
    setIsAnswered(false);
    setShowFeedback(false);
  }, [currentIndex]);

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

  // 튜토리얼 버튼 클릭
  const handleTutorialClick = () => {
    const goingToTutorial = !isTutorialMode;
    setIsTutorialMode(goingToTutorial);

    if (goingToTutorial) {
      playVoice(
        'tutorial',
        'Adventure3 튜토리얼 안내 메시지' // TODO: 실제 안내 메시지로 변경
      );
    } else {
      stopVoice();
    }
  };

  // 다음 문제로 이동
  const moveToNextProblem = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsAnswered(false);
      setShowFeedback(false);
    } else {
      // 모든 문제 완료
      setIsAllCompleted(true);
    }
  };

  // 정답/오답 처리
  const handleAnswer = (isCorrect: boolean) => {
    console.log(`답변 처리: ${isCorrect ? '정답' : '오답'}`);

    setShowFeedback(true);
    setIsCorrectAnswer(isCorrect);

    if (isCorrect) {
      // 정답 처리
      setIsAnswered(true);

      setTimeout(() => {
        setShowFeedback(false);
        moveToNextProblem();
      }, 2000);
    } else {
      // 오답 처리
      setTimeout(() => {
        setShowFeedback(false);
      }, 2000);
    }
  };

  // ====== 렌더 시작 ======
  return (
    <div
      className="flex flex-col min-h-screen relative"
      style={{
        backgroundImage: 'url(/adventurepage/adventure_3_background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#D4B896', // TODO: Adventure3에 맞는 배경색으로 변경
        minWidth: '100vw',
      }}
    >
      {/* 어두운 배경 오버레이 - 튜토리얼 모드 */}
      <TutorialOverlay active={isTutorialMode} />

      {/* 상단 아이콘 영역 */}
      <TopActionsBar onTutorialClick={handleTutorialClick} isCompleted={isAllCompleted} />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pb-16 sm:pb-20 relative z-[2]">
        {/* 튜토리얼 안내문 */}
        {isTutorialMode && (
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <TutorialBubble
              text="Adventure3 안내 메시지" // TODO: 실제 안내 메시지로 변경
              className="max-w-[90%]"
            />
          </div>
        )}

        {/* TODO: Adventure3 메인 콘텐츠 영역 구현 */}
        <div className="text-center text-white text-2xl">
          <p>Adventure3 콘텐츠 영역</p>
          <p className="text-lg mt-4">문제 {currentIndex + 1} / {problems.length}</p>
        </div>

        {/* TODO: 문제 카드 및 인터랙션 요소 추가 */}
      </main>

      {/* 우측 하단 캐릭터 (피드백 캐릭터) */}
      <FeedbackCharacter
        visible={showFeedback}
        isCorrect={isCorrectAnswer}
      />
    </div>
  );
};

export default Adventure3Page;
