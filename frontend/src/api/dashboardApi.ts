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
