import React, { useEffect, useMemo, useRef, useState } from "react";
// ⚠️ React + TypeScript 가정, 외부 의존성: hangul-js (npm i hangul-js)
import Hangul from "hangul-js";

/** ------------------------- 타입/유틸 ------------------------- */
type PlaygroundJamoPosition = {
  char: string; // 자모 문자
  x: number;   // 0~100 (viewBox 기준)
  y: number;   // 0~100
  fontSize: number; // px (viewBox에 상대적)
};

// 모음 유형
type VowelType = "vertical" | "horizontal" | "complex";
const V_VERTICAL = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅣ"] as const;
const V_HORIZONTAL = ["ㅗ", "ㅛ", "ㅜ", "ㅠ", "ㅡ"] as const;
const V_COMPLEX = ["ㅘ", "ㅙ", "ㅚ", "ㅝ", "ㅞ", "ㅟ", "ㅢ"] as const;

function getVowelType(vowel: string): VowelType {
  if ((V_VERTICAL as readonly string[]).includes(vowel)) return "vertical";
  if ((V_HORIZONTAL as readonly string[]).includes(vowel)) return "horizontal";
  if ((V_COMPLEX as readonly string[]).includes(vowel)) return "complex";
  return "vertical"; // 기본값
}

/* ✅ 자모/겹받침 정규화 + 위치별 자모 치환에 필요한 유틸/사전 추가 */
type Part = "L" | "V" | "T";
type GlyphSet = "positional" | "compat";
type GetJamoOptions = {
  glyphSet?: GlyphSet;
  /** 종성 없을 때(LV) 초성/중성은 호환 자모로 유지 */
  lvCompatWhenNoT?: boolean; // default: true
};

const COMPLEX_VOWEL_MAP: Record<string, [string, string]> = {
  "ㅘ": ["ㅗ","ㅏ"], "ㅙ": ["ㅗ","ㅐ"], "ㅚ": ["ㅗ","ㅣ"],
  "ㅝ": ["ㅜ","ㅓ"], "ㅞ": ["ㅜ","ㅔ"], "ㅟ": ["ㅜ","ㅣ"],
  "ㅢ": ["ㅡ","ㅣ"],
};

const COMPLEX_FINAL_MAP: Record<string, [string, string]> = {
  "ㄳ": ["ㄱ","ㅅ"], "ㄵ": ["ㄴ","ㅈ"], "ㄶ": ["ㄴ","ㅎ"],
  "ㄺ": ["ㄹ","ㄱ"], "ㄻ": ["ㄹ","ㅁ"], "ㄼ": ["ㄹ","ㅂ"],
  "ㄽ": ["ㄹ","ㅅ"], "ㄾ": ["ㄹ","ㅌ"], "ㄿ": ["ㄹ","ㅍ"], "ㅀ": ["ㄹ","ㅎ"],
  "ㅄ": ["ㅂ","ㅅ"],
};

const VERTICAL_VOWELS_SET = new Set(["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅣ"]);
const HORIZONTAL_VOWELS_SET = new Set(["ㅗ","ㅛ","ㅜ","ㅠ","ㅡ"]);
const CONSONANTS_SET = new Set([
  "ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"
]);
const isVowelChar = (ch: any): ch is string =>
  typeof ch === "string" && (VERTICAL_VOWELS_SET.has(ch) || HORIZONTAL_VOWELS_SET.has(ch) || ch === "ㅣ");
const isConsonantChar = (ch: any): ch is string =>
  typeof ch === "string" && CONSONANTS_SET.has(ch);
const isComplexFinal = (t: string | undefined) => !!t && t in COMPLEX_FINAL_MAP;

