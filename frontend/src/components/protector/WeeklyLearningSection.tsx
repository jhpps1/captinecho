import type { JamoStat } from '../../mocks/protectorData';

interface WeeklyLearningSectionProps {
  averageAccuracy: number;
  difficultJamos: JamoStat[];
  onDetailClick?: () => void;
}

export default function WeeklyLearningSection({
  averageAccuracy,
  difficultJamos,
  onDetailClick
}: WeeklyLearningSectionProps) {
  // 어려워한 자모 (정확도 낮은 순)
  const sortedDifficultJamos = [...difficultJamos]
    .sort((a, b) => a.progress - b.progress)
    .slice(0, 5);

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">지난주 학습 분석</h3>
        <button
          onClick={onDetailClick}
          className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg
                   hover:bg-gray-50 transition-colors font-semibold text-gray-700"
        >
          상세 보기
        </button>
      </div>

      {/* 학습 정보 분석 */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">학습 정보 분석</h4>

        {/* 평균 정확도 */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">평균 정확도</span>
            <span className="text-sm font-bold text-gray-800">{averageAccuracy}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${averageAccuracy}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 어려워한 내용 */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          우리 아이가 어떤 어려워했어요!
        </h4>
        <p className="text-xs text-green-600 mb-3">
          오답 답변 콘텐츠 - 자음, 모음 같은 문의
        </p>
      </div>

      {/* 어려워한 자모 리스트 */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
        <div className="flex flex-wrap gap-2">
          {sortedDifficultJamos.map((jamo, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium text-gray-700"
            >
              {jamo.jamo}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
