import axiosInstance from './axiosInstance';
import type { BackendGender, BackendGrade } from '../utils/studentMapper';

// ===== 타입 정의 =====

export interface InterestDto {
  interestId: number;
  interestName: string;
}

export interface StudentResponse {
  studentId: number;
  name: string;
  gender?: string;
  birth?: string;
  profileImage?: string;
  grade?: string;
  level?: number;
  coin: number;
  interests: InterestDto[];
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

export interface StudentCountResponse {
  totalCount: number;
  remainCount: number;
}

export interface VerifyPinRequest {
  pin: string;
}

export interface VerifyPinResponse {
  success: boolean;
}

export interface VerifyStudentPinResponse {
  success: boolean;
}

export interface UpdatePinRequest {
  currentPin: string;
  newPin: string;
}

export interface UpdatePinResponse {
  success: boolean;
}

export interface CreatePinRequest {
  pin: string;
}

export interface CreatePinResponse {
  success: boolean;
}

// 💡 추가: 학생 정보 수정 요청 타입 (API 명세 기반)
export interface UpdateStudentRequest {
  studentName: string;
  gender: BackendGender;
  birth: string; // 'yyyy-MM-dd'
  grade: BackendGrade;
}

// 💡 추가: 학생 정보 수정 응답 타입 (API 명세 기반)
export interface UpdateStudentResponse {
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

/**
 * 학생 삭제
 * DELETE /api/student/{studentId}
 */
export const deleteStudent = async (studentId: number): Promise<void> => {
  await axiosInstance.delete(`/student/${studentId}`);
};

/**
 * 학생 정보 수정
 * PATCH /api/student/{studentId}
 */
export const updateStudent = async (
  studentId: number,
  data: UpdateStudentRequest
): Promise<UpdateStudentResponse> => {
  const response = await axiosInstance.patch<UpdateStudentResponse>(
    `/student/${studentId}`,
    data
  );
  return response.data;
};

/**
 * 개설 가능한 학생 수 조회
 * GET /api/protector/student/count
 */
export const getStudentCount = async (): Promise<StudentCountResponse> => {
  const response = await axiosInstance.get<StudentCountResponse>('/protector/student/count');
  return response.data;
};

/**
 * 보호자 PIN 검증
 * POST /api/protector/pin/verify
 */
export const verifyPin = async (pin: string): Promise<VerifyPinResponse> => {
  const response = await axiosInstance.post<VerifyPinResponse>('/protector/pin/verify', { pin });
  return response.data;
};

/**
 * 보호자 PIN 생성 (최초 등록)
 * POST /api/protector/pin
 */
export const createPin = async (pin: string): Promise<CreatePinResponse> => {
  const response = await axiosInstance.post<CreatePinResponse>('/protector/pin', { pin });
  return response.data;
};

/**
 * 보호자 PIN 변경
 * PATCH /api/protector/pin
 */
export const updatePin = async (currentPin: string, newPin: string): Promise<UpdatePinResponse> => {
  const response = await axiosInstance.patch<UpdatePinResponse>('/protector/pin', {
    currentPin,
    newPin
  });
  return response.data;
};

/**
 * 회원 탈퇴
 * DELETE /api/protector/withdraw
 */
export const withdrawAccount = async () => {
  const response = await axiosInstance.delete('/protector/withdraw');
  return response.data;
};