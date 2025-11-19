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
  getProtectorGoal,
  setProtectorGoal as setProtectorGoalApi,
  type LearningTimeResponse,
  getDailyStreak,
  type DailyStreakResponse,
  getWeeklyJamoStat,
  type WeeklyJamoStatResponse,
} from '../api/dashboardApi';

import {
  getDailyAccuracy,
  getWeeklyAccuracy,
  type AccuracyResponse,
  getBestJamos,
  getWorstJamos,
  type JamoImprovementApiData,
  getOverallAccuracy,
  type OverallAccuracyResponse,
  getAllJamoStats,
  getCurrentJamoStats,
  type JamoStatData,
} from '../api/studentApi'

interface Student {
  id: number;
  name: string;
  level: number | null;
  streak: number;
  isActive: boolean;
  profileImage?: string;
}

// 💡 추가: ImprovementCard가 필요로 하는 데이터 형식
interface JamoImprovementData {
  jamo: string;
  previousAccuracy: number;
  currentAccuracy: number;
  improvement: number;
}

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
  const [parentGoal, setParentGoal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // API 데이터 상태
  const [curriculum, setCurriculum] = useState<string>('');
  const [learningTime, setLearningTime] = useState<LearningTimeResponse | null>(null);
  const [dailyStreak, setDailyStreak] = useState<DailyStreakResponse | null>(null)
  const [dailyAccuracy, setDailyAccuracy] = useState(0);
  const [weeklyAccuracy, setWeeklyAccuracy] = useState(0);
  const [dailyGoalCount, setDailyGoalCount] = useState(0);
  const [dailyCompletedCount, setDailyCompletedCount] = useState(0);
  const [weeklyGoalPercent, setWeeklyGoalPercent] = useState(0);
  const [jamoImprovements, setJamoImprovements] = useState<JamoImprovementData[]>([]);
  const [overallAccuracy, setOverallAccuracy] = useState<{ previous: number | null; current: number | null }>({ previous: null, current: null });
  const [jamoStats, setJamoStats] = useState<JamoStatData[]>([]);
  const [currentWeekJamoStats, setCurrentWeekJamoStats] = useState<JamoStatData[]>([]);  // 이번 주 데이터
  const [lastWeekJamoStats, setLastWeekJamoStats] = useState<JamoStatData[]>([]);      // 저번 주 데이터

  // 개별 에러 상태
  const [learningTimeError, setLearningTimeError] = useState<string | null>(null);
  const [jamoStatsError, setJamoStatsError] = useState<string | null>(null);
  const [improvementError, setImprovementError] = useState<string | null>(null);
  const [curriculumError, setCurriculumError] = useState<string | null>(null);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // 학생 목록 로드
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await getStudents();
        const studentList: Student[] = response.students.map((s) => ({
          id: s.studentId,
          name: s.name,
          level: s.level,
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

    sessionStorage.setItem('studentId', selectedStudentId.toString());

    const fetchDashboardData = async () => {
      setIsLoading(true);
      // 에러 상태 초기화
      setLearningTimeError(null);
      setJamoStatsError(null);
      setImprovementError(null);
      setCurriculumError(null);

      try {
        // API 병렬 호출 - Promise.allSettled 사용 (일부 실패해도 계속 진행)
        const results = await Promise.allSettled([
          getCurriculum(selectedStudentId),          // 0
          getLearningTime(selectedStudentId),        // 1
          getDailyGoalCount(selectedStudentId),      // 2
          getDailyCompletedCount(selectedStudentId), // 3
          getWeeklyGoalPercent(selectedStudentId),   // 4
          getDailyStreak(selectedStudentId),         // 5
          getDailyAccuracy(selectedStudentId),       // 6
          getWeeklyAccuracy(selectedStudentId),      // 7
          getBestJamos(),                            // 8
          getWorstJamos(),                           // 9
          getOverallAccuracy(),                      // 10
          getAllJamoStats(),                         // 11
          getCurrentJamoStats(),                     // 12
          getWeeklyJamoStat(selectedStudentId),      // 13
          getProtectorGoal(selectedStudentId),       // 14
        ]);

        // 각 결과 추출
        const curriculumData = results[0].status === 'fulfilled' ? results[0].value : null;
        const learningTimeData = results[1].status === 'fulfilled' ? results[1].value : null;
        const dailyGoalData = results[2].status === 'fulfilled' ? results[2].value : null;
        const dailyCompletedData = results[3].status === 'fulfilled' ? results[3].value : null;
        const weeklyPercentData = results[4].status === 'fulfilled' ? results[4].value : null;
        const dailyStreakData = results[5].status === 'fulfilled' ? results[5].value : null;
        const dailyAccuracyData = results[6].status === 'fulfilled' ? results[6].value : null;
        const weeklyAccuracyData = results[7].status === 'fulfilled' ? results[7].value : null;
        const bestJamosData = results[8].status === 'fulfilled' ? results[8].value : null;
        const worstJamosData = results[9].status === 'fulfilled' ? results[9].value : null;
        const overallAccuracyData = results[10].status === 'fulfilled' ? results[10].value : null;
        const allJamoStatsData = results[11].status === 'fulfilled' ? results[11].value : null;
        const currentWeekJamoStatsData = results[12].status === 'fulfilled' ? results[12].value : null;
        const lastWeekJamoStatsData = results[13].status === 'fulfilled' ? results[13].value : null;
        const protectorGoalData = results[14].status === 'fulfilled' ? results[14].value : null;

        // Protector Goal 데이터 설정
        if (protectorGoalData?.protectorGoal) {
          setParentGoal(protectorGoalData.protectorGoal);
        }

        // Curriculum 데이터 설정
        if (curriculumData) {
          setCurriculum(curriculumData.curriculam || '커리큘럼 데이터가 없습니다.');
          setCurriculumError(null);
        } else {
          setCurriculum('데이터를 불러올 수 없습니다.');
          setCurriculumError(results[0].status === 'rejected' ? results[0].reason?.message || '커리큘럼 로드 실패' : null);
        }

        // Learning Time 관련 데이터 설정
        if (learningTimeData && dailyStreakData) {
          setLearningTime(learningTimeData);
          setDailyStreak(dailyStreakData);
          setLearningTimeError(null);
        } else {
          setLearningTime(null);
          setDailyStreak(null);
          setLearningTimeError('학습 시간 데이터 로드 실패');
        }

        // Daily Goals 데이터 설정
        if (dailyGoalData) setDailyGoalCount(dailyGoalData.todayGoalCount);
        if (dailyCompletedData) setDailyCompletedCount(dailyCompletedData.completedCount);
        if (weeklyPercentData) setWeeklyGoalPercent(weeklyPercentData.weekGoalPercent);

        // 평균 정확도 데이터 설정 (학습한 자모만 포함)
        setDailyAccuracy(dailyAccuracyData?.accuracy ?? 0);
        setWeeklyAccuracy(weeklyAccuracyData?.accuracy ?? 0);

        // 자모 통계 데이터 설정 - currentWeekJamoStatsData 우선, allJamoStatsData는 fall back
        if (currentWeekJamoStatsData) {
          // 신규 학생 또는 이번 주 실시간 데이터가 있는 경우 (jamo_stat 테이블)
          setJamoStats(currentWeekJamoStatsData.accuracyRates);
          setJamoStatsError(null);
        } else if (allJamoStatsData) {
          // fall back: weekly_jamo_stat 데이터 사용 (배치 실행 완료된 기존 학생)
          setJamoStats(allJamoStatsData.accuracyRates);
          setJamoStatsError(null);
        } else {
          setJamoStats([]);
          setJamoStatsError('자모 통계 데이터 로드 실패');
        }

        // 이번 주 데이터 (선택적 - 비교 차트용)
        if (currentWeekJamoStatsData) {
          // jamo_stat 테이블에서 가져온 실시간 데이터 사용
          const mappedCurrentWeekStats = currentWeekJamoStatsData.accuracyRates.map(stat => ({
            jamo: stat.jamo,
            accuracy: stat.accuracyRate,
            count: stat.count
          }));
          setCurrentWeekJamoStats(mappedCurrentWeekStats);
        } else if (allJamoStatsData) {
          // fall back: weekly_jamo_stat 테이블 데이터를 이번 주 데이터로 사용
          const mappedAllStats = allJamoStatsData.accuracyRates.map(stat => ({
            jamo: stat.jamo,
            accuracy: stat.accuracyRate,
            count: stat.count
          }));
          setCurrentWeekJamoStats(mappedAllStats);
        } else {
          setCurrentWeekJamoStats([]);
        }

        // 저번 주 데이터 (선택적 - 비교 차트용)
        if (lastWeekJamoStatsData) {
          const mappedLastWeekStats = lastWeekJamoStatsData.accuracyRates.map(stat => ({
            jamo: stat.jamo,
            accuracy: stat.accuracyRate,
            count: stat.count
          }));
          setLastWeekJamoStats(mappedLastWeekStats);
        } else {
          setLastWeekJamoStats([]);
        }

        // 개선도 데이터 설정
        if (overallAccuracyData && bestJamosData && worstJamosData) {
          setOverallAccuracy({
            previous: overallAccuracyData.twoWeeksAgo,
            current: overallAccuracyData.lastWeek,
          });

          const mapJamoData = (apiData: JamoImprovementApiData): JamoImprovementData => ({
            jamo: apiData.jamo,
            previousAccuracy: apiData.twoWeeksAgo ?? 0,
            currentAccuracy: apiData.lastWeek ?? 0,
            improvement: apiData.improveRate ?? 0,
          });

          const bestJamos = bestJamosData.bestJamos.map(mapJamoData);
          const worstJamos = worstJamosData.worstJamos.map(mapJamoData);
          setJamoImprovements([...bestJamos, ...worstJamos]);
          setImprovementError(null);
        } else {
          setOverallAccuracy({ previous: null, current: null });
          setJamoImprovements([]);
          setImprovementError('개선도 데이터 로드 실패');
        }

        // Streak 계산 및 업데이트
        const streak = dailyStreakData?.currentStreak || 0;

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
        // 전체 실패 시 모든 에러 상태 설정
        setCurriculumError('커리큘럼 로드 실패');
        setLearningTimeError('학습 시간 로드 실패');
        setJamoStatsError('자모 통계 로드 실패');
        setImprovementError('개선도 로드 실패');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedStudentId]);

  // 재시도 함수들
  const handleRetryLearningTime = async () => {
    if (!selectedStudentId) return;
    setLearningTimeError(null);
    try {
      const [learningTimeData, dailyStreakData] = await Promise.all([
        getLearningTime(selectedStudentId),
        getDailyStreak(selectedStudentId),
      ]);
      setLearningTime(learningTimeData);
      setDailyStreak(dailyStreakData);

      // Streak 업데이트
      const streak = dailyStreakData.currentStreak;
      setStudents((prev) =>
        prev.map((student) =>
          student.id === selectedStudentId ? { ...student, streak } : student
        )
      );
    } catch (error) {
      setLearningTimeError('학습 시간 데이터 로드 실패');
    }
  };

  const handleRetryJamoStats = async () => {
    if (!selectedStudentId) return;
    setJamoStatsError(null);
    try {
      const results = await Promise.allSettled([
        getAllJamoStats(),
        getCurrentJamoStats(),
        getWeeklyJamoStat(selectedStudentId),
      ]);

      const allJamoStatsData = results[0].status === 'fulfilled' ? results[0].value : null;
      const currentWeekJamoStatsData = results[1].status === 'fulfilled' ? results[1].value : null;
      const lastWeekJamoStatsData = results[2].status === 'fulfilled' ? results[2].value : null;

      // currentWeekJamoStatsData 우선, allJamoStatsData는 fall back
      if (currentWeekJamoStatsData) {
        // 신규 학생 또는 이번 주 실시간 데이터가 있는 경우 (jamo_stat 테이블)
        setJamoStats(currentWeekJamoStatsData.accuracyRates);
        setJamoStatsError(null);
      } else if (allJamoStatsData) {
        // fall back: weekly_jamo_stat 데이터 사용 (배치 실행 완료된 기존 학생)
        setJamoStats(allJamoStatsData.accuracyRates);
        setJamoStatsError(null);
      } else {
        setJamoStats([]);
        setJamoStatsError('자모 통계 데이터 로드 실패');
      }

      // 이번 주 데이터 (선택적)
      if (currentWeekJamoStatsData) {
        const mappedCurrentWeekStats = currentWeekJamoStatsData.accuracyRates.map(stat => ({
          jamo: stat.jamo,
          accuracy: stat.accuracyRate,
          count: stat.count
        }));
        setCurrentWeekJamoStats(mappedCurrentWeekStats);
      } else {
        setCurrentWeekJamoStats([]);
      }

      // 저번 주 데이터 (선택적)
      if (lastWeekJamoStatsData) {
        const mappedLastWeekStats = lastWeekJamoStatsData.accuracyRates.map(stat => ({
          jamo: stat.jamo,
          accuracy: stat.accuracyRate,
          count: stat.count
        }));
        setLastWeekJamoStats(mappedLastWeekStats);
      } else {
        setLastWeekJamoStats([]);
      }
    } catch (error) {
      setJamoStatsError('자모 통계 데이터 로드 실패');
    }
  };

  const handleRetryImprovement = async () => {
    setImprovementError(null);
    try {
      const [bestJamosData, worstJamosData, overallAccuracyData] = await Promise.all([
        getBestJamos(),
        getWorstJamos(),
        getOverallAccuracy(),
      ]);

      setOverallAccuracy({
        previous: overallAccuracyData.twoWeeksAgo,
        current: overallAccuracyData.lastWeek,
      });

      const mapJamoData = (apiData: JamoImprovementApiData): JamoImprovementData => ({
        jamo: apiData.jamo,
        previousAccuracy: apiData.twoWeeksAgo ?? 0,
        currentAccuracy: apiData.lastWeek ?? 0,
        improvement: apiData.improveRate ?? 0,
      });

      const bestJamos = bestJamosData.bestJamos.map(mapJamoData);
      const worstJamos = worstJamosData.worstJamos.map(mapJamoData);
      setJamoImprovements([...bestJamos, ...worstJamos]);
    } catch (error) {
      setImprovementError('개선도 데이터 로드 실패');
    }
  };

  const handleRetryCurriculum = async () => {
    if (!selectedStudentId) return;
    setCurriculumError(null);
    try {
      const curriculumData = await getCurriculum(selectedStudentId);
      setCurriculum(curriculumData.curriculam || '커리큘럼 데이터가 없습니다.');
    } catch (error) {
      setCurriculumError('커리큘럼 로드 실패');
    }
  };

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
    problems: { current: dailyCompletedCount, target: 10 },
    time: {
      current: learningTime?.thisWeekLearningTime.daily[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]?.learningMinutes || 0,
      target: 20, // 고정값 (백엔드에서 제공하지 않음)
    },
    accuracy: { current: dailyAccuracy },
  };

  // 주간 목표 데이터
  const weeklyGoals = {
    problems: { current: weeklyGoalPercent, target: 50 },
    time: {
      current: learningTime?.thisWeekLearningTime.totalMinutes || 0,
      target: 100, // 고정값
    },
    accuracy: { current: weeklyAccuracy },
  };

  // 커리큘럼 객체 생성
  const curriculumObject = {
    title: curriculum.split('\n')[0] || '이번 주 학습 계획',
    description: curriculum.split('\n')
      .filter((line) => !line.trim().startsWith('-'))
      .join('\n')
      .trim(),
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
                  <WeeklyTimeChart
                    data={weeklyTimeData}
                    error={learningTimeError}
                    onRetry={handleRetryLearningTime}
                  />

                  {/* Weakness Alert with Expandable Chart */}
                  <WeaknessAlert
                    allJamoData={jamoStats.map(stat => ({
                      jamo: stat.jamo,
                      accuracy: stat.accuracyRate, // 여기서 'accuracyRate'를 'accuracy'로 변경
                      count: stat.count,
                    }))}
                    currentWeekData={currentWeekJamoStats}
                    lastWeekData={lastWeekJamoStats}
                    error={jamoStatsError}
                    onRetry={handleRetryJamoStats}
                  />
                </div>

                {/* Right Column - Improvement Card (full height) */}
                <div className="lg:col-span-1">
                  <ImprovementCard
                    overallImprovement={overallAccuracy}
                    jamoImprovements={jamoImprovements}
                    error={improvementError}
                    onRetry={handleRetryImprovement}
                  />
                </div>
              </div>

              {/* AI Curriculum */}
              <CurriculumCard
                curriculum={curriculumObject}
                currentGoal={parentGoal}
                onGoalChange={handleGoalChange}
                onViewAgentLog={handleViewAgentLog}
                error={curriculumError}
                onRetry={handleRetryCurriculum}
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
