import { useState, useEffect } from 'react';
import { getMajorInterests, getSubInterests } from '../../../api/interestApi';
import type { MajorInterest, SubInterest } from '../../../api/interestApi';

interface SelectedInterest {
  id: number;
  name: string;
}

interface InterestSelectionModalProps {
  onClose: () => void;
  onConfirm: (selectedInterestIds: number[]) => void;
  initialSelection?: number[];
}

export default function InterestSelectionModal({
  onClose,
  onConfirm,
  initialSelection = []
}: InterestSelectionModalProps) {
  const [majorInterests, setMajorInterests] = useState<MajorInterest[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<number | null>(null);
  const [subInterests, setSubInterests] = useState<SubInterest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<SelectedInterest[]>([]);
  const [isLoadingMajor, setIsLoadingMajor] = useState(false);
  const [isLoadingSub, setIsLoadingSub] = useState(false);

  // 대분류 목록 로드
  useEffect(() => {
    const fetchMajorInterests = async () => {
      setIsLoadingMajor(true);
      try {
        const response = await getMajorInterests();
        setMajorInterests(response.majorInterests);
        console.log('✅ 대분류 관심사 로드 완료:', response.majorInterests);
      } catch (error) {
        console.error('❌ 대분류 관심사 로드 실패:', error);
        alert('관심사 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoadingMajor(false);
      }
    };

    fetchMajorInterests();
  }, []);

  // 대분류 선택 시 소분류 로드
  useEffect(() => {
    if (selectedMajor === null) {
      setSubInterests([]);
      return;
    }

    const fetchSubInterests = async () => {
      setIsLoadingSub(true);
      try {
        const response = await getSubInterests(selectedMajor);
        setSubInterests(response.subInterests);
        console.log('✅ 소분류 관심사 로드 완료:', response.subInterests);
      } catch (error) {
        console.error('❌ 소분류 관심사 로드 실패:', error);
        alert('하위 관심사 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoadingSub(false);
      }
    };

    fetchSubInterests();
  }, [selectedMajor]);

  const toggleSubInterest = (subInterest: SubInterest) => {
    setSelectedInterests(prev => {
      const exists = prev.find(item => item.id === subInterest.subInterestId);
      if (exists) {
        return prev.filter(item => item.id !== subInterest.subInterestId);
      } else {
        // 최대 5개까지만 선택 가능
        if (prev.length >= 5) {
          alert('관심사는 최대 5개까지 선택할 수 있습니다.');
          return prev;
        }
        return [...prev, { id: subInterest.subInterestId, name: subInterest.subInterestName }];
      }
    });
  };

  const removeInterest = (interestId: number) => {
    setSelectedInterests(prev => prev.filter(item => item.id !== interestId));
  };

  const handleConfirm = () => {
    const interestIds = selectedInterests.map(item => item.id);
    onConfirm(interestIds);
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
        <div className="grid grid-cols-2 gap-8 mb-6"> {/* ⬅️ min-h-[300px] 제거 */}
          {/* 대분류 */}
          <div className="space-y-3 h-[300px] overflow-y-auto pr-2"> {/* ⬅️ 높이 고정 및 스크롤 추가 */}
            {isLoadingMajor ? (
              <div className="text-center text-gray-500">로딩 중...</div>
            ) : (
              majorInterests.map((major) => (
                <button
                  key={major.majorInterestId}
                  onClick={() => setSelectedMajor(major.majorInterestId)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedMajor === major.majorInterestId
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {major.majorInterestName}
                </button>
              ))
            )}
          </div>

          {/* 소분류 */}
          <div className="space-y-3 h-[300px] overflow-y-auto pr-2"> {/* ⬅️ 높이 고정 및 스크롤 추가 */}
            {!selectedMajor ? (
              <div className="text-center text-gray-500">왼쪽에서 대분류를 선택하세요</div>
            ) : isLoadingSub ? (
              <div className="text-center text-gray-500">로딩 중...</div>
            ) : (
              subInterests.map((sub) => (
                <label
                  key={sub.subInterestId}
                  className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedInterests.some(item => item.id === sub.subInterestId)}
                    onChange={() => toggleSubInterest(sub)}
                    className="w-5 h-5 mr-3"
                  />
                  <span className="text-gray-700">{sub.subInterestName}</span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* 선택된 항목 표시 */}
        <div className="mb-6 min-h-[60px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              선택된 관심사: {selectedInterests.length}/5
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedInterests.map((interest) => (
              <div
                key={interest.id}
                className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full"
              >
                <button
                  onClick={() => removeInterest(interest.id)}
                  className="mr-2 text-blue-600 hover:text-blue-800 font-bold"
                >
                  ✕
                </button>
                <span>{interest.name}</span>
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