// 호환 자모 → 초/중/종 전용 자모 매핑
const CHOSEONG_MAP: Record<string, string> = {
  "ㄱ":"ᄀ","ㄲ":"ᄁ","ㄴ":"ᄂ","ㄷ":"ᄃ","ㄸ":"ᄄ","ㄹ":"ᄅ","ㅁ":"ᄆ","ㅂ":"ᄇ","ㅃ":"ᄈ","ㅅ":"ᄉ","ㅆ":"ᄊ","ㅇ":"ᄋ","ㅈ":"ᄌ","ㅉ":"ᄍ","ㅊ":"ᄎ","ㅋ":"ᄏ","ㅌ":"ᄐ","ㅍ":"ᄑ","ㅎ":"ᄒ",
};
const JUNGSEONG_MAP: Record<string, string> = {
  "ㅏ":"ᅡ","ㅐ":"ᅢ","ㅑ":"ᅣ","ㅒ":"ᅤ","ㅓ":"ᅥ","ㅔ":"ᅦ","ㅕ":"ᅧ","ㅖ":"ᅨ","ㅗ":"ᅩ","ㅛ":"ᅭ","ㅜ":"ᅮ","ㅠ":"ᅲ","ㅡ":"ᅳ","ㅣ":"ᅵ",
};
const JONGSEONG_MAP: Record<string, string> = {
  "ㄱ":"ᆨ","ㄲ":"ᆩ","ㄳ":"ᆪ","ㄴ":"ᆫ","ㄵ":"ᆬ","ㄶ":"ᆭ","ㄷ":"ᆮ","ㄹ":"ᆯ","ㄺ":"ᆰ","ㄻ":"ᆱ","ㄼ":"ᆲ","ㄽ":"ᆳ","ㄾ":"ᆴ","ㄿ":"ᆵ","ㅀ":"ᆶ",
  "ㅁ":"ᆷ","ㅂ":"ᆸ","ㅄ":"ᆹ","ㅅ":"ᆺ","ㅆ":"ᆻ","ㅇ":"ᆼ","ㅈ":"ᆽ","ㅊ":"ᆾ","ㅋ":"ᆿ","ㅌ":"ᇀ","ㅍ":"ᇁ","ㅎ":"ᇂ",
};

function toPositionalGlyph(part: Part, ch: string, glyphSet: GlyphSet): string {
  if (glyphSet !== "positional") return ch; // 기존 호환 자모 유지
  if (part === "L") return CHOSEONG_MAP[ch] ?? ch;
  if (part === "V") return JUNGSEONG_MAP[ch] ?? ch;
  return JONGSEONG_MAP[ch] ?? ch; // T
}

/** disassemble(true) 결과를 L, V(1~2), T(0~2)로 안정 정규화 */
function normalizeJamoParts(syllable: string): { L: string; V: string[]; T: string[] } | null {
  const parts = Hangul.disassemble(syllable, true);
  const raw: any[] = Array.isArray(parts?.[0]) ? parts[0] : parts;
  if (!Array.isArray(raw) || raw.length < 2) return null;

  let L = raw[0] as string;
  let V: any = raw[1];
  let T: any = raw[2];

  // 중성 보정: ['ㅇ','ㅗ','ㅏ','ㅇ'] → V=[ㅗ,ㅏ], T=raw[3]
  if (Array.isArray(V) && V.length === 2) {
    // OK
  } else if (!Array.isArray(V) && raw.length >= 4 && isVowelChar(raw[1]) && isVowelChar(raw[2])) {
    V = [raw[1] as string, raw[2] as string];
    T = raw[3];
  }

  // 종성 보정: 단일자음 + 다음도 자음 → 겹받침
  if (!Array.isArray(T) && isConsonantChar(T) && raw.length >= 4 && isConsonantChar(raw[3])) {
    T = [T as string, raw[3] as string];
  }

  const outV: string[] = Array.isArray(V) ? V : (V ? [V] : []);
  let outT: string[] = [];
  if (Array.isArray(T)) {
    outT = T;
  } else if (typeof T === "string" && T) {
    outT = (isComplexFinal(T) ? COMPLEX_FINAL_MAP[T] : [T]);
  }
  return { L, V: outV, T: outT };
}

