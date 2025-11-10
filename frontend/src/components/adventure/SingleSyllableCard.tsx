import Hangul from 'hangul-js';
import { getJamoPositions } from '../../utils/hangulSVGPositions';
import type { ProblemData } from '../../types/problem';

type SingleSyllableCardProps = {
  problem: ProblemData;
};

const getPartForJamo = (index: number): 'INITIAL' | 'MEDIAL' | 'FINAL' => {
  if (index === 0) return 'INITIAL';
  if (index === 1) return 'MEDIAL';
  return 'FINAL'; // Only possible if problem.final exists and positions has 3 elements
};

export const SingleSyllableCard = ({ problem }: SingleSyllableCardProps) => {
  const syllable = Hangul.assemble([problem.initial, problem.medial, problem.final].filter(Boolean) as string[]);
  const positions = getJamoPositions(syllable);

  // Handle case where syllable might be empty or invalid
  if (positions.length === 0) {
    return (
      <div className="w-[85vw] max-w-2xl h-40 sm:h-48 md:h-56 bg-white rounded-3xl shadow-2xl flex items-center justify-center border-4 sm:border-6 border-gray-800 p-4">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <text
            x="50"
            y="55"
            fontSize="80"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#A1A1AA" // zinc-500
          >
            _
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className="w-[85vw] max-w-2xl h-40 sm:h-48 md:h-56 bg-white rounded-3xl shadow-2xl flex items-center justify-center border-4 sm:border-6 border-gray-800 p-4">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {positions.map((pos, index) => {
          const part = getPartForJamo(index);
          const isHidden = part === problem.hiddenTarget;
          const charToShow = isHidden ? '_' : pos.char;

          return (
            <text
              key={index}
              x={pos.x}
              y={pos.y}
              fontSize={pos.fontSize}
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isHidden ? '#A1A1AA' : '#18181B'} // zinc-500 for hidden, zinc-900 for visible
              fontFamily="'Noto Sans KR', sans-serif"
            >
              {charToShow}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
