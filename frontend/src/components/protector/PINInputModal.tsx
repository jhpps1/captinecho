import { useState } from 'react';

interface PINInputModalProps {
  title?: string;
  subtitle?: string;
  description?: string;
  onSubmit: (pin: string) => void;
  onForgotPin?: () => void;
  onClose?: () => void;
}

export default function PINInputModal({
  title = "설정",
  subtitle = "보호자 PIN 번호",
  description = "새 비밀번호를 입력해주세요",
  onSubmit,
  onForgotPin,
  onClose
}: PINInputModalProps) {
  const [pin, setPin] = useState('');

  const handleNumberClick = (num: string) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);

      // 6자리 입력 완료 시 자동 제출
      if (newPin.length === 6) {
        setTimeout(() => {
          onSubmit(newPin);
        }, 300);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const renderPinDots = () => {
    return (
      <div className="flex gap-4 justify-center mb-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all ${
              i < pin.length ? 'bg-gray-800' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-blue-100 to-white rounded-3xl p-8 shadow-2xl w-[480px] relative">
        {/* 클라우드 배경 효과 */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-4 left-8 w-24 h-12 bg-white rounded-full blur-xl"></div>
          <div className="absolute top-12 right-12 w-32 h-16 bg-white rounded-full blur-xl"></div>
          <div className="absolute bottom-16 left-12 w-20 h-10 bg-white rounded-full blur-xl"></div>
        </div>

        {/* 헤더 */}
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-lg text-gray-600 mb-1">{subtitle}</p>
          <p className="text-sm text-gray-500 mb-6">{description}</p>

          {/* PIN 마스킹 표시 */}
          {renderPinDots()}
        </div>

        {/* 숫자 패드 */}
        <div className="grid grid-cols-3 gap-4 mb-6 relative z-10">
          {numbers.map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="w-16 h-16 mx-auto bg-white border-2 border-gray-300 rounded-full
                       text-2xl font-bold hover:bg-gray-100 hover:border-gray-400
                       active:scale-95 transition-all shadow-md"
            >
              {num}
            </button>
          ))}

          {/* 백스페이스 버튼 */}
          <button
            onClick={handleBackspace}
            className="w-16 h-16 mx-auto bg-white border-2 border-gray-300 rounded-full
                     text-xl font-bold hover:bg-gray-100 hover:border-gray-400
                     active:scale-95 transition-all shadow-md flex items-center justify-center"
          >
            ←
          </button>

          {/* 0 버튼 */}
          <button
            onClick={() => handleNumberClick('0')}
            className="w-16 h-16 mx-auto bg-white border-2 border-gray-300 rounded-full
                     text-2xl font-bold hover:bg-gray-100 hover:border-gray-400
                     active:scale-95 transition-all shadow-md"
          >
            0
          </button>

          {/* X (닫기) 버튼 - onClose가 제공된 경우에만 표시 */}
          {onClose ? (
            <button
              onClick={handleClose}
              className="w-16 h-16 mx-auto bg-white border-2 border-gray-300 rounded-full
                       text-2xl font-bold hover:bg-red-50 hover:border-red-400
                       active:scale-95 transition-all shadow-md text-red-500"
            >
              X
            </button>
          ) : (
            <div className="w-16 h-16 mx-auto"></div>
          )}
        </div>

        {/* PIN 찾기 링크 */}
        {onForgotPin && (
          <div className="text-center relative z-10">
            <button
              onClick={onForgotPin}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              PIN 번호를 잊으셨나요?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
