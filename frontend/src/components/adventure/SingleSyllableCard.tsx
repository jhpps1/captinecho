// 단일 음절 카드 컴포넌트 (Adventure1)
// 초성/중성/종성을 분리하여 표시하며, 하나의 음소를 빈칸으로 표시
import type { ProblemData } from '../../types/problem';
import { bottomMostLineClass, getTopBlockClass } from '../../utils/hangulUtils';

type SingleSyllableCardProps = {
  problem: ProblemData;
  vowelLayoutType: string;
  vowelParts: { type: string; top: string; bottom: string | null };
  getColorClassForPart: (part: 'initial' | 'medialTop' | 'medialBottom' | 'final') => string;
};

export const SingleSyllableCard = ({
  problem,
  vowelLayoutType,
  vowelParts,
  getColorClassForPart
}: SingleSyllableCardProps) => {
  return (
    <div className="w-[85vw] max-w-2xl h-40 sm:h-48 md:h-56 bg-white rounded-3xl shadow-2xl flex items-center justify-center border-4 sm:border-6 border-gray-800">
      <div className="flex flex-col items-center justify-center m-0 p-0 gap-0 transition-all duration-300">
        {/* 줄 1: 초성 + 모음 top/single */}
        <div className={getTopBlockClass(vowelLayoutType)}>
          <span className={`text-7xl sm:text-8xl md:text-9xl font-bold ${getColorClassForPart('initial')}`}>
            {problem.initial}
          </span>
          {vowelParts.top && (
            <span className={`text-7xl sm:text-8xl md:text-9xl font-bold ${getColorClassForPart('medialTop')}`}>
              {vowelParts.top}
            </span>
          )}
        </div>

        {/* 줄 2: 복합 모음의 아래 파트 */}
        {vowelParts.bottom && (
          <div className="flex items-center justify-center m-0 p-0 gap-0 translate-y-0">
            <span className={`text-7xl sm:text-8xl md:text-9xl font-bold ${getColorClassForPart('medialBottom')}`}>
              {vowelParts.bottom}
            </span>
          </div>
        )}

        {/* 줄 3: 받침(종성) */}
        {problem.final && (
          <div className={bottomMostLineClass}>
            <span className={`text-7xl sm:text-8xl md:text-9xl font-bold ${getColorClassForPart('final')}`}>
              {problem.final}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
