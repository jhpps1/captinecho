import type { WeeklyActivity } from '../../mocks/protectorData';

interface StreakCalendarProps {
  weeklyActivity: WeeklyActivity[];
  streak: number;
}

export default function StreakCalendar({ weeklyActivity, streak }: StreakCalendarProps) {
  return (
    <div className="bg-cyan-100 rounded-2xl p-6">
      {/* 연속 학습 메시지 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🔥</span>
          <span className="text-lg font-bold text-gray-800">
            {streak}일 연속 학습중이에요!
          </span>
        </div>
      </div>

      {/* 프로필 이미지 (선택사항) */}
      <div className="flex justify-center mb-4">
        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* 요일별 활동 표시 */}
      <div className="flex justify-center gap-2 mb-6">
        {weeklyActivity.map((day, index) => (
          <div key={index} className="flex flex-col items-center">
            {day.completed ? (
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                <span className="text-xl">🔥</span>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-300"></div>
            )}
            <span className="text-xs mt-1 text-gray-700">{day.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
