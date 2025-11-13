import React, { useState, useEffect, useRef } from 'react'; // useRef 임포트
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

// BGM 아이콘 (SelectProfile에서 복사)
const SpeakerWaveIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
  </svg>
);

// 음소거 아이콘 (SelectProfile에서 복사)
const SpeakerXMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
  </svg>
);


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

  // --- BGM 관련 State 및 Ref ---
  const [volume, setVolume] = useState(0.5); // 볼륨 상태 (0.0 ~ 1.0)
  const [lastVolume, setLastVolume] = useState(0.5); // 음소거 해제 시 복원할 볼륨
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // === 기존 학생 데이터 로드 useEffect ===
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

  // BGM 로드 및 자동재생
  useEffect(() => {
    // 경로 수정
    audioRef.current = new Audio('/parrotstore/backgroundmusic.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    audioRef.current.muted = false;

    const playPromise = audioRef.current.play();

    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn("Muted BGM 자동 재생 실패.", error);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []); // 컴포넌트 마운트 시 1회만 실행

  // volume state가 변경될 때마다 실제 오디오 볼륨 조절
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (volume > 0) {
        setLastVolume(volume);
        audioRef.current.muted = false; // [!!] 볼륨이 0이 아니면 음소거 해제
      } else {
        audioRef.current.muted = true; // [!!] 볼륨이 0이면 음소거
      }
    }
  }, [volume]);

  // 첫 사용자 상호작용 시 BGM 음소거 해제
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current && audioRef.current.muted) {
        audioRef.current.muted = false;

        if (volume === 0) {
          const defaultVolume = lastVolume > 0 ? lastVolume : 0.5;
          setVolume(defaultVolume);
        }

        if (audioRef.current.paused) {
          audioRef.current.play().catch(e => console.error("Unmute 후 재생 시도 실패:", e));
        }

        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
      }
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [volume, lastVolume]); // volume, lastVolume 의존성 추가

  // 음소거 토글 핸들러
  const toggleMute = (e: React.MouseEvent<HTMLButtonElement>) => { // 1. 이벤트 객체(e)를 받도록 수정
    e.stopPropagation(); // 2. 이벤트 전파(버블링)를 중지시킵니다.

    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(lastVolume > 0 ? lastVolume : 0.5);
    }

    // (자동재생 실패시) 사용자가 수동으로 눌렀을 때 재생 시도
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(e => console.error("음소거 토글 후 재생 시도 실패:", e));
    }
  };

  // === 핸들러 ===

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

      {/* [!!] 우측 상단 UI (BGM 컨트롤러 + 코인)를 flex 컨테이너로 감싸기 */}
      <div className="absolute top-5 right-5 z-20 flex items-center space-x-4">

        {/* === BGM 컨트롤러 === */}
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-128 h-2 bg-white/50 rounded-full cursor-pointer appearance-none
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:h-5
                       [&::-webkit-slider-thumb]:w-5
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-white
                       [&::-moz-range-thumb]:h-5
                       [&::-moz-range-thumb]:w-5
                       [&::-moz-range-thumb]:rounded-full
                       [&::-moz-range-thumb]:bg-white
                       [&::-moz-range-thumb]:border-none
                       [&::-moz-range-track]:h-2
                       [&::-moz-range-track]:bg-white/50
                       [&::-moz-range-track]:rounded-full"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }} // Fallback
          />
          {/* 음소거 버튼 (h-14 w-14로 크기 조절) */}
          <button
            onClick={toggleMute}
            className="w-14 h-14 bg-white/80 rounded-lg shadow-md flex items-center justify-center transition-all active:scale-95 hover:bg-white"
          >
            {volume === 0 ? (
              <SpeakerXMarkIcon className="w-8 h-8 text-gray-700" />
            ) : (
              <SpeakerWaveIcon className="w-8 h-8 text-gray-700" />
            )}
          </button>
        </div>

        {/* === 기존 코인 갯수 표시 UI === */}
        <div
          // [!!] absolute, top, right, z-20 속성 제거 (부모가 대신 함)
          className="relative w-[15vw] h-[5vw] min-w-[180px] min-h-[60px] bg-contain bg-no-repeat"
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
      </div>
      {/* [!!] 우측 상단 UI 끝 */}


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
        className="absolute bottom-5 left-5 z-20 w-[400px] h-[80px] bg-contain bg-no-repeat"
        // [!!] min-w/min-h는 w/h에 의해 덮어쓰므로 제거해도 됩니다.
        style={{ backgroundImage: 'url(/parrotstore/profilebar.png)' }}
      >
        {/* [!!] px-[1vw] 대신 고정 패딩 pl-4 (16px)를 줍니다. */}
        <div className="flex h-full items-center pl-4">
          {isLoading ? (
            // [!!] 이미지 크기를 vw 대신 고정값 h-14 w-14 (56px)로 변경
            <div className="h-14 w-14 animate-pulse rounded-full bg-gray-400"></div>
          ) : (
            // 프로필 사진 담당
            <img
              src={profileImg}
              alt="프로필"
              // [!!] vw, min-w/h, ms-2 속성 모두 제거하고
              // [!!] 고정 크기 h-14 w-14 (56px)로 변경
              className="h-14 w-14 rounded-full border-2 border-white object-cover"
            />
          )}
          {/* 프로필 이름 표시 */}
          {/* [!!] 텍스트 크기도 text-[1.8vw] 대신 고정 크기(예: text-2xl)로 변경 */}
          <span className="ml-3 truncate text-2xl font-bold text-white text-shadow-sm">
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