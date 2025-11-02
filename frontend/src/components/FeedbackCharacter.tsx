// 정답, 오답 시 에코 캐릭터가 나옴
type FeedbackCharacterProps = {
  visible: boolean;       // 표시 여부
  isCorrect: boolean;     // 정답 여부
};

export const FeedbackCharacter = ({ visible, isCorrect }: FeedbackCharacterProps) => {
  if (!visible) return null;

  return (
    <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-10 animate-bounce-in">
      <img
        src={isCorrect ? '/adventurepage/happy_eco.png' : '/adventurepage/question_eco.png'}
        alt={isCorrect ? '정답 캐릭터' : '오답 캐릭터'}
        className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 object-contain"
      />
    </div>
  );
};
