import React, { useState, useEffect } from 'react'; // 1. useState, useEffect 임포트
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
// 2. 이전에 추가했던 모달 컴포넌트를 임포트합니다.
// (파일 이름은 상황에 맞게 StudentModal 또는 ProfileSettingsModal로 수정하세요)
import StudentModal from '../components/StudentModal'; 

// 오른쪽 나무 버튼 데이터
const woodenButtons = [
  { id: 1, label: '자모맞추기', path: '/adventure/1' },
  { id: 2, label: '빈칸맞추기', path: '/adventure/2' },
  { id: 3, label: '단어맞추기', path: '/adventure/3' },
  { id: 4, label: '단어읽기', path: '/adventure/4' },
];

// 학생 프로필 데이터 타입을 정의합니다.
interface StudentProfile {
  name: string;
  imageUrl: string;
}

// 3. 설정 아이콘 컴포넌트가 onClick 이벤트를 받을 수 있도록 수정
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-8 h-8 text-gray-700 cursor-pointer hover:rotate-45 transition-transform"
    {...props} // onClick 등의 props를 받아서 적용
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

export default function StudentDashboard() {
  const navigate = useNavigate();

  // 4. 학생 프로필과 로딩 상태를 state로 관리
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 5. 모달 상태 추가
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // 6. 세션 스토리지에서 ID를 확인하고 데이터를 불러오는 로직
  useEffect(() => {
    // 세션 스토리지에서 학생 ID를 가져옵니다.
    const studentId = sessionStorage.getItem('studentId');

    if (!studentId) {
      // ID가 없으면 경고 후 프로필 선택 페이지로 리디렉션
      alert('학생을 먼저 선택해주세요.');
      navigate('/select-profile');
      return; // 로직 중단
    }

    // --- (시뮬레이션) ID가 있다면, 해당 ID로 학생 데이터를 불러옵니다 ---
    const fetchStudentData = async (id: string) => {
      console.log(`학생 ID (${id})의 데이터를 API로 요청합니다.`);
      try {
        // !! 중요 !!
        // 실제로는 여기서 API를 호출해야 합니다.
        // 예: const studentData = await getStudentById(id);
        
        // 지금은 API가 없으므로, 더미 데이터를 사용합니다.
        // (주의: 실제로는 API 응답을 기반으로 프로필을 설정해야 함)
        const dummyDataFromApi = {
          name: '존 슨제', // (API에서 받아온 이름)
          imageUrl: '/studentboard/image 11.png', // (API에서 받아온 이미지)
        };

        setProfile(dummyDataFromApi);

      } catch (error) {
        console.error('학생 정보 로드 실패:', error);
        alert('학생 정보를 불러오는 데 실패했습니다.');
        navigate('/select-profile'); // 실패 시에도 돌려보내기
      } finally {
        setIsLoading(false); // 로딩 완료
      }
    };

    fetchStudentData(studentId); // 함수 실행
    
  }, [navigate]); // navigate 함수를 의존성 배열에 추가

  // 7. 계정 변경 핸들러
  const handleChangeAccount = () => {
    // 계정 변경 시 세션 스토리지 ID를 지워주는 것이 좋습니다 (선택 사항)
    // sessionStorage.removeItem('selectedStudentId');
    navigate('/select-profile');
  };

  // 8. 로그아웃 핸들러
  const handleLogout = () => {
    Cookies.remove('accessToken', { path: '/' });
    sessionStorage.removeItem('selectedStudentId'); // 로그아웃 시에도 ID 제거
    navigate('/');
  };

  // 9. 로딩 중일 때 표시할 화면
  if (isLoading || !profile) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 font-sans">
        <div className="text-2xl font-semibold text-gray-700">
          학생 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  // 10. 로딩 완료 후 실제 대시보드 화면
  return (
    <> {/* 모달을 위해 Fragment로 감싸기 */}
      <div
        className="w-full min-h-screen py-8 bg-cover bg-center flex items-end justify-center font-sans"
        style={{ backgroundImage: `url('/studentboard/background.png')` }}
      >
        <div className="w-full max-w-[1400px] h-[70vh] rounded-3xl shadow-2xl p-8 flex gap-6">
          <div className="flex-1 flex flex-col gap-6 h-full">
            <header className="flex items-center justify-between w-full bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <img
                  src={profile.imageUrl} // dummyProfile -> profile
                  alt="프로필"
                  className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-md"
                />
                <span className="text-3xl font-bold text-gray-800">
                  {profile.name} {/* dummyProfile -> profile */}
                </span>
                
                {/* 11. SettingsIcon에 모달 열기(openModal) 기능 연결 */}
                <SettingsIcon onClick={openModal} /> 
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleChangeAccount}
                  className="bg-white/80 text-gray-800 font-semibold px-6 py-2 rounded-xl shadow-md hover:bg-white transition"
                >
                  계정 변경
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-white/80 text-gray-800 font-semibold px-6 py-2 rounded-xl shadow-md hover:bg-white transition"
                >
                  로그아웃
                </button>
              </div>
            </header>

            {/* ... (메인 카드 그리드) ... */}
            <main className="flex-1 grid grid-cols-3 gap-6">
              {/* 왼쪽: 목표 카드 */}
              <div className="bg-white/90 rounded-2xl p-6 shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">목표</h2>
                {/* 목표 관련 내용... */}
              </div>

              {/* 중앙: 2개 카드 */}
              <div className="col-span-1 flex flex-col gap-6">
                <div className="bg-white/90 rounded-2xl p-6 shadow-md flex-1 flex flex-col items-center justify-center text-center">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    계속 탐험하기
                  </h2>
                  <span className="text-3xl font-semibold text-gray-700">
                    (준비중)
                  </span>
                </div>
                <div className="bg-white/90 rounded-2xl p-6 shadow-md flex-1 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">앵무새와</h2>
                    <h2 className="text-xl font-bold text-gray-800">메아리</h2>
                    <h2 className="text-xl font-bold text-gray-800">(준비중)</h2>
                  </div>
                  <img
                    src="/studentboard/parrot.png"
                    alt="앵무새"
                    className="w-24 h-24 object-contain"
                  />
                </div>
              </div>

              {/* 오른쪽: 준비중 카드 */}
              <div className="bg-white/90 rounded-2xl p-6 shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">준비중</h2>
                {/* 준비중 관련 내용... */}
              </div>
            </main>
          </div>

          {/* ... (오른쪽 나무 버튼 사이드바) ... */}
          <aside className="w-52 flex flex-col justify-center items-center gap-5">
            {woodenButtons.map((button) => (
              <button
                key={button.id}
                onClick={() => navigate(button.path)}
                className="w-full h-20 bg-contain bg-no-repeat bg-center text-xl font-bold text-white shadow-md hover:scale-105 transition-transform"
                style={{
                  backgroundImage: `url('/studentboard/button.png')`,
                }}
              >
                {button.label}
              </button>
            ))}
          </aside>
        </div>
      </div>

      {/* 12. 모달 컴포넌트 렌더링 */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        currentImageUrl={profile.imageUrl} // dummyProfile -> profile
      />
    </>
  );
}