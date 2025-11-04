import { useState, useEffect } from 'react';

// Types
interface Adventure3Problem {
  id: number;
  imageUrl?: string;      // 문제 이미지 URL
  correctAnswer: string;  // 정답
  options: string[];      // 선택지 배열
}

// Hooks
import { useTutorialVoice } from '../hooks/useTutorialVoice';

// Components
import { TutorialOverlay } from '../components/adventure/TutorialOverlay';
import { TopActionsBar } from '../components/adventure/TopActionsBar';
import { TutorialBubble } from '../components/adventure/TutorialBubble';
import { FeedbackCharacter } from '../components/adventure/FeedbackCharacter';
import { ImageProblemCard } from '../components/adventure/ImageProblemCard';
import { OptionsList } from '../components/adventure/OptionsList';

const Adventure3Page = () => {
  // -------- 완료 상태 관리 --------
  const [isAllCompleted, setIsAllCompleted] = useState(false);

  // -------- 더미 문제 데이터 --------
  const problems: Adventure3Problem[] = [
    {
      id: 1,
      imageUrl: '', // TODO: 실제 이미지 URL로 변경
      correctAnswer: '가방',
      options: ['가방', '신발', '모자'],
    },
    {
      id: 2,
      imageUrl: '', // TODO: 실제 이미지 URL로 변경
      correctAnswer: '바나나',
      options: ['사과', '바나나', '포도'],
    },
  ];

  // 현재 문제 인덱스
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentProblem = problems[currentIndex];

  // 튜토리얼 상태
  const [isTutorialMode, setIsTutorialMode] = useState(false);

  // 선택지 관련 상태
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 피드백 표시 상태
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

  // 음성 Hook
  const { playVoice, stopVoice } = useTutorialVoice();

  // 문제 전환 시 상태 초기화
  useEffect(() => {
    setSelectedAnswer(null);
    setWrongAnswers([]);
    setIsAnswered(false);
    setIsAnimating(false);
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
        '그림을 보고 알맞은 단어를 선택하세요!'
      );
    } else {
      stopVoice();
    }
  };

  // 다음 문제로 이동
  const moveToNextProblem = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // 모든 문제 완료
      setIsAllCompleted(true);
    }
  };

  // 선택지 클릭 핸들러
  const handleOptionClick = (option: string) => {
    // 이미 정답을 맞췄거나, 이미 틀린 선택지거나, 애니메이션 중이거나, 튜토리얼 모드면 무시
    if (isAnswered || wrongAnswers.includes(option) || isAnimating || isTutorialMode) return;

    setSelectedAnswer(option);

    // 정답 체크
    if (option === currentProblem.correctAnswer) {
      // 정답 처리
      setIsAnswered(true);
      setShowFeedback(true);
      setIsCorrectAnswer(true);

      setTimeout(() => {
        setShowFeedback(false);
        moveToNextProblem();
      }, 2000);
    } else {
      // 오답 처리
      setIsAnimating(true);
      setWrongAnswers((prev) => [...prev, option]);
      setShowFeedback(true);
      setIsCorrectAnswer(false);

      setTimeout(() => {
        setSelectedAnswer(null);
        setIsAnimating(false);
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
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 pb-6 relative z-[2]">
        {/* 튜토리얼 말풍선 (양피지 위에 표시) */}
        {isTutorialMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <TutorialBubble
              text="그림을 보고 알맞은 단어를 선택하세요!"
              className="max-w-[90%] text-center"
            />
          </div>
        )}

        {/* 양피지 컨테이너: 지도+콘텐츠 동일 스케일 */}
        <div
          className="relative"
          style={{
            backgroundImage: 'url(/adventurepage/map_background.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            width: 'clamp(800px, 96vw, 1400px)',
            aspectRatio: '16 / 9',
            padding: 'clamp(20px, 4vw, 56px) clamp(24px, 5vw, 72px)',
            overflow: 'hidden',
          }}
        >
          {/* 세이프존: 테두리 안쪽 퍼센트 영역 */}
          <div
            className="absolute flex flex-col items-center justify-center gap-[6%]"
            style={{ inset: '10% 8%' }}
          >
            {/* 이미지 문제 카드 */}
            <ImageProblemCard
              imageUrl={currentProblem.imageUrl}
              alt={currentProblem.correctAnswer}
            />

            {/* 선택지 목록 */}
            <OptionsList
              options={currentProblem.options}
              correctAnswer={currentProblem.correctAnswer}
              selectedAnswer={selectedAnswer}
              wrongAnswers={wrongAnswers}
              isAnswered={isAnswered}
              isAnimating={isAnimating}
              isTutorialMode={isTutorialMode}
              onSelect={handleOptionClick}
            />
          </div>
        </div>
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
