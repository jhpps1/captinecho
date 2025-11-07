import { Target, Clock, TrendingUp } from 'lucide-react';
import GoalProgress from './GoalProgress';

interface DailyGoalsProps {
  goals: {
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
  };
}

export default function DailyGoals({ goals }: DailyGoalsProps) {
  const problemsProgress = (goals.problems.current / goals.problems.target) * 100;
  const timeProgress = (goals.time.current / goals.time.target) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Problems Goal */}
      <GoalProgress
        icon={<Target size={24} className="text-primary" />}
        title="목표 문제수"
        current={goals.problems.current}
        target={goals.problems.target}
        unit="개"
        progress={problemsProgress}
        color="primary"
      />

      {/* Time Goal */}
      <GoalProgress
        icon={<Clock size={24} className="text-secondary" />}
        title="학습 시간"
        current={goals.time.current}
        target={goals.time.target}
        unit="분"
        progress={timeProgress}
        color="secondary"
      />

      {/* Accuracy (No Target) */}
      <GoalProgress
        icon={<TrendingUp size={24} className="text-success" />}
        title="평균 정확도"
        current={goals.accuracy.current}
        unit="%"
        progress={goals.accuracy.current}
        color="success"
        showTarget={false}
      />
    </div>
  );
}
