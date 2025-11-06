import axiosInstance from './axiosInstance';
import {
  ProblemsResponse,
  Problem,
  normalizeProblemsResponse,
  AnswerResult,
  SubmitAnswerRequest,
} from '../types/adventure';

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
