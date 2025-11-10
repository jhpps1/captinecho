import Hangul from 'hangul-js';
import overridesData from "./hangulSVGOverrides.json";

// Type assertion for the imported JSON
type SaveBlob = {
  patterns: unknown; // Patterns are not used in this hybrid approach
  overrides: Record<string, number[]>;
};
const { overrides } = overridesData as SaveBlob;


export type Part = 'L' | 'V' | 'T';
export interface JamoPosition {
  part: Part;       // L(초성) / V(중성) / T(종성)
  char: string;     // 출력할 개별 자모 (복합이면 분해된 한 글자씩)
  x: number;        // viewBox 100 기준
  y: number;        // viewBox 100 기준
  fontSize: number; // px
}

/** 복합 모음: [가로 성분, 우측 세로 성분] */
const COMPLEX_VOWEL_MAP: Record<string, [string, string]> = {
  'ㅘ': ['ㅗ','ㅏ'], 'ㅙ': ['ㅗ','ㅐ'], 'ㅚ': ['ㅗ','ㅣ'],
  'ㅝ': ['ㅜ','ㅓ'], 'ㅞ': ['ㅜ','ㅔ'], 'ㅟ': ['ㅜ','ㅣ'],
  'ㅢ': ['ㅡ','ㅣ'],
};

/** 겹받침(복합 종성) 분해 */
const COMPLEX_FINAL_MAP: Record<string, [string, string]> = {
  'ㄳ': ['ㄱ','ㅅ'], 'ㄵ': ['ㄴ','ㅈ'], 'ㄶ': ['ㄴ','ㅎ'],
  'ㄺ': ['ㄹ','ㄱ'], 'ㄻ': ['ㄹ','ㅁ'], 'ㄼ': ['ㄹ','ㅂ'],
  'ㄽ': ['ㄹ','ㅅ'], 'ㄾ': ['ㄹ','ㅌ'], 'ㄿ': ['ㄹ','ㅍ'], 'ㅀ': ['ㄹ','ㅎ'],
  'ㅄ': ['ㅂ','ㅅ'],
};

const VERTICAL_VOWELS = new Set(['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅣ']);
const HORIZONTAL_VOWELS = new Set(['ㅗ','ㅛ','ㅜ','ㅠ','ㅡ']);

type VowelType = 'vertical' | 'horizontal' | 'complex';
const getVowelType = (v: string): VowelType =>
  v in COMPLEX_VOWEL_MAP ? 'complex'
  : VERTICAL_VOWELS.has(v) ? 'vertical'
  : HORIZONTAL_VOWELS.has(v) ? 'horizontal'
  : 'vertical';

/** 복합 종성인지 여부 */
const isComplexFinal = (t: string | undefined) => !!t && t in COMPLEX_FINAL_MAP;

/**
 * 한글 음절을 자모로 분해하고 좌표를 계산해서 반환
 * - 우선적으로 `hangulSVGOverrides.json` 에서 좌표를 찾습니다.
 * - 오버라이드가 없으면 규칙 기반으로 계산하며, 복합 모음/겹받침은 각각 2개의 글리프로 분해해서 배치합니다.
 */
export function getJamoPositions(syllable: string): JamoPosition[] {
  // 1. Check for a direct override from JSON
  const overrideCoords = overrides[syllable];
  if (overrideCoords) {
    const [L, V, T] = Hangul.disassemble(syllable, true) as unknown as [string, string, string?];
    const positions: JamoPosition[] = [];
    const [x1, y1, s1, x2, y2, s2, x3, y3, s3] = overrideCoords;

    if (L) positions.push({ part: 'L', char: L, x: x1, y: y1, fontSize: s1 });
    if (V) positions.push({ part: 'V', char: V, x: x2, y: y2, fontSize: s2 });
    if (T && overrideCoords.length >= 9) {
      positions.push({ part: 'T', char: T, x: x3, y: y3, fontSize: s3 });
    }
    return positions;
  }

  // 2. If no override, proceed with rule-based calculation and splitting
  const [L, V, T] = Hangul.disassemble(syllable, false) as [string, string, string?];
  if (!L || !V) return [];

  const hasT = !!T;
  const vowelType = getVowelType(V);

  const pos: JamoPosition[] = [];
  const FS = hasT ? 38 : 45; // 종성 있으면 살짝 줄임

  // --- 초성 기본 위치 (폰트 상수: 필요시 1~2px 조정) ---
  const Lx = hasT ? 25 : 26;
  const Ly = hasT ? 42 : 52;

  // --- 종성 기준점 ---
  const TcenterX = 45;
  const TbaseY   = hasT ? 78 : 78; // 동일하게 잡고 복합일 때만 좌우 분산

  // === 초성 ===
  pos.push({ part: 'L', char: L, x: Lx, y: Ly, fontSize: FS });

  // === 중성 ===
  if (vowelType === 'vertical') {
    // 세로 모음: 초성 우측
    const Vx = hasT ? 58 : 60;
    const Vy = hasT ? 42 : 55;
    pos.push({ part: 'V', char: V, x: Vx, y: Vy, fontSize: FS });
  } else if (vowelType === 'horizontal') {
    // 가로 모음: 초성 위/아래(폰트 보정)
    const yMapNoT: Record<string, number> = { 'ㅗ': 32, 'ㅡ': 50, 'ㅜ': 58 };
    const yMapT:   Record<string, number> = { 'ㅗ': 28, 'ㅡ': 46, 'ㅜ': 56 };
    const Vy = (hasT ? yMapT : yMapNoT)[V] ?? (hasT ? 46 : 50);
    pos.push({ part: 'V', char: V, x: 50, y: Vy, fontSize: FS });
  } else {
    // 복합 모음: [가로 성분] + [우측 세로 성분]로 분해해서 각각 찍기
    const [Vh, Vr] = COMPLEX_VOWEL_MAP[V];

    // 가로 성분 Y (위/가운데/아래)
    const yMapNoT: Record<string, number> = { 'ㅗ': 32, 'ㅡ': 50, 'ㅜ': 58 };
    const yMapT:   Record<string, number> = { 'ㅗ': 28, 'ㅡ': 46, 'ㅜ': 56 };
    const VyH = (hasT ? yMapT : yMapNoT)[Vh];

    // 우측 세로 성분 X/Y(종성 있으면 살짝 위로)
    const VxR = 66;
    const VyR = hasT ? 42 : 54;

    pos.push(
      { part: 'V', char: Vh, x: 48, y: VyH, fontSize: FS }, // 가로
      { part: 'V', char: Vr, x: VxR, y: VyR, fontSize: FS } // 우측
    );
  }

  // === 종성 ===
  if (hasT) {
    if (isComplexFinal(T)) {
      // 겹받침: 좌/우 두 글리프로 분해해서 배치
      const [T1, T2] = COMPLEX_FINAL_MAP[T!];
      // 살짝 작은 폰트 + 좌우 오프셋
      const f2 = FS - 2;
      pos.push(
        { part: 'T', char: T1, x: TcenterX - 6, y: TbaseY, fontSize: f2 },
        { part: 'T', char: T2, x: TcenterX + 6, y: TbaseY, fontSize: f2 },
      );
    } else {
      // 단일 받침
      pos.push({ part: 'T', char: T!, x: TcenterX, y: TbaseY, fontSize: FS });
    }
  }

  return pos;
}
