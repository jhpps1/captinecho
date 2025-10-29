import { Link } from 'react-router-dom';
import { useState } from 'react';
import AnswerFeedback from '../components/AnswerFeedback';
import { HelpCircle, DoorOpen } from 'lucide-react';

const AdventurePage = () => {
  // 예시 문제
  const [visiblePart] = useState('ㄱ');
  const [hiddenPart] = useState('ㅏ');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  
  const options = ['ㄴ', 'ㅏ', 'ㅡ'];

  const handleOptionClick = (option: string) => {
    setSelectedAnswer(option);
    
    if (option === hiddenPart) {
      console.log('정답!');
    } else {
      console.log('오답!');
    }
  };

  const isCorrect = (option: string) => {
    return selectedAnswer === option && option === hiddenPart;
  };

  const isWrong = (option: string) => {
    return selectedAnswer === option && option !== hiddenPart;
  };

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
      size={24}  // 또는 sm 사이즈에 따라 조절
    />
  </button>
  
  {/* 게임 나가기 버튼 */}
  <Link to="/">
  <button 
    className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
    onClick={() => console.log('Notes clicked')}
  >
    <DoorOpen
      className="text-gray-700" 
      size={24}
    />
  </button>
  </Link>
</header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pb-16 sm:pb-20">
        {/* 문제 카드 */}
        <div className="mb-12 sm:mb-16">
          <div className="w-[85vw] max-w-2xl h-40 sm:h-48 md:h-56 bg-white rounded-3xl shadow-2xl flex items-center justify-center border-4 sm:border-6 border-gray-800">
            <div className="flex items-center gap-0">
              <div className="text-7xl sm:text-8xl md:text-9xl font-bold text-gray-800">
                {visiblePart}
              </div>
              
              <div className="text-7xl sm:text-8xl md:text-9xl font-bold text-gray-300 -ml-2 sm:-ml-3">
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
                hover:scale-105 
                active:scale-95
                transition-all duration-200
                cursor-pointer
                relative
              `}
            >
              <span className={selectedAnswer === option ? 'opacity-20' : ''}>
                {option}
              </span>
              
              {isCorrect(option) && <AnswerFeedback isCorrect={true} />}
              {isWrong(option) && <AnswerFeedback isCorrect={false} />}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdventurePage;