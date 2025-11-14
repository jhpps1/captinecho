import { useEffect, useState } from 'react';

type FeedbackCharacterProps = {
  visible: boolean;
  isCorrect: boolean;
};

export const FeedbackCharacter = ({ visible, isCorrect }: FeedbackCharacterProps) => {
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

      // 3초 후: 페이드아웃 시작
      const fadeTimer = setTimeout(() => {
        setAnimationState('fadeOut');
      }, 3000);

      // 3.5초 후: 완전히 제거
      const hideTimer = setTimeout(() => {
        setShow(false);
        setAnimationState('hidden');
      }, 3500);

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
      <img
        src={isCorrect ? '/adventurepage/happy_eco.png' : '/adventurepage/question_eco.png'}
        alt={isCorrect ? '정답 캐릭터' : '오답 캐릭터'}
        loading="eager"
        className="w-56 h-56 sm:w-72 sm:h-72 md:w-100 md:h-100 object-contain"
      />
    </div>
  );
};
