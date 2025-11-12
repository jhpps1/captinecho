# 한글 자모 SVG 렌더링 통합 보고서

## 0) 목표 시나리오
- **입력**: 음소 데이터(초성/중성/종성으로 분해된 한 글자).
- **튜닝**: `hangul_jamo_svgplayground`에서 드래그/휠로 **자모 좌표를 조정**하고 JSON으로 **내보내기**.
- **런타임**: 앱에서 `.json`을 **로드** → 해당 음절이 들어오면 **오버라이드 좌표**로 `SingleSyllable`에서 **SVG 렌더링**.

---

## 1) 데이터 흐름(끝→끝)

1. **플레이그라운드**
   - 음절 선택 → 자모 배치 조정 → **[L, …V, …T] 순서로 (x,y,fontSize)×N** 배열을 JSON으로 **export**  
   - 예: `왕(ㅇ,ㅗ,ㅏ,ㅇ)` → 글리프 4개 → 숫자 12개.

2. **리포지토리**
   - `src/data/overrides.json`로 저장/버전관리. (또는 원격 CDN/스토리지)

3. **런타임**
   - 앱 시작 시 **JSON 로드** → 메모리에 `Record<string, number[]>`로 유지.
   - `hangulSVGPositions.getJamoPositions(syllable, overrides)`가  
     - `Hangul.disassemble`로 **두 낱자 모델**(`L`, `V[]`, `T[]`) 생성  
     - 패턴 디폴트 좌표 생성  
     - `overrides[syllable]` 있으면 **앞에서부터 (x,y,size) 순서로 덮어쓰기**  
     - `JamoPosition[]` 반환

4. **렌더**
   - `SingleSyllable`(또는 `SingleSyllableCard`)에서 `<SyllableSVG syllable="왕" overrides={overrides} …/>`  
   - `SyllableSVG`는 `getJamoPositions` 호출 → `<svg><text …/></svg>`

---

## 2) JSON 스키마(가변 길이, 통일 규격)

```json
{
  "overrides": {
    "왕": [24,40,36, 50,34,32, 66,50,32, 48,80,34],
    "닭": [24,40,36, 58,40,36, 42,74,32, 60,84,30]
  },
  "meta": {
    "version": 1,
    "convention": "order = [L, ...V, ...T], per glyph triplet = (x,y,fontSize), viewBox=100"
  }
}
```

- **순서**: **`[L, ...V, ...T]`**
- **길이**: `3 × 글리프 수`
  - ‘왕’(4글리프) → 12개
  - ‘닭’(4글리프) → 12개
- 좌표계: **viewBox 100×100**

---

## 3) 플레이그라운드 수정(내보내기/저장 일치)

### 3-1) 분해 함수(두 낱자 유지)
```ts
function isVowel(ch: string) {
  return "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅛㅜㅠㅡㅣ".includes(ch);
}
function splitAsIs(s: string) {
  const parts = Hangul.disassemble(s);
  const L = parts[0];
  const V: string[] = [parts[1]];
  if (parts[2] && isVowel(parts[2])) V.push(parts[2]);
  const T = parts.slice(1 + V.length);
  return { L, V, T }; // V.length = 1|2, T.length = 0|1|2
}
```

### 3-2) 평탄화(가변 길이)
```ts
function flattenPositions(pos: JamoPosition[]): number[] {
  const out: number[] = [];
  for (const p of pos) out.push(p.x, p.y, p.fontSize);
  return out;
}
```

### 3-3) export 예시
```ts
function exportAll() {
  const save = loadSave();
  const blob = new Blob([JSON.stringify({
    overrides: save.overrides,
    meta: { version: 1, convention: "order=[L,...V,...T], triplet=(x,y,fontSize), viewBox=100" }
  }, null, 2)], { type: "application/json" });
  // ...다운로드 로직 그대로
}
```

> **체크**: 이미 저장된 오버라이드가 “6/9 고정길이”라면, 위 가변 길이 포맷으로 **마이그레이션**하세요.

---

## 4) `hangulSVGPositions` 정리(가변 길이 + 오버라이드 적용)

