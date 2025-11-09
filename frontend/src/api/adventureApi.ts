import axiosInstance from './axiosInstance';
import type {
  ProblemsResponse,
  Problem,
  AnswerResult,
  SubmitAnswerRequest,
  StudyType,
  StartAdventureResponse,
  EndAdventureResponse,
} from '../types/adventure';
import { normalizeProblemsResponse } from '../types/adventure';

// ===== API 함수 =====

/**
 * 일일탐험 문제 조회
 * GET /api/student/{studentId}/adventure/problem
 *
 * @param studentId - 학생 ID
 * @returns 정규화된 문제 배열과 전체 개수
 *
 * @description
 * - 완료하지 않은 문제들의 목록 반환
 * - 이전에 3문제 풀었다면 나머지 7문제 제공 (총 10문제)
 * - 혼합 문제 (adventureTypeId 1~4 혼재)
 */
export const getDailyProblems = async (
  studentId: number
): Promise<{ problems: Problem[]; totalCount: number }> => {
  const response = await axiosInstance.get<ProblemsResponse>(
    `/student/${studentId}/adventure/problem`
  );

  // API 응답 데이터 정규화 (문자열/배열 통일)
  return normalizeProblemsResponse(response.data);
};

/**
 * 추가학습 문제 조회 (탐험 타입별)
 * GET /api/student/{studentId}/adventure/problem/supple?adventureTypeId={typeId}
 *
 * @param studentId - 학생 ID
 * @param adventureTypeId - 탐험 타입 (1: 음소 분해, 2: 빈칸 채우기, 3: 단어 선택, 4: 말하기)
 * @returns 정규화된 문제 배열과 전체 개수
 *
 * @description
 * - 특정 탐험 타입의 추가학습 10문제 제공
 * - 단일 탐험 타입만 포함 (adventureTypeId 고정)
 */
export const getSuppleProblems = async (
  studentId: number,
  adventureTypeId: number
): Promise<{ problems: Problem[]; totalCount: number }> => {
  const response = await axiosInstance.get<ProblemsResponse>(
    `/student/${studentId}/adventure/problem/supple`,
    {
      params: { adventureTypeId },
    }
  );

  // API 응답 데이터 정규화 (문자열/배열 통일)
  return normalizeProblemsResponse(response.data);
};

/**
 * 문제 답안 결과 제출
 * POST /api/student/{studentId}/adventure/result
 *
 * @param studentId - 학생 ID
 * @param results - 답안 결과 배열 (문제별 정답 여부 + 시도 횟수)
 *
 * @description
 * - 프론트엔드에서 정/오답 검증 완료 후 최종 결과만 전송
 * - 각 문제별로 시도 횟수와 정답 여부 포함
 * - 한 번에 맞춤 = attemptCount: 1, 3번 만에 맞춤 = attemptCount: 3
 *
 * @example
 * submitProblemResults(123, [
 *   { dayProblemId: 1, studentId: 123, isCorrect: true, attemptCount: 1, submittedAt: '2025-11-06T10:30:00Z' },
 *   { dayProblemId: 2, studentId: 123, isCorrect: true, attemptCount: 3, submittedAt: '2025-11-06T10:31:00Z' }
 * ])
 */
export const submitProblemResults = async (
  studentId: number,
  results: AnswerResult[]
): Promise<void> => {
  const requestBody: SubmitAnswerRequest = { results };

  await axiosInstance.post(`/student/${studentId}/adventure/result`, requestBody);
};

/**
 * 단일 문제 결과 제출 (편의 함수)
 * POST /api/student/{studentId}/adventure/result
 *
 * @param studentId - 학생 ID
 * @param result - 단일 답안 결과
 */
export const submitSingleProblemResult = async (
  studentId: number,
  result: AnswerResult
): Promise<void> => {
  await submitProblemResults(studentId, [result]);
};

/**
 * 어드벤처 세션 시작
 * POST /api/student/{studentId}/adventure/start
 *
 * @param studentId - 학생 ID
 * @param studyType - 학습 타입 ('DAILY' | 'SUPPLE')
 * @returns sessionId - 생성된 세션 ID
 *
 * @description
 * - 어드벤처 세션을 시작하고 학습 기록 생성
 * - DAILY: 일일탐험 (혼합 10문제)
 * - SUPPLE: 추가학습 (특정 타입 10문제)
 * - 반환된 sessionId는 결과 제출 시 사용
 *
 * @example
 * const sessionId = await startAdventure(123, 'DAILY');
 * console.log(`세션 시작됨: ${sessionId}`);
 */
