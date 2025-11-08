import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WeeklyTimeChartProps {
  data: {
    day: string;
    thisWeek: number;
    lastWeek: number;
  }[];
}

export default function WeeklyTimeChart({ data }: WeeklyTimeChartProps) {
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

      {/* Chart */}
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
    </div>
  );
}
