import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. useNavigate 훅 import
import Cookies from 'js-cookie'; // 2. js-cookie import

// --- 더미 데이터 (조건 4 & 5) ---
// 백엔드 API 연동 전까지 사용할 임시 프로필 데이터입니다.
// [테스트] 페이지네이션을 테스트하려면 5개 이상으로 만드세요.
const DUMMY_PROFILES_DATA = [
  { id: 1, name: '존슨제', imageUrl: '/selectpage/image 11.png' },
  { id: 2, name: '쿈욘쿈', imageUrl: '/selectpage/image 13.png' },
  { id: 3, name: '파크준횽', imageUrl: '/selectpage/image 11.png' }, // 예시
  { id: 4, name: '키무큐미', imageUrl: '/selectpage/image 13.png' }, // 예시
  { id: 5, name: '키무헤민', imageUrl: '/selectpage/image 11.png' }, // 5번째 예시
  { id: 6, name: '호완쥰키', imageUrl: '/selectpage/image 13.png' }, // 6번째 예시
];
// ------------------------------

// --- 1. 페이지네이션 설정 ---
const PROFILES_PER_PAGE = 4; // 한 페이지에 4개씩 표시

const SelectProfile = () => {
  // [테스트] 프로필이 없는 상태(2번째 사진)를 보려면 DUMMY_PROFILES_DATA 대신 빈 배열 []을 넣어보세요.
  const [profiles, setProfiles] = useState(DUMMY_PROFILES_DATA);
  const [currentPage, setCurrentPage] = useState(0); // 1. 현재 페이지 상태
  const navigate = useNavigate(); // 2. 로그아웃 후 이동을 위한 navigate

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
  const handleProfileClick = (profileName: string) => {
    console.log(`${profileName} 프로필 선택됨`);
    // TODO: 프로필 선택 후 메인 페이지로 이동하는 로직 추가
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
      <header className="absolute top-0 right-0 p-6 z-10">
        <button className="bg-white text-gray-700 px-6 py-2 rounded-lg shadow-md font-semibold hover:bg-gray-100 transition-colors duration-200">
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* 프로필 목록 (페이지네이션 적용됨) */}
              <div className="flex flex-wrap justify-center gap-8 md:gap-12 min-h-[250px]">
                {/* 1. profiles.map -> currentProfiles.map 으로 변경 */}
                {currentProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex flex-col items-center gap-4 group cursor-pointer"
                    onClick={() => handleProfileClick(profile.name)}
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
              보호자로 로그인하여<br />새로운 프로필을 생성해주세요.
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
    </div>
  );
};

export default SelectProfile;