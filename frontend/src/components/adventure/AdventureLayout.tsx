import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { TutorialOverlay } from './TutorialOverlay';
import { TopActionsBar } from './TopActionsBar';
import { useTutorialVoice } from '../../hooks/useTutorialVoice';

interface AdventureLayoutProps {
  children: (isTutorialMode: boolean) => ReactNode;
  adventureTypeId?: 1 | 2 | 3 | 4;
  onExitConfirm?: () => void | Promise<void>;
}

export const AdventureLayout = ({ children, adventureTypeId, onExitConfirm }: AdventureLayoutProps) => {
  const navigate = useNavigate();
  const [isTutorialMode, setIsTutorialMode] = useState(false);
  const { playVoice, stopVoice } = useTutorialVoice();

  // 배경 이미지 경로 계산
  const bgImageSrc = adventureTypeId 
    ? `/adventurepage/adventure_${adventureTypeId}_background.png`
    : '/adventurepage/map_background.png';

  // [최적화 1] 컴포넌트 마운트 시 이미지 미리 로딩 (브라우저 캐시 태우기)
  useEffect(() => {
    const img = new Image();
    img.src = bgImageSrc;
    
    // 오버레이 이미지도 미리 로딩해두면 좋습니다
    const overlayImg = new Image();
    overlayImg.src = '/adventurepage/map_background.png';
  }, [bgImageSrc]);

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

  const getTutorialVoice = (): string => {
    switch (adventureTypeId) {
      case 1: return '회색 칸에 들어갈 글자를 골라보세요!';
      case 2: return '그림을 보고 빈칸에 들어갈 글자를 선택하세요!';
      case 3: return '그림을 보고 알맞은 단어를 선택하세요!';
      case 4: return '단어를 보고 똑같이 말해보세요!';
      default: return '문제를 풀어보세요!';
    }
  };

  const handleTutorialClick = () => {
    const goingToTutorial = !isTutorialMode;
    setIsTutorialMode(goingToTutorial);
    if (goingToTutorial) {
      playVoice('tutorial', getTutorialVoice());
    } else {
      stopVoice();
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: '#D4B896', // 이미지가 뜨기 전 잠깐 보일 색상
        minWidth: '100vw',
      }}
    >
      {/* [최적화 2] CSS backgroundImage 대신 img 태그 사용 
          - fetchPriority="high": 브라우저에게 최우선 다운로드 요청
          - loading="eager": 지연 로딩 방지
      */}
      <img 
        src={bgImageSrc}
        alt="Background"
        fetchPriority="high"
        loading="eager"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* 양피지 배경 장식 (탐험 배경 위에 오버레이) */}
      {/* z-index를 0으로 유지하되 DOM 순서상 배경 이미지 뒤에 오므로 위에 겹쳐짐 */}
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

      {/* 튜토리얼 오버레이 */}
      <TutorialOverlay active={isTutorialMode} />

      {/* 상단 액션 바 */}
      <TopActionsBar
        onTutorialClick={handleTutorialClick}
        onExitConfirm={onExitConfirm}
        isCompleted={false}
      />

      {/* Runner 컴포넌트 */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        {children(isTutorialMode)}
      </div>
    </div>
  );
};