// 여러개의 선택지 버튼(OptionButton)을 관리&배치
import { OptionButton } from './OptionButton';

type OptionsListProps = {
  options: string[];               // 선택지 배열
  correctAnswer: string;           // 정답
  selectedAnswer: string | null;   // 현재 선택된 답
  wrongAnswers: string[];          // 오답 목록
  isAnswered: boolean;             // 정답 맞춤 여부
  isAnimating: boolean;            // 오답 애니메이션 중
  isTutorialMode: boolean;         // 튜토리얼 모드
  onSelect: (option: string) => void; // 선택 핸들러
};

export const OptionsList = ({
  options,
  correctAnswer,
  selectedAnswer,
  wrongAnswers,
  isAnswered,
  isAnimating,
  isTutorialMode,
  onSelect
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
          />
        );
      })}
    </div>
  );
};
