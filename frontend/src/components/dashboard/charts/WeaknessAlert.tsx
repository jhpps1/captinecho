import { useState } from 'react';
import {
  AlertTriangle,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface JamoData {
  jamo: string;
  accuracy: number;
  count: number;
  type?: string;
}

interface WeaknessAlertProps {
  allJamoData: JamoData[];
  currentWeekData?: JamoData[];  // 이번 주 데이터
  lastWeekData?: JamoData[];     // 저번 주 데이터
  error?: string | null;
  onRetry?: () => void;
}

export default function WeaknessAlert({ allJamoData, currentWeekData, lastWeekData, error, onRetry }: WeaknessAlertProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 에러 상태 처리
  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 border border-neutral-200">
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
      </div>
    );
  }

  // 빈 데이터 상태(Empty State)를 먼저 처리
  if (!allJamoData || allJamoData.length === 0) {
    return (
      <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-neutral-200 flex items-center justify-center flex-shrink-0">
            <Info size={24} className="text-neutral-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-neutral-700 font-pretendard">
              아직 학습 데이터가 없습니다
            </h3>
            <p className="text-sm text-neutral-500 font-pretendard mt-1">
              학습을 시작하면 분석 데이터를 볼 수 있어요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- 학습한 자모만 필터링 (옵션 A: 학습 전 자모 제외) ---

  // 학습한 자모만 필터링 (count > 0)
  const learnedJamos = allJamoData.filter((j) => j.count > 0);

  // 학습한 자모가 없으면 Empty State (아직 학습 시작 안 함)
  if (learnedJamos.length === 0) {
    return (
      <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-neutral-200 flex items-center justify-center flex-shrink-0">
            <Info size={24} className="text-neutral-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-neutral-700 font-pretendard">
              아직 학습 데이터가 없습니다
            </h3>
            <p className="text-sm text-neutral-500 font-pretendard mt-1">
              학습을 시작하면 분석 데이터를 볼 수 있어요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 학습한 자모를 정확도 낮은 순으로 정렬
  const sortedLearnedJamos = [...learnedJamos].sort((a, b) => a.accuracy - b.accuracy);

  // 80% 미만인 취약 자모 필터링
  const weaknesses = sortedLearnedJamos.filter((j) => j.accuracy < 80);
  const topWeaknesses = weaknesses.slice(0, 5);

  // 차트용 데이터: 학습한 자모(정확도 낮은 순) + 학습 안한 자모(자모 순)
  const unlearnedJamos = allJamoData
    .filter(j => j.count === 0)
    .sort((a, b) => a.jamo.localeCompare(b.jamo, 'ko'));
  const chartData = [...sortedLearnedJamos, ...unlearnedJamos];

  // 성공 상태 (학습한 자모가 있고, 모두 80% 이상)
  if (weaknesses.length === 0) {
    return (
      <div className="bg-success/5 rounded-xl p-6 border border-success/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center">
            <TrendingDown size={24} className="text-success rotate-180" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-success font-pretendard">
              학습한 모든 자모를 잘하고 있어요!
            </h3>
            <p className="text-sm text-success/80 font-pretendard mt-1">
              이대로 계속 열심히 해봐요 🎉
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- 기존 '부족한 음소' 경고 상태 로직 (변경 없음) ---
  return (
    <div className="bg-warning/5 rounded-xl p-6 border border-warning/20">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {/* ... (이하 동일) ... */}
        <div className="w-12 h-12 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={24} className="text-warning" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-neutral-800 font-pretendard">
            노력해야할 음소가 있어요
          </h3>
          <p className="text-sm text-neutral-600 font-pretendard mt-1">
            아래 음소에 대한 집중 학습이 필요합니다
          </p>
        </div>

        {/* Detail Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors font-pretendard cursor-pointer"
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
                {weakness.type || '음소'}
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
          {/* 이번 주 vs 저번 주 비교 차트 */}
          {currentWeekData && currentWeekData.length > 0 ? (
            <div className="mb-8">
              <h4 className="text-md font-bold text-neutral-800 font-pretendard mb-4">
                📊 이번 주 vs 저번 주 비교
              </h4>

              {lastWeekData && lastWeekData.length > 0 ? (
                <>
                  {/* 저번 주 정확도 낮은 순으로 정렬 */}
                  {(() => {
                    // 저번 주 데이터를 정확도 낮은 순으로 정렬
                    const sortedByLastWeek = [...lastWeekData].sort((a, b) => a.accuracy - b.accuracy);

                    // 이번 주 데이터와 매칭 (자모로 조인)
                    const comparisonData = sortedByLastWeek.map(lastWeekJamo => {
                      const currentWeekJamo = currentWeekData.find(c => c.jamo === lastWeekJamo.jamo);
                      return {
                        jamo: lastWeekJamo.jamo,
                        lastWeek: lastWeekJamo.accuracy,
                        thisWeek: currentWeekJamo?.accuracy ?? 0,
                        count: currentWeekJamo?.count ?? lastWeekJamo.count,
                      };
                    });

                    return (
                      <>
                        <ResponsiveContainer
                          width="100%"
                          height={Math.max(comparisonData.length * 30, 300)}
                        >
                          <BarChart
                            data={comparisonData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#E5E7EB"
                              horizontal={false}
                            />
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
                                style: {
                                  fill: '#6B7280',
                                  fontFamily: 'Pretendard',
                                  fontSize: 12,
                                },
                              }}
                            />
                            <YAxis
                              type="category"
                              dataKey="jamo"
                              tick={{
                                fill: '#1F2937',
                                fontFamily: 'Pretendard',
                                fontWeight: 600,
                                fontSize: 14,
                              }}
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
                              formatter={(value: number) => [`${value}%`, '']}
                              labelStyle={{ color: '#1F2937', fontWeight: 600 }}
                            />
                            <Bar dataKey="lastWeek" name="저번 주" fill="#9CA3AF" radius={[0, 8, 8, 0]} />
                            <Bar dataKey="thisWeek" name="이번 주" fill="#3B82F6" radius={[0, 8, 8, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                        <p className="text-xs text-neutral-500 text-center mt-4 font-pretendard">
                          저번 주 정확도 낮은 순으로 정렬 • 파란색: 이번 주 • 회색: 저번 주
                        </p>
                      </>
                    );
                  })()}
                </>
              ) : (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
                  <p className="text-sm text-blue-700 font-pretendard text-center">
                    저번 주 데이터가 없어 이번 주 데이터만 표시됩니다.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
              <p className="text-sm text-blue-700 font-pretendard text-center">
                이번 주 학습을 시작해보세요!
              </p>
            </div>
          )}

          <h4 className="text-md font-bold text-neutral-800 font-pretendard mb-4">
            📊 전체 음소별 정확도 (40개)
          </h4>

          <ResponsiveContainer
            width="100%"
            height={Math.max(chartData.length * 30, 300)}
          >
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7EB"
                horizontal={false}
              />
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
                  style: {
                    fill: '#6B7280',
                    fontFamily: 'Pretendard',
                    fontSize: 12,
                  },
                }}
              />
              <YAxis
                type="category"
                dataKey="jamo"
                tick={{
                  fill: '#1F2937',
                  fontFamily: 'Pretendard',
                  fontWeight: 600,
                  fontSize: 14,
                }}
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
                formatter={(value: number, name: string, props: any) => {
                  if (props.payload.count === 0) {
                    return ['학습 전', ''];
                  }
                  return [`${value}% (${props.payload.count}회 학습)`, '정확도'];
                }}
                labelStyle={{ color: '#1F2937', fontWeight: 600 }}
              />
              <Bar
                dataKey="accuracy"
                radius={[0, 8, 8, 0]}
                background={{ fill: '#F3F4F6', radius: [0, 8, 8, 0] }}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.count === 0 ? '#D1D5DB' :  // 회색 (학습 전)
                      entry.accuracy < 80 ? '#EF4444' : '#3B82F6'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <p className="text-xs text-neutral-500 text-center mt-4 font-pretendard">
            전체 40개 음소 • 빨간색: 80% 미만 • 파란색: 80% 이상 • 회색: 학습 전
          </p>
        </div>
      )}
    </div>
  );
}