/* ------------------------- 메트릭/보정 ------------------------- */
// Compact metrics (렌더러와 동일 컨셉)
const METRICS = {
  FS: { noT: 72, withT: 60 },                   // 기본 폰트 크기
  L:  { xNoT: 28, yNoT: 54, xT: 27, yT: 46 },   // 초성 위치(조금 아래)
  V: {
    vert: { xNoT: 62, yNoT: 56, xT: 60, yT: 46 }, // 세로모음 위치(조금 아래/오른쪽)
    // 가로모음 높이(약간 아래)
    horizYNoT: { 'ㅗ': 44, 'ㅡ': 52, 'ㅜ': 60 } as Record<string, number>,
    horizYT:   { 'ㅗ': 42, 'ㅡ': 50, 'ㅜ': 58 } as Record<string, number>,
    // 복합모음
    complex: { xFirst: 46, xSecond: 60, yNoT: 56, yT: 46, fsDelta: -5 },
  },
  T:  { x: 50, y: 55, pairDx: 4, fsDeltaPair: -2 }, // 종성 위로 당김 (y 작을수록 위)
  LV_SPREAD: 4,                                       // 초성-세로중성 간 벌림 정도(+X)
};
// 세로 모음 개별 미세 보정(겹침 완화)
const VERT_X_ADJUST: Record<string, number> = {
  'ㅑ': 2, 'ㅕ': 3, 'ㅒ': 2, 'ㅖ': 3,
};

/* 패턴 6분류 */
export type PatternKey =
  | "VERT_NOJONG" // 세로모음, 종성 없음
  | "VERT_JONG"   // 세로모음, 종성 있음
  | "HORZ_NOJONG" // 가로모음, 종성 없음
  | "HORZ_JONG"   // 가로모음, 종성 있음
  | "COMP_NOJONG" // 복합모음, 종성 없음
  | "COMP_JONG";  // 복합모음, 종성 있음

function detectPattern(jung: string, hasJong: boolean): PatternKey {
  const t = getVowelType(jung);
  if (t === "vertical") return hasJong ? "VERT_JONG" : "VERT_NOJONG";
  if (t === "horizontal") return hasJong ? "HORZ_JONG" : "HORZ_NOJONG";
  return hasJong ? "COMP_JONG" : "COMP_NOJONG";
}

/** ------------------------- 기본 배치 ------------------------- */
// viewBox 100x100 기준 기본값(메트릭 기반)
const DEFAULTS: Record<PatternKey, [PlaygroundJamoPosition, PlaygroundJamoPosition, PlaygroundJamoPosition | null]> = {
  VERT_NOJONG: [
    { char: "", x: METRICS.L.xNoT,      y: METRICS.L.yNoT,      fontSize: METRICS.FS.noT },
    { char: "", x: METRICS.V.vert.xNoT, y: METRICS.V.vert.yNoT, fontSize: METRICS.FS.noT },
    null,
  ],
  VERT_JONG: [
    { char: "", x: METRICS.L.xT,      y: METRICS.L.yT,      fontSize: METRICS.FS.withT },
    { char: "", x: METRICS.V.vert.xT, y: METRICS.V.vert.yT, fontSize: METRICS.FS.withT },
    { char: "", x: METRICS.T.x,       y: METRICS.T.y,       fontSize: METRICS.FS.withT - 4 },
  ],
  HORZ_NOJONG: [
    { char: "", x: 50, y: METRICS.V.horizYNoT["ㅗ"], fontSize: METRICS.FS.noT },
    { char: "", x: 50, y: METRICS.V.horizYNoT["ㅜ"], fontSize: METRICS.FS.noT },
    null,
  ],
  HORZ_JONG: [
    { char: "", x: 50, y: METRICS.V.horizYT["ㅗ"], fontSize: METRICS.FS.withT },
    { char: "", x: 50, y: METRICS.V.horizYT["ㅜ"], fontSize: METRICS.FS.withT },
    { char: "", x: METRICS.T.x, y: METRICS.T.y, fontSize: METRICS.FS.withT - 4 },
  ],
  COMP_NOJONG: [
    { char: "", x: METRICS.L.xNoT, y: METRICS.L.yNoT, fontSize: METRICS.FS.noT },
    { char: "", x: METRICS.V.vert.xNoT, y: METRICS.V.vert.yNoT, fontSize: METRICS.FS.noT + METRICS.V.complex.fsDelta },
    null,
  ],
  COMP_JONG: [
    { char: "", x: METRICS.L.xT, y: METRICS.L.yT, fontSize: METRICS.FS.withT },
    { char: "", x: METRICS.V.vert.xT, y: METRICS.V.vert.yT, fontSize: METRICS.FS.withT + METRICS.V.complex.fsDelta },
    { char: "", x: METRICS.T.x, y: METRICS.T.y, fontSize: METRICS.FS.withT - 4 },
  ],
};

