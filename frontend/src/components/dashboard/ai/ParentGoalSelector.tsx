import { MessageSquare, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getProtectorGoalList, type ProtectorGoalOption } from '../../../api/dashboardApi';

// 아이콘 매핑 (백엔드에서 제공하지 않음)
const GOAL_ICONS: Record<string, string> = {
  FOCUS_ON_WEAKNESS: '🎯',
  BUILD_CONFIDENCE: '💪',
  INCREASE_DIFFICULTY: '🚀',
};

interface ParentGoalSelectorProps {
  currentGoal?: string | null;
  onChange: (goal: string) => void;
}

export default function ParentGoalSelector({
  currentGoal,
  onChange,
}: ParentGoalSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(currentGoal || '');
  const [goals, setGoals] = useState<ProtectorGoalOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // API에서 목표 선택지 로드
  useEffect(() => {
    const fetchGoals = async () => {
      setIsLoading(true);
      try {
        const response = await getProtectorGoalList();
        setGoals(response.goals);

        // 현재 목표가 없으면 첫 번째 항목 선택
        if (!currentGoal && response.goals.length > 0) {
          setSelectedGoal(response.goals[0].goal);
        }
      } catch (error) {
        console.error('목표 선택지 로드 실패:', error);
        // 에러 시 빈 배열 유지
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoals();
  }, []);

  // currentGoal prop이 변경되면 반영
  useEffect(() => {
    if (currentGoal) {
      setSelectedGoal(currentGoal);
    }
  }, [currentGoal]);

  const handleSelect = (goal: string) => {
    setSelectedGoal(goal);
    onChange(goal);
    setIsOpen(false);
  };

  // 드롭다운 열림 시 자동 스크롤
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      setTimeout(() => {
        dropdownRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }, 100);
    }
  }, [isOpen]);

  const currentOption = goals.find((g) => g.goal === selectedGoal);

  if (isLoading || goals.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 border border-neutral-200">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={18} className="text-primary" />
          <h4 className="text-sm font-semibold text-neutral-700 font-pretendard">
            보호자 의견 (다음 주 커리큘럼에 반영)
          </h4>
        </div>
        <div className="p-3 bg-neutral-50 rounded-lg text-sm text-neutral-500 font-pretendard">
          {isLoading ? '로딩 중...' : '선택지를 불러올 수 없습니다'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-neutral-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={18} className="text-primary" />
        <h4 className="text-sm font-semibold text-neutral-700 font-pretendard">
          보호자 의견 (다음 주 커리큘럼에 반영)
        </h4>
      </div>

      {/* Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-3 p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors cursor-pointer"
        >
          <span className="text-2xl">{GOAL_ICONS[currentOption?.goal || ''] || '📋'}</span>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-neutral-800 font-pretendard">
              {currentOption?.title || '선택해주세요'}
            </p>
            <p className="text-xs text-neutral-500 font-pretendard">
              {currentOption?.description || ''}
            </p>
          </div>
          <svg
            className={`w-5 h-5 text-neutral-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 overflow-hidden">
            {goals.map((goal) => (
              <button
                key={goal.goal}
                onClick={() => handleSelect(goal.goal)}
                className={`
                  w-full flex items-center gap-3 p-3 transition-colors cursor-pointer
                  ${
                    selectedGoal === goal.goal
                      ? 'bg-primary/10 border-l-4 border-primary'
                      : 'hover:bg-neutral-50'
                  }
                `}
              >
                <span className="text-2xl">{GOAL_ICONS[goal.goal] || '📋'}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-neutral-800 font-pretendard">
                    {goal.title}
                  </p>
                  <p className="text-xs text-neutral-500 font-pretendard">
                    {goal.description}
                  </p>
                </div>
                {selectedGoal === goal.goal && (
                  <Check size={18} className="text-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
