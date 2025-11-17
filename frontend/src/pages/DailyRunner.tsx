import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDailyProblems, startAdventure, endAdventure } from '../api/adventureApi';
import type { Problem, SessionState } from '../types/adventure';
import { ProblemRunner } from '../components/adventure/ProblemRunner';
import { AdventureLayout } from '../components/adventure/AdventureLayout';
import { ErrorModal } from '../components/adventure/modals/ErrorModal';

/**
 * DailyRunner - 일일탐험 문제 관리 페이지
 *
 * @description
 * - URL에서 idx 추출
 * - Session Storage에서 studentId 추출
 * - 일일탐험 문제 10개 fetch (혼합 타입)
 * - 로딩/에러 처리
 * - ProblemRunner에 데이터 전달
 *
 * @route /daily/:idx?
 */
export const DailyRunner = () => {
  const navigate = useNavigate();
  const { idx } = useParams<{ idx?: string }>();

  const [studentId, setStudentId] = useState<number | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAdventureTypeId, setCurrentAdventureTypeId] = useState<1 | 2 | 3 | 4 | undefined>();

  // 세션 관리 상태
  const [session, setSession] = useState<SessionState>({
    sessionId: null,
    studyType: null,
    isActive: false,
    startedAt: null,
  });
  const [isStarting, setIsStarting] = useState(false);

  // API 기반 완료 여부 (빈 배열이면 완료)
  const [isAllCompleted, setIsAllCompleted] = useState(false);

  // 페이지 이탈 시 세션 종료
  useEffect(() => {
    if (!studentId || !session.isActive) return;

    // 컴포넌트 언마운트 시 세션 종료 (다른 페이지로 이동)
    const cleanup = async () => {
      try {
        console.log('🚪 페이지 이탈 감지, 세션 종료 중...');
        await endAdventure(studentId);
      } catch (err) {
        console.error('❌ 페이지 이탈 시 세션 종료 실패:', err);
      }
    };

    // 브라우저 닫기/새로고침 감지
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (session.isActive) {
        // 세션이 활성화되어 있으면 동기적으로 종료 시도
        navigator.sendBeacon(`/api/student/${studentId}/adventure/end`);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanup(); // 언마운트 시 세션 종료
    };
  }, [session.isActive, studentId]);

  // 1. studentId 검증 (Session Storage)
  useEffect(() => {
    const storedStudentId = sessionStorage.getItem('studentId');
    const parsedStudentId = storedStudentId ? parseInt(storedStudentId, 10) : null;

    if (!parsedStudentId || isNaN(parsedStudentId)) {
      setError('학생 정보를 불러올 수 없습니다. 다시 로그인해주세요.');
      setIsLoading(false);
      return;
    }

    setStudentId(parsedStudentId);
  }, []);

  // 2. API 기반 완료 여부 확인 (studentId가 설정된 후 실행)
  useEffect(() => {
    if (!studentId) {
      return;
    }

    // API로 미완료 문제 조회
    const checkCompletion = async () => {
      try {
        console.log('🔍 API로 일일문제 완료 여부 확인 중...');
        const data = await getDailyProblems(studentId);

        // 빈 배열이면 문제 데이터가 없는 것으로 판단
        if (!data.problems || data.problems.length === 0) {
          console.log('❌ 일일문제 데이터가 없음');
          setError('일일문제가 아직 준비되지 않았습니다.');
          setIsLoading(false);
          return;
        }

        // 미완료 문제가 있으면 시작 대기 화면으로
        console.log(`📝 미완료 문제 ${data.problems.length}개 발견, 시작 대기 중`);
        setIsLoading(false);
      } catch (err) {
        console.error('❌ 완료 여부 확인 실패:', err);
        setError('문제를 불러오는데 실패했습니다. 다시 시도해주세요.');
        setIsLoading(false);
      }
    };

    checkCompletion();
  }, [studentId]);

  // 세션 시작 핸들러
  const handleStartAdventure = async () => {
    if (!studentId) {
      setError('유효하지 않은 학생 ID입니다.');
      return;
    }

    try {
      setIsStarting(true);
      setError(null);

      console.log('🚀 일일탐험 세션 시작 중...');

      // 1. 세션 생성
      const sessionId = await startAdventure(studentId, 'DAILY');

      setSession({
        sessionId,
        studyType: 'DAILY',
        isActive: true,
        startedAt: new Date().toISOString(),
      });

      console.log(`✅ 세션 시작됨 - Session ID: ${sessionId}`);

      // 2. 문제 불러오기
      const data = await getDailyProblems(studentId);

      if (!data.problems || data.problems.length === 0) {
        setError('오늘의 문제가 없습니다.');
        return;
      }

      setProblems(data.problems);
      console.log(`✅ 일일문제 ${data.problems.length}개 로드 완료`);

    } catch (err) {
      console.error('❌ 세션 시작 실패:', err);
      setError('탐험을 시작하는데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsStarting(false);
    }
  };

  // 세션 종료 핸들러
  const handleEndAdventure = async () => {
    if (!studentId || !session.isActive) return;

    try {
      console.log('🏁 세션 종료 중...');
      const success = await endAdventure(studentId);

      if (success) {
        console.log('✅ 세션 종료 성공');
        setSession({
          sessionId: null,
          studyType: null,
          isActive: false,
          startedAt: null,
        });

        // 완료 상태 설정 (완료 화면 표시)
        setIsAllCompleted(true);
      }
    } catch (err) {
      console.error('❌ 세션 종료 실패:', err);
    }
  };

  // 완료 화면 (모든 문제를 다 풀었을 때)
  if (isAllCompleted) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
        <video
          autoPlay
          loop
          muted
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/adventurepage/todaysgamebackground.mp4"
        >
          Your browser does not support the video tag.
        </video>
        <div
          className="relative text-center p-25 rounded-2xl z-10"
          style={{
            backgroundImage: `url('/adventurepage/layoutmap.png')`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'transparent'
          }}
        >
          <h1 className="text-4xl font-bold text-blue-900 mb-4">모든 탐험을 완료했어요!</h1>
          <p className="text-lg text-[#623d14] mb-8">내일 또 만나요!</p>
          <button
            onClick={() => navigate('/student')}
            className="px-8 py-4 bg-blue-500 text-white text-xl font-bold rounded-lg hover:bg-blue-600 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 시작 대기 화면 (세션이 활성화되지 않았을 때) - 동영상 배경 추가
  if (!session.isActive && !isLoading) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
        <video
          autoPlay
          loop
          muted
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/adventurepage/todaysgamebackground.mp4"
        >
          Your browser does not support the video tag.
        </video>
        <div
          className="relative text-center p-25 rounded-2xl z-10"
          style={{
            backgroundImage: `url('/adventurepage/layoutmap.png')`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            // Tailwind bg-white 대신 투명 배경으로
            backgroundColor: 'transparent'
          }}
        > {/* z-index를 줘서 동영상 위에 오도록 */}
          <h1 className="text-4xl font-bold text-blue-900 mb-4">일일탐험</h1>
          <h2 className="text-xl text-[#623d14] mb-8">오늘의 모험을 시작할 준비가 되셨나요?</h2>
          <button
            onClick={handleStartAdventure}
            disabled={isStarting}
            className="px-8 py-4 bg-blue-500 text-white text-xl font-bold rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isStarting ? '시작 중...' : '탐험 시작하기'}
          </button>
        </div>

        {/* 에러 모달 */}
        <ErrorModal
          isOpen={!!error}
          errorMessage={error || ''}
          onConfirm={() => navigate('/student')}
        />
      </div>
    );
  }

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-xl text-gray-600">문제를 불러오는 중...</p>
      </div>
    );
  }

  // ProblemRunner에 데이터 전달 (AdventureLayout으로 감싸기)
  return (
    <AdventureLayout
      adventureTypeId={currentAdventureTypeId}
      onExitConfirm={handleEndAdventure}
    >
      {(isTutorialMode) => (
        <ProblemRunner
          problems={problems}
          mode="daily"
          studentId={studentId!}
          onAdventureTypeChange={setCurrentAdventureTypeId}
          isTutorialMode={isTutorialMode}
          onComplete={handleEndAdventure}
        />
      )}
    </AdventureLayout>
  );
};
