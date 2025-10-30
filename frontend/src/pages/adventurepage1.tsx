import { Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import AnswerFeedback from '../components/AnswerFeedback';
import { HelpCircle, DoorOpen } from 'lucide-react';

// 복합/단일 모음을 화면에 배치하기 위한 분해 유틸
function splitVowelForLayout(vowel: string) {
  // 복합 모음들은 top / bottom 두 파트로 쪼개서 보여줄 거야
  switch (vowel) {
    case 'ㅘ':
      return { type: 'complex', top: 'ㅏ', bottom: 'ㅗ' };
    case 'ㅝ':
      return { type: 'complex', top: 'ㅓ', bottom: 'ㅜ' };
    case 'ㅚ':
      return { type: 'complex', top: 'ㅣ', bottom: 'ㅗ' };
    case 'ㅟ':
      return { type: 'complex', top: 'ㅣ', bottom: 'ㅜ' };
    case 'ㅢ':
      return { type: 'complex', top: 'ㅣ', bottom: 'ㅡ' };
    default:
      // 단일/기본형 모음은 분해 필요 없음
      return { type: 'single', top: vowel, bottom: null };
  }
}

// 모음이 어떤 계열인지(가로/세로/복합) → 윗줄(초성+모음 윗부분) 배치 스타일 보정
function getVowelLayoutType(vowel: string) {
  const horizontal = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅣ', 'ㅔ', 'ㅐ'];
  const vertical = ['ㅗ', 'ㅛ', 'ㅜ', 'ㅠ']; // 아래로 내려가는 계열
  const complex = ['ㅘ', 'ㅝ', 'ㅚ', 'ㅟ', 'ㅢ']; // 우리가 분해해서 그릴 애들

  if (horizontal.includes(vowel)) return 'horizontal';
  if (vertical.includes(vowel)) return 'vertical';
  if (complex.includes(vowel)) return 'complex';
  return 'horizontal';
}

/**
 * layoutType별로 top(초성 + 모음 윗부분/단일모음)을 어떻게 배치할지
 * - margin/padding/gap을 최소화해서 tight하게 구성
 * - translate/scale은 최소한만 유지해서 겹침만 막음
 */
function getTopBlockClass(layoutType: string) {
  switch (layoutType) {
    case 'vertical':
      // 세로형 모음(ㅗ, ㅜ 등): 초성과 모음이 실제로는 상하로 배치되는 느낌이라
      // flex-col로 쌓되 gap을 최소화
      return `
        flex flex-col items-center justify-center
        m-0 p-0 gap-[0.05rem]
        -translate-y-[0.1rem] scale-[1.03]
      `;
    case 'complex':
      // 복합 모음(ㅘ 등): top 파트는 초성과 같은 줄에 두고,
      // 살짝만 올리고 살짝 키우기
      return `
        flex flex-row items-center justify-center
        m-0 p-0 gap-[0.05rem]
        -translate-y-[0.15rem] scale-[1.07]
      `;
    default:
      // horizontal 계열(ㅏ, ㅑ, ㅓ 등): 초성과 모음이 가로로 나란히
      return `
        flex flex-row items-center justify-center
        m-0 p-0 gap-[0.05rem]
        translate-y-0 scale-[1.0]
      `;
  }
}

// 받침 줄(final)을 감싸는 클래스
// 여기도 margin/padding 거의 제거
const bottomMostLineClass = `
  flex items-center justify-center
  m-0 p-0
  translate-y-0
`;

// 유틸: 현재 문제에서 "정답이어야 하는 글자"를 구한다
function getCorrectAnswerForProblem(p: ProblemData) {
  if (p.hiddenTarget === 'initial') return p.initial;
  if (p.hiddenTarget === 'medial') return p.medial;
  if (p.hiddenTarget === 'final') return p.final ?? '';
  return '';
}

// ---------- 더미 문제 데이터 타입 ----------
type ProblemData = {
  id: number;
  initial: string;        // 초성 (예: 'ㅇ')
  medial: string;         // 중성 (예: 'ㅘ' or 'ㅏ' or 'ㅜ' 등) - 백엔드에서 그대로 줌
  final?: string;         // 종성 받침 (예: 'ㅇ'), 없을 수도 있음
  hiddenTarget: 'initial' | 'medial' | 'final'; // 어떤 부분이 빈칸인지
  options: string[];      // 보기 (정답 포함)
};

// ------------------------------------------

const AdventurePage = () => {
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
  // 예: { type:'single', top:'ㅏ', bottom:null }
  //   또는 { type:'complex', top:'ㅏ', bottom:'ㅗ' }

  // 상태들
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);       // 정답 맞춘 뒤 상태
  const [isAnimating, setIsAnimating] = useState(false);     // 오답 애니메이션 중?
  const [isTutorialMode, setIsTutorialMode] = useState(false); // 튜토리얼 온/오프

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

  // 언마운트 시 음성 정리
  useEffect(() => {
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

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
      if (synthRef.current) synthRef.current.cancel();
      setIsSpeaking(false);
      setCurrentVoiceType(null);
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
      {isTutorialMode && <div className="absolute inset-0 bg-black/60 z-[1]" />}

      {/* 상단 아이콘 영역 */}
      <header className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-2 sm:gap-3 z-10">
        {/* 튜토리얼 버튼 */}
        <button
          className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          onClick={handleTutorialClick}
        >
          <HelpCircle className="text-gray-700" size={24} />
        </button>

        {/* 나가기 */}
        <Link
          to="/"
          className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <DoorOpen className="text-gray-700" size={24} />
        </Link>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pb-16 sm:pb-20 relative z-[2]">
        {/* 안내문 (위쪽) */}
        <div
          className="flex items-center justify-center mb-4 sm:mb-6"
          style={{ minHeight: '3rem' }}
        >
          {isTutorialMode && (
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 text-center bg-white/80 rounded-xl px-4 sm:px-6 py-2 border-2 border-gray-800 shadow-md whitespace-normal break-keep max-w-[90%]">
              회색 칸에 들어갈 글자를 골라보세요!
            </p>
          )}
        </div>

        {/* 문제 카드 */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <div className="w-[85vw] max-w-2xl h-40 sm:h-48 md:h-56 bg-white rounded-3xl shadow-2xl flex items-center justify-center border-4 sm:border-6 border-gray-800">
            {/* 음소 전체 묶음 */}
            <div
              className="
                flex flex-col items-center justify-center
                m-0 p-0 gap-0
                transition-all duration-300
              "
            >
              {/* 줄 1: 초성 + 모음 top/single */}
              <div className={`
                ${getTopBlockClass(vowelLayoutType)}
              `}>
                {/* 초성 */}
                <span
                  className={`
                    text-7xl sm:text-8xl md:text-9xl font-bold
                    ${getColorClassForPart('initial')}
                  `}
                >
                  {currentProblem.initial}
                </span>

                {/* 모음 윗부분 (혹은 단일 모음 전체) */}
                {vowelParts.top && (
                  <span
                    className={`
                      text-7xl sm:text-8xl md:text-9xl font-bold
                      ${getColorClassForPart('medialTop')}
                    `}
                  >
                    {vowelParts.top}
                  </span>
                )}
              </div>

              {/* 줄 2: 복합 모음의 아래 파트가 있을 때만 */}
              {vowelParts.bottom && (
                <div
                  className="
                    flex items-center justify-center
                    m-0 p-0 gap-0
                    translate-y-0
                  "
                >
                  <span
                    className={`
                      text-7xl sm:text-8xl md:text-9xl font-bold
                      ${getColorClassForPart('medialBottom')}
                    `}
                  >
                    {vowelParts.bottom}
                  </span>
                </div>
              )}

              {/* 줄 3: 받침(종성) 있을 때만 */}
              {currentProblem.final && (
                <div
                  className={`
                    ${bottomMostLineClass}
                  `}
                >
                  <span
                    className={`
                      text-7xl sm:text-8xl md:text-9xl font-bold
                      ${getColorClassForPart('final')}
                    `}
                  >
                    {currentProblem.final}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 안내문 (선택지 위) */}
        <div
          className="flex items-center justify-center mb-6 sm:mb-8 md:mb-10"
          style={{ minHeight: '2.5rem' }}
        >
          {isTutorialMode && (
            <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 text-center bg-white/80 rounded-lg px-4 sm:px-5 py-2 border-2 border-gray-800 shadow whitespace-normal break-keep max-w-[90%]">
              아래 카드 중에서 하나를 골라요!
            </p>
          )}
        </div>

        {/* 선택지 목록 */}
        <div className="flex gap-4 sm:gap-6 md:gap-8">
          {currentProblem.options.map((option, index) => {
            const thisIsCorrectNow =
              selectedAnswer === option && option === correctAnswer;
            const wasTriedAndWrong = wrongAnswers.includes(option);

            return (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                disabled={
                  isAnswered ||
                  wasTriedAndWrong ||
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
                    !wasTriedAndWrong &&
                    !isAnimating &&
                    !isTutorialMode
                      ? 'hover:scale-105 active:scale-95 cursor-pointer'
                      : 'cursor-default pointer-events-none'
                  }
                `}
              >
                {/* 보기 글자 */}
                <span
                  className={thisIsCorrectNow || wasTriedAndWrong ? 'opacity-20' : ''}
                >
                  {option}
                </span>

                {/* 정답 O / 오답 X 겹쳐서 표시 */}
                {thisIsCorrectNow && <AnswerFeedback isCorrect={true} />}
                {wasTriedAndWrong && <AnswerFeedback isCorrect={false} />}
              </button>
            );
          })}
        </div>
      </main>

      {/* 우측 하단 캐릭터 (피드백 캐릭터) */}
      {(isAnswered || selectedAnswer) && (
        <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-10 animate-bounce-in">
          <img
            src={
              isAnswered && selectedAnswer === correctAnswer
                ? '/adventurepage/happy_eco.png'
                : '/adventurepage/question_eco.png'
            }
            alt={
              isAnswered && selectedAnswer === correctAnswer
                ? '정답 캐릭터'
                : '오답 캐릭터'
            }
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
