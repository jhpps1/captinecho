// 개별 선택지 버튼
import AnswerFeedback from './AnswerFeedback';

type OptionButtonProps = {
  option: string;                  // 선택지 글자 (예: 'ㅏ')
  isCorrectNow: boolean;           // 현재 정답 선택 여부
  wasTriedAndWrong: boolean;       // 이미 오답으로 시도한 선택지
  disabled: boolean;               // 버튼 비활성화 여부
  onClick: () => void;             // 클릭 핸들러
};

export const OptionButton = ({
  option,
  isCorrectNow,
  wasTriedAndWrong,
  disabled,
  onClick
}: OptionButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40
        bg-white rounded-2xl md:rounded-3xl shadow-xl
        border-4 sm:border-5 border-gray-800
        flex items-center justify-center
        text-5xl sm:text-6xl md:text-7xl font-bold text-gray-800
        transition-all duration-200 relative
        ${!disabled ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'cursor-default pointer-events-none'}
      `}
    >
      <span className={isCorrectNow || wasTriedAndWrong ? 'opacity-20' : ''}>
        {option}
      </span>
      {isCorrectNow && <AnswerFeedback isCorrect={true} />}
      {wasTriedAndWrong && <AnswerFeedback isCorrect={false} />}
    </button>
  );
};
