// 튜토리얼 버튼 누르면 배경 어둡게 하는 기능
type TutorialOverlayProps = {
  active: boolean;
};

export const TutorialOverlay = ({ active }: TutorialOverlayProps) => {
  if (!active) return null;

  return <div className="absolute inset-0 bg-black/60 z-[15]" />;
};
