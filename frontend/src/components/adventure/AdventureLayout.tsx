import { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TutorialOverlay } from './TutorialOverlay';
import { TopActionsBar } from './TopActionsBar';
import { useTutorialVoice } from '../../hooks/useTutorialVoice';

interface AdventureLayoutProps {
  children: ReactNode;
  adventureTypeId?: 1 | 2 | 3 | 4; // 탐험 유형 (배경 변경용)
}

/**
 * AdventureLayout - 탐험 페이지 공통 레이아웃
 *
 * @description
 * - 공통 배경 (양피지 스타일)
 * - 공통 상단 액션바 (튜토리얼/나가기 버튼)
 * - 공통 튜토리얼 오버레이
 * - children으로 DailyRunner/SuppleRunner 렌더
 *
 * @param children - DailyRunner 또는 SuppleRunner
 */
export const AdventureLayout = ({ children, adventureTypeId }: AdventureLayoutProps) => {
  const navigate = useNavigate();
  const [isTutorialMode, setIsTutorialMode] = useState(false);
  const { playVoice, stopVoice } = useTutorialVoice();

  // adventureTypeId에 따른 배경 이미지 선택
  const getBackgroundImage = () => {
    if (adventureTypeId) {
      return `/adventurepage/adventure_${adventureTypeId}_background.png`;
    }
    return '/adventurepage/map_background.png'; // 기본 배경
  };

  // ESC 키로 튜토리얼 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTutorialMode) {
        setIsTutorialMode(false);
        stopVoice();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTutorialMode, stopVoice]);

  // 튜토리얼 버튼 클릭
  const handleTutorialClick = () => {
    const goingToTutorial = !isTutorialMode;
    setIsTutorialMode(goingToTutorial);

    if (goingToTutorial) {
      playVoice('tutorial', '문제를 풀어보세요!');
    } else {
      stopVoice();
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen relative"
      style={{
        backgroundImage: `url(${getBackgroundImage()})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#D4B896',
        minWidth: '100vw',
      }}
    >
      {/* 양피지 배경 장식 (탐험 배경 위에 오버레이) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div
          style={{
            backgroundImage: 'url(/adventurepage/map_background.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            width: 'clamp(320px, 96vw, 1400px)',
            aspectRatio: '16 / 9',
          }}
        />
      </div>

      {/* 튜토리얼 오버레이 (어두운 배경) */}
      <TutorialOverlay active={isTutorialMode} />

      {/* 상단 액션 바 (튜토리얼/나가기) */}
      <TopActionsBar onTutorialClick={handleTutorialClick} isCompleted={false} />

      {/* Runner 컴포넌트 렌더링 */}
      <div className="relative z-10 flex-1">
        {children}
      </div>
    </div>
  );
};
