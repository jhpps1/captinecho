import React, { useEffect, useMemo, useRef, useState } from "react";
// 외부 의존성: hangul-js (npm i hangul-js) — 편의 유틸로 남겨두되, 분해는 유니코드 공식 사용
import Hangul from "hangul-js";

/** ------------------------- 타입/유틸 ------------------------- */
type PlaygroundJamoPosition = {
  char: string; // 자모 문자
  x: number;   // 0~100 (viewBox 기준)
  y: number;   // 0~100
  fontSize: number; // px (viewBox에 상대적)
};

type VowelType = "vertical" | "horizontal" | "complex";
const V_VERTICAL = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅣ"] as const;
const V_HORIZONTAL = ["ㅗ", "ㅛ", "ㅜ", "ㅠ", "ㅡ"] as const;
const V_COMPLEX = ["ㅘ", "ㅙ", "ㅚ", "ㅝ", "ㅞ", "ㅟ", "ㅢ"] as const;

function getVowelType(vowel: string): VowelType {
  if ((V_VERTICAL as readonly string[]).includes(vowel)) return "vertical";
  if ((V_HORIZONTAL as readonly string[]).includes(vowel)) return "horizontal";
  if ((V_COMPLEX as readonly string[]).includes(vowel)) return "complex";
  return "vertical";
}

/* ✅ 유니코드 분해 테이블 */
const L_TABLE = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const V_TABLE = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"];
const T_TABLE = ["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

/* 복합 모음/겹받침 분해 */
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

type Part = "L" | "V" | "T";
type GlyphSet = "positional" | "compat";
type GetJamoOptions = {
  glyphSet?: GlyphSet;
  /** 종성 없을 때(LV) 초/중성은 호환 자모 유지 */
  lvCompatWhenNoT?: boolean; // default: true
};

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

/** ✅ 유니코드 공식으로 확정 분해 (중복/오인 방지) */
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

  const V = (COMPLEX_VOWEL_MAP[VChar] ?? [VChar]).slice(); // 1~2개
  const T = TChar ? (COMPLEX_FINAL_MAP[TChar] ?? [TChar]).slice() : []; // 0~2개

  return { L, V, T };
}

/** ------------------------- 메트릭/보정 ------------------------- */
const METRICS = {
  FS: { noT: 72, withT: 60 },
  L:  { xNoT: 28, yNoT: 54, xT: 27, yT: 46 },
  V: {
    vert: { xNoT: 62, yNoT: 56, xT: 60, yT: 46 },
    horizYNoT: { 'ㅗ': 44, 'ㅡ': 52, 'ㅜ': 60 } as Record<string, number>,
    horizYT:   { 'ㅗ': 42, 'ㅡ': 50, 'ㅜ': 58 } as Record<string, number>,
    complex: { xFirst: 46, xSecond: 60, yNoT: 56, yT: 46, fsDelta: -5 },
  },
  T:  { x: 50, y: 55, pairDx: 4, fsDeltaPair: -2 },
  LV_SPREAD: 4,
  H_LV_SPREAD: 4,
};
const VERT_X_ADJUST: Record<string, number> = { 'ㅑ': 2, 'ㅕ': 3, 'ㅒ': 2, 'ㅖ': 3 };

/* 패턴 6분류 */
export type PatternKey = "VERT_NOJONG"|"VERT_JONG"|"HORZ_NOJONG"|"HORZ_JONG"|"COMP_NOJONG"|"COMP_JONG";
function detectPattern(jung: string, hasJong: boolean): PatternKey {
  const t = getVowelType(jung);
  if (t === "vertical") return hasJong ? "VERT_JONG" : "VERT_NOJONG";
  if (t === "horizontal") return hasJong ? "HORZ_JONG" : "HORZ_NOJONG";
  return hasJong ? "COMP_JONG" : "COMP_NOJONG";
}

