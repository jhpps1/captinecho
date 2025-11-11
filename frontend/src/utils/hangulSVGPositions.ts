import Hangul from 'hangul-js';
import overridesData from "./hangulSVGOverrides.json";

// Type assertion for the imported JSON
type SaveBlob = {
  patterns?: unknown;
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
  char: string;     // 출력할 개별 자모 (복합이면 분해된 한 글자씩, 위치별 자모로 치환 가능)
  x: number;        // viewBox 100 기준
  y: number;        // viewBox 100 기준
  fontSize: number; // px
}

type GlyphSet = 'positional' | 'compat';
type GetJamoOptions = { glyphSet?: GlyphSet };

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

// 호환 자모 → 초성/중성/종성 자모 매핑
const CHOSEONG_MAP: Record<string, string> = {
  'ㄱ':'ᄀ','ㄲ':'ᄁ','ㄴ':'ᄂ','ㄷ':'ᄃ','ㄸ':'ᄄ','ㄹ':'ᄅ','ㅁ':'ᄆ','ㅂ':'ᄇ','ㅃ':'ᄈ','ㅅ':'ᄉ','ㅆ':'ᄊ','ㅇ':'ᄋ','ㅈ':'ᄌ','ㅉ':'ᄍ','ㅊ':'ᄎ','ㅋ':'ᄏ','ㅌ':'ᄐ','ㅍ':'ᄑ','ㅎ':'ᄒ',
};
const JUNGSEONG_MAP: Record<string, string> = {
  'ㅏ':'ᅡ','ㅐ':'ᅢ','ㅑ':'ᅣ','ㅒ':'ᅤ','ㅓ':'ᅥ','ㅔ':'ᅦ','ㅕ':'ᅧ','ㅖ':'ᅨ','ㅗ':'ᅩ','ㅛ':'ᅭ','ㅜ':'ᅮ','ㅠ':'ᅲ','ㅡ':'ᅳ','ㅣ':'ᅵ',
};
const JONGSEONG_MAP: Record<string, string> = {
  'ㄱ':'ᆨ','ㄲ':'ᆩ','ㄳ':'ᆪ','ㄴ':'ᆫ','ㄵ':'ᆬ','ㄶ':'ᆭ','ㄷ':'ᆮ','ㄹ':'ᆯ','ㄺ':'ᆰ','ㄻ':'ᆱ','ㄼ':'ᆲ','ㄽ':'ᆳ','ㄾ':'ᆴ','ㄿ':'ᆵ','ㅀ':'ᆶ',
  'ㅁ':'ᆷ','ㅂ':'ᆸ','ㅄ':'ᆹ','ㅅ':'ᆺ','ㅆ':'ᆻ','ㅇ':'ᆼ','ㅈ':'ᆽ','ㅊ':'ᆾ','ㅋ':'ᆿ','ㅌ':'ᇀ','ㅍ':'ᇁ','ㅎ':'ᇂ',
};

const CONSONANTS = new Set(Object.keys(CHOSEONG_MAP));

type VowelType = 'vertical' | 'horizontal' | 'complex';
const getVowelType = (v: string): VowelType =>
  v in COMPLEX_VOWEL_MAP ? 'complex'
  : VERTICAL_VOWELS.has(v) ? 'vertical'
  : HORIZONTAL_VOWELS.has(v) ? 'horizontal'
  : 'vertical';

const isVowelChar = (ch: any): ch is string =>
  typeof ch === 'string' && (VERTICAL_VOWELS.has(ch) || HORIZONTAL_VOWELS.has(ch) || ch === 'ㅣ');

const isConsonantChar = (ch: any): ch is string =>
  typeof ch === 'string' && CONSONANTS.has(ch);

const isComplexFinal = (t: string | undefined) => !!t && t in COMPLEX_FINAL_MAP;

