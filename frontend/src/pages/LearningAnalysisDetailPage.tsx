import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/protector/StudentSidebar';
import StudentCard from '../components/protector/StudentCard';
import StreakCalendar from '../components/protector/StreakCalendar';
import StudyGoalsCard from '../components/protector/StudyGoalsCard';
import JamoProgressChart from '../components/protector/JamoProgressChart';
import WeeklyComparisonChart from '../components/protector/WeeklyComparisonChart';
import {
  mockStudents,
  mockWeeklyActivity,
  mockStudyGoals,
  mockJamoStats,
  mockWeeklyComparison
} from '../mocks/protectorData';

export default function LearningAnalysisDetailPage() {
  const navigate = useNavigate();
  const selectedStudent = mockStudents[0]; // 임시로 첫 번째 학생 선택

  const days = ['수', '목', '금', '토', '일', '월', '화(오늘)'];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* 왼쪽 사이드바 */}
      <StudentSidebar
        students={mockStudents}
        selectedStudent={selectedStudent}
        onSelectStudent={() => {}}
        onSettings={() => navigate('/protector/settings')}
        onLogout={() => {
          localStorage.removeItem('accessToken');
          sessionStorage.removeItem('accessToken');
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
      </div>
    </div>
  );
}