// 로컬 저장 키
const LS_KEY = "hangul_svg_positions_v1";

// 저장 데이터 형태: 패턴 기본값과 개별 글자 오버라이드 (모두 number[])
type SaveBlob = {
  patterns: Partial<Record<PatternKey, number[]>>;
  overrides: Record<string, number[]>;
};

function loadSave(): SaveBlob {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { patterns: {}, overrides: {} };
    return JSON.parse(raw);
  } catch {
    return { patterns: {}, overrides: {} };
  }
}
function persistSave(blob: SaveBlob) {
  localStorage.setItem(LS_KEY, JSON.stringify(blob));
}

/** ------------------------- 좌표 계산 ------------------------- */
export function getJamoPositions(
  syllable: string,
  patternDefaults: Partial<Record<PatternKey, [PlaygroundJamoPosition, PlaygroundJamoPosition, PlaygroundJamoPosition | null]>>,
  overrides: SaveBlob["overrides"],
  options?: GetJamoOptions
): PlaygroundJamoPosition[] {
  const glyphSet: GlyphSet = options?.glyphSet ?? "positional";
  const lvCompatWhenNoT = options?.lvCompatWhenNoT ?? true;

  // ✅ 안전 정규화
  const norm = normalizeJamoParts(syllable);
  if (!norm) return [];
  const { L, V, T } = norm;

  const hasT = T.length > 0;

  // LV(종성 없음)일 땐 초/중성만 호환 자모로 유지
  const effectiveGlyphSetFor = (part: Part): GlyphSet => {
    if (!hasT && lvCompatWhenNoT && (part === "L" || part === "V")) return "compat";
    return glyphSet;
  };

  // 패턴 판별 (복합 모음 여부 고려)
  const isComplex = V.length === 2;
  const pat: PatternKey = isComplex
    ? (hasT ? "COMP_JONG" : "COMP_NOJONG")
    : detectPattern(V[0], hasT);

  // 글자 단위 오버라이드 우선 적용
  const save = loadSave();
  const flat = overrides[syllable] ?? save.overrides[syllable];

  // [L, ...V, ...T] 순서로 위치별 자모 문자 생성(치환)
  const allParts: { part: Part; char: string }[] = [
    { part: "L", char: L },
    ...V.map(v => ({ part: "V" as const, char: v })),
    ...T.map(t => ({ part: "T" as const, char: t })),
  ];

  if (flat && flat.length >= 3) {
    const positions: PlaygroundJamoPosition[] = [];
    for (let i = 0; i < allParts.length; i++) {
      const idx = i * 3;
      if (idx + 2 < flat.length) {
        const { part, char } = allParts[i];
        positions.push({
          char: toPositionalGlyph(part, char, effectiveGlyphSetFor(part)),
          x: flat[idx],
          y: flat[idx + 1],
          fontSize: flat[idx + 2],
        });
      }
    }
    return positions;
  }

  // 오버라이드 없으면 기본 패턴 사용 (3개 슬롯)
  const base = (patternDefaults[pat] ?? DEFAULTS[pat]).map((p) => (p ? { ...p } : null));

  // 기본 좌표로 글리프 생성
  const positions: PlaygroundJamoPosition[] = [];

  // === 초성
  if (base[0]) {
    positions.push({ ...base[0], char: toPositionalGlyph("L", L, effectiveGlyphSetFor("L")) });
  }

  // === 중성
  if (V.length === 1 && base[1]) {
    const v = V[0];
    const vt = getVowelType(v);

    if (vt === "vertical") {
      // 세로모음: 초/중 벌림 + 개별 X 보정
      const spread = METRICS.LV_SPREAD;
      // 초성은 살짝 왼쪽
      positions[0] = { ...positions[0], x: (positions[0].x ?? METRICS.L.xNoT) - Math.round(spread / 2) };

      const baseX = base[1].x ?? (hasT ? METRICS.V.vert.xT : METRICS.V.vert.xNoT);
      const baseY = base[1].y ?? (hasT ? METRICS.V.vert.yT : METRICS.V.vert.yNoT);
      const vx = baseX + spread + (VERT_X_ADJUST[v] ?? 0);

      positions.push({
        ...base[1],
        char: toPositionalGlyph("V", v, effectiveGlyphSetFor("V")),
        x: vx,
        y: baseY,
      });
    } else {
      // 가로모음: Y 맵 사용
      const Vy = (hasT ? METRICS.V.horizYT : METRICS.V.horizYNoT)[v] ?? (hasT ? 50 : 52);
      positions.push({
        ...base[1],
        char: toPositionalGlyph("V", v, effectiveGlyphSetFor("V")),
        x: 50,
        y: Vy,
      });
    }
  } else if (V.length === 2) {
    // 복합 모음: 메트릭 사용
    const [Vh, Vr] = V;
    const VyH = (hasT ? METRICS.V.horizYT : METRICS.V.horizYNoT)[Vh] ?? (hasT ? 50 : 52);
    const VyR = hasT ? METRICS.V.complex.yT : METRICS.V.complex.yNoT;
    const fBase = base[1]?.fontSize ?? (hasT ? METRICS.FS.withT : METRICS.FS.noT);

    positions.push(
      {
        char: toPositionalGlyph("V", Vh, effectiveGlyphSetFor("V")),
        x: METRICS.V.complex.xFirst,
        y: VyH,
        fontSize: fBase + METRICS.V.complex.fsDelta,
      },
      {
        char: toPositionalGlyph("V", Vr, effectiveGlyphSetFor("V")),
        x: METRICS.V.complex.xSecond,
        y: VyR,
        fontSize: fBase + METRICS.V.complex.fsDelta,
      }
    );
  }

  // === 종성
  if (hasT) {
    const fT = base[2]?.fontSize ?? (hasT ? METRICS.FS.withT - 4 : METRICS.FS.noT);
    if (T.length === 1) {
      positions.push({
        char: toPositionalGlyph("T", T[0], effectiveGlyphSetFor("T")),
        x: METRICS.T.x,
        y: METRICS.T.y, // 더 위(기존 78 → 55 근방)
        fontSize: fT,
      });
    } else if (T.length === 2) {
      positions.push(
        {
          char: toPositionalGlyph("T", T[0], effectiveGlyphSetFor("T")),
          x: METRICS.T.x - METRICS.T.pairDx,
          y: METRICS.T.y,
          fontSize: fT + METRICS.T.fsDeltaPair,
        },
        {
          char: toPositionalGlyph("T", T[1], effectiveGlyphSetFor("T")),
          x: METRICS.T.x + METRICS.T.pairDx,
          y: METRICS.T.y,
          fontSize: fT + METRICS.T.fsDeltaPair,
        }
      );
    }
  }

  return positions;
}

