import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import PINInputModal from '../components/protector/PINInputModal';
import PINRecoveryModal from '../components/protector/modals/PINRecoveryModal';
import StudentSidebar from '../components/protector/StudentSidebar';
import StudentCard from '../components/protector/StudentCard';
import StreakCalendar from '../components/protector/StreakCalendar';
import StudyGoalsCard from '../components/protector/StudyGoalsCard';
import WeeklyLearningSection from '../components/protector/WeeklyLearningSection';
import WeeklyComparisonChart from '../components/protector/WeeklyComparisonChart';
import AIAgentSection from '../components/protector/AIAgentSection';
import type { Student, WeeklyActivity, StudyGoal } from '../mocks/protectorData';
import {
  mockStudyGoals,
  mockJamoStats
} from '../mocks/protectorData';
import {
  getCurriculum,
  getDiscussion,
  getLearningTime,
  getDailyGoalCount,
  getDailyCompletedCount,
  getWeeklyGoalPercent
} from '../api/dashboardApi';
import type { LearningTimeResponse } from '../api/dashboardApi';
import { getStudents, type StudentResponse } from '../api/protectorApi';

/**
 * 이번 주 연속 학습일 계산
 * 가장 최근 학습한 날부터 역순으로 연속된 학습일을 카운트
 */
const calculateWeeklyStreak = (activities: WeeklyActivity[]): number => {
  if (!activities || activities.length === 0) return 0;

  // 오늘 날짜 찾기
  const today = new Date().toISOString().split('T')[0];
  const todayIndex = activities.findIndex(a => a.date === today);

  let streak = 0;
  let startCounting = false;

  // 오늘부터 역순으로 순회
  const startIndex = todayIndex >= 0 ? todayIndex : activities.length - 1;

  for (let i = startIndex; i >= 0; i--) {
    if (activities[i].completed) {
      startCounting = true;
      streak++;
    } else if (startCounting) {
      // 학습일을 세다가 안 한 날을 만나면 중단
      break;
    }
    // startCounting이 false면 아직 학습 시작 안 한 날들이므로 계속 스킵
  }

  return streak;
};

