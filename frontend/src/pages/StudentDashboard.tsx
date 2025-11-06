import React from 'react';
// 1. useNavigate와 js-cookie를 import 합니다.
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

// 오른쪽 나무 버튼 데이터를 배열로 관리하면 편리합니다.
const woodenButtons = [
  { id: 1, label: '자모맞추기', path: '/adventure/1' },
  { id: 2, label: '빈칸맞추기', path: '/adventure/2' },
  { id: 3, label: '단어맞추기', path: '/adventure/3' },
  { id: 4, label: '단어읽기', path: '/adventure/4' },
];

// 설정 아이콘 컴포넌트 (SVG)
const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-8 h-8 text-gray-700 cursor-pointer hover:rotate-45 transition-transform"
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
  // 2. navigate 함수를 초기화합니다.
  const navigate = useNavigate();

  // 더미 데이터 (조건 4) - public 폴더 경로는 '/'로 시작해야 합니다.
  const dummyProfile = {
    name: '존 슨제',
    imageUrl: '/studentboard/image 11.png', // 경로 수정
  };

  // 3. 계정 변경 핸들러
  const handleChangeAccount = () => {
    navigate('/select-profile');
  };

  // 4. 로그아웃 핸들러
  const handleLogout = () => {
    Cookies.remove('accessToken', { path: '/' }); // 쿠키 제거
    navigate('/'); // '/'로 이동
  };

  return (
    // 1. 전체 화면 배경 (조건 1)
    <div
      className="w-full min-h-screen py-8 bg-cover bg-center flex items-end justify-center font-sans" // (변경) items-center -> items-end
      style={{ backgroundImage: `url('/studentboard/background.png')` }}
    >
      {/* 2. 메인 콘텐츠 영역 (갈색) */}
      <div className="w-full max-w-[1400px] h-[70vh] rounded-3xl shadow-2xl p-8 flex gap-6"> {/* (변경) h-[calc(100vh-4rem)] -> h-[70vh] */}
        {/* 2-1. 왼쪽/중앙 콘텐츠 (헤더 + 카드) */}
        <div className="flex-1 flex flex-col gap-6 h-full">
          {/* 2-1-1. 상단 헤더 바 */}
          <header className="flex items-center justify-between w-full bg-white rounded-2xl p-4 shadow-sm">
            {/* 프로필 섹션 (조건 4) */}
            <div className="flex items-center gap-4">
              <img
                src={dummyProfile.imageUrl}
                alt="프로필"
                className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-md"
              />
              <span className="text-3xl font-bold text-gray-800">
                {dummyProfile.name}
              </span>
              <SettingsIcon />
            </div>

            {/* 버튼 섹션 */}
            <div className="flex items-center gap-4">
              {/* 5. onClick 이벤트 핸들러 연결 */}
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

          {/* 2-1-2. 메인 카드 그리드 */}
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
                  4 / 10
                </span>
              </div>
              <div className="bg-white/90 rounded-2xl p-6 shadow-md flex-1 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">앵무새와</h2>
                  <h2 className="text-xl font-bold text-gray-800">메아리</h2>
                </div>
                {/* 앵무새 이미지 (조건 3) */}
                <img
                  src="/studentboard/parrot.png" // 경로 수정
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

        {/* 2-2. 오른쪽 나무 버튼 사이드바 */}
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
  );
}