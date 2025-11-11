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
  char: string;     // 출력할 개별 자모
  x: number;        // viewBox 100 기준
  y: number;        // viewBox 100 기준
  fontSize: number; // px
}

type GlyphSet = 'positional' | 'compat';
type GetJamoOptions = { glyphSet?: GlyphSet };

/** ====== 레이아웃 메트릭(조밀 버전) ====== */
const METRICS = {
  FS: { noT: 72, withT: 60 }, // 기본 폰트 사이즈 (그대로)
  L:  { 
    xNoT: 28, 
    yNoT: 54,  // 52 → 54 (조금 아래)
    xT: 27, 
    yT: 46     // 44 → 46 (조금 아래)
  },
  V: {
    // 세로모음(ㅏㅑㅓㅕㅣ): 중앙으로 약간 더 내림
    vert: { 
      xNoT: 62, 
      yNoT: 56, 
      xT: 60, 
      yT: 46
    },
    // 가로모음 높이값(조금 아래로)
    horizYNoT: { 'ㅗ': 44, 'ㅡ': 52, 'ㅜ': 60 } as Record<string, number>, // 42/50/58 → 44/52/60
    horizYT:   { 'ㅗ': 42, 'ㅡ': 50, 'ㅜ': 58 } as Record<string, number>,   // 40/48/56 → 42/50/58
    // 복합모음 좌/우 간격과 y (조금 아래로)
    complex: { 
      xFirst: 46, 
      xSecond: 60, 
      yNoT: 56, 
      yT: 46, 
      fsDelta: -5 
    },
  },
  // ⬆ 종성 더 위로: 68 → 64 (숫자 작을수록 위)
  T:  { x: 50, y: 55, pairDx: 4, fsDeltaPair: -2 },
};

/** 세로모음 개별 x 보정(겹침 완화) */
const VERT_X_ADJUST: Record<string, number> = {
  'ㅑ': 2, 'ㅕ': 3, 'ㅒ': 2, 'ㅖ': 3, // 갈고리 모음은 더 오른쪽
  // 필요시 'ㅏ': 1, 'ㅓ': 1 등 추가 조정 가능
};

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
  return JONGSEONG_MAP[ch] ?? ch; // T
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

  if (Array.isArray(V) && V.length === 2) {
    // OK
  } else if (!Array.isArray(V) && raw.length >= 4 && isVowelChar(raw[1]) && isVowelChar(raw[2])) {
    V = [raw[1] as string, raw[2] as string];
    T = raw[3];
  }

  if (!Array.isArray(T) && isConsonantChar(T) && raw.length >= 4 && isConsonantChar(raw[3])) {
    T = [T as string, raw[3] as string];
  }

  return { L, V, T };
}

/**
 * - 오버라이드가 있으면 해당 좌표 사용
 * - 없으면 규칙 기반 계산
 * - 종성 없으면 자동 compat(원본 자모) 사용
 * - 메트릭은 METRICS 에서 일괄 조정
 */
