import axiosInstance from './axiosInstance';

// ===== 타입 정의 =====

export interface MajorInterest {
  majorInterestId: number;
  majorInterestName: string;
}

export interface SubInterest {
  subInterestId: number;
  subInterestName: string;
}

export interface MajorInterestsResponse {
  majorInterests: MajorInterest[];
}

export interface SubInterestsResponse {
  majorInterestId: number;
  subInterests: SubInterest[];
}

// ===== API 함수 =====

/**
 * 대분류 관심사 목록 조회
 * GET /api/interest/major
 */
export const getMajorInterests = async (): Promise<MajorInterestsResponse> => {
  const response = await axiosInstance.get<MajorInterestsResponse>('/interest/major');
  return response.data;
};

/**
 * 소분류 관심사 목록 조회
 * GET /api/interest/sub?majorInterestId={id}
 */
export const getSubInterests = async (majorInterestId: number): Promise<SubInterestsResponse> => {
  const response = await axiosInstance.get<SubInterestsResponse>('/interest/sub', {
    params: { majorInterestId }
  });
  return response.data;
};
