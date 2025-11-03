import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import StudentSidebar from '../components/protector/StudentSidebar';
import StudentCard from '../components/protector/StudentCard';
import StreakCalendar from '../components/protector/StreakCalendar';
import StudyGoalsCard from '../components/protector/StudyGoalsCard';
import {
  mockStudents,
  mockWeeklyActivity,
  mockStudyGoals,
  mockAILogs
} from '../mocks/protectorData';

export default function AIAgentLogPage() {
  const navigate = useNavigate();
  const selectedStudent = mockStudents[0]; // 임시로 첫 번째 학생 선택

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
          Cookies.remove('accessToken');
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

        {/* AI Agent 로그 섹션 */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">AI Agent 로그</h2>

          {/* 로그 내용 영역 */}
          <div className="bg-yellow-100 rounded-xl p-6 min-h-[400px]">
            <div className="space-y-4">
              {mockAILogs.map((log) => (
                <div key={log.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-500">{log.timestamp}</span>
                    {log.type && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {log.type}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800">{log.message}</p>
                </div>
              ))}

              {mockAILogs.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  아직 AI Agent 로그가 없습니다.
                </p>
              )}
            </div>
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
    </div>
  );
}
