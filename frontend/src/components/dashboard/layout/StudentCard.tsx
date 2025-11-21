import { Flame, Droplet } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  level: number;
  streak: number;
  isActive?: boolean;
  profileImage?: string;
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
        w-full p-3 rounded-lg transition-all duration-200 cursor-pointer
        ${
          isSelected
            ? 'bg-primary/10 border-2 border-primary'
            : 'bg-white border border-neutral-200 hover:border-primary/50 hover:bg-neutral-50'
        }
        ${isExpanded ? 'mb-2' : 'mb-3'}
      `}
    >
      {isExpanded ? (
        /* 펼쳐진 상태 */
        <div className="flex items-center gap-3">
          
          <div className="flex-shrink-0">
            {student.profileImage ? (
              <img
                src={student.profileImage}
                alt={student.name}
                className="w-10 h-10 rounded-full object-cover border border-neutral-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {student.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* 학생 정보 */}
          <div className="flex-1 text-left overflow-hidden">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold font-pretendard text-sm text-neutral-800 truncate">
                {student.name}
              </span>
              <span className="text-xs text-neutral-500 font-pretendard flex-shrink-0">
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
        /* 접힌 상태 */
        <div className="flex flex-col items-center gap-1">
          
          <div className="flex-shrink-0">
            {student.profileImage ? (
              <img
                src={student.profileImage}
                alt={student.name}
                className="w-8 h-8 rounded-full object-cover border border-neutral-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {student.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {hasStreak && (
            <Flame size={12} className="text-warning mt-1" />
          )}
        </div>
      )}
    </button>
  );
}