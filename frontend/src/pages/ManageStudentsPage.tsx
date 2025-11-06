import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import StudentSidebar from '../components/protector/StudentSidebar';
import AddStudentModal from '../components/protector/modals/AddStudentModal';
import InterestSelectionModal from '../components/protector/modals/InterestSelectionModal';
import { getStudents, registerStudent, deleteStudent, getStudentCount } from '../api/protectorApi';
import {
  mapGenderToBackend,
  mapGradeToBackend,
  formatDateToBackend
} from '../utils/studentMapper';
import type { Student } from '../mocks/protectorData';

export default function ManageStudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<number | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]); // 관심사 ID 배열
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [studentCount, setStudentCount] = useState<{ total: number; remain: number } | null>(null);

  // 학생 수 조회
  const fetchStudentCount = async () => {
    try {
      const response = await getStudentCount();
      setStudentCount({
        total: response.totalCount,
        remain: response.remainCount
      });
    } catch (error: any) {
      console.error('❌ 학생 수 조회 실패:', error);
    }
  };

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
        streak: 0, // TODO: 연속 학습일 API 추가 필요
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

  // 컴포넌트 마운트 시 학생 목록 및 학생 수 로드
  useEffect(() => {
    fetchStudents();
    fetchStudentCount();
  }, []);

  const handleDelete = (id: number) => {
    setSelectedForDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteConfirmText !== '삭제하겠습니다') {
      alert('정확한 문구를 입력해주세요.');
      return;
    }

    if (selectedForDelete === null) return;

    setIsDeletingStudent(true);
    try {
      await deleteStudent(selectedForDelete);
      alert('학생이 삭제되었습니다.');

      // 학생 목록 및 학생 수 새로고침
      await fetchStudents();
      await fetchStudentCount();

      setShowDeleteModal(false);
      setSelectedForDelete(null);
      setDeleteConfirmText('');
    } catch (error: any) {
      console.error('❌ 학생 삭제 실패:', error);

      let errorMessage = '학생 삭제에 실패했습니다.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      alert(errorMessage);
    } finally {
      setIsDeletingStudent(false);
    }
  };

  const handleAddStudent = async (studentData: {
    name: string;
    gender: 'male' | 'female';
    birthDate: string;
    grade: string;
    interests: string[];
  }) => {
    setIsAddingStudent(true);
    try {
      // 프론트엔드 데이터를 백엔드 형식으로 변환
      const requestData = {
        studentName: studentData.name,
        gender: mapGenderToBackend(studentData.gender),
        birth: formatDateToBackend(studentData.birthDate),
        grade: mapGradeToBackend(studentData.grade),
        interests: selectedInterests.map(id => ({ interestId: id }))
      };

      console.log('📤 학생 등록 요청:', requestData);

      // API 호출
      const response = await registerStudent(requestData);

      if (response.success) {
        console.log('✅ 학생 등록 성공');
        alert(`학생 "${studentData.name}"이(가) 추가되었습니다!`);

        // 학생 목록 및 학생 수 새로고침
        await fetchStudents();
        await fetchStudentCount();

        // 모달 닫기
        setShowAddModal(false);
        setSelectedInterests([]);
      }
    } catch (error: any) {
      console.error('❌ 학생 등록 실패:', error);

      // 에러 메시지 파싱
      let errorMessage = '학생 등록에 실패했습니다.';

      if (error.response?.data?.message) {
        const message = error.response.data.message;
        if (message.includes('MAX_STUDENT_COUNT_EXCEEDED')) {
          errorMessage = '최대 학생 수를 초과했습니다.';
        } else if (message.includes('UNAUTHORIZED')) {
          errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
        } else {
          errorMessage = message;
        }
      }

      alert(errorMessage);
    } finally {
      setIsAddingStudent(false);
    }
  };

  const handleInterestConfirm = (interestIds: number[]) => {
    setSelectedInterests(interestIds);
    setShowInterestModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-pink-100 rounded-2xl p-8 max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              관리 학생 삭제하기
            </h2>
            <p className="text-center mb-2">정말 삭제 하시겠습니까?</p>
            <p className="text-center mb-6">
              삭제를 원한다면<br />
              '삭제하겠습니다'를 입력해주세요.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 mb-4"
              placeholder="삭제하겠습니다"
              disabled={isDeletingStudent}
            />
            <ul className="text-sm text-gray-700 mb-6 space-y-1">
              <li>• 삭제된 학생 계정은 복구가 불가능합니다.</li>
              <li>• 신중하게 생각해주세요.</li>
            </ul>
            <div className="flex gap-4">
              <button
                onClick={confirmDelete}
                disabled={isDeletingStudent}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold ${
                  isDeletingStudent
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                {isDeletingStudent ? '삭제 중...' : '삭제하기'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                disabled={isDeletingStudent}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold ${
                  isDeletingStudent
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}


      {/* 학생 추가 모달 */}
      {showAddModal && (
        <AddStudentModal
          onClose={() => {
            setShowAddModal(false);
            setSelectedInterests([]);
          }}
          onSubmit={handleAddStudent}
          onOpenInterests={() => setShowInterestModal(true)}
          selectedInterestsCount={selectedInterests.length}
          isLoading={isAddingStudent}
        />
      )}

      {/* 관심사 선택 모달 */}
      {showInterestModal && (
        <InterestSelectionModal
          onClose={() => setShowInterestModal(false)}
          onConfirm={handleInterestConfirm}
          initialSelection={selectedInterests}
        />
      )}

      {/* 왼쪽 사이드바 */}
      <StudentSidebar
        students={students}
        selectedStudent={null}
        onSelectStudent={(student) => navigate('/protector', { state: { selectedStudent: student } })}
        onSettings={() => navigate('/protector/settings')}
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
          <h1 className="text-3xl font-bold text-gray-800 mb-6">관리 학생 연결 설정</h1>

          {/* 학생 수 정보 카드 */}
          {studentCount && (
            <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">등록 가능한 학생 수</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {studentCount.remain} / {studentCount.total}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">현재 등록된 학생</p>
                  <p className="text-2xl font-bold text-cyan-600">
                    {studentCount.total - studentCount.remain}명
                  </p>
                </div>
              </div>
              {studentCount.remain === 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">
                    ⚠️ 학생을 더 이상 추가할 수 없습니다. 기존 학생을 삭제한 후 추가해주세요.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 학생 목록 */}
          <div className="space-y-4 mb-8">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-cyan-100 rounded-xl p-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                    <span className="text-2xl font-bold">{student.lastName}</span>
                  </div>
                  <div>
                    <span className="text-xl font-bold">{student.fullName}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(student.id)}
                  className="text-2xl text-gray-600 hover:text-gray-800"
                >
                  ⋯
                </button>
              </div>
            ))}
          </div>

          {/* 버튼들 */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-8 py-3 bg-white border-2 border-gray-300 rounded-lg
                       font-semibold hover:bg-gray-50"
            >
              추가하기
            </button>
            <button
              onClick={() => alert('삭제하기 기능')}
              className="px-8 py-3 bg-white border-2 border-gray-300 rounded-lg
                       font-semibold hover:bg-gray-50"
            >
              삭제하기
            </button>
            <button
              onClick={() => navigate('/protector/settings')}
              className="px-8 py-3 bg-white border-2 border-gray-300 rounded-lg
                       font-semibold hover:bg-gray-50"
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
