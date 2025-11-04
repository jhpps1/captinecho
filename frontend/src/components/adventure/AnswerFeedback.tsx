// 정답/오답 표시
interface AnswerFeedbackProps {
  isCorrect: boolean;
}

const AnswerFeedback = ({ isCorrect }: AnswerFeedbackProps) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {isCorrect ? (
        // 정답 O - 더 크게
        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-8 md:border-10 border-green-500"></div>
      ) : (
        // 오답 X - 더 크게
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28">
          <div className="absolute top-0 left-1/2 w-2 md:w-3 h-full bg-red-500 origin-center rotate-45 -translate-x-1/2"></div>
          <div className="absolute top-0 left-1/2 w-2 md:w-3 h-full bg-red-500 origin-center -rotate-45 -translate-x-1/2"></div>
        </div>
      )}
    </div>
  );
};

export default AnswerFeedback;