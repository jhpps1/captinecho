import type { StudyGoal } from '../../mocks/protectorData';

interface StudyGoalsCardProps {
  goals: StudyGoal[];
}

export default function StudyGoalsCard({ goals }: StudyGoalsCardProps) {
  const dailyProblemGoal = goals.find(g => g.type === 'daily' && g.unit === '개');
  const dailyTimeGoal = goals.find(g => g.type === 'daily' && g.unit === '분');
  const weeklyGoal = goals.find(g => g.type === 'weekly');

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-purple-500';
    if (percentage >= 50) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  return (
    <div className="bg-white rounded-2xl p-6 space-y-4">
      {/* 일일 목표 문제수 */}
      {dailyProblemGoal && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">일일 목표 문제수</span>
            <span className="text-sm font-bold text-gray-800">{dailyProblemGoal.target}{dailyProblemGoal.unit}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`${getProgressColor(getProgressPercentage(dailyProblemGoal.current, dailyProblemGoal.target))} h-3 rounded-full transition-all duration-300`}
              style={{ width: `${getProgressPercentage(dailyProblemGoal.current, dailyProblemGoal.target)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 금일 학습 시간 */}
      {dailyTimeGoal && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">금일 학습 시간</span>
            <span className="text-sm font-bold text-gray-800">{dailyTimeGoal.current}{dailyTimeGoal.unit}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage(dailyTimeGoal.current, dailyTimeGoal.target)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 주간 목표 */}
      {weeklyGoal && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">주간 목표 학습 달성률</span>
            <span className="text-sm font-bold text-gray-800">
              {getProgressPercentage(weeklyGoal.current, weeklyGoal.target)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-purple-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage(weeklyGoal.current, weeklyGoal.target)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
