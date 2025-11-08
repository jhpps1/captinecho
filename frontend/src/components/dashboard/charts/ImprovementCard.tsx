import { TrendingUp, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface ImprovementData {
  jamo: string;
  previousAccuracy: number;
  currentAccuracy: number;
  improvement: number; // percentage point
}

interface ImprovementCardProps {
  overallImprovement: {
    previous: number;
    current: number;
  };
  jamoImprovements: ImprovementData[];
}

export default function ImprovementCard({
  overallImprovement,
  jamoImprovements,
}: ImprovementCardProps) {
  const overallChange = overallImprovement.current - overallImprovement.previous;

  // 가장 많이 개선된 자모 (상위 2개)
  const topImproved = [...jamoImprovements]
    .filter((j) => j.improvement > 0)
    .sort((a, b) => b.improvement - a.improvement)
    .slice(0, 2);

  // 개선이 필요한 자모 (하위 2개, 개선율 낮은 순)
  const needsWork = [...jamoImprovements]
    .sort((a, b) => a.improvement - b.improvement)
    .slice(0, 2);

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp size={16} className="text-success" />;
    if (change < 0) return <ArrowDown size={16} className="text-error" />;
    return <Minus size={16} className="text-neutral-400" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-error';
    return 'text-neutral-500';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-success/20 to-primary/20 flex items-center justify-center">
          <TrendingUp size={24} className="text-success" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-800 font-pretendard">
            이번 주 개선 현황
          </h3>
          <p className="text-sm text-neutral-500 font-pretendard">
            지난 주 대비 학습 성과
          </p>
        </div>
      </div>

      {/* Overall Improvement */}
      <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-success/5 rounded-lg">
        <p className="text-sm text-neutral-600 font-pretendard mb-2">
          전체 정확도
        </p>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-neutral-700 font-pretendard">
            {overallImprovement.previous}%
          </span>
          <span className="text-neutral-400">→</span>
          <span className="text-3xl font-bold text-primary font-pretendard">
            {overallImprovement.current}%
          </span>
          <div className={`flex items-center gap-1 ml-2 ${getChangeColor(overallChange)}`}>
            {getChangeIcon(overallChange)}
            <span className="text-lg font-bold font-pretendard">
              {Math.abs(overallChange)}%p
            </span>
          </div>
        </div>
      </div>

      {/* Top Improved Jamo */}
      {topImproved.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-neutral-700 font-pretendard mb-3">
            가장 많이 개선된 자모
          </h4>
          <div className="space-y-3">
            {topImproved.map((jamo, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-success/5 rounded-lg border border-success/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                    <span className="text-xl font-bold text-success font-pretendard">
                      {jamo.jamo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-pretendard">
                    <span className="text-neutral-600">
                      {jamo.previousAccuracy}%
                    </span>
                    <span className="text-neutral-400">→</span>
                    <span className="font-bold text-success">
                      {jamo.currentAccuracy}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-success">
                  <ArrowUp size={16} />
                  <span className="text-lg font-bold font-pretendard">
                    {jamo.improvement}%p
                  </span>
                  {index === 0 && jamo.improvement >= 20 && (
                    <span className="ml-1">🎉</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Needs Work */}
      {needsWork.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-neutral-700 font-pretendard mb-3">
            집중 학습이 필요해요
          </h4>
          <div className="space-y-2">
            {needsWork.map((jamo, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-warning/5 rounded-lg border border-warning/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                    <span className="text-xl font-bold text-warning font-pretendard">
                      {jamo.jamo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-pretendard">
                    <span className="text-neutral-600">
                      {jamo.previousAccuracy}%
                    </span>
                    <span className="text-neutral-400">→</span>
                    <span className="font-bold text-neutral-800">
                      {jamo.currentAccuracy}%
                    </span>
                  </div>
                </div>
                <div className={`flex items-center gap-1 ${getChangeColor(jamo.improvement)}`}>
                  {getChangeIcon(jamo.improvement)}
                  <span className="text-sm font-bold font-pretendard">
                    {Math.abs(jamo.improvement)}%p
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
