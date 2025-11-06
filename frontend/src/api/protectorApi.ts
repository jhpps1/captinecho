import axiosInstance from './axiosInstance';
import type { BackendGender, BackendGrade } from '../utils/studentMapper';

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

export interface RegisterStudentRequest {
  studentName: string;
  gender: BackendGender; // 'MALE' | 'FEMALE'
  birth: string; // 'yyyy-MM-dd'
  grade: BackendGrade; // 'PRE_SCHOOL' | 'GRADE_1' ~ 'GRADE_6'
  interests: { interestId: number }[];
}

export interface RegisterStudentResponse {
  success: boolean;
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

/**
 * 학생 등록
 * POST /api/student
 */
export const registerStudent = async (
  data: RegisterStudentRequest
): Promise<RegisterStudentResponse> => {
  const response = await axiosInstance.post<RegisterStudentResponse>('/student', data);
  return response.data;
};
