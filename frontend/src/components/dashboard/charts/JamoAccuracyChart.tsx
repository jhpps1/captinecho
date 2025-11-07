import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface JamoData {
  jamo: string;
  accuracy: number;
  count: number;
}

interface JamoAccuracyChartProps {
  data: JamoData[];
}

export default function JamoAccuracyChart({ data }: JamoAccuracyChartProps) {
  const [showAll, setShowAll] = useState(false);

  // 정확도 낮은 순으로 정렬 후, showAll에 따라 표시 개수 제한
  const sortedData = [...data].sort((a, b) => a.accuracy - b.accuracy);
  const displayData = showAll ? sortedData : sortedData.slice(0, 5);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-neutral-800 font-pretendard">
            자모별 정확도
          </h3>
          <p className="text-sm text-neutral-500 font-pretendard mt-1">
            각 자모별 학습 정확도 분석
          </p>
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors font-pretendard"
        >
          {showAll ? (
            <>
              간략히 보기 <ChevronUp size={16} />
            </>
          ) : (
            <>
              자세히 보기 <ChevronDown size={16} />
            </>
          )}
        </button>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={showAll ? 400 : 250}>
        <BarChart
          data={displayData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: '#6B7280', fontFamily: 'Pretendard' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            label={{
              value: '정확도 (%)',
              position: 'insideBottom',
              offset: -5,
              style: { fill: '#6B7280', fontFamily: 'Pretendard', fontSize: 12 },
            }}
          />
          <YAxis
            type="category"
            dataKey="jamo"
            tick={{ fill: '#1F2937', fontFamily: 'Pretendard', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontFamily: 'Pretendard',
            }}
            formatter={(value: number, name: string, props: any) => [
              `${value}% (${props.payload.count}회 학습)`,
              '정확도',
            ]}
            labelStyle={{ color: '#1F2937', fontWeight: 600 }}
          />
          <Bar
            dataKey="accuracy"
            fill="#3B82F6"
            radius={[0, 8, 8, 0]}
            background={{ fill: '#F3F4F6', radius: [0, 8, 8, 0] }}
          >
            {displayData.map((entry, index) => (
              <Bar
                key={`bar-${index}`}
                fill={entry.accuracy < 80 ? '#EF4444' : '#3B82F6'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary */}
      {!showAll && sortedData.length > 5 && (
        <p className="text-xs text-neutral-500 text-center mt-4 font-pretendard">
          전체 {sortedData.length}개 중 하위 5개 표시 중
        </p>
      )}
    </div>
  );
}
