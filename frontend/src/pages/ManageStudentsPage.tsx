import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import Cookies from 'js-cookie';
import DashboardSidebar from '../components/dashboard/layout/DashboardSidebar';
import AddStudentModal from '../components/protector/modals/AddStudentModal';
import InterestSelectionModal from '../components/protector/modals/InterestSelectionModal';
import StudentProfileModal from '../components/protector/modals/StudentProfileModal';
import AddStudentCompleteModal from '../components/protector/modals/AddStudentCompleteModal';
import EditStudentModal from '../components/protector/modals/EditStudentModal';
import PINStudentModal from '../components/student/PINStudentModal';
import { updateStudentPin } from '../api/studentApi';
import { getStudents, registerStudent, deleteStudent, getStudentCount, updateStudent } from '../api/protectorApi';
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
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [studentCount, setStudentCount] = useState<{ total: number; remain: number } | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null); // 수정할 학생 정보
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdatingStudent, setIsUpdatingStudent] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinStep, setPinStep] = useState<'new' | 'confirm'>('new');
  const [tempNewPin, setTempNewPin] = useState(''); // 첫 번째 입력값 저장용
  const [targetStudentForPin, setTargetStudentForPin] = useState<Student | null>(null);

  // 학생 수 조회
  const fetchStudentCount = async () => {
    try {
      const response = await getStudentCount();
      setStudentCount({
        total: response.totalCount,
        remain: response.remainCount
      });
    } catch (error) {
      console.error('학생 수 조회 실패:', error);
    }
  };

  // 학생 목록 조회
  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const response = await getStudents();
      console.log('학생 목록 조회 응답:', response);
      const studentList: Student[] = response.students.map(s => ({
        id: s.studentId,
        name: s.name,
        level: s.level || 1,
        birthDate: s.birth || '생년월일 미등록',
        gender: s.gender ? mapGenderToFrontend(s.gender) : '남',
        grade: s.grade ? mapGradeToFrontend(s.grade) : '미취학',
        interests: s.interests?.map(interest => interest.interestName) || [],
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

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (openDropdownId !== null && !target.closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

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
        pin: "0000",
        interests: selectedInterests.map(id => ({ interestId: id }))
      };

      console.log('📤 학생 등록 요청 데이터:', requestData);
      const response = await registerStudent(requestData);
      console.log('📥 학생 등록 응답:', response);

      if (response.success) {
        await fetchStudents(); // 학생 목록 새로고침
        await fetchStudentCount(); // 학생 수 새로고침
        setShowAddModal(false); // 학생 추가 모달 닫기
        setSelectedInterests([]); // 선택한 관심사 초기화
        setShowCompleteModal(true); // "추가 완료" 모달 띄우기
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

  const handleProfileUploadSuccess = (newImageUrl: string) => {
    if (!editingStudent) return;

    setStudents(prevStudents =>
      prevStudents.map(s =>
        s.id === editingStudent.id ? { ...s, profileImage: newImageUrl } : s
      )
    );

    setShowProfileModal(false);
    setEditingStudent(null);
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

  const handleDeleteStudent = async (studentId: number) => {
    try {
      await deleteStudent(studentId);
      alert('학생이 삭제되었습니다.');
      await fetchStudents();
      await fetchStudentCount();
    } catch (error: any) {
      console.error('❌ 학생 삭제 실패:', error);
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        Cookies.remove('accessToken');
        navigate('/');
      } else {
        alert('학생 삭제에 실패했습니다.');
      }
    }
  };

  // 💡 4. 학생 정보 수정 핸들러
  const handleUpdateStudent = async (updatedData: {
    name: string;
    gender: 'male' | 'female';
    birthDate: string; // 'yyyy-MM-dd'
    grade: string;
  }) => {
    if (!editingStudent) return;

    setIsUpdatingStudent(true);
    try {
      const requestData = {
        studentName: updatedData.name,
        gender: mapGenderToBackend(updatedData.gender),
        birth: formatDateToBackend(updatedData.birthDate), // 'yyyy-MM-dd' 형식
        grade: mapGradeToBackend(updatedData.grade),
      };

      console.log('📤 학생 수정 요청 데이터:', requestData);
      const response = await updateStudent(editingStudent.id, requestData);
      console.log('📥 학생 수정 응답:', response);

      if (response.success) {
        alert('학생 정보가 수정되었습니다.');
        await fetchStudents(); // 학생 목록 새로고침
        setShowEditModal(false);
        setEditingStudent(null);
      } else {
        alert('학생 수정에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('❌ 학생 수정 실패:', error);
      let errorMessage = '학생 수정에 실패했습니다.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      alert(errorMessage);
    } finally {
      setIsUpdatingStudent(false);
    }
  };

  // DashboardSidebar용 학생 데이터 변환
  const sidebarStudents = students.map(s => ({
    id: s.id,
    name: s.name,
    level: s.level,
    streak: 0,
    isActive: s.id === selectedStudentId,
    profileImage: s.profileImage
  }));

  // 💡 2단계 PIN 변경 프로세스 (새 PIN -> 확인)
  const handlePinFlow = async (inputPin: string) => {
    if (!targetStudentForPin) return;

    // [1단계] 새 PIN 입력
    if (pinStep === 'new') {
      setTempNewPin(inputPin); // 입력값 임시 저장
      setPinStep('confirm');   // 확인 단계로 이동
      return;
    }

    // [2단계] 새 PIN 확인 (검증)
    if (pinStep === 'confirm') {
      // 1. 일치 여부 확인
      if (inputPin !== tempNewPin) {
        alert('입력한 비밀번호가 서로 다릅니다.\n새 비밀번호부터 다시 입력해주세요.');

        // 불일치 시: 다시 입력 단계로 리셋
        setTempNewPin('');
        setPinStep('new');
        throw new Error('PIN_MISMATCH'); // 모달 흔들림 효과
      }

      // 2. 일치하면 API 호출 (newPin만 전송)
      try {
        const response = await updateStudentPin(targetStudentForPin.id, inputPin);

        if (response.success) {
          alert('PIN 번호가 성공적으로 변경되었습니다.');
          handleClosePinModal();
        }
      } catch (error: any) {
        console.error('PIN 변경 실패:', error);
        if (error.response?.data?.message) {
          alert(error.response.data.message);
        } else {
          alert('PIN 변경에 실패했습니다.');
        }
        throw error;
      }
    }
  };

  // 모달 닫기 및 초기화
  const handleClosePinModal = () => {
    setShowPinModal(false);
    setTargetStudentForPin(null);
    setTempNewPin('');
    setPinStep('new'); // 초기 단계는 항상 'new'
  };

  // 모달 텍스트 설정
  const getModalContent = () => {
    switch (pinStep) {
      case 'new':
        return {
          title: "새 PIN 설정",
          subtitle: `${targetStudentForPin?.name} 학생의 새 비밀번호`,
          desc: "새로 사용할 비밀번호 4자리를 입력해주세요."
        };
      case 'confirm':
        return {
          title: "새 PIN 확인",
          subtitle: "비밀번호 재입력",
          desc: "확인을 위해 방금 입력한 번호를 한 번 더 입력해주세요."
        };
      default:
        return { title: "", subtitle: "", desc: "" };
    }
  };

  const modalContent = getModalContent();

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

      {/* 💡 5. 학생 수정 모달 렌더링 */}
      {showEditModal && editingStudent && (
        <EditStudentModal
          student={{
            name: editingStudent.name,
            gender: editingStudent.gender as 'male' | 'female',
            birthDate: editingStudent.birthDate,
            grade: editingStudent.grade,
          }}
          onClose={() => {
            setShowEditModal(false);
            setEditingStudent(null);
          }}
          onSubmit={handleUpdateStudent}
          isLoading={isUpdatingStudent}
        />
      )}

      {showCompleteModal && (
        <AddStudentCompleteModal
          isOpen={showCompleteModal}
          onClose={() => setShowCompleteModal(false)}
          onNavigate={() => {
            setShowCompleteModal(false);
            navigate('/select-profile'); // 프로필 선택 페이지로 이동
          }}
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

      {/* 💡 PIN 변경 모달 */}
      {showPinModal && targetStudentForPin && (
        <PINStudentModal
          // key에 step을 넣어주면 단계가 바뀔 때마다 입력창이 깨끗하게 초기화됩니다.
          key={pinStep}
          title={modalContent.title}
          subtitle={modalContent.subtitle}
          description={modalContent.desc}
          maxLength={4} // 4자리 고정
          onSubmit={handlePinFlow}
          onClose={handleClosePinModal}
        />
      )}

      {/* 프로필 사진 변경 모달 렌더링 */}
      {showProfileModal && editingStudent && (
        <StudentProfileModal
          isOpen={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            setEditingStudent(null);
          }}
          onSuccess={handleProfileUploadSuccess}
          // editingStudent.profileImage가 undefined일 수 있으니 '' (빈 문자열)로 처리
          currentImageUrl={editingStudent.profileImage || ''}
          studentId={editingStudent.id}
        />
      )}

      {/* 왼쪽 사이드바 */}
      <DashboardSidebar
        title="학생 관리"
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
              className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${studentCount?.remain === 0
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
                    {student.profileImage ? (
                      <img
                        src={student.profileImage}
                        alt={student.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-neutral-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-neutral-800">
                        {student.name}
                      </h3>
                      <p className="text-sm text-neutral-500">Lv.{student.level}</p>
                    </div>
                  </div>
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => setOpenDropdownId(openDropdownId === student.id ? null : student.id)}
                      className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <span className="text-2xl text-neutral-400">⋯</span>
                    </button>

                    {/* 드롭다운 메뉴 */}
                    {openDropdownId === student.id && (
                      <div className="absolute right-0 top-12 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                        {/* 💡 6. '수정하기' 버튼 onClick 핸들러 연결 */}
                        <button
                          onClick={() => {
                            setEditingStudent(student); // 1. 수정할 학생 설정
                            setShowEditModal(true);     // 2. 수정 모달 열기
                            setOpenDropdownId(null);    // 3. 드롭다운 닫기
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 transition-colors first:rounded-t-lg"
                        >
                          수정하기
                        </button>
                        <button
                          onClick={() => {
                            setEditingStudent(student); // 1. 수정할 학생 설정
                            setShowProfileModal(true);  // 2. 모달 열기
                            setOpenDropdownId(null);      // 3. 드롭다운 닫기
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 transition-colors first:rounded-t-lg"
                        >
                          프로필 사진 변경
                        </button>
                        {/* 💡 학생 PIN 재설정 버튼 연결 */}
                        <button
                          onClick={() => {
                            setTargetStudentForPin(student);
                            setPinStep('new');
                            setShowPinModal(true);
                            setOpenDropdownId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
                        >
                          PIN 번호 변경
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`${student.name} 학생을 삭제하시겠습니까?`)) {
                              await handleDeleteStudent(student.id);
                            }
                            setOpenDropdownId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error/5 transition-colors last:rounded-b-lg"
                        >
                          삭제하기
                        </button>
                      </div>
                    )}
                  </div>
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
                {/* 학생 삭제 관련 코드 */}
                {student.deleteTimer && (
                  <div className="mt-4 p-3 bg-error/10 rounded-lg">
                    <p className="text-sm text-error font-medium">
                      삭제 준비 완료 ({student.deleteTimer})
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
