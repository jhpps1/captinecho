import { useState, useEffect } from 'react';

// TODO: 실제 타입/데이터 구조는 이후에 연결
// 여기선 화면에 표시할 "단어"만 있다고 가정
interface SpeakProblem {
  id: number;
  word: string; // 예: "단 어"
  audioUrl: string;
}

// Hooks
import { useTutorialVoice } from '../hooks/useTutorialVoice';

// Components
import { TutorialOverlay } from '../components/TutorialOverlay';
import { TopActionsBar } from '../components/TopActionsBar';
import { TutorialBubble } from '../components/TutorialBubble';
import { FeedbackCharacter } from '../components/FeedbackCharacter';

const Adventure4Page = () => {
  // ---- 더미 문제 데이터 (말하기/따라 말하기 유형) ----
  const problems: SpeakProblem[] = [
    {
      id: 1,
      word: '테스트',
      audioUrl: '/audio/sample1.mp3',
    },
    {
      id: 2,
      word: '가 방',
      audioUrl: '/audio/sample2.mp3',
    },
  ];

  // 현재 문제 인덱스
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentProblem = problems[currentIndex];

  // 튜토리얼 상태
  const [isTutorialMode, setIsTutorialMode] = useState(false);

  // 녹음 중인지 상태 (마이크 버튼 UI용)
  const [isRecording, setIsRecording] = useState(false);

  // 시도 횟수 관리
  const [attemptCount, setAttemptCount] = useState(0);

  // 스피커 버튼 표시 여부 (3회 시도 후 힌트)
  const [showSpeakerButton, setShowSpeakerButton] = useState(false);

  // 백엔드 분석 중 상태
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 발음 유사도 OK → 카드에 웨이브 이펙트
  // (아직은 가짜 상태: 정답이라고 판단되면 true로 set)
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 피드백 표시 상태
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

  // 음성 helper (튜토리얼 음성 안내)
  const { playVoice, stopVoice } = useTutorialVoice();

  // ESC 누르면 튜토리얼 끄기
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

  // 상단 물음표 버튼 눌렀을 때
  const handleTutorialClick = () => {
    const goingToTutorial = !isTutorialMode;
    setIsTutorialMode(goingToTutorial);

    if (goingToTutorial) {
      playVoice(
        'tutorial',
        '이 단어를 들어보고 똑같이 말해보세요!'
      );
    } else {
      stopVoice();
    }
  };

  // 🔊 스피커 버튼 눌렀을 때: 단어 음성 재생
  const handlePlayWordAudio = () => {
    console.log('play audio:', currentProblem.audioUrl);
  };

  // 🎤 마이크 버튼 눌렀을 때: 녹음 시작 / 종료 토글
  const handleMicClick = () => {
    setIsRecording((prev) => !prev);
    // 실제로는 여기서 녹음 시작/종료를 트리거하고
    // 녹음이 끝나면 isAnalyzing -> 백엔드 -> 유사도 결과 -> isSpeaking=true 같은 흐름
  };

  return (
    <div
      className="flex flex-col h-screen relative"
      style={{
        backgroundImage: 'url(/adventurepage/adventure_4_background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#4A5A2A',
      }}
    >
      {/* 화면 어둡게 하는 오버레이 (튜토리얼 모드일 때) */}
      <TutorialOverlay active={isTutorialMode} />

      {/* 상단 아이콘 바 (물음표 / 나가기) */}
      <TopActionsBar onTutorialClick={handleTutorialClick} />

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pb-16 sm:pb-20 relative z-[2]">
        {/* 튜토리얼 말풍선 (상단 가이드) */}
        <div
          className="flex items-center justify-center mb-4 sm:mb-6"
          style={{ minHeight: '3rem' }}
        >
          {isTutorialMode && (
            <TutorialBubble
              text="이 단어를 들어보고 따라 말해요!"
              className="max-w-[90%] text-center"
            />
          )}
        </div>

        {/* 중앙 단어 카드 + 스피커 버튼 영역 */}
        <section className="flex items-center justify-center mb-10 sm:mb-12 md:mb-14 relative">
          {/* 이 컨테이너에 wave-effect를 조건부로 붙여준다 */}
          <div
            className={`relative flex items-center justify-center ${
              isSpeaking ? 'wave-effect' : ''
            }`}
          >
            {/* 단어 카드 */}
            <div
              className="
                flex items-center justify-center
                bg-[#FDF6E3]
                border-[4px] sm:border-[5px] md:border-[6px]
                border-[#B87344]
                rounded-xl sm:rounded-2xl
                shadow-[0_8px_0_rgba(0,0,0,0.3)]
                px-6 sm:px-10 md:px-12
                py-4 sm:py-6 md:py-8
              "
              style={{
                minWidth: '220px',
                boxShadow: '0 8px 0 rgba(0,0,0,0.3)',
                position: 'relative',
                zIndex: 4,
              }}
            >
              {/* 실제 단어 (큰 글자) */}
              <span
                className="text-black font-bold leading-none"
                style={{
                  fontSize: 'clamp(2rem, 2vw + 1.5rem, 4rem)',
                  lineHeight: 1.1,
                  whiteSpace: 'pre-wrap',
                  textAlign: 'center',
                  letterSpacing: '0.15em',
                }}
              >
                {currentProblem.word}
              </span>
            </div>

            {/* 오른쪽 🔊 버튼 (3회 시도 후 힌트) */}
            {showSpeakerButton && (
              <button
                onClick={handlePlayWordAudio}
                className="
                  absolute
                  left-[calc(100%+1rem)]
                  w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20
                  rounded-full
                  bg-blue-400
                  border-[3px] border-blue-700
                  shadow-[0_8px_0_rgba(0,0,0,0.3)]
                  flex items-center justify-center
                  active:translate-y-[2px] active:shadow-[0_6px_0_rgba(0,0,0,0.3)]
                  transition-all duration-200
                  hover:brightness-110
                "
                style={{ zIndex: 3 }}
              >
                <span
                  className="text-white font-bold"
                  style={{
                    fontSize: 'clamp(1.25rem, 1vw + 1rem, 2rem)',
                    lineHeight: 1,
                  }}
                >
                  🔊
                </span>
              </button>
            )}
          </div>
        </section>

        {/* 하단 마이크 버튼 */}
        <section className="flex flex-col items-center">
          <button
            onClick={handleMicClick}
            className="
              w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28
              rounded-full
              bg-gradient-to-b from-[#FFE29A] to-[#FF9F2E]
              border-[4px] border-[#C4601B]
              shadow-[0_8px_0_rgba(0,0,0,0.3)]
              flex items-center justify-center
              active:translate-y-[2px] active:shadow-[0_6px_0_rgba(0,0,0,0.3)]
            "
          >
            <span
              className={`
                font-bold text-white
                ${isRecording ? 'animate-pulse' : ''}
              `}
              style={{
                fontSize: 'clamp(2rem, 1vw + 1.5rem, 3rem)',
                lineHeight: 1,
              }}
            >
              🎙
            </span>
          </button>

          {/* 녹음 상태 텍스트 */}
          <div className="mt-3 text-white text-lg sm:text-xl font-semibold drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]">
            {isAnalyzing
              ? '분석 중...'
              : isRecording
              ? '녹음 중...'
              : '눌러서 말해요'}
          </div>
        </section>
      </main>

      {/* 우측 하단 캐릭터 (피드백 캐릭터) */}
      <FeedbackCharacter
        visible={showFeedback}
        isCorrect={isCorrectAnswer}
      />

      {/* 개발 테스트용 버튼 - 나중에 제거 */}
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 z-10">
        <button
          onClick={() => {
            // 정답 케이스: 캐릭터 O, 웨이브도 보여주기
            setShowFeedback(true);
            setIsCorrectAnswer(true);
            setIsSpeaking(true); // 웨이브 on
            setTimeout(() => {
              setShowFeedback(false);
            }, 2000);
            setTimeout(() => {
              setIsSpeaking(false); // 웨이브 자동 종료
            }, 2000);
          }}
          className="px-4 py-2 bg-green-500 text-white rounded text-sm font-semibold shadow-lg hover:bg-green-600"
        >
          ✅ 정답(웨이브)
        </button>

        <button
          onClick={() => {
            // 오답 케이스: 캐릭터 X
            setShowFeedback(true);
            setIsCorrectAnswer(false);
            setAttemptCount(prev => prev + 1);
            if (attemptCount >= 2) setShowSpeakerButton(true);
            setTimeout(() => setShowFeedback(false), 2000);
          }}
          className="px-4 py-2 bg-red-500 text-white rounded text-sm font-semibold shadow-lg hover:bg-red-600"
        >
          ❌ 오답
        </button>

        <button
          onClick={() => setShowSpeakerButton(prev => !prev)}
          className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-semibold shadow-lg hover:bg-blue-600"
        >
          🔊 스피커 토글
        </button>

        <button
          onClick={() => {
            // 수동으로 웨이브만 테스트
            setIsSpeaking((prev) => !prev);
          }}
          className="px-4 py-2 bg-orange-500 text-white rounded text-sm font-semibold shadow-lg hover:bg-orange-600"
        >
          🌊 웨이브 토글
        </button>
      </div>

      {/* 페이지 전용 스타일 (ex: 애니메이션) */}
      <style>{`
        @keyframes pulse {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        .animate-pulse {
          animation: pulse 0.8s ease-in-out infinite;
        }

        /* ====== 웨이브 효과 영역 ====== */
        .wave-effect::before,
        .wave-effect::after {
          content: '';
          position: absolute;
          border: 4px solid rgba(255, 140, 0, 1); /* 주황빛 라인 */
          border-radius: 50%;
          top: 50%;
          left: 50%;
          width: 200px;
          height: 200px;
          transform: translate(-50%, -50%) scale(0.8);
          opacity: 0.3;
          z-index: 3;
          pointer-events: none; /* 클릭 방해 안 하도록 */
        }

        .wave-effect::before {
          animation: wave-burst 1.5s ease-out infinite;
        }

        .wave-effect::after {
          animation: wave-burst 1.5s ease-out infinite 0.5s;
        }

        @keyframes wave-burst {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.6);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Adventure4Page;
