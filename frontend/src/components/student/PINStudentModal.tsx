import { useState } from 'react';

// 학생용 PIN 인터페이스
interface StudentPINInputModalProps {
  title?: string;
  subtitle?: string;
  description?: string;
  onSubmit: (pin: string) => Promise<void> | void;
  onClose?: () => void;
}

export default function PINStudentModal({
  // 해당 부분은 디폴트 데이터로 외부에서 재설정 시 변경 가능합니다.
  title = "학생 인증",
  subtitle = "학생 PIN 번호",
  description = "비밀번호를 잊어버렸다면 부모님께 알려주세요.",
  onSubmit,
  onClose,
}: StudentPINInputModalProps) {
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);

  // PIN 입력 설정 관련
  const handleNumberClick = async (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);

      if (newPin.length === 4) {
        setTimeout(async () => {
          try {
            await Promise.resolve(onSubmit(newPin));
          } catch (error) {
            // 에러 이벤트
            setIsError(true);

            // 600ms 후 에러 상태 해제 및 PIN 초기화
            setTimeout(() => {
              setIsError(false);
              setPin('');
            }, 600);
          }
        }, 300);
      }
    }
  };

  // 지우기 옵션
  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  // 뒤로가기 설정(끄기)
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // 모달창 바깥을 클릭하면 꺼지도록 하는 기능 부여 스크립트
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  // 비밀번호 구현 스크립트
  const renderPinDots = () => {
    return (
      <div className="flex gap-4 justify-center mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all ${
              isError
                ? 'bg-red-500'
                : i < pin.length
                ? 'bg-primary'
                : 'bg-neutral-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // 숫자 패드
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    // PIN 입력
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 font-pretendard"
      onClick={handleBackdropClick}
    >
      {/* 에러 발생 시 애니메이션 */}
      <div
        className={`bg-white rounded-2xl p-8 shadow-xl w-[480px] relative transition-all ${
          isError
            ? 'border-4 border-red-500 animate-shake'
            : 'border border-neutral-200'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={
          isError
            ? {
                animation: 'shake 0.6s cubic-bezier(.36,.07,.19,.97) both',
              }
            : {}
        }
      >
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-neutral-800 font-pretendard mb-2">{title}</h2>
          <p className="text-lg text-neutral-700 font-pretendard mb-1">{subtitle}</p>
          <p className="text-sm text-neutral-500 font-pretendard mb-6">{description}</p>
          {renderPinDots()}
        </div>

        {/* 숫자 패드 1~9 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {numbers.map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="w-16 h-16 mx-auto bg-neutral-100 rounded-xl
                         text-2xl font-bold font-pretendard text-neutral-800
                         hover:bg-neutral-200
                         active:scale-95 transition-all"
            >
              {num}
            </button>
          ))}
          {/* 지우기 버튼 */}
          <button
            onClick={handleBackspace}
            className="w-16 h-16 mx-auto bg-neutral-100 rounded-xl
                       text-xl font-bold font-pretendard text-neutral-600
                       hover:bg-neutral-200
                       active:scale-95 transition-all flex items-center justify-center"
          >
            ←
          </button>
          {/* 숫자 버튼 0 */}
          <button
            onClick={() => handleNumberClick('0')}
            className="w-16 h-16 mx-auto bg-neutral-100 rounded-xl
                       text-2xl font-bold font-pretendard text-neutral-800
                       hover:bg-neutral-200
                       active:scale-95 transition-all"
          >
            0
          </button>
          {/* 뒤로가기 버튼 */}
          {onClose ? (
            <button
              onClick={handleClose}
              className="w-16 h-16 mx-auto bg-neutral-100 rounded-xl
                         text-2xl font-bold font-pretendard text-error
                         hover:bg-error/10
                         active:scale-95 transition-all"
            >
              X
            </button>
          ) : (
            <div className="w-16 h-16 mx-auto"></div>
          )}
        </div>
      </div>
    </div>
  );
}