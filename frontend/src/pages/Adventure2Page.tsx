import { useState, useEffect } from 'react';
// Hooks
import { useTutorialVoice } from '../hooks/useTutorialVoice';
// Components
import { TutorialOverlay } from '../components/adventure/TutorialOverlay';
import { TopActionsBar } from '../components/adventure/TopActionsBar';
import { TutorialBubble } from '../components/adventure/TutorialBubble';
import { FeedbackCharacter } from '../components/adventure/FeedbackCharacter';
import { OptionsList } from '../components/adventure/OptionsList';
import { MultiSyllableCard, type SyllableData } from '../components/adventure/MultiSyllableCard';
import { ImageProblemCard } from '../components/adventure/ImageProblemCard';

// Adventure2 문제 타입 정의
interface Adventure2Problem {
  id: number;
  imageUrl?: string;        // 문제 이미지 URL
  word: string;             // 전체 단어 (예: "가방")
  syllables: SyllableData[]; // 음절 배열
  correctAnswer: string;    // 정답 음소
  options: string[];        // 선택지 음소들
}

const Adventure2Page = () => {
  // -------- 완료 상태 관리 --------
  const [isAllCompleted, setIsAllCompleted] = useState(false);

  // -------- 더미 문제 데이터 --------
  const problems: Adventure2Problem[] = [
    {
      id: 1,
      imageUrl: '/adventurepage/test_bag.png',
      word: '가방',
      syllables: [
        { initial: 'ㄱ', medial: 'ㅏ' },  // "가" (빈칸 없음)
        { initial: 'ㅂ', medial: 'ㅏ', final: 'ㅇ', hiddenTarget: 'final' }  // "방" (받침 빈칸)
      ],
      correctAnswer: 'ㅇ',
      options: ['ㅇ', 'ㄴ', 'ㅁ'],
    },
    {
      id: 2,
      imageUrl: '',
      word: '의자',
      syllables: [
        { initial: 'ㅇ', medial: 'ㅢ', hiddenTarget: 'initial' },  // "의" (초성 빈칸)
        { initial: 'ㅈ', medial: 'ㅏ' }  // "자" (빈칸 없음)
      ],
      correctAnswer: 'ㅇ',
      options: ['ㅇ', 'ㅎ', 'ㄱ'],
    },
    {
      id: 3,
      imageUrl: '',
      word: '사과',
      syllables: [
        { initial: 'ㅅ', medial: 'ㅏ' },  // "사" (빈칸 없음)
        { initial: 'ㄱ', medial: 'ㅘ', hiddenTarget: 'medial' }  // "과" (중성 빈칸)
      ],
      correctAnswer: 'ㅘ',
      options: ['ㅘ', 'ㅝ', 'ㅙ'],
    },
  ];

  // 현재 문제 인덱스
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentProblem = problems[currentIndex];

  // 현재 문제의 정답 음소 (데이터에서 직접 가져옴)
  const correctAnswer = currentProblem.correctAnswer;

  // 상태 관리
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTutorialMode, setIsTutorialMode] = useState(false);

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

  // 튜토리얼 버튼 클릭
  const handleTutorialClick = () => {
    const goingToTutorial = !isTutorialMode;
    setIsTutorialMode(goingToTutorial);

    if (goingToTutorial) {
      playVoice('tutorial', '그림을 보고 빈칸에 들어갈 글자를 선택하세요!');
    } else {
      stopVoice();
    }
  };

  // 선택지 클릭 핸들러
  const handleOptionClick = (option: string) => {
    if (isAnswered || wrongAnswers.includes(option) || isAnimating || isTutorialMode) return;

    setSelectedAnswer(option);

    // 정답 체크
    if (option === correctAnswer) {
      // 정답 처리
      setIsAnswered(true);

      setTimeout(() => {
        if (currentIndex < problems.length - 1) {
          // 다음 문제로
          setCurrentIndex((prev) => prev + 1);
          setSelectedAnswer(null);
          setWrongAnswers([]);
          setIsAnswered(false);
        } else {
          // 모든 문제 완료
          setIsAllCompleted(true);
        }
      }, 1000);
    } else {
      // 오답 처리
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
      className="flex flex-col min-h-screen relative overflow-x-hidden"
      style={{
        backgroundImage: 'url(/adventurepage/adventure_2_background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#D4B896',
        minWidth: '100vw',
      }}
    >
      {/* 튜토리얼 오버레이 */}
      <TutorialOverlay active={isTutorialMode} />

      {/* 상단 액션 바 */}
      <TopActionsBar onTutorialClick={handleTutorialClick} isCompleted={isAllCompleted} />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 pb-6 relative z-[2]">
        {/* 튜토리얼 말풍선 (양피지 위에 표시) */}
        {isTutorialMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <TutorialBubble
              text="그림을 보고 빈칸에 들어갈 글자를 선택하세요!"
              className="max-w-[90%] text-center"
            />
          </div>
        )}

        {/* 양피지 배경 컨테이너 */}
        <div
          className="relative"
          style={{
            backgroundImage: 'url(/adventurepage/map_background.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            width: 'clamp(320px, 96vw, 1400px)',
            aspectRatio: '16 / 9',
            padding: 'clamp(20px, 4vw, 56px) clamp(24px, 5vw, 72px)',
            overflow: 'hidden',
          }}
        >
          {/* 세이프존: 양피지 테두리 안쪽 영역 */}
          <div
            className="h-full w-full flex flex-col items-center justify-center"
            style={{ gap: 'clamp(24px, 3vh, 40px)' }}
          >
            {/* 문제 영역: 이미지 카드 + 단어 카드 (반응형 배치) */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-10 w-full"> {/* ✅ 핵심 변경 */}
              {/* 왼쪽: 이미지 카드 */}
              <div className="flex-shrink-0 w-full md:w-auto md:max-w-md"> {/* ✅ 모바일 전체폭, 데스크톱 최대 448px */}
                <ImageProblemCard
                  imageUrl={currentProblem.imageUrl}
                  alt="문제 이미지"
                />
              </div>

              {/* 오른쪽: 단어 카드 */}
              <div className="flex-shrink-0 w-full md:w-auto"> {/* ✅ 모바일 전체폭 */}
                <MultiSyllableCard
                  syllables={currentProblem.syllables}
                  isAnswered={isAnswered}
                />
              </div>
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
              variant="square"
            />
          </div>
        </div>
      </main>

      {/* 피드백 캐릭터 */}
      <FeedbackCharacter
        visible={Boolean(isAnswered || selectedAnswer)}
        isCorrect={isAnswered && selectedAnswer === correctAnswer}
      />

      {/* 애니메이션 스타일 */}
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

export default Adventure2Page;
