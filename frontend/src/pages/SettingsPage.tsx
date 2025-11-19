import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import DashboardSidebar from '../components/dashboard/layout/DashboardSidebar';
import PINInputModal from '../components/protector/PINInputModal';
import WithdrawalModal from '../components/protector/modals/WithdrawalModal'; // 경로에 맞게 수정
import { withdrawAccount, getStudents, verifyPin, updatePin } from '../api/protectorApi';

interface Student {
  id: number;
  name: string;
  level: number;
  streak: number;
  isActive: boolean;
  profileImage?: string;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [showNewPinModal, setShowNewPinModal] = useState(false);
  const [showConfirmPinModal, setShowConfirmPinModal] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [withdrawStep, setWithdrawStep] = useState<0 | 1 | 2 | 3>(0); // 0: 없음, 1:경고, 2:PIN, 3:입력
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);

  // 학생 목록 조회
  const fetchStudents = async () => {
    try {
      const response = await getStudents();
      const studentList: Student[] = response.students.map(s => ({
        id: s.studentId,
        name: s.name,
        level: s.level || 0,
        streak: 0,
        isActive: false,
        profileImage: s.profileImage
      }));
      setStudents(studentList);

      // 첫 번째 학생 자동 선택
      if (studentList.length > 0 && !selectedStudentId) {
        setSelectedStudentId(studentList[0].id);
      }
    } catch (error: any) {
      console.error('❌ 학생 목록 로드 실패:', error);
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        Cookies.remove('accessToken');
        navigate('/');
        return;
      }
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChangePinClick = () => {
    setShowChangePinModal(true);
  };

  const handleCurrentPinSubmit = async (pin: string) => {
    try {
      const result = await verifyPin(pin);
      if (result.success) {
        setCurrentPin(pin); // 현재 PIN 저장
        setShowChangePinModal(false);
        setShowNewPinModal(true);
      } else {
        // PIN이 일치하지 않음 - 모달에서 시각적 피드백
        throw new Error('PIN mismatch');
      }
    } catch (error: any) {
      console.error('❌ PIN 검증 실패:', error);
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        Cookies.remove('accessToken');
        navigate('/');
      }
      throw error; // 에러를 다시 throw해서 PINInputModal에서 catch
    }
  };

  const handleNewPinSubmit = (pin: string) => {
    setNewPin(pin);
    setShowNewPinModal(false);
    setShowConfirmPinModal(true);
  };

  const handleConfirmPinSubmit = async (pin: string) => {
    if (pin !== newPin) {
      // PIN 불일치 시 에러를 throw하여 모달의 떨림 애니메이션 트리거
      throw new Error('PIN mismatch');
    }

    try {
      const result = await updatePin(currentPin, newPin);
      if (result.success) {
        alert('PIN이 성공적으로 변경되었습니다!');
        setShowConfirmPinModal(false);
        setCurrentPin('');
        setNewPin('');
      } else {
        alert('PIN 변경에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error: any) {
      console.error('❌ PIN 변경 실패:', error);
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        Cookies.remove('accessToken');
        navigate('/');
      } else if (error.response?.status === 400) {
        alert('현재 PIN이 일치하지 않습니다.');
      } else {
        alert('PIN 변경에 실패했습니다. 다시 시도해주세요.');
      }
      setShowConfirmPinModal(false);
      setCurrentPin('');
      setNewPin('');
    }
  };

  const handleLogout = () => {
    Cookies.remove('accessToken');
    navigate('/');
  };

  const handleStudentSelect = (studentId: number) => {
    // 학생 선택 시 해당 학생의 대시보드로 이동
    sessionStorage.setItem('studentId', studentId.toString());
    navigate('/protector-dashboard');
  };

  // 1. [탈퇴 버튼 클릭] -> 1단계 모달 열기
  const handleWithdrawClick = () => {
    setWithdrawStep(1);
  };

  // 2. [1단계 확인] -> 2단계(PIN)로 이동
  const handleStep1Confirm = () => {
    setWithdrawStep(2);
  };

  // 3. [2단계 PIN 입력 성공] -> 3단계(최종 확인)로 이동
  // 기존 PINInputModal의 onSubmit에 전달할 함수입니다.
  const handleWithdrawPinSubmit = async (pin: string) => {
    try {
      const result = await verifyPin(pin);
      if (result.success) {
        setWithdrawStep(3); // PIN 맞으면 3단계로
      } else {
        throw new Error('PIN mismatch'); // PINInputModal에서 에러 처리됨
      }
    } catch (error) {
      throw error; // PINInputModal로 에러 전파
    }
  };

  // 4. [3단계 최종 확인] -> API 호출 및 로그아웃 처리
  const handleFinalWithdraw = async () => {
    setIsWithdrawLoading(true);
    try {
      const response = await withdrawAccount();

      // 성공 시 (API 응답이 success: true 라고 가정)
      if (response.success) {
        alert('회원 탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.');

        // 데이터 정리
        sessionStorage.removeItem('studentId');
        Cookies.remove('accessToken', { path: '/' });

        // 메인으로 이동
        navigate('/');
      }
    } catch (error) {
      console.error('회원 탈퇴 실패:', error);
      alert('회원 탈퇴 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsWithdrawLoading(false);
      setWithdrawStep(0);
    }
  };

  // 공통: 모달 닫기
  const handleWithdrawClose = () => {
    setWithdrawStep(0);
    setIsWithdrawLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-neutral-50 font-pretendard">
      {/* PIN 변경 모달들 */}
      {showChangePinModal && (
        <PINInputModal
          title="설정"
          subtitle="보호자 PIN 번호"
          description="현재 비밀번호를 입력해주세요"
          onSubmit={handleCurrentPinSubmit}
          onClose={() => setShowChangePinModal(false)}
        />
      )}

      {showNewPinModal && (
        <PINInputModal
          title="설정"
          subtitle="보호자 PIN 번호"
          description="새 비밀번호를 입력해주세요"
          onSubmit={handleNewPinSubmit}
        />
      )}

      {showConfirmPinModal && (
        <PINInputModal
          title="설정"
          subtitle="보호자 PIN 번호"
          description="변경된 비밀번호를 한번 더 입력해주세요"
          onSubmit={handleConfirmPinSubmit}
        />
      )}

      {/* Sidebar */}
      <DashboardSidebar
        title="설정"
        students={students}
        selectedStudentId={selectedStudentId || 0}
        onStudentSelect={handleStudentSelect}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* 설정 카드 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            {/* Header */}
            <h1 className="text-2xl font-bold text-neutral-800 font-pretendard mb-6">
              계정 설정
            </h1>

            {/* 보호자 PIN 변경 */}
            <div>
              <h2 className="text-lg font-semibold text-neutral-700 font-pretendard mb-3">
                보호자 PIN 변경
              </h2>
              <p className="text-sm text-neutral-500 font-pretendard mb-4">
                보호자 모드 접근을 위한 PIN 번호를 변경할 수 있습니다
              </p>
              <button
                onClick={() => {/* 기존 PIN 변경 로직 */ }}
                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold font-pretendard hover:bg-primary/90 transition-colors"
              >
                PIN 변경하기
              </button>
            </div>
            <div className='my-6'>
              <h2 className="text-lg font-semibold text-neutral-700 font-pretendard mb-3">
                회원 탈퇴
              </h2>
              <p className="text-sm text-neutral-500 font-pretendard mb-4">
                서비스를 그만 이용하신다면 해당 기능으로 탈퇴 하실 수 있습니다.
              </p>
              {/* 추가된 탈퇴 버튼 */}
              <button
                onClick={handleWithdrawClick}
                className="px-6 py-3 bg-white border border-red-200 text-red-600 rounded-lg font-semibold font-pretendard hover:bg-red-50 hover:border-red-300 transition-colors text-sm"
              >
                회원 탈퇴
              </button>
            </div>
            {/* 1단계 & 3단계: WithdrawalModal 재사용 */}
            {(withdrawStep === 1 || withdrawStep === 3) && (
              <WithdrawalModal
                step={withdrawStep}
                onConfirm={withdrawStep === 1 ? handleStep1Confirm : handleFinalWithdraw}
                onClose={handleWithdrawClose}
                isLoading={isWithdrawLoading}
              />
            )}

            {/* 2단계: 기존 PINInputModal 재사용 */}
            {withdrawStep === 2 && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center"> {/* z-index 높게 설정 */}
                <PINInputModal
                  title="본인 확인"
                  subtitle="PIN 번호 입력"
                  description="탈퇴를 위해 보호자 PIN 번호를 입력해주세요."
                  onSubmit={handleWithdrawPinSubmit}
                  onClose={handleWithdrawClose}
                  onForgotPin={() => {
                    alert('PIN 찾기 기능을 이용해주세요.');
                    handleWithdrawClose();
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
