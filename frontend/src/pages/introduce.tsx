import BeforeNavbar from '../components/BeforeLoginNavbar.tsx';
import InfoCard from '../components/InfoCard.tsx';

const Introduction = () => {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url('/introduce/background.png')` }}
    >
      <BeforeNavbar />

      <div className="relative z-10 flex flex-col items-center justify-start pt-20 px-4 md:px-8">
        
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 mb-8 mt-10 text-center font-peach">
          천천히 배워나가도 괜찮아요
        </h1>
        <p className="text-lg md:text-2xl text-gray-700 mb-12 text-center max-w-2xl font-peach leading-relaxed flex items-center w-full 
                 bg-white bg-opacity-80 backdrop-blur-sm 
                 border border-blue-300 
                 rounded-full shadow-md p-7">
          저희 서비스는 아래의 요소로 난독증 학생들에게 도움을 드리고자 합니다.
        </p>

        <div className="flex flex-col md:flex-row w-full max-w-6xl mt-10 items-stretch md:items-start gap-8">
          
          <div className="w-full md:w-1/3 flex flex-col justify-center md:justify-end">
            <img
              src="/introduce/introduce_echo_and_parrot.png"
              alt="Echo and Parrot character"
              className="w-[70vw] max-w-xs lg:max-w-sm hidden md:block"
            />
          </div>

          <div className="w-full md:w-2/3">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full">

              <div className="flex flex-col gap-6 w-full md:w-1/2">
                <InfoCard title="커리큘럼" description="학습 결과로 개인별 커리큘럼 생성" />
                <InfoCard title="문제" description="학생의 선호를 반영한 문제 생성" />
                <InfoCard title="대시보드" description="취약점 분석, 개인화 학습 방향 제안" />
              </div>

              <div className="flex flex-col gap-6 w-full md:w-1/2">
                <InfoCard title="학습 유형" description="4개 유형을 탐험을 통해 진행" />
                <InfoCard title="학습 방법" description="앵무새와 메아리를 이용한 피드백" />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Introduction;