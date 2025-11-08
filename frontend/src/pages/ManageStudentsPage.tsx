import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import Cookies from 'js-cookie';
import DashboardSidebar from '../components/dashboard/layout/DashboardSidebar';
import AddStudentModal from '../components/protector/modals/AddStudentModal';
import InterestSelectionModal from '../components/protector/modals/InterestSelectionModal';
import { getStudents, registerStudent, deleteStudent, getStudentCount } from '../api/protectorApi';
import {
  mapGenderToBackend,
  mapGradeToBackend,
  formatDateToBackend,
  mapGenderToFrontend,
  mapGradeToFrontend
} from '../utils/studentMapper';

interface Student {
  id: number;
  name: string;
  level: number;
  birthDate: string;
  gender: string;
  grade: string;
  interests: string[];
  profileImage?: string;
  deleteTimer?: string;
}

// 성별 표시 변환 함수
const displayGender = (gender: string): string => {
  return gender === 'male' ? '남' : gender === 'female' ? '여' : gender;
};

export default function ManageStudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [studentCount, setStudentCount] = useState<{ total: number; remain: number } | null>(null);

  // 학생 수 조회
  const fetchStudentCount = async () => {
    try {
      const response = await getStudentCount();
      setStudentCount({
        total: response.totalCount,
        remain: response.remainCount
      });
    } catch (error) {
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
        name: s.name,
        level: s.level || 1,
        birthDate: s.birth || '1996.01.03',
        gender: s.gender ? mapGenderToFrontend(s.gender) : '남',
        grade: s.grade ? mapGradeToFrontend(s.grade) : '미취학',
        interests: [],
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
    } finally {
      setIsLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchStudentCount();
  }, []);

  const handleAddStudent = async (studentData: {
    name: string;
    gender: 'male' | 'female';
    birthDate: string;
    grade: string;
    interests: string[];
  }) => {
    setIsAddingStudent(true);
    try {
      const requestData = {
        studentName: studentData.name,
        gender: mapGenderToBackend(studentData.gender),
        birth: formatDateToBackend(studentData.birthDate),
        grade: mapGradeToBackend(studentData.grade),
        interests: selectedInterests.map(id => ({ interestId: id }))
      };

      const response = await registerStudent(requestData);

      if (response.success) {
        alert(`학생 "${studentData.name}"이(가) 추가되었습니다!`);
        await fetchStudents();
        await fetchStudentCount();
        setShowAddModal(false);
        setSelectedInterests([]);
      }
    } catch (error: any) {
      console.error('❌ 학생 등록 실패:', error);
      let errorMessage = '학생 등록에 실패했습니다.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
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

  const handleLogout = () => {
    Cookies.remove('accessToken');
    navigate('/');
  };

  const handleStudentSelect = (studentId: number) => {
    setSelectedStudentId(studentId);
  };

  // DashboardSidebar용 학생 데이터 변환
  const sidebarStudents = students.map(s => ({
    id: s.id,
    name: s.name,
    level: s.level,
    streak: 0, // 백엔드 API 미지원 (향후 추가 예정)
    isActive: s.id === selectedStudentId
  }));

  return (
    <div className="min-h-screen bg-neutral-50 flex font-pretendard">
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
      <DashboardSidebar
        students={sidebarStudents}
        selectedStudentId={selectedStudentId || 0}
        onStudentSelect={handleStudentSelect}
        onLogout={handleLogout}
      />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 overflow-y-auto">
        {/* 컨텐츠 영역 */}
        <div className="max-w-7xl mx-auto p-6">
          {/* 학생 추가 버튼 */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              disabled={studentCount?.remain === 0}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
                studentCount?.remain === 0
                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              <Users size={20} />+ 학생 추가
            </button>
          </div>

          {/* 학생 카드 리스트 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {student.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-neutral-800">
                        {student.name}
                      </h3>
                      <p className="text-sm text-neutral-500">Lv.{student.level}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-neutral-100 rounded-lg">
                    <span className="text-2xl text-neutral-400">⋯</span>
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="w-20 text-neutral-500">생년월일</span>
                    <span className="text-neutral-800">{student.birthDate}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 text-neutral-500">성별</span>
                    <span className="text-neutral-800">{displayGender(student.gender)}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 text-neutral-500">학년</span>
                    <span className="text-neutral-800">{student.grade}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 text-neutral-500">관심사</span>
                    <span className="text-neutral-800">
                      {student.interests.join(', ') || '-'}
                    </span>
                  </div>
                </div>

                {student.deleteTimer && (
                  <div className="mt-4 p-3 bg-error/10 rounded-lg">
                    <p className="text-sm text-error font-medium">
                      ⏰ 삭제 준비 완료 ({student.deleteTimer})
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
