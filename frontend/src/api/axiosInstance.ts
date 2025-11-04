import axios from 'axios';
import Cookies from 'js-cookie';

// axios 인스턴스 생성 (공통 설정)
const axiosInstance = axios.create({
  baseURL: '/api', // vite.config.ts 프록시 설정으로 localhost:8080/api로 전달됨
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 모든 요청에 accessToken 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ 인증 오류: 로그인이 필요합니다.');
      // 필요시 로그인 페이지로 리다이렉트
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
