import React, { useState, type ChangeEvent, useEffect } from 'react';
// 1. [수정] API 함수 임포트
import { updateStudentProfileImage } from '../../../api/studentApi';

// 2. [수정] Props 타입 정의
interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newImageUrl: string) => void; // 성공 콜백 추가
  currentImageUrl: string;
  studentId: number; // API 호출에 필요한 학생 ID
}

// 3. [추가] 기본 이미지 URL (이미지가 없을 경우)
const DEFAULT_PLACEHOLDER = 'https://via.placeholder.com/128/E0E0E0/808080?text=No+Image';

// 4. [수정] 컴포넌트 이름 변경 (선택 사항)
export default function StudentProfileModal({
  isOpen,
  onClose,
  onSuccess,
  currentImageUrl,
  studentId,
}: ProfileSettingsModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || DEFAULT_PLACEHOLDER);
  const [isUploading, setIsUploading] = useState(false);

  // 현재 이미지 URL이 바뀌면 미리보기도 업데이트
  useEffect(() => {
    // 7. [수정] 기본값 처리
    setPreviewUrl(currentImageUrl || DEFAULT_PLACEHOLDER);
  }, [currentImageUrl]);

  // 모달이 닫힐 때 상태 초기화
  const handleClose = () => {
    // 8. [추가] 로딩 중에는 닫기 방지
    if (isUploading) return;
    setSelectedFile(null);
    setPreviewUrl(currentImageUrl || DEFAULT_PLACEHOLDER);
    onClose();
  };

  // 4. 파일 선택 시 핸들러
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // 선택한 파일의 미리보기 URL 생성
    }
  };

  // 9. [수정] 등록(제출) 핸들러
  const handleSubmit = async () => {
    if (!selectedFile) {
      alert('파일을 선택해주세요.');
      return;
    }

    if (!studentId) {
      alert('학생 ID가 올바르지 않습니다.');
      return;
    }

    setIsUploading(true);
    try {
      // API 호출
      const response = await updateStudentProfileImage(selectedFile);

      console.log('✅ 프로필 업로드 성공:', response);
      alert('프로필 사진이 변경되었습니다.');

      // 부모 컴포넌트에 새 이미지 URL 전달
      onSuccess(response.imageUrl);

    } catch (error) {
      console.error('❌ 프로필 업로드 실패:', error);
      alert('프로필 사진 변경에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="relative flex w-full max-w-lg flex-col items-center gap-5 rounded-2xl bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-gray-800">대표 사진 설정</h2>

        <img
          src={previewUrl}
          alt="프로필 미리보기"
          className="h-32 w-32 rounded-full border-4 border-gray-200 object-cover"
        />

        {/* ... (input, label, 파일 이름 표시 부분은 동일) ... */}
        <input
          type="file"
          id="profile-upload"
          className="hidden"
          accept="image/png, image/jpeg, image/gif, image/webp"
          onChange={handleFileChange}
          disabled={isUploading} // 로딩 시 비활성화
        />
        <label
          htmlFor="profile-upload"
          className={`cursor-pointer rounded-lg border border-gray-400 px-6 py-2 font-semibold text-gray-700 shadow-sm ${isUploading ? 'bg-gray-200 text-gray-500' : 'hover:bg-gray-100'}`}
        >
          찾아보기
        </label>

        <div className="flex h-10 w-full items-center rounded-lg border border-gray-300 bg-gray-50 px-3 text-gray-600">
          {selectedFile ? selectedFile.name : '파일을 선택해주세요.'}
        </div>

        {/* 10. [수정] 버튼 비활성화 로직 추가 */}
        <div className="mt-2 flex w-full gap-4">
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-lg border border-gray-400 py-2.5 text-lg font-bold text-gray-800 shadow-sm disabled:bg-gray-200 disabled:text-gray-500 hover:bg-gray-100"
            disabled={isUploading || !selectedFile}
          >
            {isUploading ? '등록 중...' : '등록하기'}
          </button>
          <button
            onClick={handleClose}
            className="flex-1 rounded-lg border border-gray-400 py-2.5 text-lg font-bold text-gray-800 shadow-sm disabled:bg-gray-200 disabled:text-gray-500 hover:bg-gray-100"
            disabled={isUploading}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}