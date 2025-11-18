import { useState, useMemo } from 'react';

interface AddStudentModalProps {
  onClose: () => void;
  onSubmit: (studentData: {
    name: string;
    gender: 'male' | 'female';
    birthDate: string;
    grade: string;
    interests: string[];
  }) => void;
  onOpenInterests: () => void;
  selectedInterestsCount: number;
  isLoading?: boolean;
}

export default function AddStudentModal({
  onClose,
  onSubmit,
  onOpenInterests,
  selectedInterestsCount,
  isLoading = false
}: AddStudentModalProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [birthDate, setBirthDate] = useState('');
  const [grade, setGrade] = useState('미취학');
  const [error, setError] = useState(''); // 오류 메시지 상태 추가

  const gradeOptions = [
    '미취학',
    '초등학교 1학년',
    '초등학교 2학년',
    '초등학교 3학년',
    '초등학교 4학년',
    '초등학교 5학년',
    '초등학교 6학년'
  ];

  // 오늘 날짜를 YYYY-MM-DD 형식으로 계산 (max 속성에 사용)
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const handleSubmit = () => {
    setError(''); // 이전 오류 메시지 초기화
    if (!name || !birthDate || !grade) {
      setError('모든 필드를 입력해주세요.'); // alert 대신 오류 상태 설정
      return;
    }

    onSubmit({
      name,
      gender,
      birthDate,
      grade,
      interests: [] // 실제 관심사는 ManageStudentsPage에서 처리
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          관리 학생 추가하기
        </h2>

        <div className="space-y-6">
          {/* 학생 이름 */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              학생 이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
              placeholder="이름을 입력하세요"
            />
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              성별
            </label>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={gender === 'male'}
                  onChange={(e) => setGender(e.target.value as 'male')}
                  className="w-5 h-5 mr-2"
                />
                <span className="text-gray-700">남성</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={gender === 'female'}
                  onChange={(e) => setGender(e.target.value as 'female')}
                  className="w-5 h-5 mr-2"
                />
                <span className="text-gray-700">여성</span>
              </label>
            </div>
          </div>

          {/* 생년월일과 학년 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                생년월일
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                min="1900-01-01"
                max={today}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                학년
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none bg-white"
              >
                {gradeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 학생 관심사 */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              학생 관심사 (선택사항)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={selectedInterestsCount > 0 ? `${selectedInterestsCount}개 선택됨` : ''}
                readOnly
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-50"
                placeholder="관심사를 선택하세요 (최대 5개)"
              />
              <button
                onClick={onOpenInterests}
                disabled={isLoading}
                className={`px-6 py-3 rounded-lg font-semibold ${isLoading
                    ? 'bg-gray-100 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300'
                  }`}
              >
                ⋯
              </button>
            </div>
          </div>

          {/* 안내 메시지 */}
          <p className="text-sm text-gray-600">
            • 현재 '2개'의 계정을 추가할 수 있습니다.
          </p>
        </div>

        {/* 오류 메시지 표시 */}
        {error && (
          <p className="text-sm text-red-600 mt-4 text-center">{error}</p>
        )}

        {/* 버튼들 */}
        <div className={`flex gap-4 ${error ? 'mt-4' : 'mt-8'}`}>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold ${isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
          >
            {isLoading ? '등록 중...' : '확인'}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold ${isLoading
                ? 'bg-gray-100 cursor-not-allowed'
                : 'bg-white hover:bg-gray-50'
              }`}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}