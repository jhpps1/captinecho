// 말하기 문제용 단어 카드 컴포넌트
// 단어 표시 + 스피커 버튼(힌트) + 웨이브 효과

type WordCardProps = {
  word: string;              // 표시할 단어 (예: "테스트", "가 방")
  showSpeaker: boolean;      // 스피커 버튼 표시 여부 (3회 시도 후 힌트)
  onSpeakerClick: () => void; // 스피커 버튼 클릭 핸들러
  isSpeaking: boolean;       // 웨이브 효과 활성화 여부 (발음 유사도 OK일 때)
};

export const WordCard = ({
  word,
  showSpeaker,
  onSpeakerClick,
  isSpeaking,
}: WordCardProps) => {
  return (
    <>
      <div
        className={`relative flex items-center justify-center ${
          isSpeaking ? 'wave-effect' : ''
        }`}
      >
        {/* 단어 카드 본체 */}
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
            width: 'clamp(280px, 70%, 700px)',
            boxShadow: '0 8px 0 rgba(0,0,0,0.3)',
            position: 'relative',
            zIndex: 4,
          }}
        >
          {/* 단어 텍스트 */}
          <span
            className="text-black font-bold leading-none"
            style={{
              fontSize: 'clamp(2rem, 3vw + 1rem, 5rem)',
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
              textAlign: 'center',
              letterSpacing: '0.15em',
            }}
          >
            {word}
          </span>
        </div>

        {/* 스피커 버튼 (3회 시도 후 힌트로 표시) */}
        {showSpeaker && (
          <button
            onClick={onSpeakerClick}
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

      {/* 컴포넌트 전용 애니메이션 - 웨이브 효과 */}
      <style>{`
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
    </>
  );
};
