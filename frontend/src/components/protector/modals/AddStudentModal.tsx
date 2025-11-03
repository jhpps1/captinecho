import { useState } from 'react';

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
  selectedInterests: string[];
}

export default function AddStudentModal({
  onClose,
  onSubmit,
  onOpenInterests,
  selectedInterests
}: AddStudentModalProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [birthDate, setBirthDate] = useState('');
  const [grade, setGrade] = useState('');

  const handleSubmit = () => {
    if (!name || !birthDate || !grade) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    onSubmit({
      name,
      gender,
      birthDate,
      grade,
      interests: selectedInterests
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
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                학년
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                placeholder="예: 초등 3학년"
              />
            </div>
          </div>

          {/* 학생 관심사 */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              학생 관심사
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={selectedInterests.join(', ')}
                readOnly
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-50"
                placeholder="관심사를 선택하세요"
              />
              <button
                onClick={onOpenInterests}
                className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-semibold"
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

        {/* 버튼들 */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
          >
            확인
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
