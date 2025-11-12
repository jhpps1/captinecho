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

/* (참고용) 복합 모음/겹받침 분해표 — 이제 사용하지 않지만 남겨둠 */
// const COMPLEX_VOWEL_MAP: Record<string, [string, string]> = { ... };
// const COMPLEX_FINAL_MAP: Record<string, [string, string]> = { ... };

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

// ✅ 복합 모음까지 포함해서 '중성 전용'으로 매핑
const JUNGSEONG_MAP: Record<string, string> = {
  // 단일 모음
  "ㅏ":"ᅡ","ㅐ":"ᅢ","ㅑ":"ᅣ","ㅒ":"ᅤ","ㅓ":"ᅥ","ㅔ":"ᅦ","ㅕ":"ᅧ","ㅖ":"ᅨ",
  "ㅗ":"ᅩ","ㅛ":"ᅭ","ㅜ":"ᅮ","ㅠ":"ᅲ","ㅡ":"ᅳ","ㅣ":"ᅵ",
  // 복합 모음 
  "ㅘ":"ᅪ","ㅙ":"ᅫ","ㅚ":"ᅬ","ㅝ":"ᅯ","ㅞ":"ᅰ","ㅟ":"ᅱ","ㅢ":"ᅴ",
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

/** ------------------------- 메트릭/보정 ------------------------- */
const METRICS = {
  FS: { noT: 72, withT: 60 },
  L:  { xNoT: 28, yNoT: 54, xT: 27, yT: 46 },
  V: {
    vert: { xNoT: 62, yNoT: 56, xT: 60, yT: 46 },
    horizYNoT: { 'ㅗ': 44, 'ㅡ': 52, 'ㅜ': 60 } as Record<string, number>,
    horizYT:   { 'ㅗ': 42, 'ㅡ': 50, 'ㅜ': 58 } as Record<string, number>,
    // 복합모음 전용 기본치(단일 글리프지만 살짝 축소)
    complex: { x: 58, yNoT: 54, yT: 45, fsDelta: -3 },
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
    { char: "", x: METRICS.L.xNoT, y: METRICS.L.yNoT, fontSize: METRICS.FS.noT },
    { char: "", x: METRICS.V.vert.xNoT, y: METRICS.V.vert.yNoT, fontSize: METRICS.FS.noT },
    null,
  ],
  VERT_JONG: [
    { char: "", x: METRICS.L.xT, y: METRICS.L.yT, fontSize: METRICS.FS.withT },
    { char: "", x: METRICS.V.vert.xT, y: METRICS.V.vert.yT, fontSize: METRICS.FS.withT },
    { char: "", x: METRICS.T.x, y: METRICS.T.y, fontSize: METRICS.FS.withT - 4 },
  ],
  HORZ_NOJONG: [
    { char: "", x: METRICS.L.xNoT, y: METRICS.L.yNoT, fontSize: METRICS.FS.noT },
    { char: "", x: 50, y: METRICS.V.horizYNoT["ㅗ"], fontSize: METRICS.FS.noT },
    null,
  ],
  HORZ_JONG: [
    { char: "", x: METRICS.L.xT, y: METRICS.L.yT, fontSize: METRICS.FS.withT },
    { char: "", x: 50, y: METRICS.V.horizYT["ㅗ"], fontSize: METRICS.FS.withT },
    { char: "", x: METRICS.T.x, y: METRICS.T.y, fontSize: METRICS.FS.withT - 4 },
  ],
  // 복합모음은 단일 글리프로 배치 (약간 축소 및 상단으로)
  COMP_NOJONG: [
    { char: "", x: METRICS.L.xNoT, y: METRICS.L.yNoT, fontSize: METRICS.FS.noT },
    { char: "", x: METRICS.V.complex.x, y: METRICS.V.complex.yNoT, fontSize: METRICS.FS.noT + METRICS.V.complex.fsDelta },
    null,
  ],
  COMP_JONG: [
    { char: "", x: METRICS.L.xT, y: METRICS.L.yT, fontSize: METRICS.FS.withT },
    { char: "", x: METRICS.V.complex.x, y: METRICS.V.complex.yT, fontSize: METRICS.FS.withT + METRICS.V.complex.fsDelta },
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

  // ✅ 확정 분해 (복합 미분해)
  const norm = decomposeSyllable(syllable);
  if (!norm) return [];
  const { L, V, T } = norm;
  const hasT = T.length > 0;

  const effectiveGlyphSetFor = (part: Part): GlyphSet => {
    if (!hasT && lvCompatWhenNoT && (part === "L" || part === "V")) return "compat";
    return glyphSet;
  };

  const pat: PatternKey = detectPattern(V[0], hasT);

  const save = loadSave();
  const flat = overrides[syllable] ?? save.overrides[syllable];

  const allParts: { part: Part; char: string }[] = [
    { part: "L", char: L },
    { part: "V", char: V[0] },
    ...T.map(t => ({ part: "T" as const, char: t })), // 이제 최대 1개
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

  // V (단일 글리프)
  if (base[1]) {
    const v = V[0];
    const vt = getVowelType(v);

    if (vt === "vertical") {
      const spread = METRICS.LV_SPREAD;
      positions[0] = { ...positions[0], x: (positions[0].x ?? METRICS.L.xNoT) - Math.round(spread / 2) };
      const baseX = base[1].x ?? (hasT ? METRICS.V.vert.xT : METRICS.V.vert.xNoT);
      const baseY = base[1].y ?? (hasT ? METRICS.V.vert.yT : METRICS.V.vert.yNoT);
      const vx = baseX + spread + (VERT_X_ADJUST[v] ?? 0);
      positions.push({ ...base[1], char: toPositionalGlyph("V", v, effectiveGlyphSetFor("V")), x: vx, y: baseY });
    } else if (vt === "horizontal") {
      const Vy = (hasT ? METRICS.V.horizYT : METRICS.V.horizYNoT)[v] ?? (hasT ? 50 : 52);
      const spread = METRICS.H_LV_SPREAD ?? 0;
      positions[0] = { ...positions[0], x: (positions[0].x ?? (hasT ? METRICS.L.xT : METRICS.L.xNoT)) - spread / 2 };
      positions.push({ ...base[1], char: toPositionalGlyph("V", v, effectiveGlyphSetFor("V")), x: 50 + spread / 2, y: Vy });
    } else {
      // complex: 단일 글리프지만 약간 축소/위치 보정
      const x = METRICS.V.complex.x;
      const y = hasT ? METRICS.V.complex.yT : METRICS.V.complex.yNoT;
      const fs = (base[1].fontSize ?? (hasT ? METRICS.FS.withT : METRICS.FS.noT)) + METRICS.V.complex.fsDelta;
      positions.push({ ...base[1], char: toPositionalGlyph("V", v, effectiveGlyphSetFor("V")), x, y, fontSize: fs });
    }
  }

  // T (겹받침도 단일 글리프 그대로)
  if (hasT && base[2]) {
    const fT = base[2].fontSize ?? (METRICS.FS.withT - 4);
    positions.push({ char: toPositionalGlyph("T", T[0], effectiveGlyphSetFor("T")), x: METRICS.T.x, y: METRICS.T.y, fontSize: fT });
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

  // 그룹 편집 모드
  const [groupEditMode, setGroupEditMode] = useState(false);
  const [sampleSyllables, setSampleSyllables] = useState<string[]>([]);

  const dragRef = useRef({ isDragging: false, targetIdx: -1 });
  const leftRef = useRef<HTMLCanvasElement | null>(null);
  const rightRef = useRef<HTMLCanvasElement | null>(null);
  const W = 200, H = 200;

  useEffect(() => { const save = loadSave(); setOverrides(save.overrides || {}); }, []);

  useEffect(() => {
    const p = getJamoPositions(current, patternDefaults, overrides, { glyphSet: 'positional', lvCompatWhenNoT: true });
    setPositions(p);
  }, [current, patternDefaults, overrides]);

  // 그룹 편집 모드 활성화 시 샘플 생성
  useEffect(() => {
    if (groupEditMode && current) {
      const samples = getSamePatternSamples(current, 12);
      setSampleSyllables(samples);
    } else {
      setSampleSyllables([]);
    }
  }, [groupEditMode, current]);

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
    const pat = norm ? detectPattern(norm.V[0], norm.T.length>0) : "VERT_NOJONG";
    const flat = flattenPositions(positions);
    const save = loadSave(); save.patterns[pat] = flat; persistSave(save);
    alert(`패턴 기본값 저장: ${pat}`);
  }
  function saveOverride() {
    const save = loadSave(); save.overrides[current] = flattenPositions(positions); persistSave(save);
    setOverrides({ ...overrides, [current]: save.overrides[current] }); alert(`개별 저장: ${current}`);
  }
  function applyToPattern() {
    const norm = decomposeSyllable(current);
    if (!norm) return;
    const pat = detectPattern(norm.V[0], norm.T.length > 0);
    const flat = flattenPositions(positions);
    const save = loadSave();

    // 1. 패턴 기본값 저장
    save.patterns[pat] = flat;

    // 2. 샘플 음절들에도 개별 오버라이드로 저장
    const newOverrides = { ...overrides };
    sampleSyllables.forEach(s => {
      newOverrides[s] = [...flat]; // 각 샘플에 동일한 좌표 개별 저장
    });

    // 3. save.overrides 업데이트 및 저장
    save.overrides = { ...save.overrides, ...newOverrides };
    persistSave(save);

    // 4. 상태 업데이트
    setOverrides(newOverrides);

    alert(`패턴 ${pat}과 샘플 음절 ${sampleSyllables.length}개에 개별 적용 완료!\n\nJSON 내보내기 시 각 음절별로 좌표가 표시됩니다.`);
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
    const exportData = { overrides: save.overrides, meta: { version: 1, convention: "order=[L,...V,...T], triplet=(x,y,fontSize), viewBox=100", description: "가변 길이 자모 좌표 (복합 모음/받침 단일 글리프)" } };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "overrides.json"; a.click(); URL.revokeObjectURL(url);
  }

  function openEditor(ch: string) { setCurrent(ch); }

  function patternBadge(ch: string) {
    const n = decomposeSyllable(ch);
    if (!n) return "-";
    return detectPattern(n.V[0], n.T.length>0);
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
          {Array.from({ length: 100 }).map((_, i) => <div key={i} className="border border-gray-50" />)}
        </div>
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-100 pointer-events-none" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-blue-100 pointer-events-none" />
        {children}
        {positions.map((p, i) => (
          <div key={i}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 cursor-pointer transition-all ${
              i === selectedIdx
                ? "border-green-500 bg-green-400 shadow-lg w-5 h-5"
                : "border-gray-300 bg-white shadow-md w-4 h-4 hover:border-blue-400 hover:bg-blue-50"
            }`}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900">한글 자모 분해 SVG 플레이그라운드</h1>
        <p className="text-sm text-gray-500 mt-2">
          카드 클릭 → 우측 편집. 드래그로 이동, <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-semibold">Shift</kbd>+휠로 크기 조절.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <input
            className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="검색 (예: 각, 공, 곽)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
            onClick={() => setCount((c) => c + 200)}
          >
            더 보기 +200
          </button>
          <button
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
            onClick={() => setCount(11172)}
          >
            전체 보기
          </button>
          <button
            className="px-4 py-2 bg-blue-500 border border-blue-500 rounded-lg hover:bg-blue-600 text-white font-medium transition-colors"
            onClick={exportAll}
          >
            📤 전체 내보내기
          </button>
        </div>
      </div>

      {/* 위: 음절 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">음절 목록 ({filtered.length}개)</h2>
        <div className="grid grid-cols-15 gap-2 max-h-[400px] overflow-y-auto pr-2">
          {filtered.map((ch) => (
            <button key={ch} onClick={() => openEditor(ch)}
              className={`border rounded-lg p-2 flex flex-col items-center gap-1 transition-all duration-200 ${
                ch === current
                  ? "bg-blue-50 border-blue-400 shadow-md"
                  : "bg-white border-gray-200 shadow-sm hover:shadow-md hover:scale-105 hover:border-gray-300"
              }`}
              title={patternBadge(ch)}>
              <div className="text-base font-bold text-gray-900">{ch}</div>
              <SvgPreview ch={ch} />
              <div className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">
                {patternBadge(ch)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 아래: 편집 영역 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="pb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">편집: <span className="text-blue-600">{current}</span></h2>

          {/* 버튼 그룹 1: 그룹 편집 */}
          <div className="flex items-center gap-2 mb-3">
            <div className="text-sm font-medium text-gray-600 w-24">그룹 편집:</div>
            <button
              className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                groupEditMode
                  ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setGroupEditMode(!groupEditMode)}
            >
              🔗 그룹 편집 모드
            </button>
            {groupEditMode && (
              <button className="px-4 py-2 bg-green-500 text-white border border-green-500 rounded-lg hover:bg-green-600 font-medium" onClick={applyToPattern}>
                ✅ 패턴 + 샘플에 적용
              </button>
            )}
          </div>

          {/* 버튼 그룹 2: 저장 */}
          <div className="flex items-center gap-2 mb-3">
            <div className="text-sm font-medium text-gray-600 w-24">저장:</div>
            <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium" onClick={savePatternDefault}>
              💾 패턴 기본값
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium" onClick={saveOverride}>
              🎯 이 글자만
            </button>
          </div>

          {/* 버튼 그룹 3: Auto-fit */}
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-gray-600 w-24">자동 조정:</div>
            <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed" disabled={busy} onClick={handleAutoFitCurrent}>
              🧪 현재 음절
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed" disabled={busy} onClick={handleAutoFixFiltered}>
              ⚡ 전체 목록
            </button>
          </div>
        </div>

        {busy && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-700 font-medium">
              ⏳ 작업 중… <span className="font-bold">{progress.done}</span> / {progress.total}
            </div>
          </div>
        )}

        {groupEditMode && sampleSyllables.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-3">
              같은 패턴의 샘플 ({sampleSyllables.length}개) - 실시간 미리보기
              <span className="ml-2 text-xs text-gray-500">(현재 편집이 모든 샘플에 실시간 반영됩니다)</span>
            </div>
            <div className="grid grid-cols-8 gap-3">
              {sampleSyllables.map((sample) => {
                const samplePos = getJamoPositions(sample, patternDefaults, {}, { glyphSet: 'positional', lvCompatWhenNoT: true });
                // 현재 편집 중인 좌표를 같은 패턴에 적용
                const adjustedPos = samplePos.map((p, i) =>
                  i < positions.length ? { ...p, x: positions[i].x, y: positions[i].y, fontSize: positions[i].fontSize } : p
                );
                return (
                  <div key={sample} className="bg-white border border-gray-200 rounded p-2 flex flex-col items-center">
                    <div className="text-xs font-bold text-gray-700 mb-1">{sample}</div>
                    <svg viewBox="0 0 100 100" className="w-16 h-16">
                      {adjustedPos.map((p, i) => (
                        <text key={i} x={p.x} y={p.y} fontSize={p.fontSize} fontWeight={700}
                          textAnchor="middle" dominantBaseline="middle" fill="#000"
                          fontFamily="'Noto Sans KR', sans-serif">
                          {p.char}
                        </text>
                      ))}
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">편집기</h3>
            </div>
            <div className="aspect-square relative">
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
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">원본 vs 조합 비교</h3>
            <div className="flex items-center justify-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <div className="text-xs text-gray-500">원본</div>
                <canvas ref={leftRef} width={W} height={H} className="border border-gray-200 rounded" />
              </div>
              <div className="text-gray-400 text-xl">→</div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-xs text-gray-500">조합</div>
                <canvas ref={rightRef} width={W} height={H} className="border border-gray-200 rounded" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="text-sm">
                유사도: <span className="font-bold text-blue-600">{score}%</span>
              </div>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded hover:bg-gray-200 text-sm" onClick={redraw}>
                ↻ 재계산
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">현재 좌표</h3>
            <pre className="text-xs bg-gray-50 p-3 rounded border border-gray-100 overflow-auto max-h-48 font-mono">
              {JSON.stringify(positions, null, 2)}
            </pre>
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
              💡 드래그로 이동, <kbd className="px-1 py-0.5 bg-gray-200 rounded text-[10px]">Shift</kbd>+휠로 크기 조절
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

/** 같은 패턴의 샘플 음절 생성 (초성 다양성 확보) */
function getSamePatternSamples(syllable: string, count: number = 12): string[] {
  const norm = decomposeSyllable(syllable);
  if (!norm) return [];

  const { V, T } = norm;
  const hasT = T.length > 0;
  const pat = detectPattern(V[0], hasT);

  const samples: string[] = [];
  const targetChoseongIndices = [0, 2, 5, 6, 7, 11, 12, 15, 17]; // ㄱ, ㄴ, ㄹ, ㅁ, ㅂ, ㅇ, ㅈ, ㅌ, ㅎ

  // 현재 음절과 같은 중성, 종성 인덱스 찾기
  const VIndex = V_TABLE.indexOf(V[0]);
  const TIndex = hasT ? T_TABLE.indexOf(T[0]) : 0;

  for (const LIndex of targetChoseongIndices) {
    if (samples.length >= count) break;

    const code = 0xAC00 + (LIndex * 588) + (VIndex * 28) + TIndex;
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const sample = String.fromCharCode(code);
      samples.push(sample);
    }
  }

  return samples;
}
