// 탐험4 문제용 마이크 버튼 컴포넌트
// 녹음 버튼 + 상태 텍스트

type MicrophoneButtonProps = {
  isRecording: boolean;   // 녹음 중 여부 (pulse 애니메이션)
  isAnalyzing: boolean;   // 백엔드 분석 중 여부
  onClick: () => void;    // 버튼 클릭 핸들러 (녹음 시작/종료)
  isTutorialMode?: boolean; // 튜토리얼 모드 여부
};

export const MicrophoneButton = ({
  isRecording,
  isAnalyzing,
  onClick,
  isTutorialMode = false,
}: MicrophoneButtonProps) => {
  // 상태에 따른 텍스트 결정
  const getStatusText = () => {
    if (isAnalyzing) return '분석 중...';
    if (isRecording) return '녹음 중...';
    return '눌러서 말해요';
  };

  return (
    <>
      <section className="flex flex-col items-center">
        {/* 마이크 버튼 */}
        <button
          onClick={onClick}
          disabled={isTutorialMode}
          className={`
            rounded-full
            bg-gradient-to-b from-[#FFE29A] to-[#FF9F2E]
            border-[4px] border-[#C4601B]
            shadow-[0_8px_0_rgba(0,0,0,0.3)]
            flex items-center justify-center
            active:translate-y-[2px]
            active:shadow-[0_6px_0_rgba(0,0,0,0.3)]
            transition-all duration-200
            ${!isTutorialMode ? 'hover:scale-105 cursor-pointer' : 'cursor-default pointer-events-none'}
          `}
          style={{
            width: 'min(16vw, 110px)',
            height: 'min(16vw, 110px)',
          }}
          aria-label={isRecording ? '녹음 중지' : '녹음 시작'}
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
          {getStatusText()}
        </div>
      </section>

      {/* 컴포넌트 전용 애니메이션 */}
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
    </>
  );
};
