import { useState } from 'react';
import { AlertTriangle, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface JamoData {
  jamo: string;
  accuracy: number;
  count: number;
  type?: string;
}

interface WeaknessAlertProps {
  allJamoData: JamoData[];
}

export default function WeaknessAlert({ allJamoData }: WeaknessAlertProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 정확도 낮은 순으로 정렬
  const sortedData = [...allJamoData].sort((a, b) => a.accuracy - b.accuracy);

  // 80% 미만만 필터링
  const weaknesses = sortedData.filter((j) => j.accuracy < 80);
  const topWeaknesses = weaknesses.slice(0, 5);

  // 성공 상태 (모든 자모 80% 이상)
  if (weaknesses.length === 0) {
    return (
      <div className="bg-success/5 rounded-xl p-6 border border-success/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center">
            <TrendingDown size={24} className="text-success rotate-180" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-success font-pretendard">
              모든 자모를 잘 학습하고 있어요!
            </h3>
            <p className="text-sm text-success/80 font-pretendard mt-1">
              이대로 계속 열심히 해봐요 🎉
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-warning/5 rounded-xl p-6 border border-warning/20">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={24} className="text-warning" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-neutral-800 font-pretendard">
            부족한 자모가 있어요
          </h3>
          <p className="text-sm text-neutral-600 font-pretendard mt-1">
            아래 자모에 대한 집중 학습이 필요합니다
          </p>
        </div>

        {/* Detail Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors font-pretendard"
        >
          {isExpanded ? (
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

      {/* Top 5 Weakness Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {topWeaknesses.map((weakness, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-3 border border-neutral-200 hover:border-warning transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-800 font-pretendard mb-1">
                {weakness.jamo}
              </div>
              <div className="text-xs text-neutral-500 font-pretendard mb-2">
                {weakness.type || '자모'}
              </div>
              <div className="text-sm font-semibold text-error font-pretendard">
                {weakness.accuracy}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Chart View */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-warning/20">
          <h4 className="text-md font-bold text-neutral-800 font-pretendard mb-4">
            📊 전체 자모별 정확도
          </h4>

          <ResponsiveContainer width="100%" height={Math.max(sortedData.length * 30, 300)}>
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: '#6B7280', fontFamily: 'Pretendard', fontSize: 12 }}
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
                tick={{ fill: '#1F2937', fontFamily: 'Pretendard', fontWeight: 600, fontSize: 14 }}
                tickLine={false}
                axisLine={false}
                width={50}
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
                radius={[0, 8, 8, 0]}
                background={{ fill: '#F3F4F6', radius: [0, 8, 8, 0] }}
              >
                {sortedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.accuracy < 80 ? '#EF4444' : '#3B82F6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <p className="text-xs text-neutral-500 text-center mt-4 font-pretendard">
            전체 {sortedData.length}개 자모 • 빨간색: 80% 미만 (집중 학습 필요)
          </p>
        </div>
      )}
    </div>
  );
}
