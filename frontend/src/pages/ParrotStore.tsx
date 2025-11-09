import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

// --- 타입 정의 ---

// 학생 정보 API 응답 (image_d0807e.png 참고)
interface Student {
  studentId: number;
  name: string;
  gender: 'MALE' | 'FEMALE';
  profileImage: string;
  grade: string;
  level: number;
  coin: number;
}

// API 응답 전체 구조
interface StudentsApiResponse {
  students: Student[];
}

// --- 상점 컴포넌트 ---
const ParrotStore = () => {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState<string>('');
  const [profileImg, setProfileImg] = useState<string>('');
  const [coinCount, setCoinCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 세션 스토리지에서 학생 ID 가져오기
    const studentIdFromSession = sessionStorage.getItem('studentId');

    if (!studentIdFromSession) {
      setError('학생 ID를 찾을 수 없습니다. (sessionStorage)');
      setIsLoading(false);
      return;
    }

    const currentStudentId = parseInt(studentIdFromSession, 10);

    // --- API 호출 로직 ---
    const fetchStudentData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // --- StudentDashboard의 인증 로직 추가 ---
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
          alert('로그인 정보가 없습니다. 다시 로그인해주세요.');
          navigate('/'); // 로그인 페이지로 이동
          return;
        }

        // 헤더 추가
        const headers = { 'Authorization': `Bearer ${accessToken}` };

        // --- 실제 API 호출 (헤더 포함) ---
        const response = await fetch('/api/protector/students', { headers });

        // --- 401 인증 오류 처리 (StudentDashboard 참조) ---
        if (response.status === 401) {
          alert('인증 정보가 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.');
          Cookies.remove('accessToken', { path: '/' });
          sessionStorage.removeItem('studentId');
          navigate('/'); // 로그인 페이지로 이동
          return;
        }
        // --- [수정 끝] ---

        if (!response.ok) {
          // 401이 아닌 다른 서버 오류
          throw new Error('API 호출에 실패했습니다.');
        }

        const data: StudentsApiResponse = await response.json();

        // --- 데이터 처리 ---
        const currentStudent = data.students.find(
          (student) => student.studentId === currentStudentId
        );

        if (currentStudent) {
          setStudentName(currentStudent.name);
          setProfileImg(currentStudent.profileImage); // API에서 받은 프로필 이미지 경로
          setCoinCount(currentStudent.coin);
        } else {
          setError('일치하는 학생 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류 발생');
        console.error('학생 데이터 로드 실패:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [navigate]); // navigate를 의존성 배열에 추가

  // 뒤로가기 핸들러
  const handleGoBack = () => {
    navigate(-1); // React Router의 이전 페이지 이동 기능
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-cover bg-center font-sans" // overflow-hidden 추가
      style={{ backgroundImage: 'url(/parrotstore/background.png)' }}
    >
      {/* 1. 뒤로가기 버튼 (왼쪽 상단) */}
      <button
        onClick={handleGoBack}
        className="absolute top-5 left-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition-transform hover:scale-105" // z-20 추가
        aria-label="뒤로가기"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* 2. 코인 슬롯 (오른쪽 상단) - 크기 vw 기준으로 비례 수정 */}
      <div
        className="absolute top-5 right-5 z-20 w-[15vw] h-[5vw] min-w-[180px] min-h-[60px] bg-contain bg-no-repeat" // w/h 비례 수정, z-20, 최소 크기 추가
        style={{ backgroundImage: 'url(/parrotstore/coinslot.png)' }}
      >
        {/* 내부 아이템들도 vw 기준으로 비례 수정 */}
        <div className="flex h-full items-center justify-left pl-[3vw]">
          <img
            src="/parrotstore/coin.png"
            alt="코인"
            className="h-[2.5vw] w-[2.5vw] min-h-[30px] min-w-[30px] mb-4" // w/h 비례 수정, 최소 크기 추가
          />
          <span className="ml-2 text-[1.8vw] font-bold text-white text-shadow-sm xl:text-3xl ms-3 mb-4"> {/* 폰트 크기 비례 수정, 최대 크기(xl) 지정 */}
            {isLoading ? '...' : error ? '!' : coinCount}
          </span>
        </div>
      </div>

      {/* 3. 중앙 보드 (가운데) - left-[55%]로 수정 */}
      <div className="absolute top-[55%] left-[63%] z-11 w-[70vw] h-[52.5vw] -translate-x-1/2 -translate-y-1/2"> {/* [수정] left-1/2 -> left-[55%] */}
        <div
          className="relative h-full w-full bg-contain bg-center bg-no-repeat" // h-full w-full
          style={{ backgroundImage: 'url(/parrotstore/board.png)' }}
        >
          {/* 보드 내부 텍스트 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-[3.5vw] font-extrabold text-[#5A3A22] xl:text-5xl"> {/* 폰트 크기 비례 수정, 최대 크기(xl) 지정 */}
              준비중 입니다.
            </h1>
          </div>
        </div>
      </div>

      {/* 4. 프로필 바 (왼쪽 하단) - 크기 vw 기준으로 비례 수정 */}
      <div
        className="absolute bottom-5 left-5 z-20 w-[400px] h-[80px] min-w-[240px] min-h-[75px] bg-contain bg-no-repeat" // w/h 비례 수정, z-20, 최소 크기 추가
        style={{ backgroundImage: 'url(/parrotstore/profilebar.png)' }}
      >
        {/* 내부 아이템들도 vw 기준으로 비례 수정 */}
        <div className="flex h-full items-center px-[1vw]">
          {isLoading ? (
            <div className="h-[3.5vw] w-[3.5vw] min-h-[56px] min-w-[56px] animate-pulse rounded-full bg-gray-400"></div> // w/h 비례 수정
          ) : (
            <img
              src={profileImg}
              alt="프로필"
              className="h-[3.5vw] w-[3.5vw] min-h-[56px] min-w-[56px] rounded-full border-2 border-white object-cover" // w/h 비례 수정
            />
          )}
          <span className="ml-3 truncate text-[1.8vw] font-bold text-white text-shadow-sm xl:text-3xl"> {/* 폰트 크기 비례 수정, 최대 크기(xl) 지정 */}
            {isLoading ? '로딩중...' : error ? '오류' : studentName}
          </span>
        </div>
      </div>

      {/* 로딩 및 오류 오버레이 */}
      {(isLoading || error) && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30"> {/* z-30 (최상단) */}
          <div className="rounded-lg bg-white p-6 shadow-xl">
            {isLoading && <div className="text-xl">데이터를 불러오는 중...</div>}
            {error && <div className="text-xl text-red-500">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParrotStore;