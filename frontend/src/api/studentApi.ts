import axiosInstance from './axiosInstance';

export interface VerifyStudentPinResponse {
  success: boolean;
}

export interface ProfileUploadResponse {
  imageUrl: string;
}

export interface AccuracyResponse {
  accuracy: number;
}

export interface JamoImprovementApiData {
  jamo: string;
  twoWeeksAgo: number;
  lastWeek: number;
  improveRate: number;
}

export interface BestJamosResponse {
  bestJamos: JamoImprovementApiData[];
}

export interface WorstJamosResponse {
  worstJamos: JamoImprovementApiData[];
}

export interface OverallAccuracyResponse {
  twoWeeksAgo: number;
  lastWeek: number;
  improveRate: number;
}

// 💡 추가: 전체 학습 분석 API 응답 인터페이스
export interface JamoStatData {
  jamo: string;
  accuracyRate: number;
  count: number;
}

export interface AllJamoStatsResponse {
  accuracyRates: JamoStatData[];
}

/**
 * sessionStorage에서 학생 ID를 가져옵니다.
 * @throws {Error} 학생 ID를 찾을 수 없는 경우 (로그인이 필요한 경우)
 */
const getStudentId = (): number => {
  const studentId = sessionStorage.getItem('studentId');

  if (!studentId) {
    throw new Error('학생 ID를 찾을 수 없습니다. 로그인이 필요합니다.');
  }

  return parseInt(studentId, 10);
};

/**
 * 학생 PIN 검증
 * POST /api/student/{student-id}/pin/verify
 * @param pin - 입력된 PIN 번호 (studentId는 이제 파라미터로 받지 않습니다)
 */
export const verifyStudentPin = async (pin: string): Promise<VerifyStudentPinResponse> => {
  const studentId = getStudentId(); // 헬퍼 함수로 ID 가져오기
  const url = `/student/${studentId}/pin/verify`;
  const response = await axiosInstance.post<VerifyStudentPinResponse>(url, { pin });
  return response.data;
};

/**
 * 학생 프로필 이미지 수정 (업로드)
 * PATCH /api/student/{student-id}/profile
 * @param file - 업로드할 이미지 파일 (studentId는 이제 파라미터로 받지 않습니다)
 */
export const updateStudentProfileImage = async (file: File): Promise<ProfileUploadResponse> => {
  const studentId = getStudentId(); // 헬퍼 함수로 ID 가져오기
  const url = `/student/${studentId}/profile`;
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.patch<ProfileUploadResponse>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// 💡 추가: 금일(오늘) 평균 정확도 조회
/**
 * 금일 평균 정확도 조회
 * GET /api/student/{student-id}/dashboard/accuracy/today
 */
export const getDailyAccuracy = async (): Promise<AccuracyResponse> => {
  const studentId = getStudentId();
  const url = `/student/${studentId}/dashboard/accuracy/today`;
  const response = await axiosInstance.get<AccuracyResponse>(url);
  return response.data;
};

// 💡 추가: 금주 평균 정확도 조회
/**
 * 금주 평균 정확도 조회
 * GET /api/student/{student-id}/dashboard/accuracy/week
 */
export const getWeeklyAccuracy = async (): Promise<AccuracyResponse> => {
  const studentId = getStudentId();
  const url = `/student/${studentId}/dashboard/accuracy/week`;
  const response = await axiosInstance.get<AccuracyResponse>(url);
  return response.data;
};

/**
 * 가장 많이 개선된 자모 Top2 조회
 * GET /api/student/{student-id}/dashboard/best/improve/jamo
 */
export const getBestJamos = async (): Promise<BestJamosResponse> => {
  const studentId = getStudentId();
  const url = `/student/${studentId}/dashboard/best/improve/jamo`;
  const response = await axiosInstance.get<BestJamosResponse>(url);
  return response.data;
};

// 💡 추가: 정확도가 낮은 자모 Top2 조회
/**
 * 정확도가 낮은 자모 Top2 조회
 * GET /api/student/{student-id}/dashboard/worst/improve/jamo
 */
export const getWorstJamos = async (): Promise<WorstJamosResponse> => {
  const studentId = getStudentId();
  const url = `/student/${studentId}/dashboard/worst/improve/jamo`;
  const response = await axiosInstance.get<WorstJamosResponse>(url);
  return response.data;
};

// 💡 추가: 전체 정확도 개선도 조회
/**
 * 지지난주 대비 지난주 전체정확도 개선도를 조회합니다.
 * GET /api/student/{student-id}/dashboard/improve/accuracy
 */
export const getOverallAccuracy = async (): Promise<OverallAccuracyResponse> => {
  const studentId = getStudentId();
  const url = `/student/${studentId}/dashboard/improve/accuracy`;
  const response = await axiosInstance.get<OverallAccuracyResponse>(url);
  return response.data;
};

// 💡 추가: 특정 아동의 전체 학습 분석 조회
/**
 * 특정 아동의 전체 학습 분석을 조회합니다.
 * GET /api/student/{student-id}/dashboard/total/jamo/stat
 */
export const getAllJamoStats = async (): Promise<AllJamoStatsResponse> => {
  const studentId = getStudentId();
  const url = `/student/${studentId}/dashboard/total/jamo/stat`;
  const response = await axiosInstance.get<AllJamoStatsResponse>(url);
  return response.data;
};