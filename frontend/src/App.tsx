import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  // app.css에 있던 @keyframes를 <style> 태그로 직접 주입합니다.
  // Tailwind 설정 파일을 수정할 수 없을 때 사용하는 방법입니다.
  const keyframes = `
    @keyframes logo-spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `;

  return (
    // React Fragment(<>)로 감싸서 <style> 태그와 메인 div를 함께 반환합니다.
    <>
      <style>{keyframes}</style>

      {/* 기존의 #root 스타일(max-width, text-center 등) 대신
          전체 화면을 채우는 다크 모드 레이아웃을 사용합니다. */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white font-sans">
        
        {/* 로고 컨테이너 */}
        <div className="flex flex-row items-center justify-center p-4">
          <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
            <img
              src="https://vitejs.dev/logo.svg" // 로컬 경로 대신 URL 사용
              // .logo 및 .logo:hover 스타일을 Tailwind로 변환
              className="h-24 p-6 will-change-filter transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]"
              alt="Vite logo"
              // 이미지 로드 실패 시 대체 이미지 표시
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://placehold.co/100x100/646CFF/FFFFFF?text=Vite";
                target.alt = "Vite logo placeholder";
              }}
            />
          </a>
          <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" // 로컬 경로 대신 URL 사용
              // .logo, .logo.react:hover 및 애니메이션 스타일을 Tailwind로 변환
              className="h-24 p-6 will-change-filter transition-all duration-300 motion-safe:animate-[logo-spin_20s_linear_infinite] hover:drop-shadow-[0_0_2em_#61dafbaa]"
              alt="React logo"
              // 이미지 로드 실패 시 대체 이미지 표시
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://placehold.co/100x100/61DAFB/000000?text=React";
                target.alt = "React logo placeholder";
              }}
            />
          </a>
        </div>
        
        {/* 제목 (가독성을 위해 스타일 추가) */}
        <h1 className="text-5xl font-bold my-4">Vite + React</h1>
        
        {/* .card 스타일을 p-8로 변환 */}
        <div className="p-8 text-center">
          <button
            onClick={() => setCount((count) => count + 1)}
            // 기존 버튼 스타일을 좀 더 세련되게 다듬었습니다.
            className="px-5 py-2.5 bg-indigo-600 rounded-lg text-white font-medium text-lg hover:bg-indigo-500 transition-colors duration-200 shadow-lg"
          >
            count is {count}
          </button>
          <p className="mt-6 text-lg">
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        
        {/* .read-the-docs 스타일을 text-gray-500으로 변환 */}
        <p className="text-gray-500 mt-4">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </>
  );
}

export default App;

