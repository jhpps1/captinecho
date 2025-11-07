import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const ProblemPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // TODO: 현재 문제 번호/경로에 따라 로직 구현
  // 예: const currentQuestionId = parseInt(location.pathname.split('/').pop() || '1');
  // const totalQuestions = 5;

  /**
   * '다 했어!' 버튼 클릭 핸들러
   * TODO: '결과 페이지' 경로로 수정하세요.
   */
  const handleSubmit = () => {
    console.log('다 했어! 결과 페이지로 이동');
    // 예: navigate('/test/results');
  };

  const handleExit = () => {
    navigate('/select-profile');
  };

  /**
   * '이전' 버튼 클릭 핸들러
   * TODO: 이전 문제 경로로 이동하는 로직을 구현하세요.
   */
  const handlePrev = () => {
    console.log('이전 문제');
    // 예: if (currentQuestionId > 1) {
    //   navigate(`/test/question/${currentQuestionId - 1}`);
    // }
  };

  /**
   * '다음' 버튼 클릭 핸들러
   * TODO: 다음 문제 경로로 이동하는 로직을 구현하세요.
   */
  const handleNext = () => {
    console.log('다음 문제');
    // 예: if (currentQuestionId < totalQuestions) {
    //   navigate(`/test/question/${currentQuestionId + 1}`);
    // }
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-white">
      
      {/* --- 1. 상단 헤더 --- */}
      <header className="flex h-20 w-full items-center justify-between bg-blue-500 px-6 shadow-md">
        
        {/* 로고 영역 */}
        <div className="text-white">
          <img 
            src="/nav/logo.png" 
            alt="꼬마선장 에코 로고" 
            className="h-12" // 로고 높이 (필요에 따라 h-12 등으로 조절)
          />
        </div>

        {/* '다 했어!' 버튼 */}
        <button
          onClick={handleSubmit}
          className="rounded-lg bg-yellow-400 px-8 py-3 text-xl font-bold text-gray-800 shadow-md transition-all hover:bg-yellow-500"
        >
          다 했어!
        </button>

        {/* '나가기' 버튼 */}
        <button
          onClick={handleExit}
          aria-label="나가기"
          className="flex h-16 w-16 items-center justify-center rounded-lg bg-white shadow-lg transition-all duration-200 hover:bg-gray-100 hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-10 w-10 text-gray-700"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
            />
          </svg>
        </button>
      </header>

      {/* --- 2. 메인 콘텐츠 (문제 + 좌우 버튼) --- */}
      <main className="flex flex-1 items-center justify-between overflow-hidden p-8">
        
        {/* '이전' 버튼 */}
        <button
          onClick={handlePrev}
          aria-label="이전 문제"
          className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-yellow-400 shadow-lg transition-all hover:bg-yellow-500 hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3} // 화살표 굵게
            stroke="currentColor"
            className="h-10 w-10 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        </button>

        {/* [중요] 문제가 들어갈 공간 (Outlet) */}
        <div className="mx-8 flex h-[90%] w-full flex-1 items-center justify-center rounded-2xl bg-gray-200 shadow-inner">
          {/*
            여기에 실제 문제 컴포넌트가 렌더링됩니다.
            React Router에서 이 라우트의 자식(children) 라우트를 설정해야 합니다.
          */}
        </div>

        {/* '다음' 버튼 */}
        <button
          onClick={handleNext}
          aria-label="다음 문제"
          className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-yellow-400 shadow-lg transition-all hover:bg-yellow-500 hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3} // 화살표 굵게
            stroke="currentColor"
            className="h-10 w-10 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </main>
    </div>
  );
};

export default ProblemPage;