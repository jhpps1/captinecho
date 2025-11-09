import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

// 오른쪽 나무 버튼 데이터 (내용 동일)
  const woodenButtons = [
    { id: 1, label: '자모맞추기', typeId: 1 },
    { id: 2, label: '글자합치기', typeId: 2 },
    { id: 3, label: '그림맞추기', typeId: 3 },
    { id: 4, label: '단어읽기', typeId: 4 },
  ];

interface StudentProfile {
  name: string;
  imageUrl: string;
}

interface ApiStudent {
  studentId: number;
  name: string;
  profileImage: string;
}

interface ApiResponse {
  students: ApiStudent[];
}

// [추가된 타입]
interface DailyCountResponse {
  completedCount: number;
}

const ExitIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3-6-3 3m0 0 3 3m-3-3h12.75" />
  </svg>
);

const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);
// --- (여기까지 기존 코드) ---


export default function StudentDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false); // 현황판 상태
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);

  // --- [수정된 부분] ---
  // solvedProblemCount를 state로 변경하고 기본값을 0으로 설정
  const [solvedProblemCount, setSolvedProblemCount] = useState(0);
  // --- [수정된 부분 끝] ---

  // --- [수정된 부분] ---
  // useEffect에서 두 개의 API를 병렬로 호출하도록 수정
  useEffect(() => {
    const studentIdFromSession = sessionStorage.getItem('studentId');

    if (!studentIdFromSession) {
      alert('학생을 먼저 선택해주세요.'); // Please select a student first.
      navigate('/select-profile');
      return;
    }

    const fetchData = async (id: string) => {
      const targetStudentId = parseInt(id, 10);
      try {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
          alert('로그인 정보가 없습니다. 다시 로그인해주세요.'); // No login information. Please log in again.
          navigate('/');
          return;
        }

        // --- 두 개의 API 요청을 병렬로 준비 ---
        const profilePromise = fetch('/api/protector/students', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        const countPromise = fetch(`/api/student/${id}/dashboard/daily/count`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        // --- Promise.all로 두 요청을 동시에 실행 ---
        const [profileResponse, countResponse] = await Promise.all([
          profilePromise,
          countPromise
        ]);

        // --- 공통 인증 오류 처리 ---
        if (profileResponse.status === 401 || countResponse.status === 401) {
          alert('인증 정보가 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.'); // Authentication expired or invalid. Please log in again.
          Cookies.remove('accessToken', { path: '/' });
          sessionStorage.removeItem('studentId');
          navigate('/');
          return;
        }

        // --- 1. 프로필 응답 처리 ---
        if (!profileResponse.ok) {
          throw new Error(`Profile API Error: ${profileResponse.status} ${profileResponse.statusText}`);
        }

        const profileData: ApiResponse = await profileResponse.json();
        const foundStudent = profileData.students.find(
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
          return; // 프로필 로드 실패 시 중단
        }

        // --- 2. 푼 문제 개수 응답 처리 ---
        if (!countResponse.ok) {
          // 푼 문제 개수 로드는 실패해도 앱이 중단되지 않도록 함.
          console.error(`Daily Count API Error: ${countResponse.status} ${countResponse.statusText}`);
          setSolvedProblemCount(0); // 에러 발생 시 0으로 설정
        } else {
          const countData: DailyCountResponse = await countResponse.json();
          setSolvedProblemCount(countData.completedCount);
        }

      } catch (error) {
        console.error('학생 정보 로드 실패:', error); // Failed to load student info
        alert('학생 정보를 불러오는 데 실패했습니다.'); // Failed to load student info
        navigate('/select-profile');
      } finally {
        setIsLoading(false); // 두 API가 모두 처리된 후 로딩 종료
      }
    };

    fetchData(studentIdFromSession);
  }, [navigate]);
  // --- [수정된 부분 끝] ---

  // 게임 시작 애니메이션 핸들러
  const handleStartGame = () => {
    setIsStartingGame(true); 
    setTimeout(() => {
      const studentId = sessionStorage.getItem('studentId');
      navigate(`/daily/${studentId}`);  // ✅ 올바른 경로
    }, 2500); // 애니메이션 시간(2.5초) 후 이동
  };

  // 배(캐릭터) 클릭 시 말풍선 표시
  const handleShipClick = () => {
    // 게임 시작 중이거나 말풍선이 이미 보이면 중복 실행 방지
    if (isStartingGame || isBubbleVisible) return;

    setIsBubbleVisible(true);

    // 3초 후에 말풍선 숨기기
    setTimeout(() => {
      setIsBubbleVisible(false);
    }, 3000);
  };

  // 로딩 중 화면
  if (isLoading || !profile) {
    // ... (기존 로딩 UI - 수정 없음) ...
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 font-sans">
        <div className="text-2xl font-semibold text-gray-700">
          학생 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  // --- UI 렌더링 (이하 수정 없음) ---
  return (
    <>
      <div
        className="w-full min-h-screen bg-black overflow-hidden relative font-sans" 
      >
        {/* --- 0. 배경 비디오 --- */}
        <video
          autoPlay
          loop
          muted
          playsInline 
          className="absolute z-0 w-auto h-auto min-w-full min-h-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
        >
          <source src="/studentboard/background.mp4" type="video/mp4" />
          브라우저가 비디오 태그를 지원하지 않습니다.
        </video>

        {/* --- 1. 오른쪽 하단 프로필 바 --- */}
        <header
          className="absolute bottom-5 right-5 w-[400px] h-[80px] bg-contain bg-no-repeat z-20" 
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

        {/* --- 2. 오른쪽 상단 나가기 버튼 --- */}
        <button
          onClick={() => navigate('/select-profile')}
          className="absolute top-5 right-5 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center z-20 hover:bg-gray-100 transition-all active:scale-95" 
        >
          <ExitIcon className="w-12 h-12 text-gray-700" />
        </button>

        {/* --- 왼쪽 상단 앵무새 버튼 --- */}
        <button
          onClick={() => { /* 앵무새 버튼 클릭 시 동작 */ }}
          className="absolute top-5 left-5 w-20 h-20 z-20 hover:scale-105 active:scale-95 transition-transform"
        >
          <img 
            src="/studentboard/parrot.png" 
            alt="앵무새" 
            className="w-full h-full object-contain"
          />
        </button>


        {/* --- 3. 중앙 배 & 시작 버튼 --- */}
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
          {/* 말풍선 */}
          <div
            className={`absolute top-[60px] left-1/2 -translate-x-1/2 w-max max-w-xs
                        bg-white rounded-xl shadow-lg p-4 z-30
                        transition-all duration-300 ease-in-out
                        ${isBubbleVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
          >
            <span className="text-gray-800 font-semibold text-lg">
              {/* state 값(solvedProblemCount)을 사용하도록 이미 설정되어 있었음 */}
              지금 {solvedProblemCount}개의 문제를 해결했어!
            </span>
            {/* 말풍선 꼬리 */}
            <div 
              className="absolute left-1/2 -translate-x-1/2 top-full 
                         w-0 h-0 border-[10px] border-solid
                         border-t-white border-l-transparent
                         border-r-transparent border-b-transparent"
             ></div>
          </div>

          <img
            src="/studentboard/ship.png"
            alt="배와 캐릭터"
            className="absolute bottom-0 left-0 w-full z-0 cursor-pointer"
            onClick={handleShipClick}
          />
          
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

        {/* --- 4. 왼쪽 사이드 메뉴 --- */}
        <aside 
          className={`fixed top-1/2 -translate-y-1/2 left-0 flex items-center h-[450px] z-50
                      transition-transform duration-500 ease-in-out
                      ${isMenuOpen ? 'translate-x-0' : '-translate-x-64'}`} 
        >
          {/* 메뉴 버튼 컨테이너 */}
          <div
            className="w-64 h-full flex flex-col justify-around items-center py-5"
          >
            {woodenButtons.map((button) => (
              <button
                key={button.id}
                onClick={() =>  {const studentId = sessionStorage.getItem('studentId');
        navigate(`/adventure/${studentId}/${button.typeId}`);  // ✅ 올바른 경로
      }}
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

          {/* 메뉴 토글 버튼 */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-12 h-24 bg-white/80 rounded-r-2xl shadow-lg flex items-center justify-center z-10 hover:bg-white active:scale-95"
          >
            <ChevronLeftIcon
              className={`w-8 h-8 text-gray-800 transition-transform duration-300 ${
                isMenuOpen ? 'rotate-0' : 'rotate-180' 
              }`}
            />
          </button>
        </aside>

        {/* --- 5. 오른쪽 사이드 현황판 --- */}
        <aside 
          className={`fixed top-1/2 -translate-y-1/2 right-0 flex items-center h-[450px] z-50
                      transition-transform duration-500 ease-in-out
                      ${isStatsOpen ? 'translate-x-0' : 'translate-x-72'}`} // w-72 (288px)
        >
          {/* 현황판 토글 버튼 */}
          <button
            onClick={() => setIsStatsOpen(!isStatsOpen)}
            className="w-12 h-24 bg-white/80 rounded-l-2xl shadow-lg flex items-center justify-center z-10 hover:bg-white active:scale-95"
          >
            <ChevronLeftIcon
              className={`w-8 h-8 text-gray-800 transition-transform duration-300 ${
                isStatsOpen ? 'rotate-180' : 'rotate-0' // 왼쪽 메뉴와 방향 반대
              }`}
            />
          </button>
          
          {/* 현황판 컨텐츠 */}
          <div
            className="w-72 h-full bg-contain bg-no-repeat bg-center p-6" // w-72 (288px)
            style={{ backgroundImage: `url('/studentboard/woodenstats.png')` }}
          >
            <h2 
              className="text-center text-3xl font-bold text-white pt-9"
              style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' }} 
            >
              현황
            </h2>
            {/* TODO: 여기에 실제 현황 데이터를 채워넣으세요. */}
            <div className="mt-4 text-white text-lg font-semibold">
              <p>여기에 현황 내용이</p>
              <p>표시됩니다.</p>
              <p className="mt-4">예: 푼 문제 수</p>
              <p>예: 정답률 등</p>
            </div>
          </div>
        </aside>

        {/* --- 6. 게임 시작 시 페이드 아웃 오버레이 --- */}
        <div
          className={`absolute inset-0 bg-sky-600 transition-opacity duration-1500 z-40
                  ${isStartingGame ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        />
      </div>
    </>
  );
}