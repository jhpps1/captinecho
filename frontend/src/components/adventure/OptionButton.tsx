// 개별 선택지 버튼
import AnswerFeedback from './AnswerFeedback';

type OptionButtonProps = {
  option: string;
  isCorrectNow: boolean;
  wasTriedAndWrong: boolean;
  disabled: boolean;
  onClick: () => void;
  variant?: 'square' | 'rectangle';
};

export const OptionButton = ({
  option,
  isCorrectNow,
  wasTriedAndWrong,
  disabled,
  onClick,
  variant = 'square'
}: OptionButtonProps) => {
  const isLong = option.length >= 3;

  const sizeClass = variant === 'rectangle'
    ? 'w-32 h-20 sm:w-40 sm:h-24 md:w-60 md:h-40'
    : 'w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40';

  const textSizeClass = variant === 'rectangle'
    ? (isLong ? 'text-3xl sm:text-4xl md:text-5xl' : 'text-4xl sm:text-5xl md:text-6xl')
    : (isLong ? 'text-5xl sm:text-6xl md:text-6xl' : 'text-5xl sm:text-6xl md:text-7xl');

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClass}
        bg-white rounded-2xl md:rounded-3xl shadow-xl
        border-4 sm:border-5 border-gray-800
        flex items-center justify-center
        ${textSizeClass} font-bold text-gray-800
        transition-all duration-200 relative
        ${!disabled ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'cursor-default pointer-events-none'}
      `}
    >
      <span 
        className={`${isCorrectNow || wasTriedAndWrong ? 'opacity-20' : ''}
                    break-keep whitespace-nowrap leading-none`}
      >
        {option}
      </span>
      {isCorrectNow && <AnswerFeedback isCorrect={true} />}
      {wasTriedAndWrong && <AnswerFeedback isCorrect={false} />}
    </button>
  );
};
