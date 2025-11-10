import React from 'react';
import { getJamoPositions } from '../../utils/hangulSVGPositions';

interface SyllableSVGProps {
  syllable: string;
  highlightIndex: number; // 0: 초성, 1: 중성, 2: 종성
  className?: string;
  color?: string;
  mutedColor?: string;
  fontFamily?: string;
}

export const SyllableSVG: React.FC<SyllableSVGProps> = ({
  syllable,
  highlightIndex,
  className = 'w-32 h-32',
  color = '#111827',
  mutedColor = '#9CA3AF',
  fontFamily = "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
}) => {
  const pos = getJamoPositions(syllable);
  if (pos.length === 0) return <div className={className}>?</div>;

  // JamoPosition에 'part' 속성이 없으므로, 배열 인덱스로 파트를 식별합니다.
  // 0: 초성, 1: 중성, 2: 종성
  const getFillColor = (index: number) => {
    return index === highlightIndex ? mutedColor : color;
  };

  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      {pos.map((p, i) => (
        <text
          key={`${p.char}-${i}`}
          x={p.x}
          y={p.y}
          fontSize={p.fontSize}
          fontWeight={700}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={getFillColor(i)}
          fontFamily={fontFamily}
        >
          {p.char}
        </text>
      ))}
    </svg>
  );
};