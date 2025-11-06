import React from 'react';
import { useNavigate } from 'react-router-dom';
import ScoreDonutChart from '../components/ScoreDonutChart.tsx'; // 방금 만든 차트 컴포넌트 임포트

/**
 * 테스트 결과 인트로 페이지
 */
const TestResultIntro = () => {
  const navigate = useNavigate();

  // --- 더미 데이터 ---
  // 각 유형별 점수를 정의합니다. (총합 80점 만점 기준)
  const dummyChartData = [
    { id: 1, title: '유형 1', score: 0, maxScore: 20 },
    { id: 2, title: '유형 2', score: 0, maxScore: 20 },
    { id: 3, title: '유형 3', score: 0, maxScore: 20 },
    { id: 4, title: '유형 4', score: 0, maxScore: 20 },
  ];

  // 차트 데이터의 총합을 계산하여 '총 점수'에 반영
  const totalScore = dummyChartData.reduce((acc, item) => acc + item.score, 0);
  const maxScore = 80; // 이미지에 표시된 만점
  // -------------------

  const handleStart = () => {
    navigate('/student');
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-white">
      
      {/* --- 1. 상단 헤더 --- */}
      <header className="flex h-20 w-full flex-shrink-0 items-center justify-between bg-blue-500 px-6 shadow-md">
        
        {/* 로고 영역 */}
        <div className="text-white">
          <img 
            src="/nav/logo.png" 
            alt="꼬마선장 에코 로고" 
            className="h-12" // 로고 높이 (필요에 따라 h-12 등으로 조절)
          />
        </div>

        {/* '시작하기' 버튼 */}
        <button
          onClick={handleStart}
          className="rounded-lg bg-orange-500 px-8 py-3 text-xl font-bold text-gray-800 shadow-md transition-all hover:bg-orange-600"
        >
          시작하기
        </button>
      </header>

      {/* --- 2. 메인 콘텐츠 --- */}
      <main className="flex flex-1 flex-col items-center overflow-y-auto p-12">
        
        {/* 총 점수 박스 */}
        <div className="rounded-2xl bg-cyan-200 px-16 py-8 shadow-lg">
          <p className="text-4xl font-bold text-gray-800">
            {/* padStart(2, '0')을 사용해 "0"을 "00"으로 표시 */}
            총 점수 : {String(totalScore).padStart(2, '0')} / {maxScore}
          </p>
        </div>

        {/* 유형별 점수 섹션 */}
        <section className="mt-12 w-full max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-gray-700">
            유형별 점수
          </h2>

          {/* [수정됨]
            이전의 정적 SVG 대신, 새로운 ScoreDonutChart 컴포넌트를 렌더링합니다.
            반응형 그리드를 유지합니다.
          */}
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {dummyChartData.map((data) => (
              <ScoreDonutChart
                key={data.id}
                title={data.title}
                score={data.score}
                maxScore={data.maxScore}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default TestResultIntro;