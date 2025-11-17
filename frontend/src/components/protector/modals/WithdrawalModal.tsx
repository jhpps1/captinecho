import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react'; // 아이콘 사용 (설치 필요, 없으면 생략 가능)

interface WithdrawalModalProps {
  step: 1 | 3; // 1단계 or 3단계
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function WithdrawalModal({ step, onConfirm, onClose, isLoading }: WithdrawalModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const TARGET_TEXT = "탈퇴하겠습니다";

  // 3단계에서 텍스트가 일치하는지 확인
  const isMatch = confirmText === TARGET_TEXT;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 font-pretendard px-4">
      <div className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-[480px] relative animate-fadeIn">
        
        {/* 아이콘 및 제목 */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">
            {step === 1 ? '정말 탈퇴하시겠습니까?' : '마지막 확인'}
          </h2>
        </div>

        {/* 내용 */}
        <div className="mb-8">
          {step === 1 ? (
            <p className="text-neutral-600 text-center leading-relaxed">
              회원 탈퇴 시 모든 학습 데이터와 계정 정보가<br />
              <span className="text-red-500 font-bold">영구적으로 삭제</span>되며 복구할 수 없습니다.<br />
              그래도 진행하시겠습니까?
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-neutral-600 text-center text-sm">
                탈퇴를 원하시면 아래 입력창에<br />
                <span className="font-bold text-neutral-800">"{TARGET_TEXT}"</span>를 정확히 입력해주세요.
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="탈퇴하겠습니다"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center font-medium"
              />
            </div>
          )}
        </div>

        {/* 버튼 그룹 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-neutral-100 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-200 transition-colors"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={step === 3 && !isMatch || isLoading}
            className={`flex-1 px-6 py-3 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2
              ${step === 3 && !isMatch 
                ? 'bg-neutral-300 cursor-not-allowed' 
                : 'bg-red-500 hover:bg-red-600'
              }`}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                처리 중...
              </>
            ) : (
              '탈퇴하기'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}