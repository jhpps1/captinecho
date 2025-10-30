import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Cookies from 'js-cookie';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');

    if (accessToken) {
      Cookies.set('accessToken', accessToken, { 
        path: '/',            // 쿠키가 사이트 전체에서 유효하도록
        secure: true,         // HTTPS에서만 쿠키 전송
        sameSite: 'Strict'    // CSRF 공격 방지
        // expires: 7          // (선택 사항) 7일 후 만료
      });

      navigate('/select-profile', { replace: true });

    } else {
      console.error('Access Token을 받지 못했습니다.');
      alert('로그인에 실패했습니다.');
      navigate('/login', { replace: true });
    }
  }, [navigate, searchParams]);

  return <div>로그인 처리 중입니다...</div>;
};

export default AuthCallback;