/** 위치별 자모로 치환 (glyphSet='positional'일 때만) */
function toPositionalGlyph(part: Part, ch: string, glyphSet: GlyphSet): string {
  if (glyphSet !== 'positional') return ch; // compat 유지
  if (part === 'L') return CHOSEONG_MAP[ch] ?? ch;
  if (part === 'V') return JUNGSEONG_MAP[ch] ?? ch;
  // part === 'T'
  // 겹받침 분해는 상위 로직에서 이미 되어 오므로 단일 종성 문자만 옴
  return JONGSEONG_MAP[ch] ?? ch;
}

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

  // V 보정: ['ㅇ','ㅗ','ㅏ','ㅇ'] → V=[ㅗ,ㅏ], T=raw[3]
  if (Array.isArray(V) && V.length === 2) {
    // OK
  } else if (!Array.isArray(V) && raw.length >= 4 && isVowelChar(raw[1]) && isVowelChar(raw[2])) {
    V = [raw[1] as string, raw[2] as string];
    T = raw[3];
  }

  // T 보정: ['ㄷ','ㅏ','ㄹ','ㄱ'] → T=[ㄹ,ㄱ]
  if (!Array.isArray(T) && isConsonantChar(T) && raw.length >= 4 && isConsonantChar(raw[3])) {
    T = [T as string, raw[3] as string];
  }

  return { L, V, T };
}

/**
 * 한글 음절을 자모로 분해하고 좌표를 계산해서 반환
 * - 오버라이드가 있으면 해당 좌표 사용
 * - 없으면 규칙 기반 계산
 * - 반환 시 위치별 자모(초성/중성/종성)로 치환 옵션 제공
 * - ✅ 종성 없으면 자동으로 compat(원본 자모) 사용
 */
