import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import Cookies from 'js-cookie';
import DashboardSidebar from '../components/dashboard/layout/DashboardSidebar';
import StudentProfile from '../components/dashboard/profile/StudentProfile';
import LearningGoals from '../components/dashboard/goals/LearningGoals';
import WeeklyTimeChart from '../components/dashboard/charts/WeeklyTimeChart';
import ImprovementCard from '../components/dashboard/charts/ImprovementCard';
import WeaknessAlert from '../components/dashboard/charts/WeaknessAlert';
import CurriculumCard from '../components/dashboard/ai/CurriculumCard';
import { getStudents } from '../api/protectorApi';
import {
  getCurriculum,
  getLearningTime,
  getDailyGoalCount,
  getDailyCompletedCount,
  getWeeklyGoalPercent,
  setProtectorGoal as setProtectorGoalApi,
  type LearningTimeResponse,
  getDailyStreak,
  type DailyStreakResponse,
} from '../api/dashboardApi';

interface Student {
  id: number;
  name: string;
  level: number;
  streak: number;
  isActive: boolean;
  profileImage?: string;
}

// Mock Data (백엔드 미구현 - 나중에 API로 교체)
const MOCK_JAMO_DATA = [
  { jamo: 'ㄱ', accuracy: 92, count: 45 },
  { jamo: 'ㄴ', accuracy: 65, count: 38 },
  { jamo: 'ㄷ', accuracy: 88, count: 52 },
  { jamo: 'ㄹ', accuracy: 73, count: 41 },
  { jamo: 'ㅁ', accuracy: 95, count: 49 },
  { jamo: 'ㅂ', accuracy: 78, count: 36 },
  { jamo: 'ㅅ', accuracy: 70, count: 44 },
  { jamo: 'ㅇ', accuracy: 85, count: 50 },
];

const MOCK_IMPROVEMENT_DATA = {
  overall: {
    previous: 78,
    current: 85,
  },
  jamo: [
    { jamo: 'ㄱ', previousAccuracy: 65, currentAccuracy: 92, improvement: 27 },
    { jamo: 'ㄴ', previousAccuracy: 63, currentAccuracy: 65, improvement: 2 },
    { jamo: 'ㄷ', previousAccuracy: 70, currentAccuracy: 88, improvement: 18 },
    { jamo: 'ㄹ', previousAccuracy: 68, currentAccuracy: 73, improvement: 5 },
    { jamo: 'ㅁ', previousAccuracy: 90, currentAccuracy: 95, improvement: 5 },
    { jamo: 'ㅂ', previousAccuracy: 72, currentAccuracy: 78, improvement: 6 },
    { jamo: 'ㅅ', previousAccuracy: 65, currentAccuracy: 70, improvement: 5 },
    { jamo: 'ㅇ', previousAccuracy: 80, currentAccuracy: 85, improvement: 5 },
  ],
};

/**
 * 이번 주 연속 학습일 계산
 */
const calculateWeeklyStreak = (learningTime: LearningTimeResponse): number => {
  const dailyData = learningTime.thisWeekLearningTime.daily;
  const today = new Date().getDay(); // 0=일요일, 1=월요일, ...

  let streak = 0;
  // 오늘부터 역순으로 순회
  for (let i = today; i >= 0; i--) {
    // 월요일=1, 화요일=2, ... 일요일=0
    const dayIndex = i === 0 ? 6 : i - 1; // API 데이터는 월요일부터 시작
    if (dailyData[dayIndex]?.learningMinutes > 0) {
      streak++;
    } else {
      break; // 학습하지 않은 날을 만나면 중단
    }
  }

  return streak;
};

