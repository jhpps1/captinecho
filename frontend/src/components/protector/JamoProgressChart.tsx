import { useState } from 'react';
import type { JamoStat } from '../../mocks/protectorData';

interface JamoProgressChartProps {
  jamoStats: JamoStat[];
}

type SortType = 'default' | 'high' | 'low';

export default function JamoProgressChart({ jamoStats }: JamoProgressChartProps) {
  const [sortType, setSortType] = useState<SortType>('default');

  const getSortedJamos = () => {
    const sorted = [...jamoStats];
    switch (sortType) {
      case 'high':
        return sorted.sort((a, b) => b.progress - a.progress);
      case 'low':
        return sorted.sort((a, b) => a.progress - b.progress);
      default:
        return sorted;
    }
  };

  const sortedJamos = getSortedJamos();

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">지난주 학습 분석</h3>

        {/* 필터 탭 */}
        <div className="flex gap-2">
          <button
            onClick={() => setSortType('default')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              sortType === 'default'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ㄱ,ㄴ,ㅅ
          </button>
          <button
            onClick={() => setSortType('high')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              sortType === 'high'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            정확도 높은 순
          </button>
          <button
            onClick={() => setSortType('low')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              sortType === 'low'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            정확도 낮은 순
          </button>
        </div>
      </div>

      {/* 학습 정보 분석 */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-4">학습 정보 분석</h4>

        {/* 자모 진행률 리스트 */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {sortedJamos.map((jamo, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{jamo.jamo}</span>
                <span className="text-sm font-bold text-gray-800">{jamo.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${jamo.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
