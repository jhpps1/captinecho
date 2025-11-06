import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface WeeklyComparisonChartProps {
  lastWeek: number[];
  thisWeek: number[];
  days: string[];
}

export default function WeeklyComparisonChart({ lastWeek, thisWeek, days }: WeeklyComparisonChartProps) {
  // Recharts 데이터 형식으로 변환
  const chartData = days.map((day, index) => ({
    day,
    지난주: lastWeek[index],
    이번주: thisWeek[index]
  }));

  // 총 학습 시간 계산
  const lastWeekTotal = lastWeek.reduce((sum, val) => sum + val, 0);
  const thisWeekTotal = thisWeek.reduce((sum, val) => sum + val, 0);
  const difference = thisWeekTotal - lastWeekTotal;
  const percentChange = lastWeekTotal > 0 ? Math.round((difference / lastWeekTotal) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">주간 학습 시간 비교</h3>
        {/* 변화량 표시 */}
        <div className="text-right">
          <div className="text-sm text-gray-600">이번주 총 학습 시간</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-purple-600">{thisWeekTotal}분</span>
            {difference !== 0 && (
              <span className={`text-sm font-semibold ${difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {difference > 0 ? '+' : ''}{difference}분 ({percentChange > 0 ? '+' : ''}{percentChange}%)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Recharts 막대 그래프 */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="day"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            label={{ value: '학습 시간 (분)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
            labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
            formatter={(value: number) => [`${value}분`, '']}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
          />
          <Bar
            dataKey="지난주"
            fill="#f472b6"
            radius={[8, 8, 0, 0]}
            animationDuration={800}
          />
          <Bar
            dataKey="이번주"
            fill="#a855f7"
            radius={[8, 8, 0, 0]}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
