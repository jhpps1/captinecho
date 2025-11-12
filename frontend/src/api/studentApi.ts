import axiosInstance from './axiosInstance';

export interface VerifyStudentPinResponse {
    success: boolean;
}

/**
 * 학생 PIN 검증
 * POST /api/student/{student-id}/pin/verify
 * @param studentId - 검증할 학생의 ID
 * @param pin - 입력된 PIN 번호
 */
export const verifyStudentPin = async (studentId: number, pin: string): Promise<VerifyStudentPinResponse> => {
    // {student-id} 부분을 실제 studentId 값으로 대체합니다.
    const url = `/student/${studentId}/pin/verify`;

    // 수정된 url과 pin 데이터를 post 요청으로 보냅니다.
    const response = await axiosInstance.post<VerifyStudentPinResponse>(url, { pin });
    return response.data;
};