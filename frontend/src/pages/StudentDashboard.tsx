import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

// 오른쪽 나무 버튼 데이터 (내용 동일)
const woodenButtons = [
  { id: 1, label: '자모맞추기', path: '/adventure/1' },
  { id: 2, label: '글자합치기', path: '/adventure/2' },
  { id: 3, label: '그림맞추기', path: '/adventure/3' },
  { id: 4, label: '단어읽기', path: '/adventure/4' },
];

// 학생 프로필 데이터 타입 (내용 동일)
interface StudentProfile {
  name: string;
  imageUrl: string;
}

// API 응답 타입 (내용 동일)
interface ApiStudent {
  studentId: number;
  name: string;
  profileImage: string;
  // ... (다른 필드들)
}

interface ApiResponse {
  students: ApiStudent[];
}

// 왼쪽 하단 나가기 아이콘 (내용 동일)
const ExitIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3-6-3 3m0 0 3 3m-3-3h12.75" />
  </svg>
);

// 오른쪽 메뉴 토글 화살표 (내용 동일)
const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);

  useEffect(() => {
    const studentIdFromSession = sessionStorage.getItem('studentId');

    if (!studentIdFromSession) {
      alert('학생을 먼저 선택해주세요.'); // Please select a student first.
      navigate('/select-profile');
      return;
    }

    // --- (기존 API 호출 로직 - 수정 없음) ---
    const fetchStudentData = async (id: string) => {
      const targetStudentId = parseInt(id, 10);
      try {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
          alert('로그인 정보가 없습니다. 다시 로그인해주세요.'); // No login information. Please log in again.
          navigate('/');
          return;
        }

        const response = await fetch('/api/protector/students', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          if (response.status === 401) {
            alert('인증 정보가 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.'); // Authentication expired or invalid. Please log in again.
            Cookies.remove('accessToken', { path: '/' });
            sessionStorage.removeItem('studentId');
            navigate('/');
            return;
          }
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data: ApiResponse = await response.json();
        const foundStudent = data.students.find(
          (student) => student.studentId === targetStudentId
        );

        if (foundStudent) {
          setProfile({
            name: foundStudent.name,
            imageUrl: foundStudent.profileImage,
          });
        } else {
          alert('학생 정보를 찾는 데 실패했습니다. 다시 선택해주세요.'); // Failed to find student info. Please select again.
          navigate('/select-profile');
        }
      } catch (error) {
        console.error('학생 정보 로드 실패:', error); // Failed to load student info
        alert('학생 정보를 불러오는 데 실패했습니다.'); // Failed to load student info
        navigate('/select-profile');
      } finally {
        setIsLoading(false);
      }
    };
    // --- (API 로직 끝) ---

    fetchStudentData(studentIdFromSession);
  }, [navigate]);

  // 게임 시작 애니메이션 핸들러 (내용 동일)
  const handleStartGame = () => {
    setIsStartingGame(true); 
    setTimeout(() => {
      navigate('/today-game');
    }, 2500); // 애니메이션 시간(2.5초) 후 이동
  };

  // 로딩 중 화면 (내용 동일)
  if (isLoading || !profile) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 font-sans">
        <div className="text-2xl font-semibold text-gray-700">
          학생 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  // --- UI 렌더링 ---
  return (
    <>
      <div
        className="w-full min-h-screen bg-black overflow-hidden relative font-sans" // bg-cover bg-center 제거, bg-black 추가 (비디오 로드 전 배경)
        // style={{ backgroundImage: `url('/studentboard/background.png')` }} // style 속성 제거
      >
        {/* --- 0. 배경 비디오 (추가됨) --- */}
        <video
          autoPlay
          loop
          muted
          playsInline // iOS에서 자동 재생을 위해 추가
          className="absolute z-0 w-auto h-auto min-w-full min-h-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" // 이 부분으로 변경
        >
          <source src="/studentboard/background.mp4" type="video/mp4" />
          브라우저가 비디오 태그를 지원하지 않습니다.
        </video>

        {/* --- 1. 오른쪽 하단 프로필 바 (수정됨) --- */}
        <header
          className="absolute bottom-5 right-5 w-[400px] h-[80px] bg-contain bg-no-repeat z-30" 
          style={{ backgroundImage: `url('/studentboard/profilebar.png')` }}
        >
          <div className="flex items-center h-full pl-2">
            <img
              src={profile.imageUrl}
              alt="프로필"
              className="w-[64px] h-[64px] rounded-full object-cover border-2 border-yellow-300/50"
            />
            <span 
              className="ml-4 text-3xl font-bold text-white"
              style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' }} 
            >
              {profile.name}
            </span>
          </div>
        </header>

        {/* --- 2. 오른쪽 상단 나가기 버튼 (수정됨) --- */}
        <button
          onClick={() => navigate('/select-profile')}
          className="absolute top-5 right-5 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center z-30 hover:bg-gray-100 transition-all active:scale-95" 
        >
          <ExitIcon className="w-12 h-12 text-gray-700" />
        </button>

        {/* --- 3. 중앙 배 & 시작 버튼 (수정 없음) --- */}
        <div
          className={`absolute bottom-[-20px] left-1/2 w-[450px] h-[525px]
                      transition-transform duration-[2000ms] ease-in-out z-20`
                    }
          style={{ 
            transform: isStartingGame 
              ? 'translate(-50%, -110vh)' 
              : 'translate(-50%, 0)' 
          }} 
        >
          <img
            src="/studentboard/ship.png"
            alt="배와 캐릭터"
            className="absolute bottom-0 left-0 w-full z-0"
          />
          
          {/* --- 여기가 수정된 부분입니다 --- */}
          <button
            onClick={handleStartGame}
            disabled={isStartingGame}
            className={`absolute bottom-[30px] left-1/2 -translate-x-1/2 w-42 h-42 z-20
                      transition-all duration-500 ease-out
                      hover:scale-110 active:scale-100
                      ${isStartingGame ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}
          >
            <img src="/studentboard/playbutton.png" alt="시작하기" />
          </button>
        </div>

        {/* --- 4. 왼쪽 사이드 메뉴 (수정된 로직) --- */}
        <aside 
          className={`fixed top-1/2 -translate-y-1/2 left-0 flex items-center h-[450px] z-50
                      transition-transform duration-500 ease-in-out
                      ${isMenuOpen ? 'translate-x-0' : '-translate-x-64'}`} // w-64 (256px) 만큼 왼쪽으로 이동
        >
          {/* 메뉴 버튼 컨테이너 (순서 변경) */}
          <div
            className="w-64 h-full flex flex-col justify-around items-center py-5"
          >
            {woodenButtons.map((button) => (
              <button
                key={button.id}
                onClick={() => navigate(button.path)}
                className="w-52 h-20 bg-contain bg-no-repeat bg-center text-xl font-bold text-white shadow-md hover:scale-105 transition-transform"
                style={{
                  backgroundImage: `url('/studentboard/button.png')`,
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
                }}
              >
                {button.label}
              </button>
            ))}
          </div>

          {/* 메뉴 토글 버튼 (순서 변경, 스타일 수정) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-12 h-24 bg-white/80 rounded-r-2xl shadow-lg flex items-center justify-center z-10 hover:bg-white active:scale-95"
          >
            <ChevronLeftIcon
              className={`w-8 h-8 text-gray-800 transition-transform duration-300 ${
                isMenuOpen ? 'rotate-0' : 'rotate-180' // 회전 로직 반대로
              }`}
            />
          </button>
        </aside>
      </div>

      {/* --- 5. 게임 시작 시 페이드 아웃 오버레이 (수정 없음) --- */}
      <div
        className={`absolute inset-0 bg-sky-600 transition-opacity duration-1500 z-40
                  ${isStartingGame ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
    </>
  );
}