import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface WeeklyTimeChartProps {
  data: {
    day: string;
    thisWeek: number;
    lastWeek: number;
  }[];
  error?: string | null;
  onRetry?: () => void;
}

export default function WeeklyTimeChart({ data, error, onRetry }: WeeklyTimeChartProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-neutral-800 font-pretendard">
            주간 학습 분석
          </h3>
          <p className="text-sm text-neutral-500 font-pretendard mt-1">
            이번 주 vs 저번 주 학습 시간 비교
          </p>
        </div>
      </div>

      {/* Error State */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-12 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle size={48} className="text-red-400 mb-4" />
          <p className="text-red-700 font-semibold font-pretendard mb-2">
            데이터를 불러올 수 없습니다
          </p>
          <p className="text-sm text-red-600 font-pretendard mb-4">
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold font-pretendard hover:bg-red-700 transition-colors"
            >
              <RefreshCw size={16} />
              다시 시도
            </button>
          )}
        </div>
      ) : (
        /* Chart */
        <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="day"
            tick={{ fill: '#6B7280', fontFamily: 'Pretendard' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontFamily: 'Pretendard' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            label={{
              value: '학습 시간 (분)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#6B7280', fontFamily: 'Pretendard', fontSize: 12 },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontFamily: 'Pretendard',
            }}
            labelStyle={{ color: '#1F2937', fontWeight: 600 }}
            formatter={(value: number) => [`${value}분`, '']}
          />
          <Legend
            wrapperStyle={{ fontFamily: 'Pretendard' }}
            iconType="circle"
          />
          <Bar
            dataKey="lastWeek"
            name="저번 주"
            fill="#9CA3AF"
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="thisWeek"
            name="이번 주"
            fill="#3B82F6"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      )}
    </div>
  );
}
