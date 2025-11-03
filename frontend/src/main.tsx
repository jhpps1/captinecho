    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import { RouterProvider } from 'react-router-dom';
    import router from './router/routes.tsx';
    import './index.css';
    import { GoogleOAuthProvider } from '@react-oauth/google';

    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // 1. 이 로그를 브라우저 콘솔에서 확인하세요!
    console.log("VITE_GOOGLE_CLIENT_ID 값:", GOOGLE_CLIENT_ID); 

    if (!GOOGLE_CLIENT_ID) {
      // 2. 만약 값이 없다면 경고를 띄웁니다.
      alert("경고: VITE_GOOGLE_CLIENT_ID가 .env 파일에 설정되지 않았거나, Vite 서버 재시작이 필요합니다.");
    }

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        {/* 3. GOOGLE_CLIENT_ID가 undefined여도 Provider는 오류를 내지 않습니다. */}
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}> 
          <RouterProvider router={router} />
        </GoogleOAuthProvider>
      </React.StrictMode>
    );
    
    