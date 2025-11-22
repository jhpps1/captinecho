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

/** ====== 레이아웃 메트릭(오버라이드 평균값 기반) ====== */
const METRICS = {
  // 패턴별 폰트 크기 (오버라이드 932개 평균값)
  FS: {
    noT: {
      horizontal: 72,    // 평균 72.00 (80개 샘플)
      complex: 57        // 평균 57.27 (108개 샘플)
    },
    withT: {
      vertical: 54,      // 평균 54.03 (362개 샘플)
      horizontal: 60,    // 평균 59.60 (228개 샘플)
      complex: 48        // 평균 47.56 (154개 샘플)
    }
  },
  // 패턴별 초성 위치
  L:  {
    horizontal_noT: { x: 49.80, y: 37.73 },   // 80개 샘플
    horizontal_withT: { x: 50.00, y: 47.05 }, // 228개 샘플
    vertical_withT: { x: 34.18, y: 50.46 },   // 362개 샘플
    complex_noT: { x: 48.61, y: 37.82 },      // 108개 샘플
    complex_withT: { x: 47.05, y: 46.72 }     // 154개 샘플
  },
  V: {
    // 세로모음 (종성 있음만, 종성 없음은 compat 모드)
    vert: {
      xNoT: 62,
      yNoT: 56,
      xT: 48.21,         // 평균 48.21
      yT: 53.17          // 평균 53.17
    },
    // 가로모음 Y 위치 (오버라이드 평균값)
    horizYNoT: {
      'ㅗ': 75.61,       // 평균 (19개 샘플)
      'ㅡ': 74.63,       // 평균 (14개 샘플)
      'ㅜ': 68.95        // 평균 (19개 샘플)
    } as Record<string, number>,
    horizYT: {
      'ㅗ': 51.90,       // 평균 (74개 샘플)
      'ㅡ': 52.39,       // 평균 (56개 샘플)
      'ㅜ': 53.97        // 평균 (56개 샘플)
    } as Record<string, number>,
    // 복합모음 위치
    complex: {
      xNoT: 57.64,       // 평균 (108개 샘플)
      yNoT: 60.44,       // 평균
      xT: 55.50,         // 평균 (154개 샘플)
      yT: 52.75,         // 평균
      fsDelta: -3
    },
    // 가로모음/복합모음 X 위치 (평균 기반)
    horizXNoT: 50.02,
    horizXWithT: 50.17
  },
  // 패턴별 종성 위치 (오버라이드 평균값)
  T: {
    vertical: { x: 48.61, y: 51.23, fs: 59.04 },     // 362개 샘플
    horizontal: { x: 49.95, y: 53.48, fs: 59.87 },  // 228개 샘플
    complex: { x: 53.30, y: 51.24, fs: 58.00 }      // 154개 샘플
  },
  LV_SPREAD: 4,
  H_LV_SPREAD: 4,
};

/** 세로모음 개별 x 보정(겹침 완화) */
const VERT_X_ADJUST: Record<string, number> = {
  'ㅑ': 2, 'ㅕ': 3, 'ㅒ': 2, 'ㅖ': 3, // 갈고리 모음은 더 오른쪽
  // 필요시 'ㅏ': 1, 'ㅓ': 1 등 추가 조정 가능
};

