import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import StudentSidebar from '../components/protector/StudentSidebar';
import PINInputModal from '../components/protector/PINInputModal';
import { getStudents } from '../api/protectorApi';
import type { Student } from '../mocks/protectorData';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [showNewPinModal, setShowNewPinModal] = useState(false);
  const [showConfirmPinModal, setShowConfirmPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');

  // 학생 목록 조회
  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const response = await getStudents();
      const studentList: Student[] = response.students.map(s => ({
        id: s.studentId,
        lastName: s.name.charAt(0),
        fullName: s.name,
        level: s.level || 0,
        streak: 0,
        profileImage: s.profileImage,
        grade: s.grade || '미취학'
      }));
      setStudents(studentList);
    } catch (error: any) {
      console.error('❌ 학생 목록 로드 실패:', error);

      // 401 인증 에러인 경우 로그인 페이지로 리다이렉트
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        Cookies.remove('accessToken');
        navigate('/');
        return;
      }

      // 학생이 없는 경우는 에러가 아니므로 빈 배열로 처리
      setStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // 컴포넌트 마운트 시 학생 목록 로드
  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChangePinClick = () => {
    setShowChangePinModal(true);
  };

  const handleCurrentPinSubmit = (pin: string) => {
    console.log('현재 PIN 입력:', pin);
    // TODO: 현재 PIN 검증 API 호출
    setShowChangePinModal(false);
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
      setNewPin('');
    } else {
      alert('PIN이 일치하지 않습니다. 다시 입력해주세요.');
      setShowConfirmPinModal(false);
      setShowNewPinModal(true);
    }
  };

  const handleManageStudentsClick = () => {
    navigate('/protector/manage-students');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
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

      {/* 왼쪽 사이드바 */}
      <StudentSidebar
        students={students}
        selectedStudent={null}
        onSelectStudent={(student) => navigate('/protector', { state: { selectedStudent: student } })}
        onSettings={() => {}}
        onLogout={() => {
          localStorage.removeItem('accessToken');
          sessionStorage.removeItem('accessToken');
          Cookies.remove('accessToken');
          navigate('/');
        }}
      />

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 ml-24 bg-gray-50 min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          {/* 제목 */}
          <h1 className="text-4xl font-bold text-gray-800 mb-8">설정</h1>

          {/* 설정 카드 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-12">
            {/* 보호자 PIN 변경 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                보호자 PIN 변경
              </h2>
              <button
                onClick={handleChangePinClick}
                className="px-6 py-3 bg-pink-200 hover:bg-pink-300 rounded-lg
                         font-semibold text-gray-800 transition-colors"
              >
                변경하기
              </button>
            </div>

            {/* 관리 학생 연결 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                관리 학생 연결
              </h2>
              <button
                onClick={handleManageStudentsClick}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300
                         rounded-lg font-semibold text-gray-800 transition-colors"
              >
                설정하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
