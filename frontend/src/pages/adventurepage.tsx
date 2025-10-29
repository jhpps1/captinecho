import { Link } from 'react-router-dom';
import { useState } from 'react';
import AnswerFeedback from '../components/AnswerFeedback';
import { HelpCircle, DoorOpen } from 'lucide-react';

const AdventurePage = () => {
  // 예시 문제
  const [visiblePart] = useState('ㄱ');
  const [hiddenPart] = useState('ㅏ');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);  // 오답 목록
  const [isAnswered, setIsAnswered] = useState(false);  // 정답 완료 여부
  const [isAnimating, setIsAnimating] = useState(false);  // 애니메이션 진행 중

  const options = ['ㄴ', 'ㅏ', 'ㅡ'];

  const handleOptionClick = (option: string) => {
    // 이미 정답을 맞췄거나, 이미 틀린 답이거나, 애니메이션 중이면 무시
    if (isAnswered || wrongAnswers.includes(option) || isAnimating) return;

    setSelectedAnswer(option);

    if (option === hiddenPart) {
      // 정답인 경우
      console.log('정답!');
      setIsAnswered(true);
    } else {
      // 오답인 경우
      console.log('오답!');
      
      // 애니메이션 시작
      setIsAnimating(true);
      
      // 오답 목록에 추가
      setWrongAnswers(prev => [...prev, option]);
      
      // 애니메이션 완료 후 선택 초기화
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsAnimating(false);  // 애니메이션 종료
      }, 1000);  // X 표시 1초 보여준 후
    }
  };

  const isCorrect = (option: string) => {
    return selectedAnswer === option && option === hiddenPart;
  };

  // 전체 문제가 정답인지 확인
  const isQuestionCorrect = selectedAnswer === hiddenPart && isAnswered;

  return (
    <div 
      className="flex flex-col h-screen relative"
      style={{
        backgroundImage: 'url(/adventurepage/adventure_1_background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#D4B896'
      }}
    >
      {/* 상단 아이콘 */}
      <header className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-2 sm:gap-3 z-10">
        {/* 물음표 버튼 */}
        <button 
          className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          onClick={() => console.log('Help clicked')}
        >
          <HelpCircle 
            className="text-gray-700" 
            size={24}
          />
        </button>
        
        {/* 게임 나가기 버튼 */}
        <Link 
          to="/"
          className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <DoorOpen
            className="text-gray-700" 
            size={24}
          />
        </Link>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pb-16 sm:pb-20">
        {/* 문제 카드 */}
        <div className="mb-12 sm:mb-16">
          <div className="w-[85vw] max-w-2xl h-40 sm:h-48 md:h-56 bg-white rounded-3xl shadow-2xl flex items-center justify-center border-4 sm:border-6 border-gray-800">
            <div className="flex items-center gap-0">
              {/* 선명한 글자 */}
              <div className="text-7xl sm:text-8xl md:text-9xl font-bold text-gray-800">
                {visiblePart}
              </div>
              
              {/* 흐린 글자 - 정답이면 검정색으로 변경 */}
              <div className={`text-7xl sm:text-8xl md:text-9xl font-bold -ml-2 sm:-ml-3 transition-colors duration-300 ${
                isQuestionCorrect ? 'text-gray-800' : 'text-gray-300'
              }`}>
                {hiddenPart}
              </div>
            </div>
          </div>
        </div>

        {/* 선택지 */}
        <div className="flex gap-4 sm:gap-6 md:gap-8">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option)}
              disabled={isAnswered || wrongAnswers.includes(option) || isAnimating}  // 정답 완료, 이미 틀린 답, 애니메이션 중 비활성화
              className={`
                w-28 h-28
                sm:w-36 sm:h-36
                md:w-40 md:h-40
                bg-white
                rounded-2xl md:rounded-3xl
                shadow-xl
                border-4 sm:border-5
                border-gray-800
                flex items-center justify-center
                text-5xl sm:text-6xl md:text-7xl
                font-bold text-gray-800
                ${!isAnswered && !wrongAnswers.includes(option) && !isAnimating ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}
                active:scale-95
                transition-all duration-200
                relative
              `}
            >
              {/* 글자 - 정답이거나 오답이면 흐리게 */}
              <span className={isCorrect(option) || wrongAnswers.includes(option) ? 'opacity-20' : ''}>
                {option}
              </span>
              
              {/* 정답 O 표시 */}
              {isCorrect(option) && <AnswerFeedback isCorrect={true} />}
              
              {/* 오답 X 표시 - wrongAnswers에 포함되어 있으면 표시 */}
              {wrongAnswers.includes(option) && <AnswerFeedback isCorrect={false} />}
            </button>
          ))}
        </div>
      </main>

      {/* 캐릭터 이미지 - 우측 하단 */}
      {(isAnswered || selectedAnswer) && (
        <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-10 animate-bounce-in">
          <img
            src={isQuestionCorrect ? '/adventurepage/happy_eco.png' : '/adventurepage/question_eco.png'}
            alt={isQuestionCorrect ? '정답 캐릭터' : '오답 캐릭터'}
            className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 object-contain"
          />
        </div>
      )}

      {/* 애니메이션을 위한 스타일 추가 */}
      <style>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0) translateY(20px);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) translateY(-10px);
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdventurePage;