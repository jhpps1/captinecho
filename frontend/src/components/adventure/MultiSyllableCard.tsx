// 여러 음절 단어 카드 컴포넌트 (Adventure2)
// 2-3개 음절로 구성된 단어를 표시하며, 하나의 음소가 빈칸으로 표시됨

import {
  splitVowelForLayout,
  getVowelLayoutType,
  getTopBlockClass,
  bottomMostLineClass,
} from '../../utils/hangulUtils';

// 단일 음절 데이터 타입
export interface SyllableData {
  initial: string;      // 초성
  medial: string;       // 중성
  final?: string;       // 종성 (선택적)
  hiddenTarget?: 'INITIAL' | 'MEDIAL' | 'FINAL';  // 빈칸으로 표시할 부분
}

// 컴포넌트 Props 타입
interface MultiSyllableCardProps {
  syllables: SyllableData[];  // 음절 배열 (2-3개)
  isAnswered: boolean;        // 정답을 맞췄는지 여부
}

export const MultiSyllableCard = ({
  syllables,
  isAnswered,
}: MultiSyllableCardProps) => {
  // 각 음절의 음소 색상 결정 함수
  const getColorClassForPart = (
    syllable: SyllableData,
    partName: 'initial' | 'medialTop' | 'medialBottom' | 'final'
  ) => {
    if (!syllable.hiddenTarget) {
      return 'text-gray-800'; // 빈칸이 없는 음절은 모두 검정
    }

    const isTargetInitial =
      syllable.hiddenTarget === 'INITIAL' && partName === 'initial';
    const isTargetFinal =
      syllable.hiddenTarget === 'FINAL' && partName === 'final';
    const isTargetMedial =
      syllable.hiddenTarget === 'MEDIAL' &&
      (partName === 'medialTop' || partName === 'medialBottom');

    const isTarget = isTargetInitial || isTargetFinal || isTargetMedial;

    // 정답 맞추기 전이면 검은 테두리 사각형, 맞춘 뒤면 검정
    if (isTarget && !isAnswered) {
      return 'text-white border-4 border-black bg-white px-2 py-1 rounded';
    }
    return 'text-gray-800';
  };

  return (
    <div className="w-[90vw] max-w-3xl h-40 sm:h-48 md:h-56 bg-white rounded-3xl shadow-2xl flex items-center justify-center border-4 sm:border-6 border-gray-800 px-4">
      {/* 음절들을 가로로 배치 */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
        {syllables.map((syllable, syllableIndex) => {
          // 각 음절의 모음 레이아웃 정보 계산
          const vowelLayoutType = getVowelLayoutType(syllable.medial);
          const vowelParts = splitVowelForLayout(syllable.medial);

          return (
            <div
              key={syllableIndex}
              className="flex flex-col items-center justify-center m-0 p-0 gap-0 transition-all duration-300"
            >
              {/* 줄 1: 초성 + 모음 top/single */}
              <div className={getTopBlockClass(vowelLayoutType)}>
                <span
                  className={`text-6xl sm:text-7xl md:text-8xl font-bold ${getColorClassForPart(
                    syllable,
                    'initial'
                  )}`}
                >
                  {syllable.initial}
                </span>
                {vowelParts.top && (
                  <span
                    className={`text-6xl sm:text-7xl md:text-8xl font-bold ${getColorClassForPart(
                      syllable,
                      'medialTop'
                    )}`}
                  >
                    {vowelParts.top}
                  </span>
                )}
              </div>

              {/* 줄 2: 복합 모음의 아래 파트 */}
              {vowelParts.bottom && (
                <div className="flex items-center justify-center m-0 p-0 gap-0 translate-y-0">
                  <span
                    className={`text-6xl sm:text-7xl md:text-8xl font-bold ${getColorClassForPart(
                      syllable,
                      'medialBottom'
                    )}`}
                  >
                    {vowelParts.bottom}
                  </span>
                </div>
              )}

              {/* 줄 3: 받침(종성) */}
              {syllable.final && (
                <div className={bottomMostLineClass}>
                  <span
                    className={`text-6xl sm:text-7xl md:text-8xl font-bold ${getColorClassForPart(
                      syllable,
                      'final'
                    )}`}
                  >
                    {syllable.final}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
