import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import PINInputModal from '../components/protector/PINInputModal';
import StudentPINInputModal from '../components/student/PINStudentModal';
import PINRecoveryModal from '../components/protector/modals/PINRecoveryModal';
import { getStudents, verifyPin } from '../api/protectorApi';
import { sendRecoveryCode, verifyRecoveryCode } from '../api/dashboardApi';
import { verifyStudentPin } from '../api/studentApi';
import LoadingScreen from '../components/LoadingScreen'; // [추가] 로딩 스크린 컴포넌트 가져오기

// 프로필 정보를 담당하는 인터페이스
interface Profile {
  id: number;
  name: string;
  imageUrl: string;
}

// 페이지네이션 시 한 페이지에 표시될 정보를 설정하는 칸. Default는 4개로 설정.
const PROFILES_PER_PAGE = 4;

// BGM 아이콘
const SpeakerWaveIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
  </svg>
);

// 음소거 아이콘
const SpeakerXMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
  </svg>
);

// 프로필 선택창 관련 기능들
const SelectProfile = () => {
  // 프로필 정보를 저장하는 배열 변수
  const [profiles, setProfiles] = useState<Profile[]>([]);
  // 페이지네이션 시 현재 페이지 정보를 저장하는 변수
  const [currentPage, setCurrentPage] = useState(0);
  
  // 로딩 관련 변수 (API)
  const [isLoading, setIsLoading] = useState(true); // [변경] 초기값을 true로 설정하여 깜빡임 방지
  
  // [추가] 비디오 로딩 상태 변수
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // 라우팅 관련
  const navigate = useNavigate();

  // PIN 입력 모달 ON/OFF 관련 변수
  const [showPinModal, setShowPinModal] = useState(false);
  // PIN 복구 모달 ON/OFF 관련 변수
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  // 이메일로 복구 코드 발송 관련 변수
  const [isSendingRecoveryCode, setIsSendingRecoveryCode] = useState(false);

  // 학생 PIN 모달
  const [showStudentPinModal, setShowStudentPinModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  // --- BGM 관련 State 및 Ref ---
  const [volume, setVolume] = useState(0.15); // 볼륨 상태 (0.0 ~ 1.0)
  const [lastVolume, setLastVolume] = useState(0.15); // 음소거 해제 시 복원할 볼륨
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // BGM 재생 로직
  useEffect(() => {
    audioRef.current = new Audio('/selectpage/backgroundmusic.mp3');
    audioRef.current.loop = true; // 반복 재생
    audioRef.current.volume = volume; // 초기 볼륨 적용
    audioRef.current.muted = true; // 초기 재생 상태 적용

    // 자동 재생 시도
    const playPromise = audioRef.current.play();

    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn("BGM 자동 재생 실패. 사용자 상호작용이 필요합니다.", error);
      });
    }

    // 컴포넌트 언마운트 시 BGM 정리
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []); // [] 빈 배열: 컴포넌트 마운트 시 1회만 실행

  // volume 상태가 변경될 때마다 오디오 객체에 적용
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (volume > 0) {
        setLastVolume(volume); // 0보다 큰 마지막 볼륨 저장
        audioRef.current.muted = false; // 볼륨이 있으면 음소거 해제
      } else {
        audioRef.current.muted = true; // 볼륨이 0이면 음소거
      }
    }
  }, [volume]);

  // 음소거 토글 핸들러
  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0); // 음소거 (볼륨 0)
    } else {
      // 음소거 해제 (이전 볼륨으로 복원, 0이었으면 0.5로)
      setVolume(lastVolume > 0 ? lastVolume : 0.15);
    }

    // 사용자가 음소거 버튼을 눌러 상호작용했으므로,
    // 만약 오디오가 멈춰있었다면(자동재생 실패시) 다시 재생 시도
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(e => console.error("음소거 해제 후 재생 시도 실패:", e));
    }
  };
  // PIN 인증 관련 검증 담당 코드
  const handlePinSubmit = async (pin: string) => {
    try {
      // PIN 검증 API 호출
      const result = await verifyPin(pin);

      if (result.success) {
        // PIN 검증 성공 : 보호자 대시보드로 이동
        setShowPinModal(false);
        navigate('/protector');
      } else {
        // PIN이 검증 실패 : 모달에서 시각적 피드백
        throw new Error('PIN mismatch');
      }
    } catch (error: any) {
      // 에러가 발생했을 경우
      console.error('PIN 검증 과정에서 에러가 발생했습니다.');

      // 만약 그 에러가 401 에러일 경우( 즉 로그인 검증 관련 이슈일 경우 )
      if (error.response?.status === 401) {
        // 인증 오류 (로그인 필요)
        alert('로그인이 필요합니다.');
        // 예방 차원의 학생 세션 스토리지 날리기
        sessionStorage.removeItem('studentId');
        // acessToken 정보 쿠키에서 날리기
        Cookies.remove('accessToken', { path: '/' });
        navigate('/');
      }
      throw error; // 에러를 다시 throw해서 PINInputModal에서 catch
    }
  };

  // PIN 찾기 복구 코드 발송 관련
  const handleForgotPin = async () => {
    setIsSendingRecoveryCode(true);
    try {
      // PIN 복구 코드 발송 API 호출
      const result = await sendRecoveryCode();

      if (result.success) {
        // 성공 한다면 해당 모달을 종료 후
        setShowPinModal(false);
        // PIN 찾기 모달 켜기.
        setShowRecoveryModal(true);
        alert('등록된 이메일로 인증 번호가 발송되었습니다.');
      } else {
        // 실패한다면 다시 시도를 요구
        alert('인증 번호 발송에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      // 단순 실패가 아닌 오류 발생 시 출력되는 부분
      console.error('PIN 복구 코드 발송 실패하였습니다.');
      alert('인증 번호 발송 중 오류가 발생했습니다.');
    } finally {
      setIsSendingRecoveryCode(false);
    }
  };

  // PIN 찾기 인증 코드 검증 관련
  const handleVerificationSubmit = async (code: string) => {
    try {
      // 인증 코드 검증 API 호출
      const result = await verifyRecoveryCode(code);

      if (result.success) {
        // 인증에 성공헀을 경우
        alert('PIN이 초기화되었습니다. 새로운 PIN은 "000000" 입니다.');
        // PIN 찾기 모달 끄기
        setShowRecoveryModal(false);
        // 다시 PIN 설정 모달로 돌아간다.
        setShowPinModal(true);
      } else {
        // 인증에 실패했을 경우
        alert('인증 번호가 올바르지 않습니다. 다시 확인해주세요.');
      }
    } catch (error) {
      // 에러가 발생했을 경우
      console.error('인증 코드 검증에 오류가 발생하여 실패하였습니다.');
      alert('인증 번호 확인 중 오류가 발생했습니다.');
    }
  };

  // PIN 찾기 인증정보 재발송 코드
  const handleResendCode = async () => {
    try {
      // 인증 번호 재발송 API 호출
      const result = await sendRecoveryCode();

      if (result.success) {
        // 성공 할 시
        alert('인증 번호가 재발송되었습니다.');
      } else {
        // 실패할 시
        alert('인증 번호 재발송에 실패했습니다.');
      }
    } catch (error) {
      // 단순 실패가 아닌 오류 발생 시 출력되는 부분
      console.error('인증 번호 재발송 중 오류가 발생했습니다.');
      alert('인증 번호 재발송 중 오류가 발생했습니다.');
    }
  };

  // PIN 복구 모달 닫기 기능
  const handleRecoveryCancel = () => {
    setShowRecoveryModal(false);
    setShowPinModal(true);
  };

  // PIN 모달 닫기 기능
  const handleClose = () => {
    setShowPinModal(false);
  };

  useEffect(() => {
    // 학생 목록을 불러오는 API를 담당하는 코드
    const fetchProfiles = async () => {
      // 로딩중 활성화 (초기값이 true라 중복이지만 명시적으로 둠)
      setIsLoading(true);
      try {
        // API 호출
        const response = await getStudents();

        // API에서 가져온 정보를 프로필 리스트에 담는다.
        const profileList: Profile[] = response.students.map(student => ({
          id: student.studentId,
          name: student.name,
          imageUrl: student.profileImage
        }));

        // 담긴 정보들을 적용시킨다.
        setProfiles(profileList);
      } catch (error) {
        // 학생 프로필을 가져오는 것에 실패할 경우
        console.error('학생 프로필을 가져오는 것에 실패하였습니다.');
        setProfiles([]);
      } finally {
        // 결과와 관계없이 로딩 프로세스가 끝나면 로딩중 비활성화
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  // 아래는 페이지 네이션 코드
  const totalProfiles = profiles.length;

  // 프로필 페이지네이션 시 페이지네이션 기능이 켜지는 시점을 담당하는 코드
  const showPagination = totalProfiles > PROFILES_PER_PAGE;

  // 프로필 페이지네이션 시 총 페이지 자동 계산 코드
  const totalPages = Math.ceil(totalProfiles / PROFILES_PER_PAGE);

  // 프로필 페이지네이션 시 시작 프로필 인덱스
  const startIndex = currentPage * PROFILES_PER_PAGE;

  // 프로필 페이지네이션 시 종료 프로필 인덱스
  const endIndex = startIndex + PROFILES_PER_PAGE;

  // 프로필 페이지네이션 시 현재 프로필 인덱스
  const currentProfiles = profiles.slice(startIndex, endIndex);

  // 프로필 페이지네이션 : 다음 페이지 이동 스크립트
  const handleNextPage = () => {
    setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
  };
  // 프로필 페이지네이션 : 이전 페이지 이동 스크립트
  const handlePrevPage = () => {
    setCurrentPage((prevPage) => (prevPage - 1 + totalPages) % totalPages);
  };

  // 프로필 클릭 시 실행될 함수
  const handleProfileClick = (profileId: number) => {
    setSelectedStudentId(profileId); // 클릭된 학생 ID 저장
    setShowStudentPinModal(true);    // 학생 PIN 모달 띄우기
  };

  // 학생 PIN 모달 닫기 핸들러
  const handleStudentPinModalClose = () => {
    setShowStudentPinModal(false);
    setSelectedStudentId(null); // 선택된 ID 초기화
  };

  // 학생 PIN 제출 핸들러
  const handleStudentPinSubmit = async (pin: string) => {
    if (!selectedStudentId) return; // selectedStudentId가 없으면 함수 종료

    try {
      // sessionStorage를 먼저 설정 (verifyStudentPin에서 사용)
      sessionStorage.setItem('studentId', String(selectedStudentId));

      // PIN만 전달 (studentId는 sessionStorage에서 자동으로 가져옴)
      const result = await verifyStudentPin(pin);

      if (result.success) {
        // PIN 검증 성공 시
        console.log('학생 PIN 인증 성공');
        navigate('/student');
        handleStudentPinModalClose(); // 모달 닫기
      } else {
        // API는 성공했으나 PIN이 틀린 경우 (success: false)
        console.log('학생 PIN 인증 실패');
        throw new Error('PIN이 일치하지 않습니다.');
      }

    } catch (error) {
      console.error('학생 PIN 검증 과정에서 에러 발생', error);
      throw error;
    }
  };

  // 로그아웃 실행 코드
  const handleLogout = () => {
    // 토큰을 날리고, 에방 차원에서 세션 스토리지에 저장된 학생 ID 정보까지 날리고 메인 페이지로 날려버림.
    sessionStorage.removeItem('studentId');
    Cookies.remove('accessToken', { path: '/' });
    navigate('/');
  };


  // [추가] API 로딩 혹은 비디오 로딩 중 하나라도 진행 중이면 전체 로딩 상태
  const isPageLoading = isLoading || !isVideoLoaded;

  return (
    // 배경화면 설정 관련 코드
    <div
      className="flex flex-col h-screen relative overflow-hidden font-sans text-gray-800"
    >
      {/* [추가] 로딩 스크린 오버레이 */}
      {isPageLoading && <LoadingScreen />}

      {/* Background 비디오 */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/selectpage/background.mp4"
        // [추가] 비디오 데이터가 로드되면 로딩 상태 해제
        onLoadedData={() => {
            console.log("배경 비디오 로딩 완료");
            setIsVideoLoaded(true);
        }}
      />

      {/* 헤더*/}
      <header className="absolute top-0 right-0 p-6 z-20 flex items-center space-x-4">
        {/* === BGM 컨트롤러 === */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-72 h-2 bg-black/50 rounded-full cursor-pointer appearance-none
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:h-5
                        [&::-webkit-slider-thumb]:w-5
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-black
                        [&::-moz-range-thumb]:h-5
                        [&::-moz-range-thumb]:w-5
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-black
                        [&::-moz-range-thumb]:border-none
                        [&::-moz-range-track]:h-2
                        [&::-moz-range-track]:bg-black/50
                        [&::-moz-range-track]:rounded-full"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} // Fallback for moz
        />
        <button
          onClick={toggleMute}
          className="w-14 h-14 bg-white rounded-lg shadow-md flex items-center justify-center transition-all active:scale-95 hover:bg-gray-100"
        >
          {volume === 0 ? (
            <SpeakerXMarkIcon className="w-8 h-8 text-gray-700" />
          ) : (
            <SpeakerWaveIcon className="w-8 h-8 text-gray-700" />
          )}
        </button>
        {/* '보호자' 버튼 */}
        <button
          onClick={() => setShowPinModal(true)}
          className="bg-white text-gray-700 px-6 py-2 rounded-lg shadow-md font-semibold hover:bg-gray-100 transition-colors duration-200 h-14" // 높이 h-14 (3.5rem) 통일
        >
          보호자
        </button>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-grow flex flex-col justify-center items-center z-10 text-center px-4">
        {/* 프로필이 존재하는 경우에 출력되는 부분 */}
        {profiles.length > 0 ? (
          <div className="flex flex-col items-center bg-white/70 rounded-3xl p-20">
            <h1 className="text-5xl font-bold text-gray-900 mb-12">
              누군지 알려주세요
            </h1>

            {/* 프로필 기능 */}
            <div className="flex items-center justify-center gap-4 w-full max-w-5xl">
              {/* 만약 프로필이 5개 이상 있을 경우 : 페이지 네이션 기능 활성화, 좌측 페이지네이션 */}
              <button
                onClick={handlePrevPage}
                className={`p-2 rounded-full bg-white/60 hover:bg-white/90 transition-opacity duration-200 ${showPagination ? 'opacity-100' : 'opacity-0 invisible'
                  }`}
                disabled={!showPagination}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* 프로필 목록 */}
              <div className="flex flex-wrap justify-center gap-8 md:gap-12 min-h-[250px]">
                {currentProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex flex-col items-center gap-4 group cursor-pointer"
                    onClick={() => handleProfileClick(profile.id)}
                  >
                    {/* 프로필 이미지 */}
                    <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-white shadow-lg overflow-hidden border-4 border-white transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:shadow-xl group-hover:border-blue-300">
                      {profile.imageUrl ? (
                        <img
                          src={profile.imageUrl}
                          alt={profile.name}
                          className="w-full h-full object-contain p-5"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                          <span className="text-5xl font-bold text-white">
                            {profile.name?.charAt(0) || 'N'}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* 프로필 이름 */}
                    <span className="text-2xl font-semibold text-gray-800 transition-colors duration-300 group-hover:text-blue-600">
                      {profile.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* 만약 프로필이 5개 이상 있을 경우 : 페이지 네이션 기능 활성화, 우측 페이지 네이션 */}
              <button
                onClick={handleNextPage}
                className={`p-2 rounded-full bg-white/60 hover:bg-white/90 transition-opacity duration-200 ${showPagination ? 'opacity-100' : 'opacity-0 invisible'
                  }`}
                disabled={!showPagination}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* 프로필이 있을 경우 : 로그아웃 버튼 */}
            <button
              onClick={handleLogout}
              className="mt-12 bg-gray-300 text-gray-600 px-6 py-2 rounded-lg shadow-md font-semibold hover:bg-gray-400 transition-colors duration-200"
            >
              로그아웃
            </button>
          </div>
        ) : (
          // 프로필이 없을 경우 출력되는 코드
          <div>
            <h1 className="text-4xl font-bold text-gray-900 text-center leading-relaxed">
              보호자로 로그인하여
              <br />
              새로운 프로필을 생성해주세요.
            </h1>

            {/* 프로필이 없을 경우 : 로그아웃 버튼 */}
            <button
              onClick={handleLogout}
              className="mt-12 bg-gray-100 text-gray-600 px-6 py-2 rounded-lg shadow-md font-semibold hover:bg-gray-200 transition-colors duration-200"
            >
              로그아웃
            </button>
          </div>
        )}
      </main>

      {/* 모달 관련 코드들 */}
      {(showPinModal || showRecoveryModal || showStudentPinModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          {/* PIN 입력 모달 */}
          {showPinModal && (
            <PINInputModal
              title="인증"
              subtitle="보호자 PIN 번호"
              description="기본 비밀번호는 '000000' 입니다. 계정 설정에서 변경할 수 있습니다."
              onSubmit={handlePinSubmit}
              onForgotPin={handleForgotPin}
              onClose={handleClose}
              isSendingRecoveryCode={isSendingRecoveryCode}
            />
          )}

          {/* PIN 복구 모달 */}
          {showRecoveryModal && (
            <PINRecoveryModal
              onSubmit={handleVerificationSubmit}
              onResend={handleResendCode}
              onCancel={handleRecoveryCancel}
            />
          )}

          {/* 학생 PIN 입력 모달 (4자리) */}
          {showStudentPinModal && (
            <StudentPINInputModal
              title="학생 인증"
              subtitle={`${profiles.find(p => p.id === selectedStudentId)?.name || '학생'} PIN 번호`}
              description={
                <>
                  기본 비밀번호는 0000 입니다.<br />
                  비밀번호를 잊어버렸다면 부모님께 알려주세요
                </>
              }
              onSubmit={handleStudentPinSubmit}
              onClose={handleStudentPinModalClose}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SelectProfile;