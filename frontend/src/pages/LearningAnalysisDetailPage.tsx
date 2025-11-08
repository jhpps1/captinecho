import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import DashboardSidebar from '../components/dashboard/layout/DashboardSidebar';
import JamoProgressChart from '../components/protector/JamoProgressChart';
import WeeklyComparisonChart from '../components/protector/WeeklyComparisonChart';
import { getStudents } from '../api/protectorApi';

interface Student {
  id: number;
  lastName: string;
  fullName: string;
  level: number;
  streak: number;
  profileImage?: string;
  grade: string;
}

// TODO: 백엔드 API 구현 후 실제 데이터로 교체
const mockJamoStats = [
  { jamo: 'ㄱ', accuracy: 85, count: 120 },
  { jamo: 'ㄴ', accuracy: 78, count: 95 },
  { jamo: 'ㄷ', accuracy: 92, count: 110 },
  { jamo: 'ㄹ', accuracy: 70, count: 88 },
  { jamo: 'ㅁ', accuracy: 88, count: 102 },
];

const mockWeeklyComparison = {
  lastWeek: [30, 45, 20, 55, 40, 35, 50],
  thisWeek: [40, 50, 35, 60, 45, 50, 55],
};

export default function LearningAnalysisDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // location.state에서 전달된 학생 또는 첫 번째 학생 선택
  const stateStudent = (location.state as { selectedStudent?: Student })?.selectedStudent;
  const selectedStudent = stateStudent
    ? students.find(s => s.id === stateStudent.id) || students[0] || null
    : students[0] || null;

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

  const days = ['수', '목', '금', '토', '일', '월', '화(오늘)'];

  return (
    <div className="flex min-h-screen bg-neutral-50 font-pretendard">
      {/* 사이드바 */}
      <DashboardSidebar
        title="학습 분석"
        students={students}
        selectedStudentId={selectedStudent?.id}
        onStudentSelect={(studentId) => {
          const student = students.find(s => s.id === studentId);
          if (student) {
            navigate('/protector/learning-analysis', { state: { selectedStudent: student } });
          }
        }}
        onLogout={() => {
          localStorage.removeItem('accessToken');
          sessionStorage.removeItem('accessToken');
          Cookies.remove('accessToken');
          navigate('/');
        }}
      />

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 lg:ml-0 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {isLoadingStudents ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-neutral-500">학생 정보를 불러오는 중...</p>
              </div>
            </div>
          ) : !selectedStudent ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-lg text-neutral-600 mb-2">등록된 학생이 없습니다</p>
                <p className="text-sm text-neutral-500">학생을 먼저 등록해주세요</p>
              </div>
            </div>
          ) : (
            <>
              {/* 페이지 헤더 */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-800">학습 분석 상세</h1>
                  <p className="text-neutral-600 mt-1">
                    {selectedStudent.fullName} 학생의 학습 분석을 확인하세요
                  </p>
                </div>
                <button
                  onClick={() => navigate('/protector')}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300
                           rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  대시보드로 돌아가기
                </button>
              </div>

              {/* 학습 분석 섹션 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 자모별 진행률 - TODO: 백엔드 API 구현 후 실제 데이터로 교체 */}
                <JamoProgressChart jamoStats={mockJamoStats} />

                {/* 주간 비교 차트 - TODO: 백엔드 API 구현 후 실제 데이터로 교체 */}
                <WeeklyComparisonChart
                  lastWeek={mockWeeklyComparison.lastWeek}
                  thisWeek={mockWeeklyComparison.thisWeek}
                  days={days}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
