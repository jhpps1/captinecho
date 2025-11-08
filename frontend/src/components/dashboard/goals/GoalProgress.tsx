interface GoalProgressProps {
  icon: React.ReactNode;
  title: string;
  current: number;
  target?: number;
  unit: string;
  progress: number;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  showTarget?: boolean;
}

const COLOR_CLASSES = {
  primary: {
    bg: 'bg-primary/10',
    progress: 'bg-primary',
    text: 'text-primary',
  },
  secondary: {
    bg: 'bg-secondary/10',
    progress: 'bg-secondary',
    text: 'text-secondary',
  },
  success: {
    bg: 'bg-success/10',
    progress: 'bg-success',
    text: 'text-success',
  },
  warning: {
    bg: 'bg-warning/10',
    progress: 'bg-warning',
    text: 'text-warning',
  },
  error: {
    bg: 'bg-error/10',
    progress: 'bg-error',
    text: 'text-error',
  },
};

export default function GoalProgress({
  icon,
  title,
  current,
  target,
  unit,
  progress,
  color,
  showTarget = true,
}: GoalProgressProps) {
  const colors = COLOR_CLASSES[color];
  const isCompleted = target ? current >= target : false;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-neutral-700 font-pretendard">
            {title}
          </h3>
        </div>
        {isCompleted && (
          <span className="text-xs font-medium text-success px-2 py-1 bg-success/10 rounded-full">
            완료!
          </span>
        )}
      </div>

      {/* Value */}
      <div className="mb-3">
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-bold ${colors.text} font-pretendard`}>
            {current.toLocaleString()}
          </span>
          {showTarget && target && (
            <>
              <span className="text-lg text-neutral-400 font-pretendard">
                / {target.toLocaleString()}
              </span>
            </>
          )}
          <span className="text-sm text-neutral-500 font-pretendard ml-1">
            {unit}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full ${colors.progress} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      {/* Progress Percentage */}
      {showTarget && target && (
        <p className="mt-2 text-xs text-neutral-500 text-right font-pretendard">
          {clampedProgress.toFixed(0)}% 달성
        </p>
      )}
    </div>
  );
}
