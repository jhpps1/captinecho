/**
 * Adventure (일일탐험/추가학습) 관련 타입 정의
 * API 명세서: instruction/Adventure-admin 설계 구조.md
// ==================== API 응답 타입 ====================
 */


/**
 * 백엔드 API 응답 문제 데이터
 * 주의: questionPhonemes, choices, correctAnswer는 문자열 또는 배열로 올 수 있음
 */
export interface ProblemRaw {
  dayProblemId: number;
  studentId: number;
  interestId: number;
  adventureTypeId: 1 | 2 | 3 | 4; // 탐험 유형 (핵심!)
  assignedDate: string; // YYYY-MM-DD
  seqNo: number; // 문제 순서 (1-10)
  level: number; // 난이도
  questionText: string; // 문제 텍스트 (max: 150)
  hint: string | null; // 힌트 (max: 300, nullable)
  imageUrl: string | null; // 이미지 URL (nullable)
  soundUrl: string | null; // 음성 URL (nullable)
  questionPhonemes: string | string[]; // 문제 음소 배열 (문자열 또는 배열)
  blankPosition: 'INITIAL' | 'MEDIAL' | 'FINAL' | null; // 빈칸 위치 (초성/중성/종성, nullable)
  blankPhoneme: string | null; // 빈칸 음소 (nullable)
  choices: string | string[]; // 선택지 배열 (문자열 또는 배열)
  correctAnswer: string | string[]; // 정답 (문자열 또는 배열)
  isCompleted: boolean; // 완료 여부
}

/**
 * 정규화된 문제 데이터 (프론트엔드에서 사용)
 * 모든 배열 필드가 string[]로 통일됨
 */
export interface Problem {
  dayProblemId: number;
  studentId: number;
  interestId: number;
  adventureTypeId: 1 | 2 | 3 | 4;
  assignedDate: string;
  seqNo: number;
  level: number;
  questionText: string;
  hint: string | null;
  imageUrl: string | null;
  soundUrl: string | null;
  questionPhonemes: string[]; // 정규화: 항상 배열
  blankPosition: 'INITIAL' | 'MEDIAL' | 'FINAL' | null;
  blankPhoneme: string | null;
  choices: string[]; // 정규화: 항상 배열
  correctAnswer: string[]; // 정규화: 항상 배열
  isCompleted: boolean;
}

/**
 * API 응답 구조
 */
export interface ProblemsResponse {
  problems: ProblemRaw[];
  totalCount: number;
}

// ==================== 답안 제출 관련 타입 ====================

/**
 * 답안 결과 데이터
 * 프론트엔드에서 정답 검증 후 백엔드에 전송
 */
export interface AnswerResult {
  dayProblemId: number;
  studentId: number;
  isCorrect: boolean; // 최종 정답 여부
  attemptCount: number; // 시도 횟수 (1회에 맞춤 = 1, 3번 만에 맞춤 = 3)
  submittedAt: string; // 제출 시각 (ISO 8601)
}

/**
 * 답안 제출 API 요청 바디
 */
export interface SubmitAnswerRequest {
  results: AnswerResult[];
}

// ==================== 정규화 함수 ====================

/**
 * 문자열 또는 배열을 string[]로 변환
 *
 * @param v - 변환할 값
 * @returns string[] 배열
 *
 * @example
 * toArray("ㄱ,ㅏ") → ["ㄱ", "ㅏ"]
 * toArray("[ㄱ, ㅏ]") → ["ㄱ", "ㅏ"]
 * toArray(["ㄱ", "ㅏ"]) → ["ㄱ", "ㅏ"]
 */
export function toArray(v: unknown): string[] {
  // 이미 배열이면 문자열 배열로 변환
  if (Array.isArray(v)) {
    return v.map(String);
  }

  // 문자열인 경우
  if (typeof v === 'string') {
    // 빈 문자열은 빈 배열
    if (!v.trim()) {
      return [];
    }

    // 대괄호 제거 후 쉼표로 분리
    // 예: "[ㄱ, ㅏ]" → "ㄱ, ㅏ" → ["ㄱ", "ㅏ"]
    const cleaned = v.replace(/[\[\]]/g, '').trim();

    if (!cleaned) {
      return [];
    }

    return cleaned.split(',').map(s => s.trim()).filter(Boolean);
  }

  // 그 외의 경우 빈 배열
  return [];
}

/**
 * API 응답 문제 데이터를 정규화
 *
 * @param raw - 백엔드 API 응답 원본 데이터
 * @returns Problem - 정규화된 문제 데이터
 */
export function normalizeProblem(raw: ProblemRaw): Problem {
  return {
    dayProblemId: raw.dayProblemId,
    studentId: raw.studentId,
    interestId: raw.interestId,
    adventureTypeId: raw.adventureTypeId,
    assignedDate: raw.assignedDate,
    seqNo: raw.seqNo,
    level: raw.level,
    questionText: raw.questionText,
    hint: raw.hint ?? null,
    imageUrl: raw.imageUrl ?? null,
    soundUrl: raw.soundUrl ?? null,
    // 배열 필드 정규화
    questionPhonemes: toArray(raw.questionPhonemes),
    blankPosition: raw.blankPosition ?? null,
    blankPhoneme: raw.blankPhoneme ?? null,
    choices: toArray(raw.choices),
    // correctAnswer: 백엔드가 단일 문자열로 보내므로 배열로 변환
    correctAnswer: Array.isArray(raw.correctAnswer)
      ? raw.correctAnswer
      : [raw.correctAnswer],
    isCompleted: raw.isCompleted,
  };
}

/**
 * 정규화된 문제 배열 반환
 *
 * @param response - API 응답 데이터
 * @returns 정규화된 문제 배열과 전체 개수
 */
export function normalizeProblemsResponse(response: ProblemsResponse): {
  problems: Problem[];
  totalCount: number;
} {
  return {
    problems: response.problems.map(normalizeProblem),
    totalCount: response.totalCount,
  };
}

 // ==================== 세션 관리 관련 타입 ====================

  /**
   * 학습 타입
   * DAILY: 일일탐험 (혼합 10문제)
   * SUPPLE: 추가학습 (특정 타입 10문제)
   */
  export type StudyType = 'DAILY' | 'SUPPLE';

  /**
   * 어드벤처 세션 시작 요청
   */
  export interface StartAdventureRequest {
    studyType: StudyType;
  }

  /**
   * 어드벤처 세션 시작 응답
   */
  export interface StartAdventureResponse {
    sessionId: number;
  }

  /**
   * 어드벤처 세션 종료 응답
   */
  export interface EndAdventureResponse {
    success: boolean;
  }

  /**
   * 세션 상태 (프론트엔드 관리용)
   */
  export interface SessionState {
    sessionId: number | null;
    studyType: StudyType | null;
    isActive: boolean;
    startedAt: string | null; // ISO 8601 timestamp
  }

// ==================== 발음 평가 관련 타입 ====================

/**
 * 음성-텍스트 변환 API 응답 (초기진단용)
 * POST /stt/transcribe
 */
export interface TranscriptionResponse {
  text: string;  // 음성 인식 결과
}

/**
 * 발음 평가 API 응답
 * POST /stt/evaluate-pronunciation
 */
export interface PronunciationEvaluationResponse {
  student_id: number;
  problem_id: number;
  correct_text: string;      // 정답 텍스트
  user_text: string;          // 음성 인식 결과
  accuracy: number;           // 정확도 (0-100)
  total_phonemes: number;     // 전체 음소 개수
  correct_phonemes: number;   // 정확한 음소 개수
  timestamp: string;          // ISO 8601 timestamp
}