/** ------------------------- 기본 배치 ------------------------- */
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
    { char: "", x: METRICS.L.xNoT, y: METRICS.L.yNoT, fontSize: METRICS.FS.noT },
    { char: "", x: 50,             y: METRICS.V.horizYNoT["ㅗ"], fontSize: METRICS.FS.noT },
    null,
  ],
  HORZ_JONG: [
    { char: "", x: METRICS.L.xT, y: METRICS.L.yT, fontSize: METRICS.FS.withT },
    { char: "", x: 50,           y: METRICS.V.horizYT["ㅗ"], fontSize: METRICS.FS.withT },
    { char: "", x: METRICS.T.x,  y: METRICS.T.y,  fontSize: METRICS.FS.withT - 4 },
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

const LS_KEY = "hangul_svg_positions_v1";
type SaveBlob = { patterns: Partial<Record<PatternKey, number[]>>; overrides: Record<string, number[]>; };
function loadSave(): SaveBlob {
  try { const raw = localStorage.getItem(LS_KEY); return raw ? JSON.parse(raw) : { patterns: {}, overrides: {} }; }
  catch { return { patterns: {}, overrides: {} }; }
}
function persistSave(blob: SaveBlob) { localStorage.setItem(LS_KEY, JSON.stringify(blob)); }

/** ------------------------- 좌표 계산 ------------------------- */
export function getJamoPositions(
  syllable: string,
  patternDefaults: Partial<Record<PatternKey, [PlaygroundJamoPosition,PlaygroundJamoPosition,PlaygroundJamoPosition|null]>>,
  overrides: SaveBlob["overrides"],
  options?: GetJamoOptions
): PlaygroundJamoPosition[] {
  const glyphSet: GlyphSet = options?.glyphSet ?? "positional";
  const lvCompatWhenNoT = options?.lvCompatWhenNoT ?? true;

  // ✅ 확정 분해
  const norm = decomposeSyllable(syllable);
  if (!norm) return [];
  const { L, V, T } = norm;
  const hasT = T.length > 0;

  const effectiveGlyphSetFor = (part: Part): GlyphSet => {
    if (!hasT && lvCompatWhenNoT && (part === "L" || part === "V")) return "compat";
    return glyphSet;
  };

  const isComplex = V.length === 2;
  const pat: PatternKey = isComplex ? (hasT ? "COMP_JONG" : "COMP_NOJONG")
                                    : detectPattern(V[0], hasT);

  const save = loadSave();
  const flat = overrides[syllable] ?? save.overrides[syllable];

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
          x: flat[idx], y: flat[idx + 1], fontSize: flat[idx + 2],
        });
      }
    }
    return positions;
  }

  const base = (patternDefaults[pat] ?? DEFAULTS[pat]).map((p) => (p ? { ...p } : null));
  const positions: PlaygroundJamoPosition[] = [];

  // L
  if (base[0]) positions.push({ ...base[0], char: toPositionalGlyph("L", L, effectiveGlyphSetFor("L")) });

  // V
  if (V.length === 1 && base[1]) {
    const v = V[0];
    const vt = getVowelType(v);
    if (vt === "vertical") {
      const spread = METRICS.LV_SPREAD;
      positions[0] = { ...positions[0], x: (positions[0].x ?? METRICS.L.xNoT) - Math.round(spread / 2) };
      const baseX = base[1].x ?? (hasT ? METRICS.V.vert.xT : METRICS.V.vert.xNoT);
      const baseY = base[1].y ?? (hasT ? METRICS.V.vert.yT : METRICS.V.vert.yNoT);
      const vx = baseX + spread + (VERT_X_ADJUST[v] ?? 0);
      positions.push({ ...base[1], char: toPositionalGlyph("V", v, effectiveGlyphSetFor("V")), x: vx, y: baseY });
    } else {
      const Vy = (hasT ? METRICS.V.horizYT : METRICS.V.horizYNoT)[v] ?? (hasT ? 50 : 52);
      const spread = METRICS.H_LV_SPREAD ?? 0;
      positions[0] = { ...positions[0], x: (positions[0].x ?? (hasT ? METRICS.L.xT : METRICS.L.xNoT)) - spread / 2 };
      positions.push({ ...base[1], char: toPositionalGlyph("V", v, effectiveGlyphSetFor("V")), x: 50 + spread / 2, y: Vy });
    }
  } else if (V.length === 2) {
    const [Vh, Vr] = V;
    const VyH = (hasT ? METRICS.V.horizYT : METRICS.V.horizYNoT)[Vh] ?? (hasT ? 50 : 52);
    const VyR = hasT ? METRICS.V.complex.yT : METRICS.V.complex.yNoT;
    const fBase = base[1]?.fontSize ?? (hasT ? METRICS.FS.withT : METRICS.FS.noT);
    positions.push(
      { char: toPositionalGlyph("V", Vh, effectiveGlyphSetFor("V")), x: METRICS.V.complex.xFirst,  y: VyH, fontSize: fBase + METRICS.V.complex.fsDelta },
      { char: toPositionalGlyph("V", Vr, effectiveGlyphSetFor("V")), x: METRICS.V.complex.xSecond, y: VyR, fontSize: fBase + METRICS.V.complex.fsDelta },
    );
  }

  // T
  if (hasT) {
    const fT = base[2]?.fontSize ?? (hasT ? METRICS.FS.withT - 4 : METRICS.FS.noT);
    if (T.length === 1) {
      positions.push({ char: toPositionalGlyph("T", T[0], effectiveGlyphSetFor("T")), x: METRICS.T.x, y: METRICS.T.y, fontSize: fT });
    } else if (T.length === 2) {
      positions.push(
        { char: toPositionalGlyph("T", T[0], effectiveGlyphSetFor("T")), x: METRICS.T.x - METRICS.T.pairDx, y: METRICS.T.y, fontSize: fT + METRICS.T.fsDeltaPair },
        { char: toPositionalGlyph("T", T[1], effectiveGlyphSetFor("T")), x: METRICS.T.x + METRICS.T.pairDx, y: METRICS.T.y, fontSize: fT + METRICS.T.fsDeltaPair },
      );
    }
  }

  return positions;
}

