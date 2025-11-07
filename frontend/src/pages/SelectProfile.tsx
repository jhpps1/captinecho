import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. useNavigate 훅 import
import Cookies from 'js-cookie'; // 2. js-cookie import
import PINInputModal from '../components/protector/PINInputModal';
import PINRecoveryModal from '../components/protector/modals/PINRecoveryModal';
import { getStudents } from '../api/protectorApi';

// 프로필 타입 정의
interface Profile {
  id: number;
  name: string;
  imageUrl: string;
}

// --- 1. 페이지네이션 설정 ---
const PROFILES_PER_PAGE = 4; // 한 페이지에 4개씩 표시

const SelectProfile = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentPage, setCurrentPage] = useState(0); // 1. 현재 페이지 상태
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // 2. 로그아웃 후 이동을 위한 navigate

  const [showPinModal, setShowPinModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showNewPinModal, setShowNewPinModal] = useState(false);
  const [showConfirmPinModal, setShowConfirmPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');

  const handlePinSubmit = (pin: string) => {
    console.log('PIN 입력:', pin);
    // TODO: 실제 PIN 인증 API 호출
    // 임시로 아무 PIN이나 허용
    alert(`PIN 인증 성공: ${pin}`);
    setShowPinModal(false);
    navigate('/protector'); // 인증 성공 시 보호자 대시보드로 이동
  };

  const handleForgotPin = () => {
    setShowPinModal(false);
    setShowRecoveryModal(true);
  };

  const handleVerificationSubmit = (code: string) => {
    console.log('인증 코드:', code);
    // TODO: 실제 인증 코드 검증 API 호출
    setShowRecoveryModal(false);
    setShowNewPinModal(true);
  };

  const handleNewPinSubmit = (pin: string) => {
    console.log('새 PIN:', pin);
    setNewPin(pin);
    setShowNewPinModal(false);
    setShowConfirmPinModal(true);
  };

  const handleConfirmPinSubmit = (pin: string) => {
    console.log('PIN 확인:', pin);
    if (pin === newPin) {
      alert('PIN이 성공적으로 변경되었습니다!');
      // TODO: 실제 PIN 변경 API 호출
      setShowConfirmPinModal(false);
      setShowPinModal(true);
      setNewPin('');
    } else {
      alert('PIN이 일치하지 않습니다. 다시 입력해주세요.');
      setShowConfirmPinModal(false);
      setShowNewPinModal(true);
    }
  };

  const handleResendCode = () => {
    alert('인증 번호가 재발송되었습니다.');
    // TODO: 실제 인증 번호 재발송 API 호출
  };

  const handleRecoveryCancel = () => {
    setShowRecoveryModal(false);
    setShowPinModal(true);
  };

  const handleClose = () => {
    setShowPinModal(false);
  };

  // 학생 목록 불러오기
  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      try {
        const response = await getStudents();

        // API 응답을 Profile 타입으로 변환
        const profileList: Profile[] = response.students.map(student => ({
          id: student.studentId,
          name: student.name,
          imageUrl: student.profileImage || '/selectpage/image 11.png' // 기본 이미지
        }));

        setProfiles(profileList);
        console.log('✅ 학생 프로필 로드 완료:', profileList);
      } catch (error) {
        console.error('❌ 학생 프로필 로드 실패:', error);
        setProfiles([]); // 에러 시 빈 배열
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  // --- 1. 페이지네이션 로직 ---
  const totalProfiles = profiles.length;
  const showPagination = totalProfiles > PROFILES_PER_PAGE;
  const totalPages = Math.ceil(totalProfiles / PROFILES_PER_PAGE);

  // 현재 페이지에 보여줄 프로필만 잘라내기
  const startIndex = currentPage * PROFILES_PER_PAGE;
  const endIndex = startIndex + PROFILES_PER_PAGE;
  const currentProfiles = profiles.slice(startIndex, endIndex);

  // 페이지 이동 핸들러
  const handleNextPage = () => {
    setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
  };
  const handlePrevPage = () => {
    setCurrentPage((prevPage) => (prevPage - 1 + totalPages) % totalPages);
  };
  // -------------------------

  // 프로필 클릭 시 실행될 함수
// 프로필 클릭 시 실행될 함수
  const handleProfileClick = (profileId: number) => {
    sessionStorage.setItem('studentId', String(profileId));
    navigate('/student');
  };

  // --- 2. 로그아웃 버튼 핸들러 ---
  const handleLogout = () => {
    console.log('로그아웃 실행');
    // 'accessToken' 쿠키를 제거합니다. (경로 '/' 설정 중요)
    Cookies.remove('accessToken', { path: '/' });
    // '/' 주소로 이동시킵니다.
    navigate('/');
  };

  return (
    <div
      className="flex flex-col h-screen relative overflow-hidden font-sans text-gray-800"
      style={{
        backgroundImage: `url('/introduce/background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <header className="absolute top-0 right-0 p-6 z-20">
        {/* '보호자' 버튼에 onClick 이벤트 핸들러 추가 */}
        <button
          onClick={() => setShowPinModal(true)}
          className="bg-white text-gray-700 px-6 py-2 rounded-lg shadow-md font-semibold hover:bg-gray-100 transition-colors duration-200"
        >
          보호자
        </button>
      </header>

      {/* --- 1. 메인 컨텐츠 영역 수정 --- */}
      <main className="flex-grow flex flex-col justify-center items-center z-10 text-center px-4">
        {profiles.length > 0 ? (
          // --- 조건 3: 저장된 프로필이 있을 때 (1번째 사진) ---
          <>
            <h1 className="text-5xl font-bold text-gray-900 mb-12">
              누군지 알려주세요
            </h1>

            {/* --- 1. 페이지네이션 래퍼 --- */}
            <div className="flex items-center justify-center gap-4 w-full max-w-5xl">
              {/* 좌측 버튼 (5개 이상일 때만 보임) */}
              <button
                onClick={handlePrevPage}
                className={`p-2 rounded-full bg-white/60 hover:bg-white/90 transition-opacity duration-200 ${
                  showPagination ? 'opacity-100' : 'opacity-0 invisible'
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

              {/* 프로필 목록 (페이지네이션 적용됨) */}
              <div className="flex flex-wrap justify-center gap-8 md:gap-12 min-h-[250px]">
                {/* 1. profiles.map -> currentProfiles.map 으로 변경 */}
                {currentProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex flex-col items-center gap-4 group cursor-pointer"
                    onClick={() => handleProfileClick(profile.id)}
                  >
                    {/* 프로필 이미지 (원형) */}
                    <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-white shadow-lg overflow-hidden border-4 border-white transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:shadow-xl group-hover:border-blue-300">
                      <img
                        src={profile.imageUrl}
                        alt={profile.name}
                        className="w-full h-full object-contain p-5" // 이미지가 잘리지 않도록 'object-contain' 사용
                      />
                    </div>
                    {/* 프로필 이름 */}
                    <span className="text-2xl font-semibold text-gray-800 transition-colors duration-300 group-hover:text-blue-600">
                      {profile.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* 우측 버튼 (5개 이상일 때만 보임) */}
              <button
                onClick={handleNextPage}
                className={`p-2 rounded-full bg-white/60 hover:bg-white/90 transition-opacity duration-200 ${
                  showPagination ? 'opacity-100' : 'opacity-0 invisible'
                }`}
                disabled={!showPagination}
              >
                <svg
                  xmlns="http://www.
                  w3.org/2000/svg"
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

            {/* --- 2. 로그아웃 버튼 추가 --- */}
            <button
              onClick={handleLogout}
              className="mt-12 bg-gray-100 text-gray-600 px-6 py-2 rounded-lg shadow-md font-semibold hover:bg-gray-200 transition-colors duration-200"
            >
              로그아웃
            </button>
          </>
        ) : (
          // --- 조건 2: 저장된 프로필이 없을 때 (2번째 사진) ---
          <>
            <h1 className="text-4xl font-bold text-gray-900 text-center leading-relaxed">
              보호자로 로그인하여
              <br />
              새로운 프로필을 생성해주세요.
            </h1>

            {/* --- 2. 로그아웃 버튼 추가 (프로필 없을 때) --- */}
            <button
              onClick={handleLogout}
              className="mt-12 bg-gray-100 text-gray-600 px-6 py-2 rounded-lg shadow-md font-semibold hover:bg-gray-200 transition-colors duration-200"
            >
              로그아웃
            </button>
          </>
        )}
      </main>

      {(showPinModal || showRecoveryModal || showNewPinModal || showConfirmPinModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          {/* PIN 입력 모달 */}
          {showPinModal && (
            <PINInputModal
              onSubmit={handlePinSubmit}
              onForgotPin={handleForgotPin}
              onClose={handleClose}
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

          {/* 새 PIN 설정 모달 (Wireframe 3) */}
          {showNewPinModal && (
            <PINInputModal
              title="설정"
              subtitle="보호자 PIN 번호"
              description="새 비밀번호을 입력해주세요"
              onSubmit={handleNewPinSubmit}
            />
          )}

          {/* PIN 확인 모달 (Wireframe 4) */}
          {showConfirmPinModal && (
            <PINInputModal
              title="설정"
              subtitle="보호자 PIN 번호"
              description="변경된 비밀번호를 한번 더 입력해주세요"
              onSubmit={handleConfirmPinSubmit}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SelectProfile;


