import axios from 'axios';

// 로그인/회원가입 응답 인터페이스
export interface LoginResponse {
  protectorId: number;
  accessToken: string;
  isNewUser: boolean;
}

// 일반 로그인 요청 데이터
interface LocalLoginRequest {
  username: string;
  password: string;
}

// 회원가입 요청 데이터
interface LocalSignupRequest {
  username: string;
  password: string;
  email: string;
}

/**
 * 소셜 로그인 API
 * POST /api/auth/social/login
 */
export const socialLogin = async (idToken: string, provider: string = 'google'): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(
    '/api/auth/social/login',
    {
      idToken: idToken,
      provider: provider,
    }
  );
  return response.data;
};

/**
 * 일반 로그인 API
 * POST /api/auth/local/login
 */
export const localLogin = async (data: LocalLoginRequest): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>('/api/auth/local/login', data);
  return response.data;
};

/**
 * 일반 회원가입 API
 * POST /api/auth/local/signup
 */
export const localSignup = async (data: LocalSignupRequest): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>('/api/auth/local/signup', data);
  return response.data;
};