// ============================================================
// ⚠️ 개발 테스트용 버튼 컴포넌트 - 이후 삭제 예정 ⚠️
// ============================================================
// 용도: UI 동작 테스트 (정답/오답 피드백, 스피커 버튼, 웨이브 효과)
// 실제 음성 인식 기능 구현 후 이 컴포넌트 전체 삭제 필요
// ============================================================

type DevTestButtonsProps = {
  onCorrect: () => void;        // 정답 테스트 (피드백 + 웨이브)
  onWrong: () => void;          // 오답 테스트 (피드백 + 시도 횟수 증가)
  onToggleSpeaker: () => void;  // 스피커 버튼 토글
  onToggleWave: () => void;     // 웨이브 효과 토글
};

export const DevTestButtons = ({
  onCorrect,
  onWrong,
  onToggleSpeaker,
  onToggleWave,
}: DevTestButtonsProps) => {
  return (
    <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 z-10">
      {/* 정답 테스트 버튼 */}
      <button
        onClick={onCorrect}
        className="px-4 py-2 bg-green-500 text-white rounded text-sm font-semibold shadow-lg hover:bg-green-600"
      >
        ✅ 정답(웨이브)
      </button>

      {/* 오답 테스트 버튼 */}
      <button
        onClick={onWrong}
        className="px-4 py-2 bg-red-500 text-white rounded text-sm font-semibold shadow-lg hover:bg-red-600"
      >
        ❌ 오답
      </button>

      {/* 스피커 버튼 토글 */}
      <button
        onClick={onToggleSpeaker}
        className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-semibold shadow-lg hover:bg-blue-600"
      >
        🔊 스피커 토글
      </button>

      {/* 웨이브 효과 토글 */}
      <button
        onClick={onToggleWave}
        className="px-4 py-2 bg-orange-500 text-white rounded text-sm font-semibold shadow-lg hover:bg-orange-600"
      >
        🌊 웨이브 토글
      </button>
    </div>
  );
};