/** ------------------------- 캔버스 유사도 ------------------------- */
const CANVAS_FONT = "700 70px 'Noto Sans KR', sans-serif";
function drawOriginal(ctx: CanvasRenderingContext2D, char: string) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.font = CANVAS_FONT; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#000";
  ctx.fillText(char, ctx.canvas.width / 2, ctx.canvas.height / 2);
}
function drawComposed(ctx: CanvasRenderingContext2D, jamo: PlaygroundJamoPosition[]) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.imageSmoothingEnabled = true; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#000";
  jamo.forEach((p) => { ctx.font = `700 ${p.fontSize}px 'Noto Sans KR', sans-serif`;
    const cx = (p.x / 100) * ctx.canvas.width, cy = (p.y / 100) * ctx.canvas.height;
    ctx.fillText(p.char, cx, cy);
  });
}
function gray(img: ImageData, i: number) { const r=img.data[i], g=img.data[i+1], b=img.data[i+2]; return (r+g+b)/3; }
function similarity(a: ImageData, b: ImageData): number {
  const n = a.data.length; let acc = 0;
  for (let i = 0; i < n; i += 4) {
    const ga = gray(a,i), gb = gray(b,i);
    const active = ga < 250 || gb < 250; if (!active) continue;
    const diff = Math.abs(ga-gb)/255; acc += 1-diff;
  }
  return Math.max(0, Math.min(1, acc / (n/4)));
}