export default function ProtectorDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [parentGoal, setParentGoal] = useState<string>('BALANCED');
  const [isLoading, setIsLoading] = useState(false);

  // API 데이터 상태
  const [curriculum, setCurriculum] = useState<string>('');
  const [learningTime, setLearningTime] = useState<LearningTimeResponse | null>(null);
  const [dailyStreak, setDailyStreak] = useState<DailyStreakResponse | null>(null)
  const [dailyGoalCount, setDailyGoalCount] = useState(50);
  const [dailyCompletedCount, setDailyCompletedCount] = useState(0);
  const [weeklyGoalPercent, setWeeklyGoalPercent] = useState(0);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // 학생 목록 로드
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await getStudents();
        const studentList: Student[] = response.students.map((s) => ({
          id: s.studentId,
          name: s.name,
          level: s.level || 0,
          streak: 0, // 초기값, 학습 시간 데이터 로드 후 업데이트
          isActive: false,
          profileImage: s.profileImage,
        }));

        setStudents(studentList);
        if (studentList.length > 0 && !selectedStudentId) {
          setSelectedStudentId(studentList[0].id);
        }
      } catch (error: any) {
        console.error('학생 목록 로드 실패:', error);
        if (error.response?.status === 401) {
          alert('로그인이 필요합니다.');
          Cookies.remove('accessToken');
          navigate('/');
        }
      }
    };

    fetchStudents();
  }, []);

  // 선택된 학생의 대시보드 데이터 로드
  useEffect(() => {
    if (!selectedStudentId) return;

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // 6개 API 병렬 호출
        const [
          curriculumData,
          learningTimeData,
          dailyGoalData,
          dailyCompletedData,
          weeklyPercentData,
          dailyStreakData,
        ] = await Promise.all([
          getCurriculum(selectedStudentId),
          getLearningTime(selectedStudentId),
          getDailyGoalCount(selectedStudentId),
          getDailyCompletedCount(selectedStudentId),
          getWeeklyGoalPercent(selectedStudentId),
          getDailyStreak(selectedStudentId),
        ]);

        // 데이터 설정
        setCurriculum(curriculumData.curriculam || '커리큘럼 데이터가 없습니다.');
        setLearningTime(learningTimeData);
        setDailyGoalCount(dailyGoalData.todayGoalCount);
        setDailyCompletedCount(dailyCompletedData.completedCount);
        setWeeklyGoalPercent(weeklyPercentData.weekGoalPercent);
        setDailyStreak(dailyStreakData);

        // Streak 계산 및 업데이트
        const streak = dailyStreakData.currentStreak;

        setStudents((prev) =>
          prev.map((student) =>
            student.id === selectedStudentId
              ? { ...student, streak, isActive: true }
              : { ...student, isActive: false }
          )
        );

        console.log('✅ 대시보드 데이터 로드 완료');
      } catch (error) {
        console.error('❌ 대시보드 데이터 로드 실패:', error);
        // 에러 발생 시 기본값 설정
        setCurriculum('데이터를 불러올 수 없습니다.');
        setLearningTime(null);
        setDailyStreak(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedStudentId]);

  // 학습 시간 데이터를 차트 형식으로 변환
  const weeklyTimeData = learningTime
    ? ['월', '화', '수', '목', '금', '토', '일'].map((day, index) => ({
        day,
        thisWeek: learningTime.thisWeekLearningTime.daily[index]?.learningMinutes || 0,
        lastWeek: learningTime.lastWeekLearningTime.daily[index]?.learningMinutes || 0,
      }))
    : [];

  // 출석 데이터 (월~금, 이번 주)
  const weeklyAttendance = dailyStreak
    ? dailyStreak.weeklyAttendance
    : [false, false, false, false, false];

  // 일일 목표 데이터
  const dailyGoals = {
    problems: { current: dailyCompletedCount, target: dailyGoalCount },
    time: {
      current: learningTime?.thisWeekLearningTime.daily[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]?.learningMinutes || 0,
      target: 30, // 고정값 (백엔드에서 제공하지 않음)
    },
    accuracy: { current: 83 }, // Mock (백엔드 미구현)
  };

  // 주간 목표 데이터
  const weeklyGoals = {
    problems: { current: weeklyGoalPercent, target: 100 },
    time: {
      current: learningTime?.thisWeekLearningTime.totalMinutes || 0,
      target: 400, // 고정값
    },
    accuracy: { current: 85 }, // Mock (백엔드 미구현)
  };

  // 커리큘럼 객체 생성
  const curriculumObject = {
    title: curriculum.split('\n')[0] || '이번 주 학습 계획',
    description: curriculum,
    goals: curriculum.split('\n').filter((line) => line.trim().startsWith('-')),
    createdAt: new Date().toISOString(),
  };

  const handleLogout = () => {
    Cookies.remove('accessToken');
    navigate('/');
  };

  const handleGoalChange = async (goal: string) => {
    if (!selectedStudentId) return;

    try {
      await setProtectorGoalApi(selectedStudentId, goal);
      setParentGoal(goal);
      console.log('보호자 목표 변경 완료:', goal);
    } catch (error) {
      console.error('보호자 목표 변경 실패:', error);
      alert('목표 변경에 실패했습니다.');
    }
  };

  const handleViewAgentLog = () => {
    if (!selectedStudent) return;
    navigate('/protector/ai-agent-log', { state: { selectedStudent } });
  };

  if (isLoading && !selectedStudent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="text-lg text-neutral-600 font-pretendard">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 font-pretendard">
      {/* Sidebar */}
      <DashboardSidebar
        title="대시보드"
        students={students}
        selectedStudentId={selectedStudentId || 0}
        onStudentSelect={setSelectedStudentId}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {selectedStudent ? (
            <>
              {/* Student Profile */}
              <StudentProfile student={selectedStudent} weeklyAttendance={weeklyAttendance} />

              {/* Learning Goals */}
              <LearningGoals dailyGoals={dailyGoals} weeklyGoals={weeklyGoals} />

              {/* Charts Section - Asymmetric Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - 2 stacked cards */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Weekly Time Chart */}
                  <WeeklyTimeChart data={weeklyTimeData} />

                  {/* Weakness Alert with Expandable Chart */}
                  <WeaknessAlert allJamoData={MOCK_JAMO_DATA} />
                </div>

                {/* Right Column - Improvement Card (full height) */}
                <div className="lg:col-span-1">
                  <ImprovementCard
                    overallImprovement={MOCK_IMPROVEMENT_DATA.overall}
                    jamoImprovements={MOCK_IMPROVEMENT_DATA.jamo}
                  />
                </div>
              </div>

              {/* AI Curriculum */}
              <CurriculumCard
                curriculum={curriculumObject}
                currentGoal={parentGoal}
                onGoalChange={handleGoalChange}
                onViewAgentLog={handleViewAgentLog}
              />
            </>
          ) : (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center">
                  <User size={40} className="text-neutral-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-neutral-700 font-pretendard mb-2">
                    등록된 학생이 없습니다
                  </h3>
                  <p className="text-sm text-neutral-500 font-pretendard mb-4">
                    학습을 시작하려면 학생을 등록해주세요
                  </p>
                  <button
                    onClick={() => navigate('/protector/manage-students')}
                    className="px-6 py-3 bg-primary text-white rounded-lg font-semibold font-pretendard hover:bg-primary/90 transition-colors"
                  >
                    학생 등록하기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