export const startAdventure = async (
  studentId: number,
  studyType: StudyType
): Promise<number> => {
  const response = await axiosInstance.post<StartAdventureResponse>(  // 👈 타입 명시
    `/student/${studentId}/adventure/start`,
    { studyType }
  );

  return response.data.sessionId;
};

/**
 * 어드벤처 세션 종료
 * POST /api/student/{studentId}/adventure/end
 *
 * @param studentId - 학생 ID
 * @returns success - 종료 성공 여부
 *
 * @description
 * - 현재 진행 중인 어드벤처 세션 종료
 * - 학습 통계 및 결과 저장
 * - 보상 지급 처리
 * - 모든 문제 완료 시 또는 중도 이탈 시 호출
 *
 * @example
 * const success = await endAdventure(123);
 * if (success) {
 *   console.log('세션 종료 성공');
 * }
 */
export const endAdventure = async (
  studentId: number
): Promise<boolean> => {
   const response = await axiosInstance.post<EndAdventureResponse>(  // 👈 타입 사용
    `/student/${studentId}/adventure/end`
  );

  return response.data.success;
};

/**
 * 학습 데이터 수집 (정답/오답 패턴 기록)
 * POST /api/student/{studentId}/session/correct
 *
 * @param studentId - 학생 ID
 * @param data - 학습 데이터
 * @param data.isCorrect - 정답 여부
 * @param data.realJamo - 실제 정답 자모/단어
 * @param data.confusionJamo - 사용자가 선택한 오답 (오답인 경우만)
 * @param data.phonemePosition - 음소 위치 ('INITIAL' | 'MEDIAL' | 'FINAL' | null)
 *
 * @description
 * - 학생의 정답/오답 패턴을 수집하여 학습 분석 데이터 축적
 * - 오답 시: 어떤 자모를 헷갈려 하는지 기록 (error_pattern 테이블)
 * - 정답/오답 모두: 자모별 정확도 통계 업데이트 (jamo_stat 테이블)
 * - Adventure1, 2 (음소 문제): phonemePosition 필수
 * - Adventure3, 4 (단어/말하기): phonemePosition은 null
 *
 * @example
 * // Adventure1, 2 - 음소 문제 (정답)
 * await submitSessionCorrect(123, {
 *   isCorrect: true,
 *   realJamo: 'ㄱ',
 *   confusionJamo: null,
 *   phonemePosition: 'INITIAL'
 * });
 *
 * @example
 * // Adventure1, 2 - 음소 문제 (오답)
 * await submitSessionCorrect(123, {
 *   isCorrect: false,
 *   realJamo: 'ㄱ',          // 정답
 *   confusionJamo: 'ㄲ',     // 사용자가 선택한 오답
 *   phonemePosition: 'INITIAL'
 * });
 *
 * @example
 * // Adventure3 - 단어 선택 (정답)
 * await submitSessionCorrect(123, {
 *   isCorrect: true,
 *   realJamo: '사과',
 *   confusionJamo: null,
 *   phonemePosition: null
 * });
 *
 * @example
 * // Adventure4 - 말하기 (항상 정답 처리)
 * await submitSessionCorrect(123, {
 *   isCorrect: true,
 *   realJamo: '바나나',
 *   confusionJamo: null,
 *   phonemePosition: null
 * });
 */
export const submitSessionCorrect = async (
  studentId: number,
  data: {
    isCorrect: boolean;
    realJamo: string;
    confusionJamo?: string | null;
    phonemePosition?: string | null;
  }
): Promise<void> => {
  // 백엔드 API 형식에 맞게 요청 데이터 구성
  const requestBody = {
    isCorrect: data.isCorrect,
    realJamo: data.realJamo ?? null,           // undefined → null 변환
    confusionJamo: data.confusionJamo ?? null,
    phonemePosition: data.phonemePosition ?? null,
  };

  console.log('📤 /session/correct 요청:', {
    studentId,
    requestBody
  });

  await axiosInstance.post(`/student/${studentId}/session/correct`, requestBody);
};