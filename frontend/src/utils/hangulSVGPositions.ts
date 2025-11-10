import Hangul from "hangul-js";
import overridesData from "./hangulSVGOverrides.json";

/**
 * 자모 위치 정보. Playground와 동일한 구조를 사용.
 */
export type JamoPosition = {
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
  return hasJong ? "COMP_JONG" : "COMP_JONG";
}

// viewBox 100x100 기준 기본값(경험치 기반 초기치)
const DEFAULTS: Record<PatternKey, [JamoPosition, JamoPosition, JamoPosition | null]> = {
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

// Type assertion for the imported JSON
type SaveBlob = {
  patterns: Partial<Record<PatternKey, number[]>>;
  overrides: Record<string, number[]>;
};

const { patterns: patternOverrides, overrides } = overridesData as SaveBlob;


/**
 * 한글 음절의 자모 위치를 계산합니다.
 * 1. `hangulSVGOverrides.json`에 해당 글자에 대한 오버라이드가 있으면 그것을 최우선으로 사용합니다.
 * 2. 오버라이드가 없으면, 음절 패턴(6가지)을 감지합니다.
 * 3. JSON에 해당 패턴에 대한 오버라이드가 있으면 그것을 사용합니다.
 * 4. 패턴 오버라이드도 없으면, 코드에 내장된 기본(DEFAULTS)값을 사용합니다.
 * @param syllable 계산할 한글 음절 (예: "가", "힣")
 * @returns {JamoPosition[]} 자모 위치 정보 배열
 */
export function getJamoPositions(syllable: string): JamoPosition[] {
  const parts = Hangul.disassemble(syllable);
  if (parts.length === 0) return [];

  // 글자 단위 오버라이드 확인
  const overrideCoords = overrides[syllable];
  if (overrideCoords) {
    const [ch, ju, jo] = parts as [string, string, string?];
    const positions: JamoPosition[] = [];
    const [x1, y1, s1, x2, y2, s2, x3, y3, s3] = overrideCoords;

    positions.push({ char: ch, x: x1, y: y1, fontSize: s1 });
    positions.push({ char: ju, x: x2, y: y2, fontSize: s2 });
    if (jo && overrideCoords.length >= 9) {
      positions.push({ char: jo, x: x3, y: y3, fontSize: s3 });
    }
    return positions;
  }

  // 오버라이드 없으면 패턴 기반으로 계산
  const [ch, ju, jo] = parts as [string, string, string?];
  const hasJong = parts.length >= 3 && !!jo;
  const patternKey = detectPattern(ju, hasJong);

  // 패턴 오버라이드 또는 기본값 가져오기
  const patternOverrideCoords = patternOverrides[patternKey];
  let basePositions: [JamoPosition, JamoPosition, JamoPosition | null];

  if (patternOverrideCoords) {
    const [x1, y1, s1, x2, y2, s2, x3, y3, s3] = patternOverrideCoords;
    basePositions = [
      { char: "", x: x1, y: y1, fontSize: s1 },
      { char: "", x: x2, y: y2, fontSize: s2 },
      null,
    ];
    if (hasJong && patternOverrideCoords.length >= 9) {
      basePositions[2] = { char: "", x: x3, y: y3, fontSize: s3 };
    }
  } else {
    // JSON에 패턴값이 없으면 하드코딩된 DEFAULTS 사용
    // DEFAULTS는 null을 포함하므로 깊은 복사로 새로운 배열 생성
    basePositions = DEFAULTS[patternKey].map(p => p ? { ...p } : null) as [JamoPosition, JamoPosition, JamoPosition | null];
  }

  // 최종 위치에 실제 자모 문자 채워넣기
  basePositions[0].char = ch;
  basePositions[1].char = ju;
  if (hasJong && basePositions[2]) {
    basePositions[2]!.char = jo!;
  }

  return basePositions.filter(Boolean) as JamoPosition[];
}
