// src/components/ProfileSettingsModal.tsx (파일 경로 예시)

import React, { useState, type ChangeEvent, useEffect } from 'react';

// 컴포넌트 Props 타입 정의
interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageUrl: string;
}

export default function StudentModal({
  isOpen,
  onClose,
  currentImageUrl,
}: ProfileSettingsModalProps) {
  // 1. 선택된 파일과 미리보기 URL을 위한 State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl);

  // 2. 현재 이미지 URL이 바뀌면 미리보기도 업데이트
  useEffect(() => {
    setPreviewUrl(currentImageUrl);
  }, [currentImageUrl]);

  // 3. 모달이 닫힐 때 상태 초기화
  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(currentImageUrl); // 취소 시 현재 이미지로 복원
    onClose(); // 부모 컴포넌트의 닫기 함수 호출
  };

  // 4. 파일 선택 시 핸들러
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // 선택한 파일의 미리보기 URL 생성
    }
  };

  // 5. 등록(제출) 핸들러
  const handleSubmit = () => {
    if (selectedFile) {
      // --- 여기에 실제 파일 업로드 로직을 추가하세요 ---
      console.log('업로드할 파일:', selectedFile.name);
      // 예: const formData = new FormData();
      //     formData.append('profileImage', selectedFile);
      //     api.post('/upload-profile', formData);
      // ----------------------------------------------
    }
    // 성공 여부와 관계없이 모달을 닫습니다 (데모)
    handleClose();
  };

  // isOpen이 false면 아무것도 렌더링하지 않음
  if (!isOpen) {
    return null;
  }

  // 6. 모달 JSX
  return (
    // 모달 배경 (Backdrop)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose} // 배경 클릭 시 닫기
    >
      {/* 모달 본문 (클릭 이벤트 전파 중지) */}
      <div
        className="relative flex w-full max-w-lg flex-col items-center gap-5 rounded-2xl bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫히지 않도록 함
      >
        {/* 제목 */}
        <h2 className="text-3xl font-bold text-gray-800">대표 사진 설정</h2>

        {/* 이미지 미리보기 */}
        <img
          src={previewUrl}
          alt="프로필 미리보기"
          className="h-32 w-32 rounded-full border-4 border-gray-200 object-cover"
        />

        {/* 파일 업로드 버튼 (label + 숨겨진 input) */}
        <input
          type="file"
          id="profile-upload"
          className="hidden"
          accept="image/png, image/jpeg, image/gif, image/webp"
          onChange={handleFileChange}
        />
        <label
          htmlFor="profile-upload"
          className="cursor-pointer rounded-lg border border-gray-400 px-6 py-2 font-semibold text-gray-700 shadow-sm hover:bg-gray-100"
        >
          찾아보기
        </label>

        {/* 선택된 파일 이름 표시 (디자인 참고) */}
        <div className="flex h-10 w-full items-center rounded-lg border border-gray-300 bg-gray-50 px-3 text-gray-600">
          {selectedFile ? selectedFile.name : '파일을 선택해주세요.'}
        </div>

        {/* 도움말 텍스트 */}
        <p className="text-sm text-gray-500">
          등록 가능 : PNG, JPG, JPEG, GIF, WEBP
        </p>

        {/* 액션 버튼 (등록, 취소) */}
        <div className="mt-2 flex w-full gap-4">
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-lg border border-gray-400 py-2.5 text-lg font-bold text-gray-800 shadow-sm hover:bg-gray-100"
          >
            등록하기
          </button>
          <button
            onClick={handleClose}
            className="flex-1 rounded-lg border border-gray-400 py-2.5 text-lg font-bold text-gray-800 shadow-sm hover:bg-gray-100"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}