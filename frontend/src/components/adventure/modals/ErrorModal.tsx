type ErrorModalProps = {
  isOpen: boolean;
  errorMessage: string;
  onConfirm: () => void;
};

/**
 * ErrorModal - 에러 메시지 표시 모달
 *
 * @description
 * - 에러 발생 시 오버레이 모달로 메시지 표시
 * - 배경 화면을 유지하면서 부드러운 알림 제공
 * - 프로젝트 전체 모달 패턴과 일관성 유지
 */
export const ErrorModal = ({
  isOpen,
  errorMessage,
  onConfirm,
}: ErrorModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      {/* 모달 안에서만 쓰는 스타일 */}
      <style>
        {`
          @keyframes parrot-fly {
            0%   { transform: translateX(-8px) translateY(0) rotate(-4deg); }
            50%  { transform: translateX(8px) translateY(-6px) rotate(4deg); }
            100% { transform: translateX(-8px) translateY(0) rotate(-4deg); }
          }
          .parrot-fly {
            animation: parrot-fly 1.8s ease-in-out infinite;
          }
        `}
      </style>

      <div className="relative bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4">
        {/* 앵무새 */}
        <img
          src="/adventurepage/flying_parrot.png"
          alt="에코 앵무새"
          className="absolute -top-23 left-1/2 -translate-x-1/2 w-40 h-40 parrot-fly"
        />

        {/* 제목 */}
        <h1 className="mt-4 text-2xl font-bold text-gray-800 mb-4 text-center">
          잠깐만요!
        </h1>

        {/* 내용 */}
        <p className="text-lg text-gray-600 mb-8 text-center leading-relaxed">
          에코가 진단을 바탕으로<br />
          오늘 문제를 만들고 있어요.
          <br />
          <br />
          조금 있다가 다시 시작해 주세요.
        </p>

        {/* 버튼 */}
        <button
          onClick={onConfirm}
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          알겠어요
        </button>
      </div>
    </div>
  );
};
