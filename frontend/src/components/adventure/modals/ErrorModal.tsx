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
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4">
        {/* 제목 */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          ⚠️ 오류
        </h2>

        {/* 내용 */}
        <p className="text-lg text-gray-600 mb-8 text-center">
          {errorMessage}
        </p>

        {/* 버튼 */}
        <button
          onClick={onConfirm}
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          돌아가기
        </button>
      </div>
    </div>
  );
};