/** ✅ 유니코드 분해 테이블 */
const L_TABLE = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const V_TABLE = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"];
const T_TABLE = ["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

/* (참고용) 복합 모음/겹받침 분해표 — 이제 사용하지 않지만 남겨둠 */
// const COMPLEX_VOWEL_MAP: Record<string, [string, string]> = { ... };
// const COMPLEX_FINAL_MAP: Record<string, [string, string]> = { ... };

const VERTICAL_VOWELS = new Set(['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅣ']);
const HORIZONTAL_VOWELS = new Set(['ㅗ','ㅛ','ㅜ','ㅠ','ㅡ']);

// 호환 자모 → 초성/중성/종성 자모 매핑
const CHOSEONG_MAP: Record<string, string> = {
  'ㄱ':'ᄀ','ㄲ':'ᄁ','ㄴ':'ᄂ','ㄷ':'ᄃ','ㄸ':'ᄄ','ㄹ':'ᄅ','ㅁ':'ᄆ','ㅂ':'ᄇ','ㅃ':'ᄈ','ㅅ':'ᄉ','ㅆ':'ᄊ','ㅇ':'ᄋ','ㅈ':'ᄌ','ㅉ':'ᄍ','ㅊ':'ᄎ','ㅋ':'ᄏ','ㅌ':'ᄐ','ㅍ':'ᄑ','ㅎ':'ᄒ',
};
const JUNGSEONG_MAP: Record<string, string> = {
  // 단일 모음
  'ㅏ':'ᅡ','ㅐ':'ᅢ','ㅑ':'ᅣ','ㅒ':'ᅤ','ㅓ':'ᅥ','ㅔ':'ᅦ','ㅕ':'ᅧ','ㅖ':'ᅨ',
  'ㅗ':'ᅩ','ㅛ':'ᅭ','ㅜ':'ᅮ','ㅠ':'ᅲ','ㅡ':'ᅳ','ㅣ':'ᅵ',
  // 복합 모음
  'ㅘ':'ᅪ','ㅙ':'ᅫ','ㅚ':'ᅬ','ㅝ':'ᅯ','ㅞ':'ᅰ','ㅟ':'ᅱ','ㅢ':'ᅴ',
};
const JONGSEONG_MAP: Record<string, string> = {
  'ㄱ':'ᆨ','ㄲ':'ᆩ','ㄳ':'ᆪ','ㄴ':'ᆫ','ㄵ':'ᆬ','ㄶ':'ᆭ','ㄷ':'ᆮ','ㄹ':'ᆯ','ㄺ':'ᆰ','ㄻ':'ᆱ','ㄼ':'ᆲ','ㄽ':'ᆳ','ㄾ':'ᆴ','ㄿ':'ᆵ','ㅀ':'ᆶ',
  'ㅁ':'ᆷ','ㅂ':'ᆸ','ㅄ':'ᆹ','ㅅ':'ᆺ','ㅆ':'ᆻ','ㅇ':'ᆼ','ㅈ':'ᆽ','ㅊ':'ᆾ','ㅋ':'ᆿ','ㅌ':'ᇀ','ㅍ':'ᇁ','ㅎ':'ᇂ',
};

const CONSONANTS = new Set(Object.keys(CHOSEONG_MAP));

// 복합 모음 집합 (단일 글리프로 처리)
const COMPLEX_VOWELS = new Set(['ㅘ', 'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ']);

type VowelType = 'vertical' | 'horizontal' | 'complex';
const getVowelType = (v: string): VowelType =>
  COMPLEX_VOWELS.has(v) ? 'complex'
  : VERTICAL_VOWELS.has(v) ? 'vertical'
  : HORIZONTAL_VOWELS.has(v) ? 'horizontal'
  : 'vertical';

/** 위치별 자모로 치환 (glyphSet='positional'일 때만) */
function toPositionalGlyph(part: Part, ch: string, glyphSet: GlyphSet): string {
  if (glyphSet !== 'positional') return ch; // compat 유지
  if (part === 'L') return CHOSEONG_MAP[ch] ?? ch;
  if (part === 'V') return JUNGSEONG_MAP[ch] ?? ch;
  return JONGSEONG_MAP[ch] ?? ch; // T
}

/** ✅ 유니코드 공식으로 확정 분해 — 복합모음/겹받침을 분해하지 않음 */
function decomposeSyllable(s: string): { L: string; V: string[]; T: string[] } | null {
  if (!s || s.length !== 1) return null;
  const code = s.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return null;

  const S = code - 0xAC00;
  const LIndex = Math.floor(S / 588);
  const VIndex = Math.floor((S % 588) / 28);
  const TIndex = S % 28;

  const L = L_TABLE[LIndex];
  const VChar = V_TABLE[VIndex];
  const TChar = T_TABLE[TIndex];

  // ⬇️ 여기서 더 이상 분해하지 않는다
  const V = [VChar];                  // 항상 길이 1
  const T = TChar ? [TChar] : [];     // 없으면 0, 있으면 1

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

  // ✅ 확정 분해 (복합 미분해)
  const norm = decomposeSyllable(syllable);
  if (!norm) return [];
  const { L, V, T } = norm;
  const hasT = T.length > 0;

  const glyphSet: GlyphSet = !hasT ? 'compat' : requested;

  const overrideCoords = customOverrides?.[syllable] ?? overrides[syllable];

  const allChars: { part: Part; char: string }[] = [
    { part: 'L', char: L },
    { part: 'V', char: V[0] },
    ...T.map(t => ({ part: 'T' as const, char: t })), // 이제 최대 1개
  ];

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

  // ===== 규칙 기반 배치 (오버라이드 평균값 기반) =====
  const v = V[0];
  const vt = getVowelType(v);

  // 패턴별 폰트 크기
  let FS: number;
  if (!hasT) {
    if (vt === 'horizontal') FS = METRICS.FS.noT.horizontal;      // 72
    else if (vt === 'complex') FS = METRICS.FS.noT.complex;       // 57
    else FS = 72; // vertical_noT 기본값 (compat 모드, 오버라이드 없음)
  } else {
    if (vt === 'vertical') FS = METRICS.FS.withT.vertical;        // 54
    else if (vt === 'horizontal') FS = METRICS.FS.withT.horizontal; // 60
    else FS = METRICS.FS.withT.complex;                            // 48
  }

  const pos: JamoPosition[] = [];

  // 패턴별 초성 위치
  let Lx0: number, Ly: number;
  const pattern = `${vt}_${hasT ? 'withT' : 'noT'}`;
  const Lmetrics = METRICS.L[pattern as keyof typeof METRICS.L];
  if (Lmetrics) {
    Lx0 = Lmetrics.x;
    Ly = Lmetrics.y;
  } else {
    // vertical_noT 기본값 (compat 모드)
    Lx0 = 28;
    Ly = 54;
  }

  if (vt === 'vertical') {
    const spread = METRICS.LV_SPREAD;
    const Lx = Lx0 - Math.round(spread / 2);
    const baseX = hasT ? METRICS.V.vert.xT : METRICS.V.vert.xNoT;
    const baseY = hasT ? METRICS.V.vert.yT : METRICS.V.vert.yNoT;
    const vx = baseX + spread + (VERT_X_ADJUST[v] ?? 0);

    pos.push(
      {
        part: 'L',
        char: toPositionalGlyph('L', L, glyphSet),
        x: Lx,
        y: Ly,
        fontSize: FS,
      },
      {
        part: 'V',
        char: toPositionalGlyph('V', v, glyphSet),
        x: vx,
        y: baseY,
        fontSize: FS,
      }
    );
  } else if (vt === 'horizontal') {
    const Vy = (hasT ? METRICS.V.horizYT : METRICS.V.horizYNoT)[v] ?? (hasT ? 52 : 72);
    const Vx = hasT ? METRICS.V.horizXWithT : METRICS.V.horizXNoT;
    const spread = METRICS.H_LV_SPREAD ?? 0;
    const Lx = Lx0 - spread / 2;

    pos.push(
      {
        part: 'L',
        char: toPositionalGlyph('L', L, glyphSet),
        x: Lx,
        y: Ly,
        fontSize: FS,
      },
      {
        part: 'V',
        char: toPositionalGlyph('V', v, glyphSet),
        x: Vx + spread / 2,
        y: Vy,
        fontSize: FS,
      }
    );
  } else {
    // complex: 단일 글리프지만 약간 축소/위치 보정
    const x = hasT ? METRICS.V.complex.xT : METRICS.V.complex.xNoT;
    const y = hasT ? METRICS.V.complex.yT : METRICS.V.complex.yNoT;
    const fs = FS + METRICS.V.complex.fsDelta;

    pos.push(
      {
        part: 'L',
        char: toPositionalGlyph('L', L, glyphSet),
        x: Lx0,
        y: Ly,
        fontSize: FS,
      },
      {
        part: 'V',
        char: toPositionalGlyph('V', v, glyphSet),
        x,
        y,
        fontSize: fs,
      }
    );
  }

  // 종성 (겹받침도 단일 글리프 그대로, 패턴별 평균값 적용)
  if (hasT) {
    const Tmetrics = METRICS.T[vt];
    pos.push({
      part: 'T',
      char: toPositionalGlyph('T', T[0], glyphSet),
      x: Tmetrics.x,
      y: Tmetrics.y,
      fontSize: Tmetrics.fs,
    });
  }

  return pos;
}

/**
 * Calculate scale factor for consistent visual size across syllables
 * Uses the larger of y-range or maxFontSize as estimated size
 * Caps scale at 1.0 to prevent box overflow (only allows shrinking)
 * @param positions - Jamo positions to measure
 * @param targetSize - Desired visual size in viewBox units
 * @returns Scale factor to apply via SVG transform (≤ 1.0)
 */
export function calculateScale(
  positions: JamoPosition[],
  targetSize: number
): number {
  if (positions.length === 0) return 1.0;

  let minY = Infinity;
  let maxY = -Infinity;
  let maxFontSize = 0;

  for (const pos of positions) {
    minY = Math.min(minY, pos.y);
    maxY = Math.max(maxY, pos.y);
    maxFontSize = Math.max(maxFontSize, pos.fontSize);
  }

  const yRange = maxY - minY;
  // Use the larger dimension as estimated size
  const estimatedSize = Math.max(yRange, maxFontSize);

  if (estimatedSize <= 0) return 1.0;

  const scale = targetSize / estimatedSize;

  // Cap at 1.1 to prevent overflow (allow up to 10% enlargement)
  return Math.min(scale, 1.1);
}
