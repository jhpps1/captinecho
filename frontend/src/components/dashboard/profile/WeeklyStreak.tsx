import { Flame } from 'lucide-react';

interface WeeklyStreakProps {
  attendance: boolean[]; // [Mon, Tue, Wed, Thu, Fri]
}

const WEEKDAYS = ['월', '화', '수', '목', '금'];

export default function WeeklyStreak({ attendance }: WeeklyStreakProps) {
  return (
    <div className="flex items-center gap-2">
      {WEEKDAYS.map((day, index) => {
        const isPresent = attendance[index];

        return (
          <div
            key={day}
            className="flex flex-col items-center gap-1"
          >
            {/* Day Label */}
            <span className="text-xs font-medium text-neutral-500 font-pretendard">
              {day}
            </span>

            {/* Attendance Indicator */}
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
                ${
                  isPresent
                    ? 'bg-warning/20 ring-2 ring-warning'
                    : 'bg-neutral-100 border-2 border-neutral-200'
                }
              `}
            >
              {isPresent ? (
                <Flame size={20} className="text-warning" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-neutral-300" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
