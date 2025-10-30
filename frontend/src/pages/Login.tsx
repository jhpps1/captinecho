import BeforeNavbar from '../components/BeforeLoginNavbar'; 

const Login = () => {
    
  // 1. 구글 로그인 버튼 클릭 시 실행될 함수
  const handleLoginClick = () => {
    window.location.href = 'YOUR_BACKEND_GOOGLE_AUTH_URL';
  };

  return (
    <div 
      className="flex flex-col h-screen relative overflow-hidden" 
      style={{
        backgroundImage: `url('/introduce/background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      
      <BeforeNavbar />

      <div className="flex-grow flex justify-center items-center z-10 p-4">
        
        <div className="text-center">
          
          <h1 className="text-4xl font-bold mb-8 text-gray-800">
            로그인 페이지
          </h1>
          
          <button 
            onClick={handleLoginClick} 
            className="inline-flex items-center bg-white border border-gray-300 rounded-lg px-6 py-3 text-lg font-medium text-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
            {/* SVG 아이콘... */}
            <svg className="w-6 h-6" viewBox="0 0 48 48">

              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>

              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v8.51h12.8c-.57 2.81-2.22 5.25-4.8 6.94l6.98 5.38c4.1-3.79 6.4-9.33 6.4-16.28z"></path>

              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"></path>

              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-6.98-5.38c-2.11 1.45-4.8 2.3-7.91 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>

              <path d="M0 0h48v48H0z" fill="none"></path>

            </svg>
            <span className="ml-4">Google 계정으로 로그인</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;