import { useEffect, useState, useRef } from 'react';

type FeedbackCharacterProps = {
  visible: boolean;
  isCorrect: boolean;
  message?: string;
};

// 이미지 경로 상수화
const HAPPY_IMG = '/adventurepage/happy_eco.png';
const QUESTION_IMG = '/adventurepage/question_eco.png';

export const FeedbackCharacter = ({ visible, isCorrect, message }: FeedbackCharacterProps) => {
  // [수정 1] show 상태 제거 -> visible props로만 제어해도 충분함 (mount 유지를 위해)
  // 대신 애니메이션 단계를 관리
  const [animationState, setAnimationState] = useState<'hidden' | 'pop' | 'stable' | 'fadeOut'>('hidden');

  // [수정 2] 컴포넌트 마운트 시 이미지 2장 미리 강제 로딩 (브라우저 캐시에 저장)
  useEffect(() => {
    const preloadImages = [HAPPY_IMG, QUESTION_IMG];
    preloadImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    if (visible) {
      // 등장 로직
      setAnimationState('hidden'); // 일단 숨김 (위치 잡기)
      
      const popTimer = setTimeout(() => setAnimationState('pop'), 50);
      const stableTimer = setTimeout(() => setAnimationState('stable'), 400);

      return () => {
        clearTimeout(popTimer);
        clearTimeout(stableTimer);
      };
    } else {
      // 퇴장 로직
      if (animationState !== 'hidden') {
        setAnimationState('fadeOut');
        // 300ms 후 완전히 숨김 상태로 변경
        const hideTimer = setTimeout(() => setAnimationState('hidden'), 300);
        return () => clearTimeout(hideTimer);
      }
    }
  }, [visible]);

  // [수정 3] if (!show) return null; 삭제!
  // 대신 animationState가 'hidden'일 때 CSS로만 숨김 처리하여 DOM에 유지시킴

  const getStateClass = () => {
    switch (animationState) {
      case 'hidden':
        // opacity-0과 invisible로 화면에서만 안 보이게 처리 (이미지는 로딩된 상태 유지)
        return 'opacity-0 scale-0 invisible'; 
      case 'pop':
        return 'opacity-100 scale-110 visible';
      case 'stable':
        return 'opacity-100 scale-100 visible';
      case 'fadeOut':
        return 'opacity-0 scale-95 visible';
      default:
        return 'opacity-0 scale-0 invisible';
    }
  };

  return (
    <div
      className={`absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-10
                  origin-bottom-right will-change-transform
                  transition-all duration-300 ease-out
                  ${getStateClass()}`}
    >
      {/* 말풍선 */}
      {message && (
        <div className="absolute bottom-full mb-4 right-0 min-w-max">
          <div className="relative bg-yellow-100 border-2 border-yellow-400 px-10 py-5 sm:px-12 sm:py-6 rounded-2xl shadow-lg animate-bounce">
            <p className="text-2xl sm:text-3xl font-bold text-gray-800 whitespace-nowrap">{message}</p>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[15px] border-r-[15px] border-t-[15px] border-l-transparent border-r-transparent border-t-yellow-400"></div>
          </div>
        </div>
      )}

      {/* 캐릭터 이미지 */}
      {/* [수정 4] decoding="async" 추가 */}
      <img
        src={isCorrect ? HAPPY_IMG : QUESTION_IMG}
        alt={isCorrect ? '정답 캐릭터' : '오답 캐릭터'}
        loading="eager"
        decoding="async" 
        className="w-56 h-56 sm:w-72 sm:h-72 md:w-100 md:h-100 object-contain"
      />
    </div>
  );
};