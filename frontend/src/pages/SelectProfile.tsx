import React, { useState } from 'react';

// --- 더미 데이터 (조건 4 & 5) ---
// 백엔드 API 연동 전까지 사용할 임시 프로필 데이터입니다.
const DUMMY_PROFILES_DATA = [
  { id: 1, name: '존슨제', imageUrl: '/selectpage/image 11.png' },
  { id: 2, name: '쿈욘쿈', imageUrl: '/selectpage/image 13.png' }
];
// ------------------------------

const SelectProfile = () => {
  // [테스트] 프로필이 없는 상태(2번째 사진)를 보려면 DUMMY_PROFILES_DATA 대신 빈 배열 []을 넣어보세요.
  const [profiles, setProfiles] = useState(DUMMY_PROFILES_DATA);

  // 프로필 클릭 시 실행될 함수 (지금은 아무것도 안 함)
  const handleProfileClick = (profileName: string) => {
    console.log(`${profileName} 프로필 선택됨`);
    // TODO: 프로필 선택 후 메인 페이지로 이동하는 로직 추가
  };

  return (
    <div 
      className="flex flex-col h-screen relative overflow-hidden font-sans text-gray-800"
      style={{
        backgroundImage: `url('/introduce/background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      
      <header className="absolute top-0 right-0 p-6 z-10">
        <button className="bg-white text-gray-700 px-6 py-2 rounded-lg shadow-md font-semibold hover:bg-gray-100 transition-colors duration-200">
          보호자
        </button>
      </header>

      <main className="flex-grow flex flex-col justify-center items-center z-10 text-center">
        
        {profiles.length > 0 ? (
          // --- 조건 3: 저장된 프로필이 있을 때 (1번째 사진) ---
          <>
            <h1 className="text-5xl font-bold text-gray-900 mb-12">
              누군지 알려주세요
            </h1>
            
            {/* 프로필 목록 */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              {profiles.map((profile) => (
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
          </>
        ) : (
          // --- 조건 2: 저장된 프로필이 없을 때 (2번째 사진) ---
          <h1 className="text-4xl font-bold text-gray-900 text-center leading-relaxed">
            보호자로 로그인하여<br />새로운 프로필을 생성해주세요.
          </h1>
        )}

      </main>
    </div>
  );
};

export default SelectProfile;
