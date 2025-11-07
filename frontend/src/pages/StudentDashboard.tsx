import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import StudentModal from '../components/StudentModal';

// 오른쪽 나무 버튼 데이터 (기존과 동일)
const woodenButtons = [
  { id: 1, label: '자모맞추기', path: '/adventure/1' },
  { id: 2, label: '빈칸맞추기', path: '/adventure/2' },
  { id: 3, label: '단어맞추기', path: '/adventure/3' },
  { id: 4, label: '단어읽기', path: '/adventure/4' },
];

// 학생 프로필 데이터 타입을 정의합니다. (기존과 동일)
interface StudentProfile {
  name: string;
  imageUrl: string;
}

// --- 1. API 응답에 맞춘 타입 정의 (이미지 기반) ---
// API 응답의 개별 학생 객체 타입
interface ApiStudent {
  studentId: number;
  name: string;
  gender: string;
  profileImage: string; // API 필드명은 profileImage 입니다.
  grade: string;
  level: number;
  coin: number;
}

// API 응답의 최상위 객체 타입
interface ApiResponse {
  students: ApiStudent[];
}
// --- 여기까지 ---

// 설정 아이콘 컴포넌트 (기존과 동일)
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-8 h-8 text-gray-700 cursor-pointer hover:rotate-45 transition-transform"
    {...props}
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

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    
    const studentIdFromSession = sessionStorage.getItem('studentId');

    if (!studentIdFromSession) {
      alert('학생을 먼저 선택해주세요.');
      navigate('/select-profile');
      return;
    }

    // --- 2. fetchStudentData 함수를 실제 API 호출 로직으로 수정 ---
    const fetchStudentData = async (id: string) => {
      // 세션 스토리지의 ID는 문자열이므로, 비교를 위해 숫자로 변환합니다.
      const targetStudentId = parseInt(id, 10);
      console.log(`학생 ID (${targetStudentId})의 데이터를 API로 요청합니다.`);

      try {
        // --- 2. 'accessToken'을 쿠키에서 직접 읽어오기 ---
        const accessToken = Cookies.get('accessToken');

        if (!accessToken) {
          // 토큰이 아예 없으면 로그인 페이지로 보냅니다.
          alert('로그인 정보가 없습니다. 다시 로그인해주세요.');
          navigate('/'); // (로그인 페이지 경로)
          return;
        }

        // --- 3. fetch 요청 수정 ---
        const response = await fetch('/api/protector/students', {
          // 'credentials: 'include'' 옵션 제거!
          
          // 대신 'Authorization' 헤더를 수동으로 추가합니다.
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            // (필요한 경우 다른 헤더도 추가, 예: 'Content-Type')
          },
        });
        // --- 여기까지 ---

        if (!response.ok) {
          // 401 에러가 발생하면, 토큰이 만료되었을 가능성이 높습니다.
          if (response.status === 401) {
            alert('인증 정보가 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.');
            // 로그아웃 처리 후 로그인 페이지로 보냅니다.
            Cookies.remove('accessToken', { path: '/' });
            sessionStorage.removeItem('studentId');
            navigate('/'); // (로그인 페이지 경로)
            return; // 추가 실행 중단
          }
          // 그 외 에러
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        // JSON 파싱 (ApiResponse 타입 적용)
        const data: ApiResponse = await response.json();

        // API가 반환한 { students: [...] } 배열에서
        // 세션 스토리지 ID와 일치하는 학생을 찾습니다.
        const foundStudent = data.students.find(
          (student) => student.studentId === targetStudentId
        );

        if (foundStudent) {
          // 학생을 찾았으면, 'profile' 상태를 업데이트합니다.
          // (주의: API의 profileImage 필드를 앱의 imageUrl 필드로 매핑)
          setProfile({
            name: foundStudent.name,
            imageUrl: foundStudent.profileImage,
          });
        } else {
          // API 호출은 성공했으나, 리스트에 해당 ID의 학생이 없는 경우
          console.error(`학생 ID (${targetStudentId})를 찾을 수 없습니다.`);
          alert('학생 정보를 찾는 데 실패했습니다. 다시 선택해주세요.');
          navigate('/select-profile');
        }

      } catch (error) {
        console.error('학생 정보 로드 실패:', error);
        alert('학생 정보를 불러오는 데 실패했습니다.');
        navigate('/select-profile'); // 실패 시에도 돌려보내기
      } finally {
        setIsLoading(false); // 로딩 완료 (성공/실패 무관)
      }
    };
    // --- 여기까지 ---

    fetchStudentData(studentIdFromSession); // 함수 실행
  }, [navigate]); // navigate 함수를 의존성 배열에 추가

  // 계정 변경 핸들러 (기존과 동일)
  const handleChangeAccount = () => {
    navigate('/select-profile');
  };

  // 로그아웃 핸들러 (기존과 동일)
  const handleLogout = () => {
    Cookies.remove('accessToken', { path: '/' });
    sessionStorage.removeItem('studentId'); // 'selectedStudentId' -> 'studentId' 통일
    navigate('/');
  };

  // 로딩 중일 때 표시할 화면 (기존과 동일)
  if (isLoading || !profile) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 font-sans">
        <div className="text-2xl font-semibold text-gray-700">
          학생 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  // 로딩 완료 후 실제 대시보드 화면 (profile 사용 부분만 확인)
  return (
    <>
      <div
        className="w-full min-h-screen py-8 bg-cover bg-center flex items-end justify-center font-sans"
        style={{ backgroundImage: `url('/studentboard/background.png')` }}
      >
        <div className="w-full max-w-[1400px] h-[70vh] rounded-3xl shadow-2xl p-8 flex gap-6">
          <div className="flex-1 flex flex-col gap-6 h-full">
            <header className="flex items-center justify-between w-full bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <img
                  src={profile.imageUrl} // 3. 상태(profile)에서 이미지 URL 사용
                  alt="프로필"
                  className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-md"
                />
                <span className="text-3xl font-bold text-gray-800">
                  {profile.name} {/* 3. 상태(profile)에서 이름 사용 */}
                </span>

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

            {/* ... (메인 카드 그리드) ... (기존과 동일) */}
            <main className="flex-1 grid grid-cols-3 gap-6">
              <div className="bg-white/90 rounded-2xl p-6 shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">목표</h2>
              </div>
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
              <div className="bg-white/90 rounded-2xl p-6 shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">준비중</h2>
              </div>
            </main>
          </div>

          {/* ... (오른쪽 나무 버튼 사이드바) ... (기존과 동일) */}
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
        currentImageUrl={profile.imageUrl} // 3. 상태(profile)에서 이미지 URL 사용
      />
    </>
  );
}