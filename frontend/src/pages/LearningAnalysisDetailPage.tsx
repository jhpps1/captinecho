import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import StudentSidebar from '../components/protector/StudentSidebar';
import StudentCard from '../components/protector/StudentCard';
import StreakCalendar from '../components/protector/StreakCalendar';
import StudyGoalsCard from '../components/protector/StudyGoalsCard';
import JamoProgressChart from '../components/protector/JamoProgressChart';
import WeeklyComparisonChart from '../components/protector/WeeklyComparisonChart';
import { getStudents } from '../api/protectorApi';
import type { Student } from '../mocks/protectorData';
import {
  mockWeeklyActivity,
  mockStudyGoals,
  mockJamoStats,
  mockWeeklyComparison
} from '../mocks/protectorData';

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
    <div className="min-h-screen bg-gray-100 flex">
      {/* 왼쪽 사이드바 */}
      <StudentSidebar
        students={students}
        selectedStudent={selectedStudent}
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
        {isLoadingStudents ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">학생 정보를 불러오는 중...</p>
          </div>
        ) : !selectedStudent ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">등록된 학생이 없습니다.</p>
          </div>
        ) : (
          <>
            {/* 학생 정보 카드 */}
            <StudentCard
              student={selectedStudent}
              onSettingsClick={() => alert('학생 설정 (준비 중)')}
            />

            {/* 상단: 연속 학습 & 목표 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <StreakCalendar
                weeklyActivity={mockWeeklyActivity}
                streak={selectedStudent.streak}
              />
              <StudyGoalsCard goals={mockStudyGoals} />
            </div>

            {/* 학습 분석 섹션 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 자모별 진행률 */}
              <JamoProgressChart jamoStats={mockJamoStats} />

              {/* 주간 비교 차트 */}
              <WeeklyComparisonChart
                lastWeek={mockWeeklyComparison.lastWeek}
                thisWeek={mockWeeklyComparison.thisWeek}
                days={days}
              />
            </div>

            {/* 돌아가기 버튼 */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => navigate('/protector')}
                className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg
                         hover:bg-gray-50 transition-colors font-semibold text-gray-700"
              >
                돌아가기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