/** ---------- 오버랩 박스 & 페널티 ---------- */
function bboxFromCenter(ctx: CanvasRenderingContext2D, char: string, cx: number, cy: number, fs: number) {
  ctx.font = `700 ${fs}px 'Noto Sans KR', sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const m = ctx.measureText(char);
  const left = cx - m.actualBoundingBoxLeft, right = cx + m.actualBoundingBoxRight;
  const top = cy - m.actualBoundingBoxAscent, bottom = cy + m.actualBoundingBoxDescent;
  return { left, right, top, bottom };
}
function overlapArea(a:{left:number;right:number;top:number;bottom:number}, b:{left:number;right:number;top:number;bottom:number}) {
  const w = Math.max(0, Math.min(a.right,b.right) - Math.max(a.left,b.left));
  const h = Math.max(0, Math.min(a.bottom,b.bottom) - Math.max(a.top,b.top));
  return w*h;
}
function overlapPenaltyForPositions(pos: PlaygroundJamoPosition[], width:number, height:number) {
  const c = document.createElement("canvas"); c.width = width; c.height = height;
  const ctx = c.getContext("2d")!;
  const boxes = pos.map(p => bboxFromCenter(ctx, p.char, (p.x/100)*width, (p.y/100)*height, p.fontSize));
  let sum = 0;
  for (let i=0;i<boxes.length;i++) for (let j=i+1;j<boxes.length;j++) sum += overlapArea(boxes[i], boxes[j]);
  return sum / (width*height);
}

/** ---------- 손실 함수 ---------- */
async function lossForPositions(syllable:string, positions:PlaygroundJamoPosition[], W=200, H=200, lambda=0.004) {
  const l = document.createElement("canvas"); l.width=W; l.height=H;
  const r = document.createElement("canvas"); r.width=W; r.height=H;
  const lctx = l.getContext("2d")!, rctx = r.getContext("2d")!;
  drawOriginal(lctx, syllable); drawComposed(rctx, positions);
  const a = lctx.getImageData(0,0,W,H), b = rctx.getImageData(0,0,W,H);
  const sim = similarity(a,b), pen = overlapPenaltyForPositions(positions,W,H);
  return (1-sim) + lambda*pen;
}

/** ---------- 저장 유틸 ---------- */
function saveOverridePositions(ch: string, pos: PlaygroundJamoPosition[]) {
  const save = loadSave(); save.overrides[ch] = flattenPositions(pos); persistSave(save);
}

/** ---------- Auto-fit ---------- */
async function autoFitSyllableOnce(
  syllable: string,
  patternDefaults: Partial<Record<PatternKey, [PlaygroundJamoPosition,PlaygroundJamoPosition,PlaygroundJamoPosition|null]>>,
  overrides: Record<string, number[]>,
) {
  const base = getJamoPositions(syllable, patternDefaults, {}, { glyphSet: "positional", lvCompatWhenNoT: true });
  let best = base.map(p => ({ ...p })); let bestLoss = await lossForPositions(syllable, best);

  const STEPS = 40, DELTA_POS = 2.2, DELTA_FS = 1.4;
  for (let s=0; s<STEPS; s++) {
    const trial = best.map(p => ({
      ...p,
      x: p.x + (Math.random()-0.5)*2*DELTA_POS,
      y: p.y + (Math.random()-0.5)*2*DELTA_POS,
      fontSize: Math.max(40, Math.min(80, p.fontSize + (Math.random()-0.5)*2*DELTA_FS)),
    }));
    const L = await lossForPositions(syllable, trial);
    if (L < bestLoss) { best = trial; bestLoss = L; }
  }

  const baseLoss = await lossForPositions(syllable, base);
  if (baseLoss - bestLoss >= 0.005) { saveOverridePositions(syllable, best); return { saved:true, loss:bestLoss, baseLoss }; }
  return { saved:false, loss:bestLoss, baseLoss };
}

async function autoFixMany(
  syllables: string[],
  patternDefaults: Partial<Record<PatternKey, [PlaygroundJamoPosition,PlaygroundJamoPosition,PlaygroundJamoPosition|null]>>,
  overrides: Record<string, number[]>,
  onProgress?: (done:number, total:number, lastSaved?:string) => void,
) {
  let done = 0;
  for (const ch of syllables) {
    // @ts-ignore
    if (document.fonts && document.fonts.ready) { await (document as any).fonts.ready; }
    await autoFitSyllableOnce(ch, patternDefaults, overrides);
    done++; onProgress?.(done, syllables.length, ch);
    await new Promise(r => setTimeout(r));
  }
}

/** ------------------------- 메인 컴포넌트 ------------------------- */
export default function HangulJamoSVGPlayground() {
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(200);
  const syllables = useMemo(() => buildSyllables(), []);
  const filtered = useMemo(() => (query ? syllables.filter((c) => c.includes(query)) : syllables).slice(0, count), [syllables, query, count]);

  const [patternDefaults] = useState<Partial<Record<PatternKey, [PlaygroundJamoPosition,PlaygroundJamoPosition,PlaygroundJamoPosition|null]>>>({});
  const [overrides, setOverrides] = useState<Record<string, number[]>>({});
  const [current, setCurrent] = useState<string>("가");

  const [positions, setPositions] = useState<PlaygroundJamoPosition[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{done:number; total:number}>({done:0,total:0});

  const dragRef = useRef({ isDragging: false, targetIdx: -1 });
  const leftRef = useRef<HTMLCanvasElement | null>(null);
  const rightRef = useRef<HTMLCanvasElement | null>(null);
  const W = 200, H = 200;

  useEffect(() => { const save = loadSave(); setOverrides(save.overrides || {}); }, []);

  useEffect(() => {
    const p = getJamoPositions(current, patternDefaults, overrides, { glyphSet: 'positional', lvCompatWhenNoT: true });
    setPositions(p);
  }, [current, patternDefaults, overrides]);

  useEffect(() => {
    (async () => {
      // @ts-ignore
      if (document.fonts && document.fonts.ready) { await document.fonts.ready; }
      redraw();
    })();
  }, [current, positions]);

  function redraw() {
    const l = leftRef.current?.getContext("2d");
    const r = rightRef.current?.getContext("2d");
    if (!l || !r) return;
    drawOriginal(l, current); drawComposed(r, positions);
    const a = l.getImageData(0,0,W,H); const b = r.getImageData(0,0,W,H);
    const s = similarity(a,b); setScore(Math.round(s*1000)/10);
  }

  function onMouseDown(e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    let min = Infinity, idx = 0;
    positions.forEach((p, i) => { const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < min) { min = d; idx = i; }});
    dragRef.current = { isDragging: true, targetIdx: idx }; setSelectedIdx(idx);
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragRef.current.isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const targetIdx = dragRef.current.targetIdx;
    setPositions((prev) => prev.map((p, i) => i === targetIdx ? { ...p, x, y } : p));
  }
  function onMouseUp() { dragRef.current.isDragging = false; }
  function onWheel(e: React.WheelEvent) {
    if (!e.shiftKey) return;
    e.preventDefault();
    const delta = -Math.sign(e.deltaY);
    setPositions((prev) => prev.map((p, i) =>
      i === selectedIdx ? { ...p, fontSize: Math.max(20, Math.min(80, p.fontSize + delta)) } : p
    ));
  }

  function savePatternDefault() {
    const norm = decomposeSyllable(current)!;
    const pat = norm ? (norm.V.length === 2 ? (norm.T.length ? "COMP_JONG" : "COMP_NOJONG") : detectPattern(norm.V[0], norm.T.length>0)) : "VERT_NOJONG";
    const flat = flattenPositions(positions);
    const save = loadSave(); save.patterns[pat] = flat; persistSave(save);
    alert(`패턴 기본값 저장: ${pat}`);
  }
  function saveOverride() {
    const save = loadSave(); save.overrides[current] = flattenPositions(positions); persistSave(save);
    setOverrides({ ...overrides, [current]: save.overrides[current] }); alert(`개별 저장: ${current}`);
  }

  async function handleAutoFitCurrent() {
    setBusy(true);
    try {
      await autoFitSyllableOnce(current, patternDefaults, overrides);
      const save = loadSave(); setOverrides(save.overrides || {});
      const p = getJamoPositions(current, patternDefaults, save.overrides, { glyphSet:'positional', lvCompatWhenNoT:true });
      setPositions(p);
    } finally { setBusy(false); }
  }
  async function handleAutoFixFiltered() {
    setBusy(true); setProgress({done:0,total:filtered.length});
    try {
      await autoFixMany(filtered, patternDefaults, overrides, (done,total)=>setProgress({done,total}));
      const save = loadSave(); setOverrides(save.overrides || {});
    } finally { setBusy(false); }
  }

  function exportAll() {
    const save = loadSave();
    const exportData = { overrides: save.overrides, meta: { version: 1, convention: "order=[L,...V,...T], triplet=(x,y,fontSize), viewBox=100", description: "가변 길이 자모 좌표 (복합 모음/받침 분리)" } };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "overrides.json"; a.click(); URL.revokeObjectURL(url);
  }

  function openEditor(ch: string) { setCurrent(ch); }

  function patternBadge(ch: string) {
    const n = decomposeSyllable(ch);
    if (!n) return "-";
    return n.V.length === 2 ? (n.T.length ? "COMP_JONG" : "COMP_NOJONG")
                            : detectPattern(n.V[0], n.T.length>0);
  }

  function SvgPreview({ ch }: { ch: string }) {
    const ps = getJamoPositions(ch, patternDefaults, overrides, { glyphSet: 'positional', lvCompatWhenNoT: true });
    return (
      <svg viewBox="0 0 100 100" className="w-12 h-12">
        {ps.map((p, i) => (
          <text key={i} x={p.x} y={p.y} fontSize={p.fontSize} fontWeight={700}
            textAnchor="middle" dominantBaseline="middle" fill="#000"
            fontFamily="'Noto Sans KR', sans-serif">
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
        onMouseDown={onMouseDown} onMouseMove={onMouseMove}
        onMouseUp={onMouseUp} onMouseLeave={onMouseUp} onWheel={onWheel}
        title="드래그로 이동, Shift+휠로 크기 조절"
      >
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 pointer-events-none">
          {Array.from({ length: 100 }).map((_, i) => <div key={i} className="border border-gray-100" />)}
        </div>
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 pointer-events-none" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 pointer-events-none" />
        {children}
        {positions.map((p, i) => (
          <div key={i}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border ${i === selectedIdx ? "border-green-600 bg-green-200/50" : "border-gray-400 bg-white/70"}`}
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: 16, height: 16 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">한글 자모 분해 SVG 플레이그라운드</h1>
      <p className="text-sm text-gray-600">카드 클릭 → 우측 편집. 드래그 이동, <b>Shift+휠</b> 크기 조절.</p>

      <div className="flex items-center gap-2">
        <input className="px-3 py-2 border rounded w-60" placeholder="검색 (예: 각, 공, 곽)"
          value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="px-3 py-2 border rounded" onClick={() => setCount((c) => c + 200)}>더 보기 +200</button>
        <button className="px-3 py-2 border rounded" onClick={() => setCount(11172)}>전체 보기</button>
        <button className="px-3 py-2 border rounded" onClick={exportAll}>📤 전체 내보내기</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="grid grid-cols-10 gap-2">
            {filtered.map((ch) => (
              <button key={ch} onClick={() => openEditor(ch)}
                className={`border rounded p-2 flex flex-col items-center gap-1 hover:bg-gray-50 ${ch === current ? "ring-2 ring-blue-500" : ""}`}
                title={patternBadge(ch)}>
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
              <button className="px-2 py-1 border rounded" disabled={busy} onClick={handleAutoFitCurrent}>🧪 Auto-fit(현재)</button>
              <button className="px-2 py-1 border rounded" disabled={busy} onClick={handleAutoFixFiltered}>⚡ Auto-fix(이 목록)</button>
            </div>
          </div>

          {busy && <div className="text-sm text-blue-600">작업 중… {progress.done} / {progress.total}</div>}

          <div className="grid grid-cols-3 gap-3">
            <div className="border rounded aspect-square relative overflow-hidden">
              <EditorOverlay>
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                  {positions.map((p, i) => (
                    <text key={i} x={p.x} y={p.y} fontSize={p.fontSize} fontWeight={700}
                      textAnchor="middle" dominantBaseline="middle" fill={i === selectedIdx ? "#10B981" : "#000"}
                      fontFamily="'Noto Sans KR', sans-serif">
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
              <div className="text-xs text-gray-500 mt-2">드래그로 이동, Shift+휠로 크기 조절.</div>
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
  for (const p of pos) out.push(p.x, p.y, p.fontSize);
  return out;
}
