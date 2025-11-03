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

// Components (Adventure1Page에서 쓰던 것 재사용 가정)
import { TutorialOverlay } from '../components/TutorialOverlay';
import { TopActionsBar } from '../components/TopActionsBar';
import { TutorialBubble } from '../components/TutorialBubble';

// 아직 없는 컴포넌트들(말풍선 외 UI 버튼 등)은 나중에 분리 가능하지만,
// 우선 스피커 버튼 / 마이크 버튼을 이 페이지 안에서 임시로 만든다.

const Adventure4Page = () => {
  // ---- 더미 문제 데이터 (말하기/따라 말하기 유형) ----
  const problems: SpeakProblem[] = [
    {
      id: 1,
      word: '단 어',
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

  // 음성 helper (튜토리얼 음성 안내)
  const { playVoice, stopVoice } = useTutorialVoice();

  // ESC 누르면 튜토리얼 끄기 (Adventure1Page와 동일 패턴)
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

  // 상단 물음표 버튼 눌렀을 때(TopActionsBar에서 불릴 함수)
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
    // 여기선 실제 오디오 재생 로직은 아직 없음
    // 나중에 HTMLAudioElement나 custom hook 연결
    console.log('play audio:', currentProblem.audioUrl);
  };

  // 🎤 마이크 버튼 눌렀을 때: 녹음 시작 / 종료 토글
  const handleMicClick = () => {
    setIsRecording((prev) => !prev);
    // 나중에 실제 음성인식 hook 연결
  };

  return (
    <div
      className="flex flex-col h-screen relative"
      style={{
        // Adventure1Page와 비슷하게 background 설정
        backgroundImage: 'url(/adventurepage/adventure_4_background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        // 첫번째 스샷 배경은 정글 느낌이라 약간 초록/갈색 톤
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
        <section className="flex flex-col items-center mb-10 sm:mb-12 md:mb-14">
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
              relative
            "
            style={{
              minWidth: '220px',
              boxShadow: '0 8px 0 rgba(0,0,0,0.3)',
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
              }}
            >
              {currentProblem.word}
            </span>

            {/* 오른쪽 🔊 버튼 (스샷처럼 카드 오른쪽에 동그란 파란 버튼) */}
            <button
              onClick={handlePlayWordAudio}
              className="
                absolute
                right-[-3rem] sm:right-[-3.5rem] md:right-[-4rem]
                top-1/2 -translate-y-1/2
                w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20
                rounded-full
                bg-blue-400
                border-[3px] border-blue-700
                shadow-[0_6px_0_rgba(0,0,0,0.25)]
                flex items-center justify-center
                active:translate-y-[2px] active:shadow-[0_4px_0_rgba(0,0,0,0.25)]
              "
            >
              {/* 아이콘은 나중에 실제 SVG로 교체 가능 */}
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

          {/* 녹음 상태 텍스트 (선택) */}
          <div className="mt-3 text-white text-lg sm:text-xl font-semibold drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]">
            {isRecording ? '말하는 중...' : '눌러서 말해요'}
          </div>
        </section>
      </main>

      {/* 특수 효과나 캐릭터가 필요하면 여기서 추가할 수 있음
         Adventure1Page 에서는 FeedbackCharacter 같은 영역이 여기였어.
         Adventure4 는 스샷에서 그런 캐릭터는 안 보여서 일단 비워둔다.
      */}

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
      `}</style>
    </div>
  );
};

export default Adventure4Page;
