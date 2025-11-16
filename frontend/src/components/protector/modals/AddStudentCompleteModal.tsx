import React from 'react';

interface AddStudentCompleteModalProps {
  isOpen: boolean;
  onClose: () => void; // "머무르기"
  onNavigate: () => void; // "프로필 선택"
}

export default function AddStudentCompleteModal({
  isOpen,
  onClose,
  onNavigate,
}: AddStudentCompleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-pretendard">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl mx-4">
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">
          학생 추가가 완료되었습니다.
        </h2>

        <p className="text-neutral-600 mb-8 leading-relaxed">
          계속 보호자 페이지에서 관리하시겠습니까?
          <br />
          추가한 계정으로 학습을 진행하도록,
          <br />
          프로필 선택창으로 돌아가겠습니까?
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-neutral-100 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-200 transition-colors order-2 sm:order-1"
          >
            머무르기
          </button>
          <button
            onClick={onNavigate}
            className="flex-1 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors order-1 sm:order-2"
          >
            프로필 선택
          </button>
        </div>
      </div>
    </div>
  );
}