interface AIAgentSectionProps {
  curriculum?: string;
  discussion?: string;
  isLoading?: boolean;
  onLogClick?: () => void;
}

export default function AIAgentSection({
  curriculum = '',
  discussion = '',
  isLoading = false,
  onLogClick
}: AIAgentSectionProps) {
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
        <div className="bg-yellow-100 rounded-xl p-6 min-h-[150px] flex items-center">
          {isLoading ? (
            <div className="w-full text-center text-gray-500">
              로딩 중...
            </div>
          ) : (
            <div className="w-full">
              <h4 className="text-sm font-bold text-gray-700 mb-2">금주 커리큘럼</h4>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {curriculum || '커리큘럼 데이터가 없습니다.'}
              </p>
            </div>
          )}
        </div>

        {/* 부모 의사 협의 로그 카드 */}
        <div className="bg-yellow-100 rounded-xl p-6 min-h-[150px] flex items-center">
          {isLoading ? (
            <div className="w-full text-center text-gray-500">
              로딩 중...
            </div>
          ) : (
            <div className="w-full">
              <h4 className="text-sm font-bold text-gray-700 mb-2">협의 로그</h4>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {discussion || '협의 로그가 없습니다.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
