type SuppleCompletionModalProps = {
  isOpen: boolean;
  onRetry: () => void;
  onGoHome: () => void;
};

/**
 * SuppleCompletionModal - 추가학습 완료 모달
 *
 * @description
 * - 추가학습 10문제 완료 시 표시
 * - 다시 풀기 또는 대시보드 복귀 선택 가능
 * - 마지막 문제 화면 위에 오버레이로 표시
 */
export const SuppleCompletionModal = ({
  isOpen,
  onRetry,
  onGoHome,
}: SuppleCompletionModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4">
        {/* 제목 */}
        <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          🎉 축하합니다!
        </h2>

        {/* 내용 */}
        <p className="text-lg text-gray-600 mb-8 text-center">
          추가학습 10문제를 모두 풀었어요!
        </p>

        {/* 버튼 2개 */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onRetry}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            다시 10문제 풀기
          </button>
          <button
            onClick={onGoHome}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            학생 대시보드로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};
