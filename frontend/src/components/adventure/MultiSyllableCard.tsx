// 여러 음절 단어 카드 컴포넌트 (Adventure2) — SVG/JamoPosition 방식
import Hangul from 'hangul-js';
import { getJamoPositions, type JamoPosition } from '../../utils/hangulSVGPositions';

export interface SyllableData {
  initial: string;
  medial: string;
  final?: string;
  hiddenTarget?: 'INITIAL' | 'MEDIAL' | 'FINAL';
}

interface MultiSyllableCardProps {
  syllables: SyllableData[];   // 2~3개 음절
  isAnswered: boolean;         // 정답 여부
  /** 'transparent' = 감추기, 'box' = 사각형 표시 */
  hideStyle?: 'transparent' | 'box';
}

const getPartForJamo = (j: JamoPosition): 'INITIAL' | 'MEDIAL' | 'FINAL' => {
  if (j.part === 'L') return 'INITIAL';
  if (j.part === 'V') return 'MEDIAL';
  return 'FINAL'; // 'T'
};

// SVG 글자 주변 박스 근사치
const getBoxForJamo = (pos: JamoPosition) => {
  const w = pos.fontSize * 0.78;
  const h = pos.fontSize * 0.98;
  return {
    x: pos.x - w / 2,
    y: pos.y - h / 2,
    width: w,
    height: h,
    rx: Math.max(2, pos.fontSize * 0.08),
  };
};

export const MultiSyllableCard = ({
  syllables,
  isAnswered,
  hideStyle = 'transparent',
}: MultiSyllableCardProps) => {
  // syllable 하나를 SVG로 렌더
  const renderSyllableSVG = (syllable: SyllableData, key: number) => {
    const syllableChar = Hangul.assemble(
      [syllable.initial, syllable.medial, syllable.final].filter(Boolean) as string[],
    );
    const positions = getJamoPositions(syllableChar);

    // 잘못된 입력 방어
    if (positions.length === 0) {
      return (
        <div
          key={key}
          className="w-[26vw] max-w-28 min-w-20 h-36 sm:h-44 md:h-52 flex items-center justify-center"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <text
              x="50"
              y="50"
              fontSize="80"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#A1A1AA"
            >
              _
            </text>
          </svg>
        </div>
      );
    }

    return (
      <div
        key={key}
        className="w-[26vw] max-w-28 min-w-20 h-36 sm:h-44 md:h-52 flex items-center justify-center"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {positions.map((pos, i) => {
            const part = getPartForJamo(pos);
            const isHidden = syllable.hiddenTarget === part && !isAnswered;

            if (isHidden && hideStyle === 'transparent') {
              // 자리만 비우기 (좌표 절대값이라 레이아웃 영향 없음)
              return null;
            }

            if (isHidden && hideStyle === 'box') {
              const box = getBoxForJamo(pos);
              return (
                <g key={i}>
                  <rect
                    x={box.x}
                    y={box.y}
                    width={box.width}
                    height={box.height}
                    rx={box.rx}
                    fill="#FFFFFF"
                    stroke="#000000"
                    strokeWidth={Math.max(1.5, pos.fontSize * 0.06)}
                  />
                </g>
              );
            }

            // 일반 표시
            return (
              <text
                key={i}
                x={pos.x}
                y={pos.y}
                fontSize={pos.fontSize}
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#18181B"
                fontFamily="'Noto Sans KR', sans-serif"
              >
                {pos.char}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="w-[90vw] max-w-3xl h-40 sm:h-48 md:h-56 bg-white rounded-3xl shadow-2xl flex items-center justify-center border-4 sm:border-6 border-gray-800 px-4">
      <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
        {syllables.map((syllable, idx) => renderSyllableSVG(syllable, idx))}
      </div>
    </div>
  );
};
