import { useState } from 'react';
import { Target, Clock, TrendingUp } from 'lucide-react';
import GoalProgress from './GoalProgress';

interface GoalsData {
  problems: {
    current: number;
    target: number;
  };
  time: {
    current: number;
    target: number;
  };
  accuracy: {
    current: number;
  };
}

interface LearningGoalsProps {
  dailyGoals: GoalsData;
  weeklyGoals: GoalsData;
}

export default function LearningGoals({ dailyGoals, weeklyGoals }: LearningGoalsProps) {
  const [viewMode, setViewMode] = useState<'today' | 'week'>('today');

  const currentGoals = viewMode === 'today' ? dailyGoals : weeklyGoals;
  const problemsProgress = (currentGoals.problems.current / currentGoals.problems.target) * 100;
  const timeProgress = (currentGoals.time.current / currentGoals.time.target) * 100;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-neutral-800 font-pretendard">
          학습 목표
        </h2>

        {/* Toggle Button */}
        <div className="flex items-center bg-neutral-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('today')}
            className={`
              px-4 py-2 rounded-md text-sm font-medium font-pretendard transition-all duration-200
              ${
                viewMode === 'today'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-800'
              }
            `}
          >
            오늘
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`
              px-4 py-2 rounded-md text-sm font-medium font-pretendard transition-all duration-200
              ${
                viewMode === 'week'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-800'
              }
            `}
          >
            이번주
          </button>
        </div>
      </div>

      {/* Goal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Problems Goal */}
        <GoalProgress
          icon={<Target size={24} className="text-primary" />}
          title="목표 문제수"
          current={currentGoals.problems.current}
          target={currentGoals.problems.target}
          unit="개"
          progress={problemsProgress}
          color="primary"
        />

        {/* Time Goal */}
        <GoalProgress
          icon={<Clock size={24} className="text-secondary" />}
          title="학습 시간"
          current={currentGoals.time.current}
          target={currentGoals.time.target}
          unit="분"
          progress={timeProgress}
          color="secondary"
        />

        {/* Accuracy (No Target) */}
        <GoalProgress
          icon={<TrendingUp size={24} className="text-success" />}
          title="평균 정확도"
          current={currentGoals.accuracy.current}
          unit="%"
          progress={currentGoals.accuracy.current}
          color="success"
          showTarget={false}
        />
      </div>
    </div>
  );
}
