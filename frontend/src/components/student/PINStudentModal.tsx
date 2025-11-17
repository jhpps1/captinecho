import { useState, useEffect } from 'react';

interface StudentPINInputModalProps {
  title?: string;
  subtitle?: string;
  description?: React.ReactNode;
  onSubmit: (pin: string) => Promise<void> | void;
  onClose?: () => void;
  maxLength?: number; // 💡 확장성을 위해 추가 (기본값 4)
}

export default function PINStudentModal({
  title = "학생 인증",
  subtitle = "학생 PIN 번호",
  description = "비밀번호를 잊어버렸다면 부모님께 알려주세요.",
  onSubmit,
  onClose,
  maxLength = 4, // 💡 4자리로 고정
}: StudentPINInputModalProps) {
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);

  // 숫자 입력 핸들러
  const handleNumberClick = async (num: string) => {
    if (pin.length < maxLength) {
      const newPin = pin + num;
      setPin(newPin);

      if (newPin.length === maxLength) {
        // 입력 완료 시 자동 제출 (약간의 딜레이)
        setTimeout(async () => {
          try {
            await Promise.resolve(onSubmit(newPin));
          } catch (error) {
            setIsError(true);
            setTimeout(() => {
              setIsError(false);
              setPin('');
            }, 600);
          }
        }, 300);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  // 💡 maxLength에 따라 동그라미 개수 동적 생성
  const renderPinDots = () => {
    return (
      <div className="flex gap-4 justify-center mb-8">
        {[...Array(maxLength)].map((_, i) => (
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

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 font-pretendard"
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-2xl p-8 shadow-xl w-[480px] relative transition-all ${
          isError
            ? 'border-4 border-red-500 animate-shake'
            : 'border border-neutral-200'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={isError ? { animation: 'shake 0.6s cubic-bezier(.36,.07,.19,.97) both' } : {}}
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-neutral-800 font-pretendard mb-2">{title}</h2>
          <p className="text-lg text-neutral-700 font-pretendard mb-1">{subtitle}</p>
          <div className="text-sm text-neutral-500 font-pretendard mb-6 min-h-[20px]">
            {description}
          </div>
          {renderPinDots()}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {numbers.map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="w-16 h-16 mx-auto bg-neutral-100 rounded-xl text-2xl font-bold font-pretendard text-neutral-800 hover:bg-neutral-200 active:scale-95 transition-all"
            >
              {num}
            </button>
          ))}
          
          <button
            onClick={handleBackspace}
            className="w-16 h-16 mx-auto bg-neutral-100 rounded-xl text-xl font-bold font-pretendard text-neutral-600 hover:bg-neutral-200 active:scale-95 transition-all flex items-center justify-center"
          >
            ←
          </button>
          
          <button
            onClick={() => handleNumberClick('0')}
            className="w-16 h-16 mx-auto bg-neutral-100 rounded-xl text-2xl font-bold font-pretendard text-neutral-800 hover:bg-neutral-200 active:scale-95 transition-all"
          >
            0
          </button>

          {onClose ? (
            <button
              onClick={onClose}
              className="w-16 h-16 mx-auto bg-neutral-100 rounded-xl text-2xl font-bold font-pretendard text-error hover:bg-error/10 active:scale-95 transition-all"
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