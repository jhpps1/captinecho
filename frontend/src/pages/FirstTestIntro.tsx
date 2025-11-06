import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 첫 번째 테스트 시작 화면 컴포넌트
 */
const FirstTestIntro: React.FC = () => {
  const navigate = useNavigate();

  /**
   * '시작하기' 버튼 클릭 시 호출되는 핸들러
   * TODO: 실제 테스트 페이지 경로로 수정하세요.
   */
  const handleStart = () => {
    console.log('테스트 시작');
    // 예: navigate('/test/question/1');
  };

  /**
   * '나가기' 버튼 클릭 시 호출되는 핸들러
   * TODO: 메인 페이지나 대시보드 경로로 수정하세요.
   */
  const handleExit = () => {
    console.log('나가기');
    navigate('/select-profile');
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[url('/firsttest/background.png')] bg-cover bg-center">
      
      {/* --- 나가기 버튼 (우측 상단) --- */}
      <button
        onClick={handleExit}
        aria-label="나가기"
        className="absolute top-6 right-6 z-30 flex h-16 w-16 items-center justify-center rounded-lg bg-white shadow-lg transition-all duration-200 hover:bg-gray-100 hover:scale-105"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-10 w-10 text-gray-700"
        >
          {/* 나가기 아이콘 (Heroicons: ArrowRightOnRectangleIcon) */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
          />
        </svg>
      </button>

      {/* --- 메인 콘텐츠 영역 (캐릭터 + 말풍선) --- */}
      <div className="relative flex h-full w-full items-center justify-center">
        
        {/* --- 캐릭터 이미지 --- */}
        {/* z-10: 캐릭터가 말풍선보다 뒤에 있지만 배경보다는 앞에 있도록 설정 */}
        <img
          src="/firsttest/echo.png"
          alt="Echo 캐릭터"
          className="absolute bottom-10 left-[5vw] z-10 h-[55vh] max-h-[450px]"
        />

        {/* --- 말풍선 (흰색 박스로 변경) --- */}
        <div
          className="relative z-20 w-[70vw] max-w-[700px] rounded-3xl bg-white p-16 shadow-2xl"
        >
          {/* 말풍선 내부 콘텐츠 (텍스트 + 버튼) */}
          {/* [수정됨] `pb-8` 제거 (부모 div의 padding으로 대체) */}
          <div className="flex flex-col items-center justify-center">
            <p className="max-w-md text-center text-3xl font-bold leading-snug text-gray-700">
              안녕! 먼저 네 실력이 어느정도인지
              <br />
              확인하고 싶어!
              <br />
              몇가지 문제를 풀어줄 수 있을까?
            </p>
            
            <button
              onClick={handleStart}
              className="mt-10 rounded-lg border-2 border-gray-400 bg-white px-12 py-3 text-2xl font-semibold text-gray-800 shadow-md transition-all duration-200 hover:bg-gray-50 hover:border-gray-500 hover:scale-105"
            >
              시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstTestIntro;