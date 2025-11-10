import React from 'react';
import { getJamoPositions } from '../../utils/hangulSVGPositions';
import type { JamoPosition } from '../../utils/hangulSVGPositions';

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

  const fillFor = (p: JamoPosition) => {
    if (p.part === 'L' && highlightIndex === 0) return mutedColor;
    if (p.part === 'V' && highlightIndex === 1) return mutedColor;
    if (p.part === 'T' && highlightIndex === 2) return mutedColor;
    return color;
  };

  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      {pos.map((p, i) => (
        <text
          key={`${p.part}-${p.char}-${i}`}
          x={p.x}
          y={p.y}
          fontSize={p.fontSize}
          fontWeight={700}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={fillFor(p)}
          fontFamily={fontFamily}
        >
          {p.char}
        </text>
      ))}
    </svg>
  );
};