import type { Student } from '../../mocks/protectorData';

interface StudentCardProps {
  student: Student | null;
  onSettingsClick?: () => void;
}

export default function StudentCard({ student, onSettingsClick }: StudentCardProps) {
  if (!student) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <p className="text-gray-400 text-center">학생을 선택해주세요</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 relative">
      {/* 설정 버튼 (우측 상단) */}
      {onSettingsClick && (
        <button
          onClick={onSettingsClick}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="학생 설정"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      )}

      <div className="flex items-center gap-6">
        {/* 프로필 이미지 */}
        <div className="flex-shrink-0">
          {student.profileImage ? (
            <img
              src={student.profileImage}
              alt={student.fullName}
              className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-blue-100">
              <span className="text-3xl font-bold text-white">
                {student.lastName}
              </span>
            </div>
          )}
        </div>

        {/* 학생 정보 */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {student.fullName}
          </h2>
          <p className="text-gray-600 mb-3">{student.grade}</p>

          {/* 레벨 & 연속 학습일 */}
          <div className="flex items-center gap-4">
            {/* 레벨 뱃지 */}
            <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-semibold text-blue-700">
                레벨 {student.level}
              </span>
            </div>

            {/* 연속 학습일 */}
            <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full">
              <svg
                className="w-5 h-5 text-orange-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-semibold text-orange-700">
                {student.streak}일 연속
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
