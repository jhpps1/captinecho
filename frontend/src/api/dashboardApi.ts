import axiosInstance from './axiosInstance';

// ===== 타입 정의 =====

export interface DailyLearningTime {
  dayOfWeek: string; // "MONDAY", "TUESDAY", ...
  learningMinutes: number;
}

export interface WeeklyLearningTime {
  totalMinutes: number;
  daily: DailyLearningTime[];
}

export interface LearningTimeResponse {
  thisWeekLearningTime: WeeklyLearningTime;
  lastWeekLearningTime: WeeklyLearningTime;
}

export interface CurriculumResponse {
  curriculam: string; // API 명세서의 오타 그대로 사용
}

export interface DiscussionResponse {
  discussion: string;
}

export interface DailyGoalCountResponse {
  todayGoalCount: number;
}

export interface DailyCompletedCountResponse {
  completedCount: number;
}

export interface WeeklyGoalPercentResponse {
  weekGoalPercent: number;
}

export interface ProtectorGoalOption {
  goal: string; // "FOCUS_ON_WEAKNESS", "BUILD_CONFIDENCE", "INCREASE_DIFFICULTY"
  title: string; // 한글 제목
  description: string; // 설명
}

export interface ProtectorGoalListResponse {
  goals: ProtectorGoalOption[];
}

export interface SetProtectorGoalRequest {
  protectorGoal: string; // "ACADEMIC_FOCUS", "WELLBEING_PRIORITY", "BALANCED", "MAINTAIN_CURRENT"
}

export interface SetProtectorGoalResponse {
  success: boolean;
}

export interface GetProtectorGoalResponse {
  protectorGoal: string | null;
}

// ===== PIN 복구 관련 타입 =====

export interface SendRecoveryCodeResponse {
  success: boolean;
}

export interface VerifyRecoveryCodeRequest {
  code: string;
}

export interface VerifyRecoveryCodeResponse {
  success: boolean;
}

export interface DailyStreakResponse {
  weeklyAttendance: boolean[];
  currentStreak: number;
}

export interface JamoAccuracyRate {
  jamo: string;
  accuracyRate: number;
  count: number;
}

export interface WeeklyJamoStatResponse {
  accuracyRates: JamoAccuracyRate[];
}

export interface AccuracyResponse {
  accuracy: number;
}

// ===== API 함수 =====

/**
 * 금주 커리큘럼 조회
 * GET /api/student/{studentId}/dashboard/curriculum
 */
export const getCurriculum = async (studentId: number): Promise<CurriculumResponse> => {
  const response = await axiosInstance.get<CurriculumResponse>(
    `/student/${studentId}/dashboard/curriculum`
  );
  return response.data;
};

/**
 * 금주 협의 로그 조회
 * GET /api/student/{studentId}/dashboard/discussion
 */
export const getDiscussion = async (studentId: number): Promise<DiscussionResponse> => {
  const response = await axiosInstance.get<DiscussionResponse>(
    `/student/${studentId}/dashboard/discussion`
  );
  return response.data;
};

/**
 * 학습 시간 조회 (금주 vs 지난주)
 * GET /api/student/{studentId}/dashboard/learning-time
 */
export const getLearningTime = async (studentId: number): Promise<LearningTimeResponse> => {
  const response = await axiosInstance.get<LearningTimeResponse>(
    `/student/${studentId}/dashboard/learning-time`
  );
  return response.data;
};

/**
 * 오늘 목표 문제 수 조회
 * GET /api/student/{studentId}/dashboard/daily/plan
 */
export const getDailyGoalCount = async (studentId: number): Promise<DailyGoalCountResponse> => {
  const response = await axiosInstance.get<DailyGoalCountResponse>(
    `/student/${studentId}/dashboard/daily/plan`
  );
  return response.data;
};

/**
 * 오늘 완료한 문제 수 조회
 * GET /api/student/{studentId}/dashboard/daily/count
 */
export const getDailyCompletedCount = async (studentId: number): Promise<DailyCompletedCountResponse> => {
  const response = await axiosInstance.get<DailyCompletedCountResponse>(
    `/student/${studentId}/dashboard/daily/count`
  );
  return response.data;
};

