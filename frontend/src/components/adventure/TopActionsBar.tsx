// 탐험 페이지 상단에 있는 메뉴바(튜토리얼 & 나가기)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, DoorOpen } from 'lucide-react';
import { ExitConfirmModal } from './modals/ExitConfirmModal';
import { CompletionModal } from './modals/CompletionModal';

type TopActionsBarProps = {
  onTutorialClick: () => void;
  isCompleted?: boolean;
};

export const TopActionsBar = ({
  onTutorialClick,
  isCompleted = false,
}: TopActionsBarProps) => {
  const navigate = useNavigate();
  const [showExitModal, setShowExitModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // 완료 상태 감지 시 완료 모달 표시
  useEffect(() => {
    if (isCompleted) {
      setShowCompletionModal(true);
    }
  }, [isCompleted]);

  const handleExitClick = () => {
    setShowExitModal(true);
  };

  const handleExitConfirm = () => {
    navigate('/student');
  };

  const handleExitCancel = () => {
    setShowExitModal(false);
  };

  const handleCompletionConfirm = () => {
    navigate('/student');
  };

  return (
    <>
      <header className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-2 sm:gap-3 z-50">
        {/* 튜토리얼 버튼 */}
        <button
          className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          onClick={onTutorialClick}
          aria-label="튜토리얼 보기"
        >
          <HelpCircle className="text-gray-700" size={24} />
        </button>

        {/* 나가기 */}
        <button
          onClick={handleExitClick}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="나가기"
        >
          <DoorOpen className="text-gray-700" size={24} />
        </button>
      </header>

      {/* 나가기 확인 모달 */}
      <ExitConfirmModal
        isOpen={showExitModal}
        onConfirm={handleExitConfirm}
        onCancel={handleExitCancel}
      />

      {/* 완료 축하 모달 */}
      <CompletionModal
        isOpen={showCompletionModal}
        onConfirm={handleCompletionConfirm}
      />
    </>
  );
};
