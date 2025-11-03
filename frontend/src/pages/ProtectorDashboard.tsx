import { useState } from 'react';
import PINInputModal from '../components/protector/PINInputModal';
import PINRecoveryModal from '../components/protector/modals/PINRecoveryModal';
import StudentSidebar from '../components/protector/StudentSidebar';
import StudentCard from '../components/protector/StudentCard';
import type { Student } from '../mocks/protectorData';
import { mockStudents } from '../mocks/protectorData';

export default function ProtectorDashboard() {
  const [showPinModal, setShowPinModal] = useState(false); // 임시로 false로 변경
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showNewPinModal, setShowNewPinModal] = useState(false);
  const [showConfirmPinModal, setShowConfirmPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(true); // 임시로 true로 변경
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(mockStudents[0]); // 임시로 첫 번째 학생 선택

  const handlePinSubmit = (pin: string) => {
    console.log('PIN 입력:', pin);
    // TODO: 실제 PIN 인증 API 호출
    // 임시로 아무 PIN이나 허용
    setIsAuthenticated(true);
    setShowPinModal(false);
    alert(`PIN 인증 성공: ${pin}`);
  };

  const handleForgotPin = () => {
    setShowPinModal(false);
    setShowRecoveryModal(true);
  };

  const handleVerificationSubmit = (code: string) => {
    console.log('인증 코드:', code);
    // TODO: 실제 인증 코드 검증 API 호출
    setShowRecoveryModal(false);
    setShowNewPinModal(true);
  };

  const handleNewPinSubmit = (pin: string) => {
    console.log('새 PIN:', pin);
    setNewPin(pin);
    setShowNewPinModal(false);
    setShowConfirmPinModal(true);
  };

  const handleConfirmPinSubmit = (pin: string) => {
    console.log('PIN 확인:', pin);
    if (pin === newPin) {
      alert('PIN이 성공적으로 변경되었습니다!');
      // TODO: 실제 PIN 변경 API 호출
      setShowConfirmPinModal(false);
      setShowPinModal(true);
      setNewPin('');
    } else {
      alert('PIN이 일치하지 않습니다. 다시 입력해주세요.');
      setShowConfirmPinModal(false);
      setShowNewPinModal(true);
    }
  };

  const handleResendCode = () => {
    alert('인증 번호가 재발송되었습니다.');
    // TODO: 실제 인증 번호 재발송 API 호출
  };

  const handleRecoveryCancel = () => {
    setShowRecoveryModal(false);
    setShowPinModal(true);
  };

  const handleClose = () => {
    setShowPinModal(false);
    alert('PIN 입력이 취소되었습니다.');
    // TODO: 이전 페이지로 이동 또는 로그인 페이지로 리다이렉트
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* PIN 입력 모달 */}
      {showPinModal && (
        <PINInputModal
          onSubmit={handlePinSubmit}
          onForgotPin={handleForgotPin}
          onClose={handleClose}
        />
      )}

      {/* PIN 복구 모달 */}
      {showRecoveryModal && (
        <PINRecoveryModal
          onSubmit={handleVerificationSubmit}
          onResend={handleResendCode}
          onCancel={handleRecoveryCancel}
        />
      )}

      {/* 새 PIN 설정 모달 (Wireframe 3) */}
      {showNewPinModal && (
        <PINInputModal
          title="설정"
          subtitle="보호자 PIN 번호"
          description="새 비밀번호를 입력해주세요"
          onSubmit={handleNewPinSubmit}
        />
      )}

      {/* PIN 확인 모달 (Wireframe 4) */}
      {showConfirmPinModal && (
        <PINInputModal
          title="설정"
          subtitle="보호자 PIN 번호"
          description="변경된 비밀번호를 한번 더 입력해주세요"
          onSubmit={handleConfirmPinSubmit}
        />
      )}

      {/* 메인 대시보드 (인증 후 표시) */}
      {isAuthenticated && (
        <div className="flex">
          {/* 왼쪽 사이드바 */}
          <StudentSidebar
            students={mockStudents}
            selectedStudent={selectedStudent}
            onSelectStudent={setSelectedStudent}
            onSettings={() => alert('설정 페이지 (준비 중)')}
            onLogout={() => {
              setIsAuthenticated(false);
              setSelectedStudent(null);
              setShowPinModal(true);
            }}
          />

          {/* 메인 컨텐츠 영역 */}
          <div className="flex-1 ml-24 bg-gray-50 min-h-screen p-8">
            {/* 학생 정보 카드 */}
            <StudentCard
              student={selectedStudent}
              onSettingsClick={() => alert('학생 설정 (준비 중)')}
            />

            {/* TODO: 나머지 컴포넌트들 추가 예정 */}
            {selectedStudent && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <p className="text-gray-500 text-center">
                  학습 통계 및 활동 정보가 여기에 표시됩니다.
                </p>
              </div>
            )}

            {/* 테스트용: PIN 모달 다시 열기 버튼 */}
            <button
              onClick={() => setShowPinModal(true)}
              className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              PIN 모달 다시 열기 (테스트용)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
