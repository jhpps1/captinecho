import axiosInstance from './axiosInstance';

// ===== 타입 정의 =====

export interface StudentResponse {
  studentId: number;
  name: string;
  gender?: string;
  profileImage?: string;
  grade?: string;
  level?: number;
  coin: number;
}

export interface StudentListResponse {
  students: StudentResponse[];
}

// ===== API 함수 =====

/**
 * 보호자의 학생 목록 조회
 * GET /api/protector/students
 */
export const getStudents = async (): Promise<StudentListResponse> => {
  const response = await axiosInstance.get<StudentListResponse>('/protector/students');
  return response.data;
};
