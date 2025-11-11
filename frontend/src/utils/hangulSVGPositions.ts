import Hangul from 'hangul-js';
import overridesData from "./hangulSVGOverrides.json";

// Type assertion for the imported JSON
type SaveBlob = {
  patterns?: unknown;  // optional
  overrides: Record<string, number[]>;
  meta?: {
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

/** 모음 여부(단일 성분 기준) */
const isVowelChar = (ch: any): ch is string =>
  typeof ch === 'string' && (
    VERTICAL_VOWELS.has(ch) || HORIZONTAL_VOWELS.has(ch) ||
    // 복합 모음 성분들(예: ㅗ,ㅏ,ㅜ,ㅓ 등)은 위 집합에 이미 포함됨
    ch === 'ㅣ'
  );

/** 복합 종성인지 여부(문자 한 칸 기준) */
const isComplexFinal = (t: string | undefined) => !!t && t in COMPLEX_FINAL_MAP;

/** disassemble 결과를 L, V, T로 정규화 (V, T는 배열일 수 있음) */
function normalizeJamoParts(parts: any): {
  L: string;
  V: string | [string, string];
  T?: string | [string, string];
} | null {
  const raw = Array.isArray(parts?.[0]) ? parts[0] : parts;
  if (!Array.isArray(raw) || raw.length < 2) return null;

  let L = raw[0] as string;
  let V: any = raw[1];
  let T: any = raw[2];

  // V가 배열로 오는 정석 케이스
  if (Array.isArray(V) && V.length === 2) {
    // OK
  }
  // V가 한 칸씩 나뉘어 들어온 케이스: ['ㅇ','ㅗ','ㅏ','ㅇ']
  else if (!Array.isArray(V) && raw.length >= 4 && isVowelChar(raw[1]) && isVowelChar(raw[2])) {
    V = [raw[1] as string, raw[2] as string];
    T = raw[3]; // 종성은 한 칸 밀림
  }

  // T가 배열로 오는 케이스(드묾)도 그대로 허용
  return { L, V, T };
}

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
  console.log('🔍 getJamoPositions 호출:', syllable);

  // 1) 오버라이드 확인 (custom > default)
  const overrideCoords = customOverrides?.[syllable] ?? overrides[syllable];
  console.log('📦 overrideCoords:', overrideCoords);

  if (overrideCoords && overrideCoords.length >= 3) {
    const parts = Hangul.disassemble(syllable, true);
    console.log('🔤 Hangul.disassemble 결과:', parts);
    console.log('📊 parts 타입:', typeof parts, Array.isArray(parts));
    console.log('📊 parts[0] 타입:', typeof parts?.[0], Array.isArray(parts?.[0]));

    const norm = normalizeJamoParts(parts);
    if (!norm) return [];
    let { L, V, T } = norm;

    console.log('✅ 정규화 L,V,T:', L, V, T);

    // allChars 구성
    const allChars: { part: Part; char: string }[] = [];
    allChars.push({ part: 'L', char: L });

    // V 처리 (배열/문자/복합문자)
    if (Array.isArray(V)) {
      const [Vh, Vr] = V;
      allChars.push({ part: 'V', char: Vh }, { part: 'V', char: Vr });
    } else if (V in COMPLEX_VOWEL_MAP) {
      const [Vh, Vr] = COMPLEX_VOWEL_MAP[V];
      allChars.push({ part: 'V', char: Vh }, { part: 'V', char: Vr });
    } else {
      allChars.push({ part: 'V', char: V });
    }

    // T 처리 (배열/겹받침/단일)
    if (T) {
      if (Array.isArray(T) && T.length === 2) {
        const [t1, t2] = T;
        allChars.push({ part: 'T', char: t1 }, { part: 'T', char: t2 });
      } else if (typeof T === 'string' && isComplexFinal(T)) {
        const [t1, t2] = COMPLEX_FINAL_MAP[T];
        allChars.push({ part: 'T', char: t1 }, { part: 'T', char: t2 });
      } else if (typeof T === 'string') {
        allChars.push({ part: 'T', char: T });
      }
    }

    console.log('🎯 allChars 배열:', allChars.map(c => `${c.char}(${c.part})`).join(', '));
    console.log('📏 allChars.length:', allChars.length, 'overrideCoords.length:', overrideCoords.length);

    // 오버라이드 좌표 적용 ([L, ...V, ...T] 순서, 3칸씩)
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

  // 2) 오버라이드가 없으면 규칙 기반 배치
  const parts = Hangul.disassemble(syllable, true);
  const norm = normalizeJamoParts(parts);
  if (!norm) return [];
  let { L, V, T } = norm;

  const hasT = !!T;
  console.log('🔧 규칙 기반 계산 - L,V,T:', L, V, T);

  const pos: JamoPosition[] = [];
  const FS = hasT ? 38 : 45; // 종성 있으면 살짝 줄임

  // --- 초성 기본 위치 ---
  const Lx = hasT ? 25 : 26;
  const Ly = hasT ? 42 : 52;

  // --- 종성 기준점 ---
  const TcenterX = 45;
  const TbaseY   = 78;

  // === 초성 ===
  pos.push({ part: 'L', char: L, x: Lx, y: Ly, fontSize: FS });

  // === 중성 ===
  const vowelType: VowelType =
    Array.isArray(V) ? 'complex' :
    getVowelType(V as string);

  if (vowelType === 'vertical') {
    // 세로 모음: 초성 우측
    const Vx = hasT ? 58 : 60;
    const Vy = hasT ? 42 : 55;
    pos.push({ part: 'V', char: V as string, x: Vx, y: Vy, fontSize: FS });
  } else if (vowelType === 'horizontal') {
    // 가로 모음: 초성 위/아래(폰트 보정)
    const vChar = V as string;
    const yMapNoT: Record<string, number> = { 'ㅗ': 32, 'ㅡ': 50, 'ㅜ': 58 };
    const yMapT:   Record<string, number> = { 'ㅗ': 28, 'ㅡ': 46, 'ㅜ': 56 };
    const Vy = (hasT ? yMapT : yMapNoT)[vChar] ?? (hasT ? 46 : 50);
    pos.push({ part: 'V', char: vChar, x: 50, y: Vy, fontSize: FS });
  } else {
    // 복합 모음: [가로 성분] + [우측 세로 성분]로 분해해서 각각 찍기
    const [Vh, Vr] = Array.isArray(V) ? V : COMPLEX_VOWEL_MAP[V as string];

    const yMapNoT: Record<string, number> = { 'ㅗ': 32, 'ㅡ': 50, 'ㅜ': 58 };
    const yMapT:   Record<string, number> = { 'ㅗ': 28, 'ㅡ': 46, 'ㅜ': 56 };
    const VyH = (hasT ? yMapT : yMapNoT)[Vh] ?? (hasT ? 46 : 50);

    const VxR = 66;
    const VyR = hasT ? 42 : 54;

    pos.push(
      { part: 'V', char: Vh, x: 48, y: VyH, fontSize: FS }, // 가로 성분
      { part: 'V', char: Vr, x: VxR, y: VyR, fontSize: FS } // 우측 세로 성분
    );
  }

  // === 종성 ===
  if (hasT) {
    if (Array.isArray(T) && T.length === 2) {
      const [t1, t2] = T;
      const f2 = FS - 2;
      pos.push(
        { part: 'T', char: t1, x: TcenterX - 6, y: TbaseY, fontSize: f2 },
        { part: 'T', char: t2, x: TcenterX + 6, y: TbaseY, fontSize: f2 },
      );
    } else if (typeof T === 'string' && isComplexFinal(T)) {
      const [T1, T2] = COMPLEX_FINAL_MAP[T];
      const f2 = FS - 2;
      pos.push(
        { part: 'T', char: T1, x: TcenterX - 6, y: TbaseY, fontSize: f2 },
        { part: 'T', char: T2, x: TcenterX + 6, y: TbaseY, fontSize: f2 },
      );
    } else if (typeof T === 'string') {
      pos.push({ part: 'T', char: T, x: TcenterX, y: TbaseY, fontSize: FS });
    }
  }

  console.log('✨ 최종 positions 배열:', pos.map(p => `${p.char}(${p.part})`).join(', '));
  return pos;
}
