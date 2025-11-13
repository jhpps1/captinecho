import Hangul from 'hangul-js';
import { getJamoPositions, calculateScale, type JamoPosition } from '../../utils/hangulSVGPositions';
import type { ProblemData } from '../../types/problem';

type SingleSyllableCardProps = {
  problem: ProblemData;
  isAnswered?: boolean;
};

// The 'part' property is available again on JamoPosition
const getPartForJamo = (jamo: JamoPosition): 'INITIAL' | 'MEDIAL' | 'FINAL' => {
  if (jamo.part === 'L') return 'INITIAL';
  if (jamo.part === 'V') return 'MEDIAL';
  return 'FINAL'; // 'T'
};

export const SingleSyllableCard = ({ problem, isAnswered = false }: SingleSyllableCardProps) => {
  const syllable = Hangul.assemble([problem.initial, problem.medial, problem.final].filter(Boolean) as string[]);
  const positions = getJamoPositions(syllable);
  const scale = calculateScale(positions, 73);

  // Handle case where syllable might be empty or invalid
  if (positions.length === 0) {
    return (
      <div className="w-[90vw] max-w-3xl h-48 sm:h-56 md:h-64 bg-white rounded-3xl shadow-2xl flex items-center justify-center border-4 sm:border-6 border-gray-800 p-4">
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
    <div className="w-[90vw] max-w-3xl h-48 sm:h-56 md:h-64 bg-white rounded-3xl shadow-2xl flex items-center justify-center border-4 sm:border-6 border-gray-800 p-4">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <g transform={`translate(50, 50) scale(${scale}) translate(-50, -50)`}>
          {positions.map((pos, index) => {
            const part = getPartForJamo(pos);
            const isHidden = part === problem.hiddenTarget && !isAnswered;
            const charToShow = pos.char; // Always show the character

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
        </g>
      </svg>
    </div>
  );
};
