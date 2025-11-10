import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

// 학생 정보 관련 인터페이스
interface Student {
  studentId: number;
  name: string;
  gender: 'MALE' | 'FEMALE';
  profileImage: string;
  grade: string;
  level: number;
  coin: number;
}

// API 응답 관련 인터페이스
interface StudentsApiResponse {
  students: Student[];
}

const ParrotStore = () => {
  // 라우팅 관련
  const navigate = useNavigate();
  // 학생 이름을 저장하는 변수
  const [studentName, setStudentName] = useState<string>('');
  // 프로필 이미지를 저장하는 변수
  const [profileImg, setProfileImg] = useState<string>('');
  // 코인 갯수를 담당하는 변수
  const [coinCount, setCoinCount] = useState<number>(0);
  // 로딩중 판정 관련 변수
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // 에러 관련 변수
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 세션 스토리지에서 학생 ID 가져오기
    const studentIdFromSession = sessionStorage.getItem('studentId');

    if (!studentIdFromSession) {
      // 세션 스토리지에 학생 ID 정보가 없을 경우
      setError('학생 ID를 찾을 수 없습니다.');
      setIsLoading(false);
      return;
    }

    // 학생 ID를 숫자로 변환
    const currentStudentId = parseInt(studentIdFromSession, 10);

    // API 호출 관련 로직들
    const fetchStudentData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 토큰 정보 검증
        const accessToken = Cookies.get('accessToken');
        // AccessToken 정보가 없을 경우
        if (!accessToken) {
          alert('로그인 정보가 없습니다. 다시 로그인해주세요.');
          // 세션 스토리지의 정보 제거
          sessionStorage.removeItem('studentId');
          // 로그인 페이지로 이동
          navigate('/login');
          return;
        }

        // AccessToken 관련
        const headers = { 'Authorization': `Bearer ${accessToken}` };

        // API 호출
        const response = await fetch('/api/protector/students', { headers });

        // 401 에러(로그인 관련) 문제 발생시
        if (response.status === 401) {
          alert('인증 정보가 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.');
          // 쿠키에 accessToken 정보 제거
          Cookies.remove('accessToken', { path: '/' });
          // 세션 스토리지의 정보 제거
          sessionStorage.removeItem('studentId');
          // 로그인 페이지로 이동
          navigate('/login');
          return;
        }

        if (!response.ok) {
          // 401이 아닌 다른 서버 오류
          throw new Error('API 호출에 실패했습니다.');
        }

        // 학생 ID 관련 API 작동
        const data: StudentsApiResponse = await response.json();

        // 세션 스토리지에서 학생 ID 정보 검증
        const currentStudent = data.students.find(
          (student) => student.studentId === currentStudentId
        );

        if (currentStudent) {
          // 학생 정보가 있을 시 API에서 정보를 가져온다
          setStudentName(currentStudent.name);
          setProfileImg(currentStudent.profileImage);
          setCoinCount(currentStudent.coin);
        } else {
          // 일치하는 학생 정보가 없을 시
          setError('일치하는 학생 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        // 학생 데이터 로드 실패 에러 발생 시
        setError(err instanceof Error ? err.message : '알 수 없는 오류 발생');
        console.error('학생 데이터 로드 실패');
      } finally {
        // 결과에 관계없이 프로세스 처리 후 로딩 종료
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [navigate]);

  // 뒤로가기 핸들러
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    // 배경화면 관련 설정
    <div
      className="relative min-h-screen w-full overflow-hidden bg-cover bg-center font-sans"
      style={{ backgroundImage: 'url(/parrotstore/background.png)' }}
    >
      {/* 왼쪽 상단의 뒤로가기 버튼 */}
      <button
        onClick={handleGoBack}
        className="absolute top-5 left-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition-transform hover:scale-105"
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

      {/* 우측 상단의 코인 갯수 표시 UI */}
      <div
        className="absolute top-5 right-5 z-20 w-[15vw] h-[5vw] min-w-[180px] min-h-[60px] bg-contain bg-no-repeat" // w/h 비례 수정, z-20, 최소 크기 추가
        style={{ backgroundImage: 'url(/parrotstore/coinslot.png)' }}
      >
        {/* 코인 이미지 */}
        <div className="flex h-full items-center justify-left pl-[3vw]">
          <img
            src="/parrotstore/coin.png"
            alt="코인"
            className="h-[2.5vw] w-[2.5vw] min-h-[30px] min-w-[30px] mb-4"
          />
          {/* 코인 갯수 표시 */}
          <span className="ml-2 text-[1.8vw] font-bold text-white text-shadow-sm xl:text-3xl ms-3 mb-4">
            {isLoading ? '...' : error ? '!' : coinCount}
          </span>
        </div>
      </div>

      {/* 우측 하단의 큼직한 상점 페이지 아이템 표시 관련 코드 (현재는 준비중) */}
      <div className="absolute top-[55%] left-[63%] z-11 w-[70vw] h-[52.5vw] -translate-x-1/2 -translate-y-1/2">
        {/* 보드 배경화면 */}
        <div
          className="relative h-full w-full bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/parrotstore/board.png)' }}
        >
          {/* 보드 내부 텍스트, 추후 판매 아이템들을 아래 div 내부에 위치하게 코드를 짜면 됨 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-[3.5vw] font-extrabold text-[#5A3A22] xl:text-5xl">
              준비중 입니다.
            </h1>
          </div>
        </div>
      </div>

      {/* 프로필 바 관련 표시 */}
      <div
        className="absolute bottom-5 left-5 z-20 w-[400px] h-[80px] min-w-[240px] min-h-[75px] bg-contain bg-no-repeat"
        style={{ backgroundImage: 'url(/parrotstore/profilebar.png)' }}
      >
        <div className="flex h-full items-center px-[1vw]">
          {isLoading ? (
            <div className="h-[3.5vw] w-[3.5vw] min-h-[56px] min-w-[56px] animate-pulse rounded-full bg-gray-400"></div>
          ) : (
            // 프로필 사진 담당
            <img
              src={profileImg}
              alt="프로필"
              className="h-[3.5vw] w-[3.5vw] min-h-[56px] min-w-[56px] rounded-full border-2 border-white object-cover"
            />
          )}
          {/* 프로필 이름 표시 */}
          <span className="ml-3 truncate text-[1.8vw] font-bold text-white text-shadow-sm xl:text-3xl"> 
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