export function getJamoPositions(
  syllable: string,
  customOverrides?: Record<string, number[]>,
  options?: GetJamoOptions
): JamoPosition[] {
  const requested: GlyphSet = options?.glyphSet ?? 'positional';
  console.log('🔍 getJamoPositions 호출:', syllable, 'requested glyphSet=', requested);

  // --- 분해 & 정규화 ---
  const parts1 = Hangul.disassemble(syllable, true);
  console.log('🔤 Hangul.disassemble 결과:', parts1);

  const norm = normalizeJamoParts(parts1);
  if (!norm) return [];
  let { L, V, T } = norm;
  console.log('✅ 정규화 L,V,T:', L, V, T);

  // 종성 유무
  const hasT = Array.isArray(T) ? T.length > 0 : !!T;

  // ✅ 종성 없으면 자동 compat, 있으면 요청값 사용
  const effectiveGlyphSet: GlyphSet = !hasT ? 'compat' : requested;

  // 1) 오버라이드 확인
  const overrideCoords = customOverrides?.[syllable] ?? overrides[syllable];
  console.log('📦 overrideCoords:', overrideCoords);

  // allChars 구성
  const allChars: { part: Part; char: string }[] = [];
  allChars.push({ part: 'L', char: L });

  // V 처리
  if (Array.isArray(V)) {
    const [Vh, Vr] = V;
    allChars.push({ part: 'V', char: Vh }, { part: 'V', char: Vr });
  } else if (V in COMPLEX_VOWEL_MAP) {
    const [Vh, Vr] = COMPLEX_VOWEL_MAP[V];
    allChars.push({ part: 'V', char: Vh }, { part: 'V', char: Vr });
  } else {
    allChars.push({ part: 'V', char: V as string });
  }

  // T 처리
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

  // 오버라이드 적용 도우미
  const applyOverride = () => {
    if (!overrideCoords || overrideCoords.length < 3) return null;
    const positions: JamoPosition[] = [];
    for (let i = 0; i < allChars.length; i++) {
      const idx = i * 3;
      if (idx + 3 <= overrideCoords.length) {
        positions.push({
          part: allChars[i].part,
          char: toPositionalGlyph(allChars[i].part, allChars[i].char, effectiveGlyphSet),
          x: overrideCoords[idx],
          y: overrideCoords[idx + 1],
          fontSize: overrideCoords[idx + 2],
        });
      }
    }
    return positions;
  };

  // 1) 오버라이드 우선
  if (overrideCoords) {
    console.log('🎯 allChars 배열:', allChars.map(c => `${c.char}(${c.part})`).join(', '));
    const withOverride = applyOverride();
    if (withOverride) {
      console.log('✅ 오버라이드 적용 완료');
      return withOverride;
    }
  }

  // 2) 규칙 기반 배치 (간격/폰트 크기는 여기서 조절)
  const FS = hasT ? 60 : 72; // 글자 크기(기본)
  const Lx = hasT ? 25 : 26; // 초성 X
  const Ly = hasT ? 42 : 52; // 초성 Y
  const TcenterX = 45;       // 종성 X 기준
  const TbaseY   = 78;       // 종성 Y 기준

  const pos: JamoPosition[] = [];

  // === 초성 ===
  pos.push({
    part: 'L',
    char: toPositionalGlyph('L', allChars[0].char, effectiveGlyphSet),
    x: Lx, y: Ly, fontSize: FS
  });

  // === 중성 ===
  const vItems = allChars.filter(c => c.part === 'V').map(c => c.char);
  if (vItems.length === 1) {
    const v = vItems[0];
    const vowelType = getVowelType(v);
    if (vowelType === 'vertical') {
      const Vx = hasT ? 58 : 60;
      const Vy = hasT ? 42 : 55;
      pos.push({ part: 'V', char: toPositionalGlyph('V', v, effectiveGlyphSet), x: Vx, y: Vy, fontSize: FS });
    } else if (vowelType === 'horizontal') {
      const yMapNoT: Record<string, number> = { 'ㅗ': 32, 'ㅡ': 50, 'ㅜ': 58 };
      const yMapT:   Record<string, number> = { 'ㅗ': 28, 'ㅡ': 46, 'ㅜ': 56 };
      const Vy = (hasT ? yMapT : yMapNoT)[v] ?? (hasT ? 46 : 50);
      pos.push({ part: 'V', char: toPositionalGlyph('V', v, effectiveGlyphSet), x: 50, y: Vy, fontSize: FS });
    }
  } else if (vItems.length === 2) {
    const [Vh, Vr] = vItems;
    const yMapNoT: Record<string, number> = { 'ㅗ': 32, 'ㅡ': 50, 'ㅜ': 58 };
    const yMapT:   Record<string, number> = { 'ㅗ': 28, 'ㅡ': 46, 'ㅜ': 56 };
    const VyH = (hasT ? yMapT : yMapNoT)[Vh] ?? (hasT ? 46 : 50);
    const VxR = 66;
    const VyR = hasT ? 42 : 54;
    pos.push(
      { part: 'V', char: toPositionalGlyph('V', Vh, effectiveGlyphSet), x: 48, y: VyH, fontSize: FS },
      { part: 'V', char: toPositionalGlyph('V', Vr, effectiveGlyphSet), x: VxR, y: VyR, fontSize: FS }
    );
  }

  // === 종성 ===
  const tItems = allChars.filter(c => c.part === 'T').map(c => c.char);
  if (tItems.length === 1) {
    pos.push({ part: 'T', char: toPositionalGlyph('T', tItems[0], effectiveGlyphSet), x: TcenterX, y: TbaseY, fontSize: FS });
  } else if (tItems.length === 2) {
    const [t1, t2] = tItems;
    const f2 = FS - 2;
    pos.push(
      { part: 'T', char: toPositionalGlyph('T', t1, effectiveGlyphSet), x: TcenterX - 6, y: TbaseY, fontSize: f2 },
      { part: 'T', char: toPositionalGlyph('T', t2, effectiveGlyphSet), x: TcenterX + 6, y: TbaseY, fontSize: f2 },
    );
  }

  console.log('✨ 최종 positions 배열:', pos.map(p => `${p.char}(${p.part})`).join(', '));
  return pos;
}
