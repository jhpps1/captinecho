// 탐험 페이지 상단에 있는 메뉴바(튜토리얼 & 나가기)
import { Link } from 'react-router-dom';
import { HelpCircle, DoorOpen } from 'lucide-react';

type TopActionsBarProps = {
  onTutorialClick: () => void;
};

export const TopActionsBar = ({ onTutorialClick }: TopActionsBarProps) => {
  return (
    <header className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-2 sm:gap-3 z-10">
      {/* 튜토리얼 버튼 */}
      <button
        className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        onClick={onTutorialClick}
        aria-label="튜토리얼 보기"
      >
        <HelpCircle className="text-gray-700" size={24} />
      </button>

      {/* 나가기 */}
      <Link
        to="/student"
        className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label="나가기"
      >
        <DoorOpen className="text-gray-700" size={24} />
      </Link>
    </header>
  );
};