/**
 * 주간 목표 도달률 조회
 * GET /api/student/{studentId}/dashboard/weekly/plan
 */
export const getWeeklyGoalPercent = async (studentId: number): Promise<WeeklyGoalPercentResponse> => {
  const response = await axiosInstance.get<WeeklyGoalPercentResponse>(
    `/student/${studentId}/dashboard/weekly/plan`
  );
  return response.data;
};

/**
 * 보호자 학습 목표 선택지 조회
 * GET /api/student/dashboard/protector/goal
 */
export const getProtectorGoalList = async (): Promise<ProtectorGoalListResponse> => {
  const response = await axiosInstance.get<ProtectorGoalListResponse>(
    `/student/dashboard/protector/goal`
  );
  return response.data;
};

/**
 * 개별 학생의 현재 보호자 목표 조회
 * GET /api/student/{studentId}/dashboard/goal
 */
export const getProtectorGoal = async (
  studentId: number
): Promise<GetProtectorGoalResponse> => {
  const response = await axiosInstance.get<GetProtectorGoalResponse>(
    `/student/${studentId}/dashboard/goal`
  );
  return response.data;
};

/**
 * 보호자 학습 목표 설정
 * POST /api/student/{studentId}/dashboard/goal
 */
export const setProtectorGoal = async (
  studentId: number,
  protectorGoal: string
): Promise<SetProtectorGoalResponse> => {
  const response = await axiosInstance.post<SetProtectorGoalResponse>(
    `/student/${studentId}/dashboard/goal`,
    { protectorGoal }
  );
  return response.data;
};

// ===== PIN 복구 API =====

/**
 * PIN 복구 코드 발송 (이메일)
 * POST /api/protector/pin/send-recovery-code
 */
export const sendRecoveryCode = async (): Promise<SendRecoveryCodeResponse> => {
  const response = await axiosInstance.post<SendRecoveryCodeResponse>(
    `/protector/pin/send-recovery-code`
  );
  return response.data;
};

/**
 * PIN 복구 코드 검증
 * POST /api/protector/pin/verify-recovery-code
 */
export const verifyRecoveryCode = async (code: string): Promise<VerifyRecoveryCodeResponse> => {
  const response = await axiosInstance.post<VerifyRecoveryCodeResponse>(
    `/protector/pin/verify-recovery-code`,
    { code }
  );
  return response.data;
};

/**
 * 주간 학습 현황 (Daily Streak) 조회
 * GET /api/student/{studentId}/dashboard/daily-streak
 */
export const getDailyStreak = async (studentId: number): Promise<DailyStreakResponse> => {
  const response = await axiosInstance.get<DailyStreakResponse>(
    `/student/${studentId}/dashboard/daily-streak`
  );
  return response.data;
};

/**
 * 저번 주 학습 분석 조회 (weekly_jamo_stat 가장 최근 데이터)
 * GET /api/student/{studentId}/dashboard/weekly/jamo/stat
 */
export const getWeeklyJamoStat = async (studentId: number): Promise<WeeklyJamoStatResponse> => {
  const response = await axiosInstance.get<WeeklyJamoStatResponse>(
    `/student/${studentId}/dashboard/weekly/jamo/stat`
  );
  return response.data;
};

/**
 * 금일 평균 정확도 조회 (학습한 자모만 포함)
 * GET /api/student/{studentId}/dashboard/accuracy/today
 */
export const getDailyAccuracy = async (studentId: number): Promise<AccuracyResponse> => {
  const response = await axiosInstance.get<AccuracyResponse>(
    `/student/${studentId}/dashboard/accuracy/today`
  );
  return response.data;
};

/**
 * 금주 평균 정확도 조회 (학습한 자모만 포함)
 * GET /api/student/{studentId}/dashboard/accuracy/week
 */
export const getWeeklyAccuracy = async (studentId: number): Promise<AccuracyResponse> => {
  const response = await axiosInstance.get<AccuracyResponse>(
    `/student/${studentId}/dashboard/accuracy/week`
  );
  return response.data;
};