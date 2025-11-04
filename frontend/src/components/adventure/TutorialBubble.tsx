// 튜토리얼 텍스트 박스 설정
// 텍스트 내용 각각 탐험 페이지에서 설정
type TutorialBubbleProps = {
  text: string;           // 안내 텍스트
  className?: string;     // 추가 스타일 (위치/여백 조정용)
};

export const TutorialBubble = ({ text, className = '' }: TutorialBubbleProps) => {
  return (
    <p className={`
      text-xl sm:text-2xl md:text-3xl font-bold text-gray-800
      text-center bg-white/80 rounded-xl px-4 sm:px-6 py-2
      border-2 border-gray-800 shadow-md
      whitespace-normal break-keep
      ${className}
    `}>
      {text}
    </p>
  );
};
