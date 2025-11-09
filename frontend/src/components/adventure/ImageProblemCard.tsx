// 이미지 문제 카드 컴포넌트(탐험3)
// Adventure3에서 사용

type ImageProblemCardProps = {
  imageUrl?: string;
  alt?: string;
};

const FALLBACK_SRC = '/adventurepage/no_image.png'; // public/ 아래 실제 파일

// ✅ 1) 컴포넌트 바깥(상단)에 배치
const isValidImageUrl = (url?: string): boolean => {
  if (!url || url.trim() === '') return false;

  // HTTP(S) URL만 허용
  if (!url.startsWith('http://') && !url.startsWith('https://')) return false;

  // 알려진 잘못된 패턴 제외
  if (url.includes('undefined') || url.includes('null')) return false;

  return true;
};

export const ImageProblemCard = ({ imageUrl, alt }: ImageProblemCardProps) => {
  // ✅ 2) initialSrc 계산 시 사용 (검증 통과 못하면 FALLBACK 사용)
  const initialSrc = isValidImageUrl(imageUrl) ? imageUrl! : FALLBACK_SRC;

  return (
    <div className="w-44 sm:w-52 md:w-60 lg:w-64 bg-white rounded-2xl shadow-xl border-4 border-gray-800 overflow-hidden">
      <div className="aspect-square flex items-center justify-center bg-gray-100">
        <img
          src={initialSrc}
          alt={alt || '문제 이미지'}
          className="w-full h-full object-contain"
          // 로드 실패 시 기본 이미지로 교체 (무한 루프 방지)
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_SRC;
          }}
          draggable={false}
        />
      </div>
    </div>
  );
};