### 4-1) 패턴/템플릿(요지)
- **기준**: `vCount(1|2) × tCount(0|1|2) × baseType(vertical|horizontal)`
- 템플릿은 시작점 좌표(폰트별 보정은 계속 튜닝)

```ts
type BaseType = "vertical" | "horizontal";
const V_VERTICAL = new Set("ㅏㅐㅑㅒㅓㅔㅕㅖㅣ");

function baseTypeFromV1(v1: string): BaseType {
  return V_VERTICAL.has(v1) ? "vertical" : "horizontal";
}
type PatternKey =
  | "V1_T0_VERT" | "V1_T1_VERT" | "V1_T2_VERT"
  | "V2_T0_VERT" | "V2_T1_VERT" | "V2_T2_VERT"
  | "V1_T0_HORZ" | "V1_T1_HORZ" | "V1_T2_HORZ"
  | "V2_T0_HORZ" | "V2_T1_HORZ" | "V2_T2_HORZ";

function patternKeyOf(vCount: number, tCount: number, base: BaseType): PatternKey {
  const v = vCount === 1 ? "V1" : "V2";
  const t = (`T${Math.min(tCount,2)}` as "T0"|"T1"|"T2");
  const b = base === "vertical" ? "VERT" : "HORZ";
  return `${v}_${t}_${b}` as PatternKey;
}
```

### 4-2) 좌표 생성 + 오버라이드 적용
```ts
export type Part = 'L' | 'V' | 'T';
export interface JamoPosition { part: Part; char: string; x: number; y: number; fontSize: number; }

export function getJamoPositions(
  syllable: string,
  overrides: Record<string, number[]> = {},
  patternDefaults?: Partial<Record<PatternKey,(L:string,V:string[],T:string[])=>JamoPosition[]>>
): JamoPosition[] {
  const parts = Hangul.disassemble(syllable);
  if (parts.length < 2) return [];

  // 두 낱자 유지 분해
  const L = parts[0];
  const V: string[] = [parts[1]];
  const isVowel = (ch:string)=>"ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅛㅜㅠㅡㅣ".includes(ch);
  if (parts[2] && isVowel(parts[2])) V.push(parts[2]);
  const T = parts.slice(1 + V.length);

  const key = patternKeyOf(V.length, T.length, baseTypeFromV1(V[0]));
  const maker = (patternDefaults?.[key] ?? DEFAULTS[key])!;
  const arr = maker(L, V, T).map(p => ({ ...p })); // 복사

  // 오버라이드: [L,...V,...T] 순서로 (x,y,fontSize)
  const flat = overrides[syllable];
  if (flat && flat.length >= 3) {
    const n = Math.min(arr.length * 3, flat.length);
    for (let i = 0; i < n; i += 3) {
      const j = i / 3;
      if (typeof flat[i]     === 'number') arr[j].x = flat[i]!;
      if (typeof flat[i + 1] === 'number') arr[j].y = flat[i + 1]!;
      if (typeof flat[i + 2] === 'number') arr[j].fontSize = flat[i + 2]!;
    }
  }
  return arr;
}
```

> **DEFAULTS**는 기존 값 재사용 가능(단, `V2_*`/`T2`가 추가됐으니 템플릿 보완).

---

## 5) `SyllableSVG`에 오버라이드 연결

```tsx
// SyllableSVG.tsx (prop 추가)
type SyllableSVGProps = {
  syllable: string;
  overrides?: Record<string, number[]>;
  // ...기타(color, mutedColor 등)
};

export const SyllableSVG = ({ syllable, overrides, ...props }: SyllableSVGProps) => {
  const pos = getJamoPositions(syllable, overrides);
  if (pos.length === 0) return <div className={props.className}>?</div>;
  return (
    <svg viewBox="0 0 100 100" className={props.className} >
      {pos.map((p, i) => (
        <text key={`${p.part}-${p.char}-${i}`}
              x={p.x} y={p.y} fontSize={p.fontSize} fontWeight={700}
              textAnchor="middle" dominantBaseline="middle"
              fill={/* 기존 fill 로직 */ undefined}
              fontFamily={props.fontFamily}>
          {p.char}
        </text>
      ))}
    </svg>
  );
};
```

---

## 6) `SingleSyllable`에서 SVG로 전환

