import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './router/routes.tsx'; // router 파일
import './index.css'; // tailwindCSS 적용
import { GoogleOAuthProvider } from '@react-oauth/google'; // 1. import

// 2. .env 파일의 VITE_GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 3. GoogleOAuthProvider로 RouterProvider를 감싸줍니다. */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  </React.StrictMode>
);