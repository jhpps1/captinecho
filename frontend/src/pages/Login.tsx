import { useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import axios from 'axios';
import Cookies from 'js-cookie';
import BeforeNavbar from '../components/BeforeLoginNavbar';

// 백엔드 응답 타입 (Swagger 기반)
interface LoginResponse {
  protectorId: number;
  accessToken: string;
  isNewUser: boolean;
}

const Login = () => {
  const navigate = useNavigate();

  // 1. 구글 로그인 성공 시 호출될 콜백 함수
  const handleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    // 'credential' 필드에 idToken이 담겨 옵니다.
    const idToken = credentialResponse.credential;

    if (!idToken) {
      console.error('❌ Google로부터 idToken을 받지 못했습니다.');
      return;
    }

    try {
      // 2. idToken을 백엔드 서버로 전송
      console.log('🚀 백엔드(/api/protector/login)로 idToken 전송 시도...');
      const response = await axios.post<LoginResponse>(
        '/api/auth/login', // (vite.config.ts 프록시 설정이 되어있어야 함)
        {
          idToken: idToken,
          provider: 'google',
        }
      );

      // 3. 백엔드 응답에서 AccessToken, isNewUser 추출
      const { accessToken, isNewUser } = response.data;

      if (accessToken) {
        // 4. AccessToken을 쿠키에 저장
        Cookies.set('accessToken', accessToken, { expires: 7, path: '/' });

        // 5. 신규 회원 여부에 따라 리디렉션
        if (isNewUser) {
          // 신규 회원: 약관 동의 페이지로 이동
          console.log('✅ 신규 회원: 약관 동의 페이지로 이동');
          navigate('/new-user-terms');
        } else {
          // 기존 회원: 프로필 선택 페이지로 이동
          console.log('✅ 기존 회원: 프로필 선택 페이지로 이동');
          navigate('/select-profile');
        }
      } else {
        console.error('❌ 백엔드 응답에 AccessToken이 없습니다.');
      }
    } catch (error) {
      console.error('❌ 백엔드 로그인 요청 실패:', error);
      // (여기서 401 오류가 뜬다면 백엔드 측의 idToken 검증 로직 확인 필요)
    }
  };

  // 2. 구글 로그인 실패 시
  const handleLoginError = () => {
    console.error('❌ Google 로그인에 실패했습니다.');
  };

  return (
    <div
      className="flex flex-col h-screen relative overflow-hidden font-sans"
      style={{
        backgroundImage: `url('/introduce/background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <BeforeNavbar />

      <div className="flex-grow flex justify-center items-center z-10 p-4">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold mb-10 text-gray-900 tracking-tight">
            로그인
          </h1>
          
          {/* 3. 기존 버튼 대신 GoogleLogin 컴포넌트 사용 */}
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