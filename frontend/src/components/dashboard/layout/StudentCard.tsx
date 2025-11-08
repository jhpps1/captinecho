import { User, Flame, Droplet } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  level: number;
  streak: number;
  isActive?: boolean;
}

interface StudentCardProps {
  student: Student;
  isSelected: boolean;
  isExpanded: boolean;
  onClick: () => void;
}

export default function StudentCard({
  student,
  isSelected,
  isExpanded,
  onClick,
}: StudentCardProps) {
  const hasStreak = student.streak >= 3;

  return (
    <button
      onClick={onClick}
      className={`
        w-full p-3 rounded-lg transition-all duration-200
        ${
          isSelected
            ? 'bg-primary/10 border-2 border-primary'
            : 'bg-white border border-neutral-200 hover:border-primary/50 hover:bg-neutral-50'
        }
        ${isExpanded ? 'mb-2' : 'mb-3'}
      `}
    >
      {isExpanded ? (
        <div className="flex items-center gap-3">
          {/* Profile Image */}
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <User size={20} className="text-primary" />
          </div>

          {/* Student Info */}
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold font-pretendard text-sm text-neutral-800">
                {student.name}
              </span>
              <span className="text-xs text-neutral-500 font-pretendard">
                Lv.{student.level}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {hasStreak ? (
                <>
                  <Flame size={14} className="text-warning" />
                  <span className="text-xs text-neutral-600 font-pretendard">
                    {student.streak}일
                  </span>
                </>
              ) : (
                <>
                  <Droplet size={14} className="text-primary" />
                  <span className="text-xs text-neutral-500 font-pretendard">
                    시작 단계
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Collapsed View - Icon Only */
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <User size={16} className="text-primary" />
          </div>
          {hasStreak && (
            <Flame size={12} className="text-warning" />
          )}
        </div>
      )}
    </button>
  );
}
