interface WeeklyComparisonChartProps {
  lastWeek: number[];
  thisWeek: number[];
  days: string[];
}

export default function WeeklyComparisonChart({ lastWeek, thisWeek, days }: WeeklyComparisonChartProps) {
  const maxValue = Math.max(...lastWeek, ...thisWeek);
  const chartHeight = 300;

  const getBarHeight = (value: number) => {
    return (value / maxValue) * chartHeight;
  };

  return (
    <div className="bg-white rounded-2xl p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">주간 학습 시간 비교</h3>

      {/* 차트 */}
      <div className="relative" style={{ height: `${chartHeight + 60}px` }}>
        {/* Y축 레이블 */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          <span>{maxValue}분</span>
          <span>{Math.round(maxValue / 2)}분</span>
          <span>0분</span>
        </div>

        {/* 차트 영역 */}
        <div className="ml-12 h-full flex items-end justify-around gap-2">
          {days.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              {/* 막대 그래프 */}
              <div className="w-full flex justify-center items-end gap-1" style={{ height: chartHeight }}>
                {/* 지난 주 */}
                <div className="relative group">
                  <div
                    className="w-8 bg-pink-400 rounded-t transition-all duration-300 hover:bg-pink-500"
                    style={{ height: `${getBarHeight(lastWeek[index])}px` }}
                  ></div>
                  {lastWeek[index] > 0 && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700">
                      {lastWeek[index]}분
                    </div>
                  )}
                </div>

                {/* 이번 주 */}
                <div className="relative group">
                  <div
                    className="w-8 bg-purple-500 rounded-t transition-all duration-300 hover:bg-purple-600"
                    style={{ height: `${getBarHeight(thisWeek[index])}px` }}
                  ></div>
                  {thisWeek[index] > 0 && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700">
                      {thisWeek[index]}분
                    </div>
                  )}
                </div>
              </div>

              {/* X축 레이블 */}
              <span className="text-sm text-gray-700">{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex justify-center gap-6 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-pink-400 rounded"></div>
          <span className="text-sm text-gray-700">지난 주 학습 시간</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <span className="text-sm text-gray-700">이번 주 학습 시간</span>
        </div>
      </div>
    </div>
  );
}
