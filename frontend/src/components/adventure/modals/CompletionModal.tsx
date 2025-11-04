type CompletionModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
};

export const CompletionModal = ({
  isOpen,
  onConfirm,
}: CompletionModalProps) => {
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
          모든 문제를 완료했습니다!
        </p>

        {/* 버튼 */}
        <button
          onClick={onConfirm}
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  );
};
