// 여러개의 선택지 버튼(OptionButton)을 관리&배치
import { OptionButton } from './OptionButton';

type OptionsListProps = {
  options: string[];
  correctAnswer: string;
  selectedAnswer: string | null;
  wrongAnswers: string[];
  isAnswered: boolean;
  isAnimating: boolean;
  isTutorialMode: boolean;
  onSelect: (option: string) => void;
  variant?: 'square' | 'rectangle';
};

export const OptionsList = ({
  options,
  correctAnswer,
  selectedAnswer,
  wrongAnswers,
  isAnswered,
  isAnimating,
  isTutorialMode,
  onSelect,
  variant = 'square'
}: OptionsListProps) => {
  return (
    <div className="flex gap-4 sm:gap-6 md:gap-8">
      {options.map((option, index) => {
        const isCorrectNow = selectedAnswer === option && option === correctAnswer;
        const wasTriedAndWrong = wrongAnswers.includes(option);
        const disabled = isAnswered || wasTriedAndWrong || isAnimating || isTutorialMode;

        return (
          <OptionButton
            key={index}
            option={option}
            isCorrectNow={isCorrectNow}
            wasTriedAndWrong={wasTriedAndWrong}
            disabled={disabled}
            onClick={() => onSelect(option)}
            variant={variant}
          />
        );
      })}
    </div>
  );
};
