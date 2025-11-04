// 이미지 문제 카드 컴포넌트
// Adventure3에서 사용

type ImageProblemCardProps = {
  imageUrl?: string;  // 문제 이미지 URL
  alt?: string;       // 이미지 대체 텍스트
};

export const ImageProblemCard = ({ imageUrl, alt }: ImageProblemCardProps) => {
  return (
    <div className="w-full max-w-xs bg-white rounded-2xl shadow-xl border-4 border-gray-800 overflow-hidden">
      <div className="aspect-video flex items-center justify-center bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={alt || '문제 이미지'}
            className="w-full h-full object-contain"
          />
        ) : (
          // 이미지가 없을 때 플레이스홀더
          <div className="text-center text-gray-400">
            <div className="text-6xl mb-2">🖼️</div>
            <p className="text-sm">이미지 준비중</p>
          </div>
        )}
      </div>
    </div>
  );
};
