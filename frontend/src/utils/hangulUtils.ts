// 복합/단일 모음을 화면에 배치하기 위한 한글 분해 유틸
export function splitVowelForLayout(vowel: string) {
  // 복합 모음들은 top / bottom 두 파트로 쪼개서 보여줄 것
  switch (vowel) {
    case 'ㅘ':
      return { type: 'complex', top: 'ㅏ', bottom: 'ㅗ' };
    case 'ㅝ':
      return { type: 'complex', top: 'ㅓ', bottom: 'ㅜ' };
    case 'ㅚ':
      return { type: 'complex', top: 'ㅣ', bottom: 'ㅗ' };
    case 'ㅟ':
      return { type: 'complex', top: 'ㅣ', bottom: 'ㅜ' };
    case 'ㅢ':
      return { type: 'complex', top: 'ㅣ', bottom: 'ㅡ' };
    default:
      // 단일/기본형 모음은 분해 필요 없음
      return { type: 'single', top: vowel, bottom: null };
  }
}

// 모음이 어떤 계열인지(가로/세로/복합) → 윗줄(초성+모음 윗부분) 배치 스타일 보정
export function getVowelLayoutType(vowel: string) {
  const horizontal = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅣ', 'ㅔ', 'ㅐ'];
  const vertical = ['ㅗ', 'ㅛ', 'ㅜ', 'ㅠ']; // 아래로 내려가는 계열
  const complex = ['ㅘ', 'ㅝ', 'ㅚ', 'ㅟ', 'ㅢ']; // 우리가 분해해서 그릴 애들

  if (horizontal.includes(vowel)) return 'horizontal';
  if (vertical.includes(vowel)) return 'vertical';
  if (complex.includes(vowel)) return 'complex';
  return 'horizontal';
}

/**
 * layoutType별로 top(초성 + 모음 윗부분/단일모음)을 어떻게 배치할지
 * - margin/padding/gap을 최소화해서 tight하게 구성
 * - translate/scale은 최소한만 유지해서 겹침만 막음
 */
export function getTopBlockClass(layoutType: string) {
  switch (layoutType) {
    case 'vertical':
      // 세로형 모음(ㅗ, ㅜ 등): 초성과 모음이 실제로는 상하로 배치되는 느낌이라
      // flex-col로 쌓되 gap을 최소화
      return `
        flex flex-col items-center justify-center
        m-0 p-0 gap-[0.05rem]
        -translate-y-[0.1rem] scale-[1.03]
      `;
    case 'complex':
      // 복합 모음(ㅘ 등): top 파트는 초성과 같은 줄에 두고,
      // 살짝만 올리고 살짝 키우기
      return `
        flex flex-row items-center justify-center
        m-0 p-0 gap-[0.05rem]
        -translate-y-[0.15rem] scale-[1.07]
      `;
    default:
      // horizontal 계열(ㅏ, ㅑ, ㅓ 등): 초성과 모음이 가로로 나란히
      return `
        flex flex-row items-center justify-center
        m-0 p-0 gap-[0.05rem]
        translate-y-0 scale-[1.0]
      `;
  }
}

// 받침 줄(final)을 감싸는 클래스
// 여기도 margin/padding 거의 제거
export const bottomMostLineClass = `
  flex items-center justify-center
  m-0 p-0
  translate-y-0
`;

// 유틸: 현재 문제에서 "정답이어야 하는 글자"를 구한다
export function getCorrectAnswerForProblem(p: {
  initial: string;
  medial: string;
  final?: string;
  hiddenTarget: 'initial' | 'medial' | 'final';
}) {
  if (p.hiddenTarget === 'initial') return p.initial;
  if (p.hiddenTarget === 'medial') return p.medial;
  if (p.hiddenTarget === 'final') return p.final ?? '';
  return '';
}
