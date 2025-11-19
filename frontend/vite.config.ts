import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 코어 라이브러리 분리
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // 차트 라이브러리 분리 (무거움, 대시보드에서만 사용)
          'vendor-charts': ['recharts'],
          // 유틸리티 라이브러리 분리
          'vendor-utils': ['axios', 'date-fns', 'hangul-js', 'zustand'],
          // 아이콘 라이브러리 분리
          'vendor-icons': ['lucide-react'],
          // UI/Form 라이브러리 분리
          'vendor-ui': ['@react-oauth/google', 'react-hook-form', 'zod', '@hookform/resolvers'],
          // Query 라이브러리 분리
          'vendor-query': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },

  server: {
    proxy: {
      // ai-service (STT)
      '/api/stt': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Spring Boot 백엔드
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})