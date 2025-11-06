import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// 컴포넌트 Props 타입 정의 (React.FC 미사용)
type ScoreDonutChartProps = {
  title: string;
  score: number;
  maxScore: number;
};

// 차트 색상 (파란색: 획득 점수, 회색: 남은 점수)
const COLORS = ['#3B82F6', '#E5E7EB']; // (Tailwind blue-500, gray-200)

/**
 * 정답률을 표시하는 데이터 기반 도넛 차트 컴포넌트
 */
const ScoreDonutChart = ({ title, score, maxScore }: ScoreDonutChartProps) => {
  // 차트에 사용할 데이터 배열 생성
  const chartData = [
    { name: 'score', value: score },
    { name: 'remaining', value: maxScore - score },
  ];

  // 0으로 나누는 것을 방지
  const percentage = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 1. 유형 타이틀 */}
      <h3 className="text-2xl font-semibold text-gray-700">{title}</h3>

      {/* 2. 차트 & 중앙 텍스트 */}
      {/* relative 컨테이너로 차트와 중앙 텍스트를 겹치게 합니다.
      */}
      <div className="relative h-48 w-48">
        {/* 중앙 텍스트 (absolute로 차트 위에 배치) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-blue-600">{percentage}%</span>
          <span className="text-sm text-gray-500">
            {score} / {maxScore}
          </span>
        </div>

        {/* Recharts 도넛 차트 */}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"   // 차트 x축 중앙
              cy="50%"   // 차트 y축 중앙
              dataKey="value"
              innerRadius={60} // 도넛 안쪽 반지름
              outerRadius={80} // 도넛 바깥쪽 반지름
              startAngle={90}  // 90도(위쪽)에서 렌더링 시작
              endAngle={-270}  // 360도 회전
              paddingAngle={0}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="none" // 셀 사이의 경계선 없음
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ScoreDonutChart;