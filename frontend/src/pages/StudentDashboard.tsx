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

interface DailyCountResponse {
  completedCount: number;
}

// 주간 스트릭 API 응답 (boolean 배열)
type DailyStreakResponse = boolean[];

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

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);

  const [solvedProblemCount, setSolvedProblemCount] = useState(0);
  
  // 주간 스트릭 데이터 (API로부터 받은 boolean 배열)
  const [weeklyStreak, setWeeklyStreak] = useState<boolean[]>([]);
 
  useEffect(() => {
    const studentIdFromSession = sessionStorage.getItem('studentId');

    if (!studentIdFromSession) {
      alert('학생을 먼저 선택해주세요.');
      navigate('/select-profile');
      return;
    }

    const fetchData = async (id: string) => {
      const targetStudentId = parseInt(id, 10);
      try {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
          alert('로그인 정보가 없습니다. 다시 로그인해주세요.');
          navigate('/');
          return;
        }

        // --- 세 개의 API 요청을 병렬로 준비 ---
        const headers = { 'Authorization': `Bearer ${accessToken}` };

        const profilePromise = fetch('/api/protector/students', { headers });
  
        const countPromise = fetch(`/api/student/${id}/dashboard/daily/count`, { headers });
  
        const streakPromise = fetch(`/api/student/${id}/dashboard/daily-streak`, { headers });

        // --- Promise.all로 세 요청을 동시에 실행 ---
        const [profileResponse, countResponse, streakResponse] = await Promise.all([
          profilePromise,
          countPromise,
          streakPromise // [추가]
        ]);

        // --- 공통 인증 오류 처리 ---
        if (profileResponse.status === 401 || countResponse.status === 401 || streakResponse.status === 401) {
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
          return; 
        }

        // --- 2. 푼 문제 개수 응답 처리 ---
        if (!countResponse.ok) {
          console.error(`Daily Count API Error: ${countResponse.status} ${countResponse.statusText}`);
          setSolvedProblemCount(0); // 에러 발생 시 0으로 설정
        } else {
          const countData: DailyCountResponse = await countResponse.json();
          setSolvedProblemCount(countData.completedCount);
        }

        // --- 3. [새로 추가] 주간 스트릭 응답 처리 ---
        if (!streakResponse.ok) {
          console.error(`Daily Streak API Error: ${streakResponse.status} ${streakResponse.statusText}`);
          setWeeklyStreak(Array(5).fill(false)); // 에러 발생 시 5개 빈 스탬프로 설정
        } else {
          const streakData: DailyStreakResponse = await streakResponse.json();
          // API가 5개 미만의 데이터를 줄 경우를 대비해 5개로 맞춤
          const paddedStreak = [...streakData, ...Array(5).fill(false)].slice(0, 5);
          setWeeklyStreak(paddedStreak);
        }
        // --- [추가된 부분 끝] ---

      } catch (error) {
        console.error('학생 대시보드 데이터 로드 실패:', error); // Failed to load student dashboard data
        alert('학생 정보를 불러오는 데 실패했습니다.'); // Failed to load student info
        navigate('/select-profile');
      } finally {
        setIsLoading(false); // 모든 API가 처리된 후 로딩 종료
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
    if (isStartingGame || isBubbleVisible) return;
    setIsBubbleVisible(true);
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
  
  // --- [새로 추가된 렌더링 함수] ---
  // 오늘의 탐험 목표 (최대 10개) 스탬프 배열 생성
  const dailyStamps = Array.from({ length: 10 }, (_, i) => i < solvedProblemCount);
  // --- [추가된 부분 끝] ---

  // --- UI 렌더링 ---
  return (
    <>
      <div
        className="w-full min-h-screen bg-black overflow-hidden relative font-sans" 
      >
        {/* --- 0. 배경 비디오 (수정 없음) --- */}
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

        {/* --- 1. 오른쪽 하단 프로필 바 (수정 없음) --- */}
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

        {/* --- 2. 오른쪽 상단 나가기 버튼 (수정 없음) --- */}
        <button
          onClick={() => navigate('/select-profile')}
          className="absolute top-5 right-5 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center z-20 hover:bg-gray-100 transition-all active:scale-95" 
        >
          <ExitIcon className="w-12 h-12 text-gray-700" />
        </button>

        {/* --- 왼쪽 상단 앵무새 버튼 (수정 없음) --- */}
        <button
          onClick={() => { navigate('/parrot-store') }}
          className="absolute top-5 left-5 w-20 h-20 z-20 hover:scale-105 active:scale-95 transition-transform"
        >
          <img 
            src="/studentboard/parrot.png" 
            alt="앵무새" 
            className="w-full h-full object-contain"
          />
        </button>


        {/* --- 3. 중앙 배 & 시작 버튼 (수정 없음, 말풍선 포함) --- */}
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

        {/* --- 5. [수정된 부분] 오른쪽 사이드 현황판 --- */}
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
                isStatsOpen ? 'rotate-180' : 'rotate-0' 
              }`}
            />
          </button>
          
          {/* 현황판 나무 프레임 */}
          <div
            className="w-72 h-full bg-contain bg-no-repeat bg-center p-5"
            style={{ backgroundImage: `url('/studentboard/woodenstats.png')` }}
          >
            <h2 
              className="text-center text-3xl font-bold text-white pt-10"
              style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' }} 
            >
              현황
            </h2>
            
            {/* 양피지 배경 - pt-9 -> pt-3로 수정, mt-2 -> mt-1로 수정, h-[calc(100%-80px)] -> h-[calc(100%-60px)]로 수정 */}
            <div
              className="w-full h-[calc(100%-170px)] mt-3 bg-contain bg-no-repeat bg-center p-4"
              style={{ backgroundImage: `url('/studentboard/statspaper.png')` }}
            >
              {/* 1. 이번 주 목표 */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mt-1 mb-1">이번 주 목표 탐험 완료</h3>
                <div className="flex justify-around items-center px-1">
                  {weeklyStreak.map((isCompleted, index) => (
                    <img
                      key={`week-${index}`}
                      src={isCompleted ? "/studentboard/onstamp.png" : "/studentboard/offstamp.png"}
                      alt={isCompleted ? "완료 스탬프" : "미완료 스탬프"}
                      className="w-9 h-9"
                    />
                  ))}
                </div>
              </div>
              
              {/* 2. 오늘의 탐험 목표 */}
              <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-1">오늘의 탐험 목표</h3>
                <div className="grid grid-cols-5 gap-y-1 justify-items-center px-1">
                  {dailyStamps.map((isCompleted, index) => (
                    <img
                      key={`today-${index}`}
                      src={isCompleted ? "/studentboard/onstamp.png" : "/studentboard/offstamp.png"}
                      alt={isCompleted ? "완료 스탬프" : "미완료 스탬프"}
                      className="w-9 h-9"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
        {/* --- [수정된 부분 끝] --- */}

        {/* --- 6. 게임 시작 시 페이드 아웃 오버레이 (수정 없음) --- */}
        <div
          className={`absolute inset-0 bg-sky-600 transition-opacity duration-1500 z-40
                  ${isStartingGame ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        />
      </div>
    </>
  );
}