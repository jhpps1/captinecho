import { Link } from 'react-router-dom';
import BeforeNavbar from '../components/BeforeLoginNavbar.tsx';

const MainPage = () => {
  return (
    <div className="flex flex-col h-screen">
      
      {/* Navbar는 컴포넌트 처리 */}
      <BeforeNavbar />
      
      <div 
        className="w-full flex-1 relative bg-cover bg-center bg-[url('/mainpage/mainimage.png')]"
      >
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <Link to="/login">
            <img 
              src="/mainpage/startbutton.png" 
              alt="시작하기" 
              className="cursor-pointer transition-transform duration-200 hover:scale-105"
            />
          </Link>
        </div>
      </div>

    </div>
  );
};

export default MainPage;