/** ------------------------- 캔버스 유사도 ------------------------- */
const CANVAS_FONT = "700 70px 'Noto Sans KR', sans-serif"; // 동일 조건

function drawOriginal(ctx: CanvasRenderingContext2D, char: string) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.font = CANVAS_FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000";
  ctx.fillText(char, ctx.canvas.width / 2, ctx.canvas.height / 2);
}

function drawComposed(ctx: CanvasRenderingContext2D, jamo: PlaygroundJamoPosition[]) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000";
  jamo.forEach((p) => {
    const cx = (p.x / 100) * ctx.canvas.width;
    const cy = (p.y / 100) * ctx.canvas.height;
    ctx.font = `700 ${p.fontSize}px 'Noto Sans KR', sans-serif`;
    ctx.fillText(p.char, cx, cy);
  });
}

function gray(img: ImageData, i: number) {
  const r = img.data[i], g = img.data[i + 1], b = img.data[i + 2];
  return (r + g + b) / 3;
}

function similarity(a: ImageData, b: ImageData): number {
  const n = a.data.length;
  let acc = 0;
  for (let i = 0; i < n; i += 4) {
    const ga = gray(a, i);
    const gb = gray(b, i);
    const active = ga < 250 || gb < 250; // 글자 영역만
    if (!active) continue;
    const diff = Math.abs(ga - gb) / 255;
    acc += 1 - diff;
  }
  const px = n / 4;
  return Math.max(0, Math.min(1, acc / px));
}

