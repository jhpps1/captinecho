import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import DashboardSidebar from '../components/dashboard/layout/DashboardSidebar';
import PINInputModal from '../components/protector/PINInputModal';
import { getStudents, verifyPin, updatePin } from '../api/protectorApi';

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
    setSelectedStudentId(studentId);
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
                onClick={handleChangePinClick}
                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold font-pretendard hover:bg-primary/90 transition-colors"
              >
                PIN 변경하기
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