```tsx
import overrides from "@/data/overrides.json"; // Vite/Next는 기본 JSON import 가능
import { SyllableSVG } from "@/components/game/SyllableSVG";

type SingleSyllableProps = {
  syllable: string; // 또는 problem.syllable
  // 색상/하이라이트 로직이 있으면 prop로 전달
};

export function SingleSyllable({ syllable }: SingleSyllableProps) {
  return (
    <div className="w-[85vw] max-w-2xl h-40 sm:h-48 md:h-56 bg-white rounded-3xl shadow-2xl
                    flex items-center justify-center border-4 sm:border-6 border-gray-800">
      <SyllableSVG
        syllable={syllable}
        overrides={(overrides as any).overrides}
        className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32"
        color="#111827"
        mutedColor="#9CA3AF"
        fontFamily="'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif"
      />
    </div>
  );
}
```

> 기존 `SingleSyllableCard`의 `<span>` 라인 UI는 **SVG 대체**. 색상 “빈칸” 하이라이트가 필요하면 `SyllableSVG`의 `fillFor`를 현재 규칙에 맞게 조정.

---

## 7) 로더/검증(권장)

### 7-1) JSON 로드 유틸
```ts
export type OverridesMap = Record<string, number[]>;

export function loadOverrides(raw: any): OverridesMap {
  const src = raw?.overrides ?? raw ?? {};
  const out: OverridesMap = {};
  for (const [syllable, arr] of Object.entries(src)) {
    if (!Array.isArray(arr) || arr.length < 3) continue;
    out[syllable] = (arr as number[]).filter(n => typeof n === "number");
  }
  return out;
}
```

### 7-2) 정상성 검사(길이 체크)
```ts
function validateOverride(syllable: string, flat: number[], expectedGlyphs: number) {
  const need = expectedGlyphs * 3;
  if (flat.length !== need) {
    console.warn(`[overrides] '${syllable}' length mismatch: got ${flat.length}, want ${need}`);
    // 정책: (1) 무시, (2) 겹치는 범위만 적용 둘 중 하나 선택
  }
}
```

---

## 8) 테스트 체크리스트

- [ ] **‘왕’**: `ㅇ,ㅗ,ㅏ,ㅇ` → 4글리프 → 12개 숫자 적용되는지  
- [ ] **‘닭’**: `ㄷ,ㅏ,ㄹ,ㄱ` → 4글리프 → 12개 숫자 적용되는지  
- [ ] 오버라이드 **없을 때** 디폴트 템플릿으로 자연스럽게 보이는지  
- [ ] 폰트 로딩 후 렌더 타이밍 문제 없는지(`document.fonts.ready` 고려 필요 시 추가)  
- [ ] 반응형 클래스(`w-… h-…`)에서 글자 비율 깨짐 없는지

---

## 9) 마이그레이션/운영 팁

- 과거에 “6/9 고정길이”로 저장된 JSON이 있다면, **가변 길이 스펙**으로 변환(‘왕’, ‘닭’ 같은 복합 케이스 추가).
- 좌표 튜닝은 **폰트·무게(700)·렌더러**에 따라 약간씩 다를 수 있어, **플레이그라운드와 런타임의 폰트 스택을 동일**하게 유지.
- 추후 음절 추가 시 **플레이그라운드에서 해당 글자만 튜닝→JSON 덮어쓰기**로 운영.

---

## 10) 산출물 요약

- `src/data/overrides.json` (가변 길이 스펙)
- `hangul_jamo_svgplayground`  
  - `splitAsIs`/`flattenPositions` 적용, export 포맷 통일
- `hangulSVGPositions.ts`  
  - `splitAsIs`, `patternKeyOf`, `getJamoPositions(…, overrides)` 반영
- `SyllableSVG.tsx`  
  - `overrides` prop 추가
- `SingleSyllable(.tsx)`  
  - 텍스트 UI → `<SyllableSVG>`로 교체, `overrides.json` 주입

이 구성으로, **플레이그라운드에서 만든 좌표가 그대로 런타임에서 재현**되고, **복합모음/복합받침을 두 낱자**로 일관되게 처리할 수 있습니다.