export function getJamoPositions(
  syllable: string,
  customOverrides?: Record<string, number[]>,
  options?: GetJamoOptions
): JamoPosition[] {
  const requested: GlyphSet = options?.glyphSet ?? 'positional';

  const parts1 = Hangul.disassemble(syllable, true);
  const norm = normalizeJamoParts(parts1);
  if (!norm) return [];
  let { L, V, T } = norm;

  const hasT = Array.isArray(T) ? T.length > 0 : !!T;
  const glyphSet: GlyphSet = !hasT ? 'compat' : requested;

  const overrideCoords = customOverrides?.[syllable] ?? overrides[syllable];

  const allChars: { part: Part; char: string }[] = [{ part: 'L', char: L }];

  if (Array.isArray(V)) {
    const [Vh, Vr] = V;
    allChars.push({ part: 'V', char: Vh }, { part: 'V', char: Vr });
  } else if (V in COMPLEX_VOWEL_MAP) {
    const [Vh, Vr] = COMPLEX_VOWEL_MAP[V];
    allChars.push({ part: 'V', char: Vh }, { part: 'V', char: Vr });
  } else {
    allChars.push({ part: 'V', char: V as string });
  }

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

  // 오버라이드 우선
  if (overrideCoords && overrideCoords.length >= 3) {
    const positions: JamoPosition[] = [];
    for (let i = 0; i < allChars.length; i++) {
      const idx = i * 3;
      if (idx + 3 <= overrideCoords.length) {
        positions.push({
          part: allChars[i].part,
          char: toPositionalGlyph(allChars[i].part, allChars[i].char, glyphSet),
          x: overrideCoords[idx],
          y: overrideCoords[idx + 1],
          fontSize: overrideCoords[idx + 2],
        });
      }
    }
    if (positions.length) return positions;
  }

  // ===== 규칙 기반 배치 (조밀 메트릭 적용) =====
  const FS = hasT ? METRICS.FS.withT : METRICS.FS.noT;

  const pos: JamoPosition[] = [];

  // 초성
  pos.push({
    part: 'L',
    char: toPositionalGlyph('L', allChars[0].char, glyphSet),
    x: hasT ? METRICS.L.xT : METRICS.L.xNoT,
    y: hasT ? METRICS.L.yT : METRICS.L.yNoT,
    fontSize: FS,
  });

  // 중성
  const vItems = allChars.filter(c => c.part === 'V').map(c => c.char);
  if (vItems.length === 1) {
    const v = vItems[0];
    const vt = getVowelType(v);
    if (vt === 'vertical') {
      const baseX = hasT ? METRICS.V.vert.xT : METRICS.V.vert.xNoT;
      const baseY = hasT ? METRICS.V.vert.yT : METRICS.V.vert.yNoT;
      const vx = baseX + (VERT_X_ADJUST[v] ?? 0); // ⬅ 세로모음 개별 보정
      pos.push({
        part: 'V',
        char: toPositionalGlyph('V', v, glyphSet),
        x: vx,
        y: baseY,
        fontSize: FS,
      });
    } else { // horizontal
      const Vy = (hasT ? METRICS.V.horizYT : METRICS.V.horizYNoT)[v] ?? (hasT ? 48 : 50);
      pos.push({
        part: 'V',
        char: toPositionalGlyph('V', v, glyphSet),
        x: 50,
        y: Vy,
        fontSize: FS,
      });
    }
  } else if (vItems.length === 2) {
    const [Vh, Vr] = vItems;
    const VyH = (hasT ? METRICS.V.horizYT : METRICS.V.horizYNoT)[Vh] ?? (hasT ? 48 : 50);
    const VyR = hasT ? METRICS.V.complex.yT : METRICS.V.complex.yNoT;
    pos.push(
      {
        part: 'V',
        char: toPositionalGlyph('V', Vh, glyphSet),
        x: METRICS.V.complex.xFirst,
        y: VyH,
        fontSize: FS + METRICS.V.complex.fsDelta,
      },
      {
        part: 'V',
        char: toPositionalGlyph('V', Vr, glyphSet),
        x: METRICS.V.complex.xSecond,
        y: VyR,
        fontSize: FS + METRICS.V.complex.fsDelta,
      }
    );
  }

  // 종성
  const tItems = allChars.filter(c => c.part === 'T').map(c => c.char);
  if (tItems.length === 1) {
    pos.push({
      part: 'T',
      char: toPositionalGlyph('T', tItems[0], glyphSet),
      x: METRICS.T.x,
      y: METRICS.T.y, // ↑ 위로 올려진 값(68)
      fontSize: FS,
    });
  } else if (tItems.length === 2) {
    const [t1, t2] = tItems;
    pos.push(
      {
        part: 'T',
        char: toPositionalGlyph('T', t1, glyphSet),
        x: METRICS.T.x - METRICS.T.pairDx,
        y: METRICS.T.y,
        fontSize: FS + METRICS.T.fsDeltaPair,
      },
      {
        part: 'T',
        char: toPositionalGlyph('T', t2, glyphSet),
        x: METRICS.T.x + METRICS.T.pairDx,
        y: METRICS.T.y,
        fontSize: FS + METRICS.T.fsDeltaPair,
      }
    );
  }

  return pos;
}
