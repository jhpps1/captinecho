import axiosInstance from './axiosInstance';
import type { TranscriptionResponse } from '../types/adventure';

// ===== 초기진단 API 함수 =====

/**
 * 음성-텍스트 변환 (초기진단용)
 * POST /stt/transcribe
 *
 * @param audioFile - WebM 오디오 파일
 * @returns 음성 인식 텍스트
 *
 * @description
 * - ai-service의 Whisper API를 통한 음성 인식만 수행 (정답 비교 없음)
 * - WebM 오디오 파일을 multipart/form-data로 전송
 * - 초기진단 문제용으로 사용
 *
 * @example
 * const result = await transcribeAudio(audioFile);
 * console.log(`인식 결과: ${result.text}`);
 */
export const transcribeAudio = async (
  audioFile: File
): Promise<TranscriptionResponse> => {
  const formData = new FormData();
  formData.append('audio_file', audioFile);

  const response = await axiosInstance.post<TranscriptionResponse>(
    '/stt/transcribe',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};
