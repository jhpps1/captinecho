import { Link } from 'react-router-dom';

/**
 * 로그인 전 사용되는 상단 네비게이션 바 컴포넌트
 */
const BeforeLoginNavbar = () => {
  return (
    <nav className="w-full bg-white px-6 py-3 flex justify-between items-center shadow-sm">
      
      <div className="flex items-center space-x-6">
        <Link to="/">
          <img 
            src="/nav/logo.png" 
            alt="꼬마선장 에코 로고" 
            className="h-12" // 로고 높이 (필요에 따라 h-12 등으로 조절)
          />
        </Link>
        
        <Link 
          to="/introduction" // '소개' 페이지 라우트 경로 (예시)
          className="text-gray-700 hover:text-blue-600 text-lg font-medium font-peach ps-10"
        >
          소개
        </Link>
      </div>
      
      <div>
        <Link 
          to="/login" // '시작하기' 페이지 라우트 경로 (예시: 로그인 또는 회원가입)
          className="bg-blue-500 text-white font-semibold px-5 py-2 rounded-md hover:bg-blue-600 transition-colors font-peach"
        >
          시작하기
        </Link>
      </div>

    </nav>
  );
};

export default BeforeLoginNavbar;