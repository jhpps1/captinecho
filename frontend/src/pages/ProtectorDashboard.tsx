import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import PINInputModal from '../components/protector/PINInputModal';
import PINRecoveryModal from '../components/protector/modals/PINRecoveryModal';
import StudentSidebar from '../components/protector/StudentSidebar';
import StudentCard from '../components/protector/StudentCard';
import StreakCalendar from '../components/protector/StreakCalendar';
import StudyGoalsCard from '../components/protector/StudyGoalsCard';
import WeeklyLearningSection from '../components/protector/WeeklyLearningSection';
import AIAgentSection from '../components/protector/AIAgentSection';
import type { Student } from '../mocks/protectorData';
import {
  mockStudents,
  mockWeeklyActivity,
  mockStudyGoals,
  mockJamoStats
} from '../mocks/protectorData';

export default function ProtectorDashboard() {
  const navigate = useNavigate();
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
            onSettings={() => navigate('/protector/settings')}
            onLogout={() => {
              // 액세스 토큰 삭제
              localStorage.removeItem('accessToken');
              sessionStorage.removeItem('accessToken');
              Cookies.remove('accessToken');

              // 홈 화면으로 리다이렉트
              navigate('/');
            }}
          />

          {/* 메인 컨텐츠 영역 */}
          <div className="flex-1 ml-24 bg-gray-50 min-h-screen p-8">
            {/* 학생 정보 카드 */}
            <StudentCard
              student={selectedStudent}
              onSettingsClick={() => alert('학생 설정 (준비 중)')}
            />

            {/* 메인 콘텐츠 */}
            {selectedStudent && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 왼쪽 컬럼 */}
                <div className="space-y-6">
                  {/* 연속 학습 캘린더 */}
                  <StreakCalendar
                    weeklyActivity={mockWeeklyActivity}
                    streak={selectedStudent.streak}
                  />

                  {/* 학습 목표 카드 */}
                  <StudyGoalsCard goals={mockStudyGoals} />

                  {/* 지난주 학습 분석 */}
                  <WeeklyLearningSection
                    averageAccuracy={83}
                    difficultJamos={mockJamoStats}
                    onDetailClick={() => navigate('/protector/learning-analysis')}
                  />
                </div>

                {/* 오른쪽 컬럼 */}
                <div className="space-y-6">
                  {/* AI Agent 섹션 */}
                  <AIAgentSection
                    onLogClick={() => navigate('/protector/ai-agent-log')}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
