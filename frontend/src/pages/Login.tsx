import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import Cookies from 'js-cookie';
import BeforeNavbar from '../components/BeforeLoginNavbar';
import { socialLogin, localLogin, localSignup, type LoginResponse } from '../api/authApi';

const Login = () => {
  const navigate = useNavigate();
  
  // 탭 상태: 'login' | 'signup'
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // 입력 폼 상태 (confirmPassword 추가)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '', 
    email: ''
  });

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  // 입력 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 공통 로그인 성공 처리 로직
  const processLoginSuccess = (data: LoginResponse) => {
    const { accessToken, isNewUser } = data;

    if (accessToken) {
      Cookies.set('accessToken', accessToken, { expires: 7, path: '/' });
      
      if (isNewUser) {
        navigate('/new-user-terms');
      } else {
        navigate('/select-profile');
      }
    } else {
      console.error('AccessToken이 응답에 없습니다.');
      alert('로그인 처리 중 오류가 발생했습니다.');
    }
  };

  // 일반 로그인 / 회원가입 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ 유효성 검사: 회원가입 시 비밀번호 일치 여부 확인
    if (activeTab === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        alert('비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
        return;
      }
    }

    setIsLoading(true);

    try {
      // 1. 일반 로그인 로직
      if (activeTab === 'login') {
        const response = await localLogin({
          username: formData.username,
          password: formData.password
        });
        // 로그인 성공 시에만 메인으로 이동 로직 실행
        processLoginSuccess(response);
      } 
      // 2. 회원가입 로직
      else {
        await localSignup({
          username: formData.username,
          password: formData.password,
          email: formData.email
        });
        
        alert('회원가입이 완료되었습니다! 로그인을 진행해주세요.');
        
        // ✅ 자동 로그인(processLoginSuccess)을 하지 않고, 페이지를 새로고침합니다.
        window.location.reload(); 
      }
      
    } catch (error: any) {
      console.error('요청 실패:', error);
      const errorMessage = error.response?.data?.message || '오류가 발생했습니다. 다시 시도해주세요.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 구글 로그인 성공 핸들러
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) return;

    try {
      const data = await socialLogin(idToken, 'google');
      processLoginSuccess(data);
    } catch (error) {
      console.error('Google 로그인 실패:', error);
      alert('Google 로그인에 실패했습니다.');
    }
  };

  return (
    <div
      className="flex flex-col h-screen relative overflow-hidden font-pretendard"
      style={{
        backgroundImage: `url('/introduce/background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <BeforeNavbar />

      <div className="flex-grow flex justify-center items-center z-10 p-4">
        {/* 카드형 컨테이너 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-[440px] transition-all duration-300">
          
          {/* 헤더 */}
          <h1 className="text-3xl font-bold text-center text-neutral-800 mb-8">
            {activeTab === 'login' ? '로그인' : '회원가입'}
          </h1>

          {/* 탭 버튼 (로그인 / 회원가입) */}
          <div className="flex p-1 bg-neutral-100 rounded-xl mb-6 relative">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'login' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'signup' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              회원가입
            </button>
          </div>

          {/* 일반 로그인/회원가입 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              {/* 아이디 입력 */}
              <div>
                <input
                  type="text"
                  name="username"
                  placeholder="아이디"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-neutral-700 placeholder-neutral-400"
                />
              </div>

              {/* 이메일 입력 (회원가입 시에만 표시) */}
              {activeTab === 'signup' && (
                <div className="animate-fadeIn">
                  <input
                    type="email"
                    name="email"
                    placeholder="이메일 (example@email.com)"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-neutral-700 placeholder-neutral-400"
                  />
                </div>
              )}

              {/* 비밀번호 입력 */}
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="비밀번호"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-neutral-700 placeholder-neutral-400"
                />
              </div>

              {/* 비밀번호 확인 입력 (회원가입 시에만 표시) */}
              {activeTab === 'signup' && (
                <div className="animate-fadeIn">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="비밀번호 확인"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3.5 bg-neutral-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-neutral-700 placeholder-neutral-400 ${
                      // 입력값이 있는데 불일치하면 테두리 붉게 표시 (UX 강화)
                      formData.confirmPassword && formData.password !== formData.confirmPassword 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-neutral-200'
                    }`}
                  />
                  {/* 불일치 시 도움말 텍스트 */}
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1 ml-1">비밀번호가 일치하지 않습니다.</p>
                  )}
                </div>
              )}
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  처리 중...
                </span>
              ) : (
                activeTab === 'login' ? '로그인' : '가입하기'
              )}
            </button>
          </form>

          {/* 구분선 */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/0 backdrop-blur-sm text-neutral-500 bg-white rounded-full">
                또는 소셜 계정으로 가입 없이 시작
              </span>
            </div>
          </div>

          {/* 구글 로그인 */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.error('Login Failed')}
              useOneTap={false}
              shape="pill"
              theme="outline"
              size="large"
              width="340" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;