import { useState, useEffect } from 'react';
import { useTutorialVoice } from '../hooks/useTutorialVoice';
import { TutorialOverlay } from '../components/adventure/TutorialOverlay';
import { TopActionsBar } from '../components/adventure/TopActionsBar';
import { TutorialBubble } from '../components/adventure/TutorialBubble';
import { FeedbackCharacter } from '../components/adventure/FeedbackCharacter';
import { ImageProblemCard } from '../components/adventure/ImageProblemCard';
import { OptionsList } from '../components/adventure/OptionsList';

interface Adventure3Problem {
  id: number;
  imageUrl?: string;
  correctAnswer: string;
  options: string[];
}

const Adventure3Page = () => {
  const [isAllCompleted, setIsAllCompleted] = useState(false);

  const problems: Adventure3Problem[] = [
    {
      id: 1,
      imageUrl: '/adventurepage/test_bag.png',
      correctAnswer: '가방',
      options: ['가방', '신발', '모자'],
    },
    {
      id: 2,
      imageUrl: '',
      correctAnswer: '바나나',
      options: ['사과', '바나나', '포도'],
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentProblem = problems[currentIndex];

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTutorialMode, setIsTutorialMode] = useState(false);

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

  const handleTutorialClick = () => {
    const goingToTutorial = !isTutorialMode;
    setIsTutorialMode(goingToTutorial);

    if (goingToTutorial) {
      playVoice('tutorial', '그림을 보고 알맞은 단어를 선택하세요!');
    } else {
      stopVoice();
    }
  };

  const handleOptionClick = (option: string) => {
    if (isAnswered || wrongAnswers.includes(option) || isAnimating || isTutorialMode) return;

    setSelectedAnswer(option);

    if (option === currentProblem.correctAnswer) {
      setIsAnswered(true);

      setTimeout(() => {
        if (currentIndex < problems.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedAnswer(null);
          setWrongAnswers([]);
          setIsAnswered(false);
        } else {
          setIsAllCompleted(true);
        }
      }, 1000);
    } else {
      setIsAnimating(true);
      setWrongAnswers((prev) => [...prev, option]);

      setTimeout(() => {
        setSelectedAnswer(null);
        setIsAnimating(false);
      }, 1000);
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen relative"
      style={{
        backgroundImage: 'url(/adventurepage/adventure_3_background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#D4B896',
        minWidth: '100vw',
      }}
    >
      {/* 양피지 배경 장식 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div
          style={{
            backgroundImage: 'url(/adventurepage/map_background.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            width: 'clamp(320px, 96vw, 1400px)',
            aspectRatio: '16 / 9',
          }}
        />
      </div>

      <TutorialOverlay active={isTutorialMode} />
      <TopActionsBar onTutorialClick={handleTutorialClick} isCompleted={isAllCompleted} />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pb-16 sm:pb-20">
        {/* 튜토리얼 말풍선 */}
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
            imageUrl={currentProblem.imageUrl}
            alt={currentProblem.correctAnswer}
          />
        </div>

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
          variant="rectangle"
        />
      </main>

      <FeedbackCharacter
        visible={Boolean(isAnswered || selectedAnswer)}
        isCorrect={isAnswered && selectedAnswer === currentProblem.correctAnswer}
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

export default Adventure3Page;
