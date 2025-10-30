import { Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import AnswerFeedback from '../components/AnswerFeedback';
import { HelpCircle, DoorOpen } from 'lucide-react';

const AdventurePage = () => {
  // --------예시 문제(하드코딩)--------
  const [visiblePart] = useState('ㄱ');
  const [hiddenPart] = useState('ㅏ');
  const options = ['ㄴ', 'ㅏ', 'ㅡ'];
  // ---------------------------------
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTutorialMode, setIsTutorialMode] = useState(false);

  // 음성 관련 상태
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentVoiceType, setCurrentVoiceType] = useState<string | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // speechSynthesis 초기화
  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // 음성 재생 (튜토리얼 전용)
  const playVoice = useCallback((type: string, text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    setTimeout(() => {
      if (!synthRef.current) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.95;

      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentVoiceType(null);
      };

      setIsSpeaking(true);
      setCurrentVoiceType(type);
      synthRef.current.speak(utterance);
    }, 100);
  }, []);

  // ESC 키로 튜토리얼 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTutorialMode) {
        setIsTutorialMode(false);
        if (synthRef.current) synthRef.current.cancel();
        setIsSpeaking(false);
        setCurrentVoiceType(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTutorialMode]);

  // 언마운트 시 음성 중단
  useEffect(() => {
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const handleOptionClick = (option: string) => {
    if (isAnswered || wrongAnswers.includes(option) || isAnimating || isTutorialMode) return;
    setSelectedAnswer(option);

    if (option === hiddenPart) {
      setIsAnswered(true);
    } else {
      setIsAnimating(true);
      setWrongAnswers(prev => [...prev, option]);
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsAnimating(false);
      }, 1000);
    }
  };

  const isCorrect = (option: string) => selectedAnswer === option && option === hiddenPart;
  const isQuestionCorrect = selectedAnswer === hiddenPart && isAnswered;

  const handleTutorialClick = () => {
    const goingToTutorial = !isTutorialMode;
    setIsTutorialMode(goingToTutorial);

    if (goingToTutorial) {
      playVoice(
        'tutorial',
        '회색 칸에 들어갈 글자를 골라보세요! 아래 카드 중에서 하나를 골라요!'
      );
    } else {
      if (synthRef.current) synthRef.current.cancel();
      setIsSpeaking(false);
      setCurrentVoiceType(null);
    }
  };

  return (
    <div
      className="flex flex-col h-screen relative"
      style={{
        backgroundImage: 'url(/adventurepage/adventure_1_background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#D4B896'
      }}
    >
      {/* 어두운 배경 오버레이 - 튜토리얼 모드 */}
      {isTutorialMode && (
        <div className="absolute inset-0 bg-black/60 z-[1]" />
      )}

      {/* 상단 아이콘 */}
      <header className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-2 sm:gap-3 z-10">
        <button
          className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          onClick={handleTutorialClick}
        >
          <HelpCircle className="text-gray-700" size={24} />
        </button>

        <Link
          to="/"
          className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <DoorOpen className="text-gray-700" size={24} />
        </Link>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pb-16 sm:pb-20 relative z-[2]">

        {/* 상단 안내 영역 (항상 자리 차지 / flex 중앙 정렬) */}
        <div
          className="flex items-center justify-center mb-4 sm:mb-6"
          style={{ minHeight: '3rem' /* 약 48px 고정 공간 */ }}
        >
          {isTutorialMode && (
            <p
              className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800
                         text-center bg-white/80 rounded-xl px-4 sm:px-6 py-2
                         border-2 border-gray-800 shadow-md
                         whitespace-normal break-keep max-w-[90%]"
            >
              회색 칸에 들어갈 글자를 골라보세요!
            </p>
          )}
        </div>

        {/* 문제 카드 */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <div className="w-[85vw] max-w-2xl h-40 sm:h-48 md:h-56 bg-white rounded-3xl shadow-2xl flex items-center justify-center border-4 sm:border-6 border-gray-800">
            <div className="flex items-center gap-0">
              <div className="text-7xl sm:text-8xl md:text-9xl font-bold text-gray-800">
                {visiblePart}
              </div>
              <div
                className={`text-7xl sm:text-8xl md:text-9xl font-bold -ml-2 sm:-ml-3 transition-colors duration-300 ${
                  isQuestionCorrect ? 'text-gray-800' : 'text-gray-300'
                }`}
              >
                {hiddenPart}
              </div>
            </div>
          </div>
        </div>

        {/* 하단 안내 영역 (항상 자리 차지 / flex 중앙 정렬) */}
        <div
          className="flex items-center justify-center mb-6 sm:mb-8 md:mb-10"
          style={{ minHeight: '2.5rem' /* 약 40px 고정 공간 */ }}
        >
          {isTutorialMode && (
            <p
              className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800
                         text-center bg-white/80 rounded-lg px-4 sm:px-5 py-2
                         border-2 border-gray-800 shadow
                         whitespace-normal break-keep max-w-[90%]"
            >
              아래 카드 중에서 하나를 골라요!
            </p>
          )}
        </div>

        {/* 선택지 */}
        <div className="flex gap-4 sm:gap-6 md:gap-8">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option)}
              disabled={
                isAnswered ||
                wrongAnswers.includes(option) ||
                isAnimating ||
                isTutorialMode
              }
              className={`
                w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40
                bg-white rounded-2xl md:rounded-3xl shadow-xl
                border-4 sm:border-5 border-gray-800
                flex items-center justify-center
                text-5xl sm:text-6xl md:text-7xl font-bold text-gray-800
                transition-all duration-200 relative
                ${
                  !isAnswered &&
                  !wrongAnswers.includes(option) &&
                  !isAnimating &&
                  !isTutorialMode
                    ? 'hover:scale-105 active:scale-95 cursor-pointer'
                    : 'cursor-default pointer-events-none'
                }
              `}
            >
              <span
                className={
                  isCorrect(option) || wrongAnswers.includes(option)
                    ? 'opacity-20'
                    : ''
                }
              >
                {option}
              </span>
              {isCorrect(option) && <AnswerFeedback isCorrect={true} />}
              {wrongAnswers.includes(option) && (
                <AnswerFeedback isCorrect={false} />
              )}
            </button>
          ))}
        </div>
      </main>

      {/* 캐릭터 이미지 */}
      {(isAnswered || selectedAnswer) && (
        <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-10 animate-bounce-in">
          <img
            src={
              isQuestionCorrect
                ? '/adventurepage/happy_eco.png'
                : '/adventurepage/question_eco.png'
            }
            alt={isQuestionCorrect ? '정답 캐릭터' : '오답 캐릭터'}
            className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 object-contain"
          />
        </div>
      )}

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

export default AdventurePage;