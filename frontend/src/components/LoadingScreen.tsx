import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-sky-400 transition-opacity duration-500">
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 bg-white rounded-full opacity-20 animate-ping"></div>
        <div className="absolute inset-2 bg-white rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute inset-0 flex items-center justify-center"> 
            <img src="/loading/ship.png" alt="Logo" />
        </div>
      </div>
      
      <h2 className="text-3xl font-bold text-white animate-pulse tracking-widest">
        탐험 준비 중...
      </h2>
      <p className="mt-4 text-sky-100 text-lg font-medium">
        멋진 바다로 떠날 준비를 하고 있어요!
      </p>
    </div>
  );
};

export default LoadingScreen;