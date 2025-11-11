import Hangul from 'hangul-js';
import overridesData from "./hangulSVGOverrides.json";

// Type assertion for the imported JSON
 type SaveBlob = {
   patterns?: unknown;  // optional로 변경
   overrides: Record<string, number[]>;
   meta?: {  // 추가
     version?: number;
     convention?: string;
     description?: string;
   };
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
 * - 우선적으로 외부에서 전달된 오버라이드 또는 `hangulSVGOverrides.json` 에서 좌표를 찾습니다.
 * - 오버라이드가 없으면 규칙 기반으로 계산하며, 복합 모음/겹받침은 각각 2개의 글리프로 분해해서 배치합니다.
 *
 * @param syllable - 한글 음절 (예: "왕", "닭")
 * @param customOverrides - 외부에서 전달된 오버라이드 (선택적)
 */
export function getJamoPositions(
  syllable: string,
  customOverrides?: Record<string, number[]>
): JamoPosition[] {
  console.log('🔍 getJamoPositions 호출:', syllable); // 콘솔 디버그용
  // 1. Check for a direct override (custom > default)
  const overrideCoords = customOverrides?.[syllable] ?? overrides[syllable];
  console.log('📦 overrideCoords:', overrideCoords); // 콘솔 디버그용
  if (overrideCoords && overrideCoords.length >= 3) {
    // 가변 길이 오버라이드 적용
    const parts = Hangul.disassemble(syllable, true);
    // 콘솔 디버그용
    console.log('🔤 Hangul.disassemble 결과:', parts);
    console.log('📊 parts 타입:', typeof parts, Array.isArray(parts));
    console.log('📊 parts[0] 타입:', typeof parts[0], Array.isArray(parts[0]));
    // 이중 배열인 경우 첫 번째 요소 추출
    const actualParts = Array.isArray(parts[0]) ? parts[0] : parts;
    if (actualParts.length < 2) return [];
    const L = actualParts[0] as string;
    const V = actualParts[1] as string;
    const T = actualParts[2] as string | undefined;
    console.log('✅ L, V, T:', L, V, T); // 콘솔 디버그용
    // 복합 모음/받침 분리
    const allChars: { part: Part; char: string }[] = [];

    // 초성
    allChars.push({ part: 'L', char: L });

    // 중성 (복합 모음 처리)
    if (V in COMPLEX_VOWEL_MAP) {
      const [Vh, Vr] = COMPLEX_VOWEL_MAP[V];
      allChars.push({ part: 'V', char: Vh }, { part: 'V', char: Vr });
    } else {
      allChars.push({ part: 'V', char: V });
    }

    // 종성 (겹받침 처리)
    if (T) {
      if (isComplexFinal(T)) {
        const [T1, T2] = COMPLEX_FINAL_MAP[T];
        allChars.push({ part: 'T', char: T1 }, { part: 'T', char: T2 });
      } else {
        allChars.push({ part: 'T', char: T });
      }
    }

    console.log('🎯 allChars 배열:', allChars.map(c => `${c.char}(${c.part})`).join(', '));
    console.log('📏 allChars.length:', allChars.length, 'overrideCoords.length:', overrideCoords.length);

    // 오버라이드 좌표 적용 ([L, ...V, ...T] 순서로)
    const positions: JamoPosition[] = [];
    for (let i = 0; i < allChars.length; i++) {
      const idx = i * 3;
      console.log(`  [${i}] idx=${idx}, char=${allChars[i].char}, check: ${idx}+2=${idx+2} < ${overrideCoords.length}?`, idx + 2 < overrideCoords.length);
      if (idx + 3 <= overrideCoords.length) {
        positions.push({
          ...allChars[i],
          x: overrideCoords[idx],
          y: overrideCoords[idx + 1],
          fontSize: overrideCoords[idx + 2],
        });
      }
    }

    console.log('✅ 오버라이드 적용 완료 - positions:', positions.map(p => `${p.char}(${p.part})`).join(', '));
    return positions;
  }

  // 2. If no override, proceed with rule-based calculation and splitting
  const parts = Hangul.disassemble(syllable, true); // true로 변경: 초성/중성/종성으로 정확히 분리
  // 이중 배열인 경우 첫 번째 요소 추출
  const actualParts = Array.isArray(parts[0]) ? parts[0] : parts;
  if (actualParts.length < 2) return [];
 const L = actualParts[0] as string;
 const V = actualParts[1] as string;
 const T = actualParts[2] as string | undefined;
  if (!L || !V) return [];
  console.log('🔧 규칙 기반 계산 - L, V, T:', L, V, T);

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

  console.log('✨ 최종 positions 배열:', pos.map(p => `${p.char}(${p.part})`).join(', '));
  return pos;
}