/** ------------------------- 메인 컴포넌트 ------------------------- */
export default function HangulJamoSVGPlayground() {
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(200);
  const syllables = useMemo(() => buildSyllables(), []);
  const filtered = useMemo(
    () => (query ? syllables.filter((c) => c.includes(query)) : syllables).slice(0, count),
    [syllables, query, count]
  );

  const [patternDefaults, setPatternDefaults] =
    useState<Partial<Record<PatternKey, [PlaygroundJamoPosition, PlaygroundJamoPosition, PlaygroundJamoPosition | null]>>>({});
  const [overrides, setOverrides] = useState<Record<string, number[]>>({});
  const [current, setCurrent] = useState<string>("가");

  const [positions, setPositions] = useState<PlaygroundJamoPosition[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  const dragRef = useRef({ isDragging: false, targetIdx: -1 });

  const leftRef = useRef<HTMLCanvasElement | null>(null);
  const rightRef = useRef<HTMLCanvasElement | null>(null);
  const W = 200, H = 200;

  useEffect(() => {
    const save = loadSave();
    setOverrides(save.overrides || {});
  }, []);

  useEffect(() => {
    const p = getJamoPositions(current, patternDefaults, overrides);
    setPositions(p);
  }, [current, patternDefaults, overrides]);

  useEffect(() => {
    (async () => {
      // @ts-ignore
      if (document.fonts && document.fonts.ready) {
        // @ts-ignore
        await document.fonts.ready;
      }
      redraw();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, positions]);

  function redraw() {
    const l = leftRef.current?.getContext("2d");
    const r = rightRef.current?.getContext("2d");
    if (!l || !r) return;
    drawOriginal(l, current);
    drawComposed(r, positions);
    const a = l.getImageData(0, 0, W, H);
    const b = r.getImageData(0, 0, W, H);
    const s = similarity(a, b);
    setScore(Math.round(s * 1000) / 10);
  }

  function onMouseDown(e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    let min = Infinity, idx = 0;
    positions.forEach((p, i) => {
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < min) { min = d; idx = i; }
    });
    dragRef.current = { isDragging: true, targetIdx: idx };
    setSelectedIdx(idx);
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragRef.current.isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const targetIdx = dragRef.current.targetIdx;
    setPositions((prev) => prev.map((p, i) => i === targetIdx ? { ...p, x, y } : p));
  }

  function onMouseUp() {
    dragRef.current.isDragging = false;
  }

  function onWheel(e: React.WheelEvent) {
    if (!e.shiftKey) return;
    e.preventDefault();
    const delta = -Math.sign(e.deltaY);
    setPositions((prev) => prev.map((p, i) =>
      i === selectedIdx ? { ...p, fontSize: Math.max(20, Math.min(80, p.fontSize + delta)) } : p
    ));
  }

  function savePatternDefault() {
    const parts = Hangul.disassemble(current);
    const hasJong = parts.length >= 3;
    const pat = detectPattern(parts[1], hasJong);
    const flat = flattenPositions(positions);
    const save = loadSave();
    save.patterns[pat] = flat;
    persistSave(save);
    alert(`패턴 기본값 저장: ${pat}`);
  }

  function saveOverride() {
    const save = loadSave();
    save.overrides[current] = flattenPositions(positions);
    persistSave(save);
    setOverrides({ ...overrides, [current]: save.overrides[current] });
    alert(`개별 저장: ${current}`);
  }

  function exportAll() {
    const save = loadSave();
    const exportData = {
      overrides: save.overrides,
      meta: {
        version: 1,
        convention: "order=[L,...V,...T], triplet=(x,y,fontSize), viewBox=100",
        description: "가변 길이 자모 좌표 (복합 모음/받침 분리)"
      }
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "overrides.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function openEditor(ch: string) {
    setCurrent(ch);
  }

  function patternBadge(ch: string) {
    const parts = Hangul.disassemble(ch);
    if (parts.length < 2) return "-";
    const key = detectPattern(parts[1], parts.length >= 3);
    return key;
  }

  function SvgPreview({ ch }: { ch: string }) {
    const ps = getJamoPositions(ch, patternDefaults, overrides);
    return (
      <svg viewBox="0 0 100 100" className="w-12 h-12">
        {ps.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={p.y}
            fontSize={p.fontSize}
            fontWeight={700}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#000"
            fontFamily="'Noto Sans KR', sans-serif"
          >
            {p.char}
          </text>
        ))}
      </svg>
    );
  }

  function EditorOverlay({ children }: { children: React.ReactNode }) {
    return (
      <div
        className="relative w-full h-full select-none"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
        title="드래그로 이동, Shift+휠로 크기 조절"
      >
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 pointer-events-none">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="border border-gray-100" />
          ))}
        </div>
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 pointer-events-none" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 pointer-events-none" />
        {children}
        {positions.map((p, i) => (
          <div
            key={i}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border ${
              i === selectedIdx ? "border-green-600 bg-green-200/50" : "border-gray-400 bg-white/70"
            }`}
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: 16, height: 16 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">한글 자모 분해 SVG 플레이그라운드</h1>
      <p className="text-sm text-gray-600">
        카드 클릭 → 우측 편집. 드래그로 위치 이동, <b>Shift+휠</b>로 크기 조절. 상단 검색/더보기 지원.
      </p>

      <div className="flex items-center gap-2">
        <input
          className="px-3 py-2 border rounded w-60"
          placeholder="검색 (예: 각, 공, 곽)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="px-3 py-2 border rounded" onClick={() => setCount((c) => c + 200)}>더 보기 +200</button>
        <button className="px-3 py-2 border rounded" onClick={() => setCount(11172)}>전체 보기</button>
        <button className="px-3 py-2 border rounded" onClick={exportAll}>📤 전체 내보내기</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="grid grid-cols-10 gap-2">
            {filtered.map((ch) => (
              <button
                key={ch}
                onClick={() => openEditor(ch)}
                className={`border rounded p-2 flex flex-col items-center gap-1 hover:bg-gray-50 ${
                  ch === current ? "ring-2 ring-blue-500" : ""
                }`}
                title={patternBadge(ch)}
              >
                <div className="text-lg font-bold">{ch}</div>
                <SvgPreview ch={ch} />
                <div className="text-[10px] text-gray-500">{patternBadge(ch)}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold">편집: {current}</div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 border rounded" onClick={savePatternDefault}>💾 패턴 기본값 저장</button>
              <button className="px-2 py-1 border rounded" onClick={saveOverride}>🎯 이 글자만 저장</button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="border rounded aspect-square relative overflow-hidden">
              <EditorOverlay>
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                  {positions.map((p, i) => (
                    <text
                      key={i}
                      x={p.x}
                      y={p.y}
                      fontSize={p.fontSize}
                      fontWeight={700}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={i === selectedIdx ? "#10B981" : "#000"}
                      fontFamily="'Noto Sans KR', sans-serif"
                    >
                      {p.char}
                    </text>
                  ))}
                </svg>
              </EditorOverlay>
            </div>

            <div className="border rounded p-2 space-y-2">
              <div className="text-sm text-gray-600">원본 vs 조합 비교</div>
              <div className="flex items-center gap-2">
                <canvas ref={leftRef} width={W} height={H} className="border rounded" />
                <div className="text-gray-400">→</div>
                <canvas ref={rightRef} width={W} height={H} className="border rounded" />
              </div>
              <div className="text-sm">유사도: <b>{score}%</b></div>
              <button className="px-2 py-1 border rounded" onClick={redraw}>↻ 재계산</button>
            </div>

            <div className="border rounded p-2">
              <div className="text-sm font-medium mb-1">현재 좌표</div>
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-48">
                {JSON.stringify(positions, null, 2)}
              </pre>
              <div className="text-xs text-gray-500 mt-2">드래그로 이동, Shift+휠로 크기 조절. 가장 가까운 점이 선택됩니다.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ------------------------- 보조 함수 ------------------------- */
function buildSyllables(): string[] {
  const arr: string[] = [];
  for (let code = 0xac00; code <= 0xd7a3; code++) arr.push(String.fromCharCode(code));
  return arr;
}

function flattenPositions(pos: PlaygroundJamoPosition[]): number[] {
  const out: number[] = [];
  for (const p of pos) {
    out.push(p.x, p.y, p.fontSize);
  }
  return out;
}
