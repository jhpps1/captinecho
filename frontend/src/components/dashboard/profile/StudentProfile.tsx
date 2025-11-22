import { User } from 'lucide-react';
import WeeklyStreak from './WeeklyStreak';

interface StudentProfileProps {
  student: {
    id: number;
    name: string;
    level: number | null;
    profileImage?: string;
  };
  weeklyAttendance: boolean[]; // [Mon, Tue, Wed, Thu, Fri]
}

export default function StudentProfile({
  student,
  weeklyAttendance,
}: StudentProfileProps) {
  const totalAttendance = weeklyAttendance.filter(Boolean).length;
  const hasGoodStreak = totalAttendance >= 3;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
      <div className="flex items-start gap-6">
        {/* Profile Section */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            {student.profileImage ? (
              <img
                src={student.profileImage}
                alt={student.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User size={40} className="text-primary" />
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold font-pretendard text-neutral-800">
              {student.name}
            </h2>
            {student.level !== null && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold font-pretendard">
                Lv.{student.level}
              </span>
            )}
          </div>

          {/* Weekly Streak Section */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-neutral-700 font-pretendard">
                이번 주 학습 현황
              </h3>
              {hasGoodStreak && (
                <span className="text-xs text-success font-medium font-pretendard">
                  좋은 습관을 만들고 있어요! 🎉
                </span>
              )}
            </div>
            <WeeklyStreak attendance={weeklyAttendance} />
          </div>

          {/* Motivational Message */}
          {totalAttendance === 0 && (
            <p className="mt-3 text-sm text-neutral-500 font-pretendard">
              이번 주 학습을 시작해보세요!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