export default function ProtectorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPinModal, setShowPinModal] = useState(false); // 임시로 false로 변경
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showNewPinModal, setShowNewPinModal] = useState(false);
  const [showConfirmPinModal, setShowConfirmPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(true); // 임시로 true로 변경

  // 학생 목록 상태
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const lastLocationKey = useRef<string | undefined>(undefined);

  // API 데이터 상태
  const [curriculum, setCurriculum] = useState<string>('');
  const [discussion, setDiscussion] = useState<string>('');
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity[]>([]);
  const [studyGoals, setStudyGoals] = useState<StudyGoal[]>(mockStudyGoals); // 일일/주간 목표
  const [learningTime, setLearningTime] = useState<LearningTimeResponse | null>(null); // 주간 학습 시간
  const [isLoading, setIsLoading] = useState(false);

  const handlePinSubmit = (pin: string) => {
    console.log('PIN 입력:', pin);
    // TODO: 실제 PIN 인증 API 호출
    // 임시로 아무 PIN이나 허용
    setIsAuthenticated(true);
    setShowPinModal(false);
    alert(`PIN 인증 성공: ${pin}`);
  };

  const handleForgotPin = () => {
    setShowPinModal(false);
    setShowRecoveryModal(true);
  };

  const handleVerificationSubmit = (code: string) => {
    console.log('인증 코드:', code);
    // TODO: 실제 인증 코드 검증 API 호출
    setShowRecoveryModal(false);
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
      setShowPinModal(true);
      setNewPin('');
    } else {
      alert('PIN이 일치하지 않습니다. 다시 입력해주세요.');
      setShowConfirmPinModal(false);
      setShowNewPinModal(true);
    }
  };

  const handleResendCode = () => {
    alert('인증 번호가 재발송되었습니다.');
    // TODO: 실제 인증 번호 재발송 API 호출
  };

  const handleRecoveryCancel = () => {
    setShowRecoveryModal(false);
    setShowPinModal(true);
  };

  const handleClose = () => {
    setShowPinModal(false);
    alert('PIN 입력이 취소되었습니다.');
    // TODO: 이전 페이지로 이동 또는 로그인 페이지로 리다이렉트
  };

  // 컴포넌트 마운트 시 학생 목록 로드
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      try {
        const response = await getStudents();

        // StudentResponse를 Student 타입으로 변환
        const studentList: Student[] = response.students.map(s => ({
          id: s.studentId,
          lastName: s.name.charAt(0), // 이름의 첫 글자를 성으로 사용
          fullName: s.name,
          level: s.level || 0,
          streak: 0, // TODO: 연속 학습 일수는 나중에 API에서 받아오기
          profileImage: s.profileImage,
          grade: s.grade || '미취학'
        }));

        setStudents(studentList);
        console.log('✅ 학생 목록 로드 완료:', studentList);
      } catch (error) {
        console.error('❌ 학생 목록 로드 실패:', error);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, []);

  // location.state에서 전달된 학생이 있으면 선택, 없으면 첫 번째 학생 선택
  // location.key가 변경되었을 때만 실행 (페이지 새로 로드 or 다른 페이지에서 navigate)
  useEffect(() => {
    if (students.length === 0) return;

    // location.key가 동일하면 이미 처리했으므로 skip
    if (lastLocationKey.current === location.key) return;

    lastLocationKey.current = location.key;

    const stateStudent = (location.state as { selectedStudent?: Student })?.selectedStudent;
    if (stateStudent) {
      // 전달된 학생 ID로 목록에서 찾기
      const foundStudent = students.find(s => s.id === stateStudent.id);
      if (foundStudent) {
        setSelectedStudent(foundStudent);
      } else {
        setSelectedStudent(students[0]);
      }
    } else if (!selectedStudent) {
      // selectedStudent가 없으면 첫 번째 학생 선택
      setSelectedStudent(students[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, location.key]);

  // 학생 선택 시 대시보드 데이터 로드
  useEffect(() => {
    if (!selectedStudent) return;

    const fetchDashboardData = async () => {
      setIsLoading(true);
      let calculatedStreak = 0;
      try {
        // 6개 API 병렬 호출
        const [
          curriculumData,
          discussionData,
          learningTimeData,
          dailyGoalData,
          dailyCompletedData,
          weeklyPercentData
        ] = await Promise.all([
          getCurriculum(selectedStudent.id),
          getDiscussion(selectedStudent.id),
          getLearningTime(selectedStudent.id),
          getDailyGoalCount(selectedStudent.id),
          getDailyCompletedCount(selectedStudent.id),
          getWeeklyGoalPercent(selectedStudent.id)
        ]);

        // 커리큘럼 설정
        setCurriculum(curriculumData.curriculam || '커리큘럼 데이터가 없습니다.');

        // 협의 로그 설정
        setDiscussion(discussionData.discussion || '협의 로그가 없습니다.');

        // 학습 시간 데이터 저장 (차트용)
        setLearningTime(learningTimeData);

        // 학습 시간 데이터를 WeeklyActivity 형식으로 변환
        const activityData = convertToWeeklyActivity(learningTimeData);
        calculatedStreak = calculateWeeklyStreak(activityData);
        setWeeklyActivity(activityData);

        // students 배열에서 현재 학생의 streak 업데이트
        setStudents(prevStudents =>
          prevStudents.map(student =>
            student.id === selectedStudent.id
              ? { ...student, streak: calculatedStreak }
              : student
          )
        );

        // 학습 목표 데이터 설정
        const goalsData: StudyGoal[] = [
          {
            type: 'daily',
            target: dailyGoalData.todayGoalCount,
            current: dailyCompletedData.completedCount,
            unit: '개' // 문제 개수
          },
          {
            type: 'daily',
            target: 30, // 일일 학습 시간 목표 (30분 고정)
            current: learningTimeData.thisWeekLearningTime.daily[new Date().getDay()]?.learningMinutes || 0,
            unit: '분' // 학습 시간
          },
          {
            type: 'weekly',
            target: 100, // TODO: 주간 목표는 백분율이므로 100 고정
            current: weeklyPercentData.weekGoalPercent,
            unit: '%'
          }
        ];
        setStudyGoals(goalsData);

        console.log('✅ 대시보드 데이터 로드 완료:', {
          curriculum: curriculumData,
          discussion: discussionData,
          learningTime: learningTimeData,
          dailyGoal: dailyGoalData,
          dailyCompleted: dailyCompletedData,
          weeklyPercent: weeklyPercentData
        });
      } catch (error) {
        console.error('❌ 대시보드 데이터 로드 실패:', error);
        // 에러 발생 시 빈 데이터 설정
        setCurriculum('데이터를 불러올 수 없습니다.');
        setDiscussion('데이터를 불러올 수 없습니다.');
        setWeeklyActivity([]);
        setStudyGoals(mockStudyGoals); // 에러 시 mock 데이터 사용
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedStudent]);

  // 학습 시간 API 데이터를 WeeklyActivity 형식으로 변환
  const convertToWeeklyActivity = (data: LearningTimeResponse): WeeklyActivity[] => {
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const today = new Date();
    const currentDay = today.getDay(); // 0=일요일, 1=월요일, ...

    // 이번 주 월요일 찾기
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((currentDay + 6) % 7));

    return data.thisWeekLearningTime.daily.map((day, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);

      return {
        date: date.toISOString().split('T')[0], // YYYY-MM-DD 형식
        studyTime: day.learningMinutes,
        completed: day.learningMinutes > 0
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* PIN 입력 모달 */}
      {showPinModal && (
        <PINInputModal
          onSubmit={handlePinSubmit}
          onForgotPin={handleForgotPin}
          onClose={handleClose}
        />
      )}

      {/* PIN 복구 모달 */}
      {showRecoveryModal && (
        <PINRecoveryModal
          onSubmit={handleVerificationSubmit}
          onResend={handleResendCode}
          onCancel={handleRecoveryCancel}
        />
      )}

      {/* 새 PIN 설정 모달 (Wireframe 3) */}
      {showNewPinModal && (
        <PINInputModal
          title="설정"
          subtitle="보호자 PIN 번호"
          description="새 비밀번호를 입력해주세요"
          onSubmit={handleNewPinSubmit}
        />
      )}

      {/* PIN 확인 모달 (Wireframe 4) */}
      {showConfirmPinModal && (
        <PINInputModal
          title="설정"
          subtitle="보호자 PIN 번호"
          description="변경된 비밀번호를 한번 더 입력해주세요"
          onSubmit={handleConfirmPinSubmit}
        />
      )}

      {/* 메인 대시보드 (인증 후 표시) */}
      {isAuthenticated && (
        <div className="flex">
          {/* 왼쪽 사이드바 */}
          <StudentSidebar
            students={students}
            selectedStudent={selectedStudent}
            onSelectStudent={setSelectedStudent}
            onSettings={() => navigate('/protector/settings')}
            onLogout={() => {
              // 액세스 토큰 삭제
              localStorage.removeItem('accessToken');
              sessionStorage.removeItem('accessToken');
              Cookies.remove('accessToken');

              // 홈 화면으로 리다이렉트
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

            {/* 메인 콘텐츠 */}
            {selectedStudent && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 왼쪽 컬럼 */}
                <div className="space-y-6">
                  {/* 연속 학습 캘린더 */}
                  <StreakCalendar
                    weeklyActivity={weeklyActivity.length > 0 ? weeklyActivity : []}
                    streak={selectedStudent.streak}
                  />

                  {/* 학습 목표 카드 */}
                  <StudyGoalsCard goals={studyGoals} />

                  {/* 주간 학습 시간 비교 차트 */}
                  {learningTime && (
                    <WeeklyComparisonChart
                      lastWeek={learningTime.lastWeekLearningTime.daily.map(d => d.learningMinutes)}
                      thisWeek={learningTime.thisWeekLearningTime.daily.map(d => d.learningMinutes)}
                      days={['월', '화', '수', '목', '금', '토', '일']}
                    />
                  )}

                  {/* 지난주 학습 분석 */}
                  <WeeklyLearningSection
                    averageAccuracy={83}
                    difficultJamos={mockJamoStats}
                    onDetailClick={() => navigate('/protector/learning-analysis')}
                  />
                </div>

                {/* 오른쪽 컬럼 */}
                <div className="space-y-6">
                  {/* AI Agent 섹션 */}
                  <AIAgentSection
                    curriculum={curriculum}
                    discussion={discussion}
                    isLoading={isLoading}
                    onLogClick={() => navigate('/protector/ai-agent-log')}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
