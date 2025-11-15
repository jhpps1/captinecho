import { useEffect, useState } from 'react';

type FeedbackCharacterProps = {
  visible: boolean;
  isCorrect: boolean;
  message?: string;
};

export const FeedbackCharacter = ({ visible, isCorrect, message }: FeedbackCharacterProps) => {
  const [show, setShow] = useState(false);
  const [animationState, setAnimationState] = useState<'hidden' | 'pop' | 'stable' | 'fadeOut'>('hidden');

  useEffect(() => {
    if (visible) {
      setShow(true);
      setAnimationState('hidden');

      // 50ms 후: 페이드인 + 팝 효과 시작 (초기 렌더링 완료 대기)
      const popTimer = setTimeout(() => {
        setAnimationState('pop');
      }, 50);

      // 400ms 후: 안정화 (팝에서 정상 크기로)
      const stableTimer = setTimeout(() => {
        setAnimationState('stable');
      }, 400);

      // 4초 후: 페이드아웃 시작
      const fadeTimer = setTimeout(() => {
        setAnimationState('fadeOut');
      }, 4000);

      // 4.5초 후: 완전히 제거
      const hideTimer = setTimeout(() => {
        setShow(false);
        setAnimationState('hidden');
      }, 4500);

      return () => {
        clearTimeout(popTimer);
        clearTimeout(stableTimer);
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    } else {
      setShow(false);
      setAnimationState('hidden');
    }
  }, [visible]);

  if (!show) return null;

  // 상태별 클래스: 반짝 등장 효과
  const getStateClass = () => {
    switch (animationState) {
      case 'hidden':
        return 'opacity-0 scale-0 invisible'; // 완전히 숨김
      case 'pop':
        return 'opacity-100 scale-110 visible'; // 반짝 효과 (커짐)
      case 'stable':
        return 'opacity-100 scale-100 visible'; // 정상 크기
      case 'fadeOut':
        return 'opacity-0 scale-95 visible'; // 작아지며 사라짐
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
      {/* 말풍선 (캐릭터 위에 표시) */}
      {message && (
        <div className="absolute bottom-full mb-4 right-0 min-w-max">
          <div className="relative bg-yellow-100 border-2 border-yellow-400 px-10 py-5 sm:px-12 sm:py-6 rounded-2xl shadow-lg animate-bounce">
            <p className="text-2xl sm:text-3xl font-bold text-gray-800 whitespace-nowrap">{message}</p>
            {/* 말풍선 꼬리 */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[15px] border-r-[15px] border-t-[15px] border-l-transparent border-r-transparent border-t-yellow-400"></div>
          </div>
        </div>
      )}

      {/* 캐릭터 이미지 */}
      <img
        src={isCorrect ? '/adventurepage/happy_eco.png' : '/adventurepage/question_eco.png'}
        alt={isCorrect ? '정답 캐릭터' : '오답 캐릭터'}
        loading="eager"
        className="w-56 h-56 sm:w-72 sm:h-72 md:w-100 md:h-100 object-contain"
      />
    </div>
  );
};
