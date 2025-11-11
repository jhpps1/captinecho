import { Link } from 'react-router-dom';

// 로그인 전 사용되는 상단 네비게이션 바 컴포넌트
const BeforeLoginNavbar = () => {
  return (
    <nav className="w-full bg-white/90 backdrop-blur-md px-6 py-3 flex justify-between items-center shadow-sm border-b border-white/20">
      
      <div className="flex items-center space-x-6">
        {/* 로고 겸 홈 버튼 */}
        <Link to="/">
          <img 
            src="/nav/logo.png" 
            alt="꼬마선장 에코 로고" 
            className="h-12"
          />
        </Link>
        {/* 소개 페이지 버튼 */}
        <Link 
          to="/introduction"
          className="text-gray-700 hover:text-blue-600 text-lg font-medium font-peach ps-10"
        >
          소개
        </Link>
      </div>
      
      {/* 시작하기 버튼 */}
      <div>
        <Link 
          to="/login"
          className="bg-blue-500 text-white font-semibold px-5 py-2 rounded-md hover:bg-blue-600 transition-colors font-peach"
        >
          시작하기
        </Link>
      </div>

    </nav>
  );
};

export default BeforeLoginNavbar;