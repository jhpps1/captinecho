import { useState } from 'react';

interface PINRecoveryModalProps {
  onSubmit: (verificationCode: string) => void;
  onResend?: () => void;
  onCancel: () => void;
}

export default function PINRecoveryModal({ onSubmit, onResend, onCancel }: PINRecoveryModalProps) {
  const [verificationCode, setVerificationCode] = useState('');

  const handleSubmit = () => {
    if (verificationCode.trim()) {
      onSubmit(verificationCode);
    } else {
      alert('인증 번호를 입력해주세요.');
    }
  };

  const handleResend = () => {
    if (onResend) {
      onResend();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-blue-100 to-white rounded-3xl p-8 shadow-2xl w-[480px] relative">
        {/* 클라우드 배경 효과 */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-4 left-8 w-24 h-12 bg-white rounded-full blur-xl"></div>
          <div className="absolute top-12 right-12 w-32 h-16 bg-white rounded-full blur-xl"></div>
          <div className="absolute bottom-16 left-12 w-20 h-10 bg-white rounded-full blur-xl"></div>
        </div>

        {/* 컨텐츠 */}
        <div className="relative z-10">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">PIN 번호 찾기</h2>
            <p className="text-gray-600 mb-6">
              등록된 이메일로 전송된 인증 번호를 입력해주세요
            </p>
          </div>

          {/* 인증 번호 입력 필드 */}
          <div className="mb-6">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="인증 번호 입력"
              maxLength={6}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                       text-center text-lg tracking-widest
                       focus:border-blue-500 focus:outline-none
                       transition-colors"
            />
          </div>

          {/* 재발송 링크 */}
          {onResend && (
            <div className="text-center mb-6">
              <button
                onClick={handleResend}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                인증 번호 재발송이 필요하신가요?
              </button>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg
                       hover:bg-gray-300 active:scale-95 transition-all font-medium"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg
                       hover:bg-blue-600 active:scale-95 transition-all font-medium"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
