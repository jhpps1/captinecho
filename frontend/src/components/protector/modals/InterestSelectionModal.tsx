import { useState, useEffect } from 'react';

interface InterestCategory {
  id: string;
  name: string;
}

interface InterestSelectionModalProps {
  onClose: () => void;
  onConfirm: (selectedInterests: string[]) => void;
  initialSelection?: string[];
}

// Mock data for interests
const majorCategories: InterestCategory[] = [
  { id: 'major1', name: '대분류 1' },
  { id: 'major2', name: '대분류 2' },
  { id: 'major3', name: '대분류 3' },
  { id: 'major4', name: '대분류 4' },
];

const minorCategories: InterestCategory[] = [
  { id: 'minor1', name: '소분류 1' },
  { id: 'minor2', name: '소분류 2' },
  { id: 'minor3', name: '소분류 3' },
  { id: 'minor4', name: '소분류 4' },
];

export default function InterestSelectionModal({
  onClose,
  onConfirm,
  initialSelection = []
}: InterestSelectionModalProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialSelection);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(item => item !== interest);
      } else {
        return [...prev, interest];
      }
    });
  };

  const handleConfirm = () => {
    onConfirm(selectedInterests);
  };

  const removeInterest = (interest: string) => {
    setSelectedInterests(prev => prev.filter(item => item !== interest));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4">
        {/* 헤더 */}
        <div className="grid grid-cols-2 gap-4 mb-6 bg-blue-200 rounded-lg p-4">
          <h3 className="text-xl font-bold text-gray-800 text-center">대분류</h3>
          <h3 className="text-xl font-bold text-gray-800 text-center">소분류</h3>
        </div>

        {/* 관심사 선택 영역 */}
        <div className="grid grid-cols-2 gap-8 mb-6 min-h-[300px]">
          {/* 대분류 */}
          <div className="space-y-3">
            {majorCategories.map((category) => (
              <label
                key={category.id}
                className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedInterests.includes(category.name)}
                  onChange={() => toggleInterest(category.name)}
                  className="w-5 h-5 mr-3"
                />
                <span className="text-gray-700">{category.name}</span>
              </label>
            ))}
          </div>

          {/* 소분류 */}
          <div className="space-y-3">
            {minorCategories.map((category) => (
              <label
                key={category.id}
                className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedInterests.includes(category.name)}
                  onChange={() => toggleInterest(category.name)}
                  className="w-5 h-5 mr-3"
                />
                <span className="text-gray-700">{category.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 선택된 항목 표시 */}
        <div className="mb-6 min-h-[60px]">
          <div className="flex flex-wrap gap-2">
            {selectedInterests.map((interest) => (
              <div
                key={interest}
                className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full"
              >
                <button
                  onClick={() => removeInterest(interest)}
                  className="mr-2 text-blue-600 hover:text-blue-800 font-bold"
                >
                  ✕
                </button>
                <span>{interest}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 버튼들 */}
        <div className="flex gap-4">
          <button
            onClick={handleConfirm}
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
