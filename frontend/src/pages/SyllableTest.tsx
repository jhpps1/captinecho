import React from 'react';
import { SyllableSVG } from '../components/game/SyllableSVG';

const TEST_CASES = [
  { label: '세로 모음', syllables: ['가', '나', '다', '사', '자'] },
  { label: '가로 모음', syllables: ['고', '누', '도', '소', '주'] },
  { label: '복합 모음', syllables: ['과', '돼', '쇠', '귀', '의'] },
  { label: '세로+종성', syllables: ['각', '난', '달', '산', '잘'] },
  { label: '가로+종성', syllables: ['곰', '눈', '돌', '숲', '줄'] },
];

export const SyllableTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">한글 자모 분해 테스트</h1>

      {TEST_CASES.map((category) => (
        <div key={category.label} className="mb-12">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">{category.label}</h2>
          <div className="grid grid-cols-5 gap-6">
            {category.syllables.map((syllable) => (
              <div key={syllable} className="bg-white rounded-lg p-4 shadow">
                <div className="text-center font-bold mb-2 text-gray-600">{syllable}</div>

                <div className="grid grid-cols-3 gap-3">
                  {/* 초성 강조 */}
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 mb-1">초성</span>
                    <SyllableSVG syllable={syllable} highlightIndex={0} className="w-20 h-20" />
                  </div>

                  {/* 중성 강조 */}
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 mb-1">중성</span>
                    <SyllableSVG syllable={syllable} highlightIndex={1} className="w-20 h-20" />
                  </div>

                  {/* 종성 강조 */}
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 mb-1">종성</span>
                    <SyllableSVG syllable={syllable} highlightIndex={2} className="w-20 h-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
