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
    // 복합모음 전용 기본치(단일 글리프지만 살짝 축소)
    complex: {
      x: 58,
      yNoT: 54,
      yT: 45,
      fsDelta: -3
    },
  },
  // ⬆ 종성 더 위로: 68 → 64 (숫자 작을수록 위)
  T:  { x: 50, y: 55, pairDx: 4, fsDeltaPair: -2 },
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

  // ===== 규칙 기반 배치 (조밀 메트릭 적용) =====
  const FS = hasT ? METRICS.FS.withT : METRICS.FS.noT;

  const pos: JamoPosition[] = [];

  // 초성 (spread 적용은 중성에서)
  const Lx0 = hasT ? METRICS.L.xT : METRICS.L.xNoT;
  const Ly = hasT ? METRICS.L.yT : METRICS.L.yNoT;

  // 중성 (단일 글리프)
  const v = V[0];
  const vt = getVowelType(v);

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
    const Vy = (hasT ? METRICS.V.horizYT : METRICS.V.horizYNoT)[v] ?? (hasT ? 50 : 52);
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
        x: 50 + spread / 2,
        y: Vy,
        fontSize: FS,
      }
    );
  } else {
    // complex: 단일 글리프지만 약간 축소/위치 보정
    const x = METRICS.V.complex.x;
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

  // 종성 (겹받침도 단일 글리프 그대로)
  if (hasT) {
    pos.push({
      part: 'T',
      char: toPositionalGlyph('T', T[0], glyphSet),
      x: METRICS.T.x,
      y: METRICS.T.y,
      fontSize: FS,
    });
  }

  return pos;
}
