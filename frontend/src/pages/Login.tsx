import { useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import axios from 'axios';
import Cookies from 'js-cookie';
import BeforeNavbar from '../components/BeforeLoginNavbar';

// 로그인 관련 인터페이스
interface LoginResponse {
  protectorId: number;
  accessToken: string;
  isNewUser: boolean;
}

const Login = () => {
  // 라우팅 관련
  const navigate = useNavigate();

  // 구글 로그인 성공 시 호출될 콜백 함수
  const handleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    // 'credential' 필드에 idToken이 담겨 옵니다.
    const idToken = credentialResponse.credential;

    if (!idToken) {
      // 구글로 부터 idToken을 받지 못 할시
      console.error('Google로부터 idToken을 받지 못했습니다.');
      return;
    }

    try {
      // idToken을 백엔드 서버로 전송
      const response = await axios.post<LoginResponse>(
        '/api/auth/social/login',
        {
          idToken: idToken,
          provider: 'google',
        }
      );

      // 백엔드 응답에서 AccessToken, isNewUser 추출
      const { accessToken, isNewUser } = response.data;

      if (accessToken) {
        // AccessToken을 쿠키에 저장
        Cookies.set('accessToken', accessToken, { expires: 7, path: '/' });

        // 신규 회원 여부에 따라 리디렉션
        if (isNewUser) {
          // 신규 회원: 약관 동의 페이지로 이동
          navigate('/new-user-terms');
        } else {
          // 기존 회원: 프로필 선택 페이지로 이동
          navigate('/select-profile');
        }
      } else {
        // AccessToken 에러 발생시
        console.error('백엔드 응답에 AccessToken이 없습니다.');
      }
    } catch (error) {
      // 로그인 실패 시
      console.error('백엔드 로그인 요청 실패:');
    }
  };

  // 구글 로그인 실패 시
  const handleLoginError = () => {
    console.error('Google 로그인에 실패했습니다.');
  };

  return (
    // 배경화면 설정 관련
    <div
      className="flex flex-col h-screen relative overflow-hidden font-sans"
      style={{
        backgroundImage: `url('/introduce/background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* 상단 Navbar */}
      <BeforeNavbar />

      <div className="flex-grow flex justify-center items-center z-10 p-4">
        <div className="text-center">
          {/* "로그인" */}
          <h1 className="text-4xl font-extrabold mb-10 text-gray-900 tracking-tight">
            로그인
          </h1>
          
          {/* 구글 로그인 컴포넌트 */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
              useOneTap={false} // 원탭 로그인 비활성화 (버튼 클릭 방식만 사용)
              shape="pill"
              theme="outline"
              size="large"
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;