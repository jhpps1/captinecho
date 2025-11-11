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

// 모음 여부 판별
function isVowel(ch: string): boolean {
  return "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅛㅜㅠㅡㅣ".includes(ch);
}

// 복합 모음/받침 분리 분해 (두 낱자 유지)
type SplitResult = {
  L: string;        // 초성 (1개)
  V: string[];      // 중성 (1-2개)
  T: string[];      // 종성 (0-2개)
};

function splitAsIs(syllable: string): SplitResult {
  const parts = Hangul.disassemble(syllable);
  if (parts.length === 0) return { L: "", V: [], T: [] };

  const L = parts[0];  // 초성
  const V: string[] = [parts[1]];  // 중성 첫 번째

  // 중성 두 번째가 모음이면 복합 모음
  if (parts[2] && isVowel(parts[2])) {
    V.push(parts[2]);
  }

  // 나머지는 종성
  const T = parts.slice(1 + V.length);

  return { L, V, T };
}

// 패턴 6분류
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
// viewBox 100x100 기준 기본값(경험치 기반 초기치)
const DEFAULTS: Record<PatternKey, [PlaygroundJamoPosition, PlaygroundJamoPosition, PlaygroundJamoPosition | null]> = {
  VERT_NOJONG: [
    { char: "", x: 25, y: 55, fontSize: 45 }, // 초성
    { char: "", x: 60, y: 55, fontSize: 45 }, // 중성
    null, // 종성 없음
  ],
  VERT_JONG: [
    { char: "", x: 25, y: 42, fontSize: 38 },
    { char: "", x: 58, y: 42, fontSize: 38 },
    { char: "", x: 42, y: 78, fontSize: 36 },
  ],
  HORZ_NOJONG: [
    { char: "", x: 50, y: 38, fontSize: 45 },
    { char: "", x: 50, y: 74, fontSize: 45 },
    null,
  ],
  HORZ_JONG: [
    { char: "", x: 50, y: 32, fontSize: 38 },
    { char: "", x: 50, y: 58, fontSize: 38 },
    { char: "", x: 50, y: 84, fontSize: 36 },
  ],
  COMP_NOJONG: [
    { char: "", x: 22, y: 55, fontSize: 45 },
    { char: "", x: 60, y: 55, fontSize: 45 },
    null,
  ],
  COMP_JONG: [
    { char: "", x: 22, y: 42, fontSize: 38 },
    { char: "", x: 58, y: 42, fontSize: 38 },
    { char: "", x: 42, y: 78, fontSize: 36 },
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
): PlaygroundJamoPosition[] {
  // splitAsIs로 복합 모음/받침 분리
  const { L, V, T } = splitAsIs(syllable);
  if (!L) return [];

  // 패턴 판별 (복합 모음 여부 고려)
  const isComplex = V.length === 2;
  const pat = isComplex
    ? (T.length > 0 ? 'COMP_JONG' : 'COMP_NOJONG')
    : detectPattern(V[0], T.length > 0);

  // 글자 단위 오버라이드 우선 적용
  const save = loadSave();
  const flat = overrides[syllable] ?? save.overrides[syllable];

  if (flat && flat.length >= 3) {
    // 오버라이드가 있으면 가변 길이로 적용
    const positions: PlaygroundJamoPosition[] = [];
    const allChars = [L, ...V, ...T];  // [L, ...V, ...T] 순서

    for (let i = 0; i < allChars.length; i++) {
      const idx = i * 3;
      if (idx + 2 < flat.length) {
        positions.push({
          char: allChars[i],
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
  const allChars = [L, ...V, ...T];

  // 초성
  if (base[0]) {
    positions.push({ ...base[0], char: L });
  }

  // 중성 (1-2개)
  if (V.length === 1 && base[1]) {
    positions.push({ ...base[1], char: V[0] });
  } else if (V.length === 2) {
    // 복합 모음: 두 자모를 좌우/상하로 배치
    const baseV = base[1] ?? { x: 60, y: 55, fontSize: 45 };
    positions.push(
      { char: V[0], x: baseV.x - 8, y: baseV.y, fontSize: baseV.fontSize - 5 },
      { char: V[1], x: baseV.x + 8, y: baseV.y, fontSize: baseV.fontSize - 5 }
    );
  }

  // 종성 (0-2개)
  if (T.length === 1) {
    // 단일 받침: fallback 좌표 제공
    const baseT = base[2] ?? { x: 42, y: 78, fontSize: 36 };
    positions.push({ ...baseT, char: T[0] });
  } else if (T.length === 2) {
    // 복합 받침: 두 자모를 좌우로 배치 (fallback 좌표 제공)
    const baseT = base[2] ?? { x: 42, y: 78, fontSize: 36 };
    positions.push(
      { char: T[0], x: baseT.x - 8, y: baseT.y, fontSize: baseT.fontSize - 4 },
      { char: T[1], x: baseT.x + 8, y: baseT.y, fontSize: baseT.fontSize - 4 }
    );
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
    // viewBox 100→ canvas 좌표로 변환
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
    const diff = Math.abs(ga - gb) / 255; // 0~1
    acc += 1 - diff; // 유사할수록 1에 가까움
  }
  const px = n / 4;
  return Math.max(0, Math.min(1, acc / px));
}

/** ------------------------- 메인 컴포넌트 ------------------------- */
export default function HangulJamoSVGPlayground() {
  // 상태
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(200); // 초기 로드 수
  const syllables = useMemo(() => buildSyllables(), []);
  const filtered = useMemo(
    () => (query ? syllables.filter((c) => c.includes(query)) : syllables).slice(0, count),
    [syllables, query, count]
  );

  // ⬇⬇ 순서 중요: patternDefaults / overrides / current 가 먼저 선언되어야 함
  const [patternDefaults, setPatternDefaults] =
    useState<Partial<Record<PatternKey, [PlaygroundJamoPosition, PlaygroundJamoPosition, PlaygroundJamoPosition | null]>>>({});
  const [overrides, setOverrides] = useState<Record<string, number[]>>({});
  const [current, setCurrent] = useState<string>("가");

  // positions 는 초기엔 빈 배열로, 의존성 준비 후 useEffect에서 계산
  const [positions, setPositions] = useState<PlaygroundJamoPosition[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  // 드래그 상태 관리 (리렌더링 최소화)
  const dragRef = useRef({ isDragging: false, targetIdx: -1 });

  // 캔버스
  const leftRef = useRef<HTMLCanvasElement | null>(null); // 원본
  const rightRef = useRef<HTMLCanvasElement | null>(null); // 조합
  const W = 200, H = 200;

  // 저장 불러오기 (패턴 기본/오버라이드)
  useEffect(() => {
    const save = loadSave();
    setOverrides(save.overrides || {});
    // 패턴 기본값은 저장 포맷(number[]) → 화면 표시/계산은 DEFAULTS를 쓰되,
    // 별도로 패턴 에디터가 생기면 setPatternDefaults로 반영하세요.
  }, []);

  // current / 패턴 / 오버라이드가 준비되면 positions 계산
  useEffect(() => {
    const p = getJamoPositions(current, patternDefaults, overrides);
    setPositions(p);
  }, [current, patternDefaults, overrides]);

  // 폰트 로딩 보장 + 비교 캔버스 그리기
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
    setScore(Math.round(s * 1000) / 10); // 소수1자리
  }

  // 드래그 이동
  function onMouseDown(e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    // 가장 가까운 자모 선택
    let min = Infinity, idx = 0;
    positions.forEach((p, i) => {
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < min) { min = d; idx = i; }
    });
    // 드래그 상태 즉시 설정
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
    if (!e.shiftKey) return; // Shift+휠만 크기 변경
    e.preventDefault();
    const delta = -Math.sign(e.deltaY); // 위로 굴리면 +
    setPositions((prev) => prev.map((p, i) =>
      i === selectedIdx ? { ...p, fontSize: Math.max(20, Math.min(80, p.fontSize + delta)) } : p
    ));
  }

  // 저장/내보내기
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

  // 카드 클릭 시 편집 전환
  function openEditor(ch: string) {
    setCurrent(ch);
  }

  // 패턴 추정 배지
  function patternBadge(ch: string) {
    const parts = Hangul.disassemble(ch);
    if (parts.length < 2) return "-";
    const key = detectPattern(parts[1], parts.length >= 3);
    return key;
  }

  // SVG 렌더 프리뷰
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

  // 편집 캔버스 안내 라인 + 자모 포인트
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
        {/* 그리드 */}
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 pointer-events-none">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="border border-gray-100" />
          ))}
        </div>
        {/* 중심선 */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 pointer-events-none" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 pointer-events-none" />
        {children}
        {/* 선택 점 */}
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

      {/* 검색/컨트롤 */}
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
        {/* 좌: 목록 */}
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

        {/* 우: 편집기 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold">편집: {current}</div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 border rounded" onClick={savePatternDefault}>💾 패턴 기본값 저장</button>
              <button className="px-2 py-1 border rounded" onClick={saveOverride}>🎯 이 글자만 저장</button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* A: 편집 뷰 */}
            <div className="border rounded aspect-square relative overflow-hidden">
              <EditorOverlay>
                {/* 자모 SVG 실제 렌더 */}
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

            {/* B: 캔버스 비교 */}
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

            {/* C: 현재 좌표 */}
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

// 가변 길이 평탄화: 모든 글리프를 (x, y, fontSize) 순서로
function flattenPositions(pos: PlaygroundJamoPosition[]): number[] {
  const out: number[] = [];
  for (const p of pos) {
    out.push(p.x, p.y, p.fontSize);
  }
  return out;
}
