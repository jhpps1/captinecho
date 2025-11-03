interface AIAgentSectionProps {
  onLogClick?: () => void;
}

export default function AIAgentSection({ onLogClick }: AIAgentSectionProps) {
  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">AI Agent</h3>
        <button
          onClick={onLogClick}
          className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg
                   hover:bg-gray-50 transition-colors font-semibold text-gray-700"
        >
          로그 확인
        </button>
      </div>

      <div className="space-y-4">
        {/* 커리큘럼 설명 카드 */}
        <div className="bg-yellow-100 rounded-xl p-6 min-h-[150px] flex items-center justify-center">
          <p className="text-lg font-semibold text-gray-800 text-center">
            커리큘럼 설명하는 것
          </p>
        </div>

        {/* 부모 의사 선택 카드 */}
        <div className="bg-yellow-100 rounded-xl p-6 min-h-[150px] flex items-center justify-center">
          <p className="text-lg font-semibold text-gray-800 text-center">
            부모 의사 선택하는 것
          </p>
        </div>
      </div>
    </div>
  );
}
