import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDailyProblems, startAdventure, endAdventure } from '../../api/adventureApi';
import type { Problem, SessionState } from '../../types/adventure';
import { ProblemRunner } from './ProblemRunner';
import { AdventureLayout } from './AdventureLayout';

/**
 * DailyRunner - 일일탐험 문제 관리 컴포넌트
 *
 * @description
 * - URL에서 studentId 추출
 * - 일일탐험 문제 10개 fetch (혼합 타입)
 * - 로딩/에러 처리
 * - ProblemRunner에 데이터 전달
 *
 * @route /daily/:studentId/:idx?
 */
export const DailyRunner = () => {
  const navigate = useNavigate();
  const { studentId, idx } = useParams<{ studentId: string; idx?: string }>();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAdventureTypeId, setCurrentAdventureTypeId] = useState<1 | 2 | 3 | 4 | undefined>();

  // 세션 관리 상태 추가
  const [session, setSession] = useState<SessionState>({
    sessionId: null,
    studyType: null,
    isActive: false,
    startedAt: null,
  });
  const [isStarting, setIsStarting] = useState(false);

  // TODO: API 개발되면 수정 예정
  // 임시 방편: localStorage로 완료 여부 관리
  // 추후 백엔드 API (GET /api/student/{studentId}/adventure/daily/status)로 대체
  const [isCompleted, setIsCompleted] = useState(false);

  // TODO: API 개발되면 수정 예정
  // localStorage 키 생성 헬퍼 함수들
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const getCompletionKey = () => {
    return `daily_completed_${parsedStudentId}_${getTodayString()}`;
  };

  const getSessionKey = () => {
    return `daily_session_${parsedStudentId}_${getTodayString()}`;
  };

  // TODO: API 개발되면 수정 예정
  // localStorage에 세션 정보 저장
  const saveSessionToStorage = (sessionData: SessionState, problemsData: Problem[]) => {
    const sessionKey = getSessionKey();
    const data = {
      session: sessionData,
      problems: problemsData,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(sessionKey, JSON.stringify(data));
    console.log('💾 세션 정보 localStorage에 저장:', sessionKey);
  };

  // TODO: API 개발되면 수정 예정
  // localStorage에서 세션 정보 불러오기
  const loadSessionFromStorage = () => {
    const sessionKey = getSessionKey();
    const saved = localStorage.getItem(sessionKey);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        console.log('📂 localStorage에서 세션 정보 복원:', data);
        return data;
      } catch (error) {
        console.error('❌ localStorage 파싱 실패:', error);
        return null;
      }
    }
    return null;
  };

  // TODO: API 개발되면 수정 예정
  // localStorage에서 세션 정보 삭제
  const clearSessionFromStorage = () => {
    const sessionKey = getSessionKey();
    localStorage.removeItem(sessionKey);
    console.log('🗑️ localStorage 세션 정보 삭제:', sessionKey);
  };

  // TODO: API 개발되면 수정 예정
  // 문제 완료 시 localStorage 업데이트
  const handleProblemComplete = (problemId: number) => {
    console.log(`✅ 문제 ${problemId} 완료, localStorage 업데이트`);
    // 현재 문제 목록과 세션 정보를 다시 저장
    saveSessionToStorage(session, problems);
  };

  // studentId 검증
  const parsedStudentId = studentId ? parseInt(studentId, 10) : null;

  // 페이지 이탈 시 세션 종료
  useEffect(() => {
    if (!parsedStudentId || !session.isActive) return;

    // 컴포넌트 언마운트 시 세션 종료 (다른 페이지로 이동)
    const cleanup = async () => {
      try {
        console.log('🚪 페이지 이탈 감지, 세션 종료 중...');
        await endAdventure(parsedStudentId);
      } catch (err) {
        console.error('❌ 페이지 이탈 시 세션 종료 실패:', err);
      }
    };

    // 브라우저 닫기/새로고침 감지
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (session.isActive) {
        // 세션이 활성화되어 있으면 동기적으로 종료 시도
        navigator.sendBeacon(`/api/student/${parsedStudentId}/adventure/end`);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanup(); // 언마운트 시 세션 종료
    };
  }, [session.isActive, parsedStudentId]);

// studentId 검증 및 세션 복원
  useEffect(() => {
    if (!parsedStudentId || isNaN(parsedStudentId)) {
      setError('유효하지 않은 학생 ID입니다.');
      setIsLoading(false);
      return;
    }

    // TODO: API 개발되면 수정 예정
    // 임시: localStorage에서 오늘의 세션 정보 및 완료 여부 확인
    // 추후 백엔드 API (GET /api/student/{studentId}/adventure/daily/status)로 대체

    // 1. 완료 여부 확인
    const completionKey = getCompletionKey();
    const completed = localStorage.getItem(completionKey);
    if (completed === 'true') {
      console.log('✅ 오늘의 일일문제 이미 완료됨');
      setIsCompleted(true);
      setIsLoading(false);
      return;
    }

    // 2. 진행 중인 세션 복원 시도
    const savedData = loadSessionFromStorage();
    if (savedData && savedData.session && savedData.problems) {
      console.log('🔄 진행 중인 세션 발견, 새 세션으로 이어하기 시작');

      // 새로운 세션 생성 (이전 세션은 종료되었으므로)
      startAdventure(parsedStudentId, 'DAILY')
        .then((sessionId) => {
          const newSession = {
            sessionId,
            studyType: 'DAILY' as const,
            isActive: true,
            startedAt: new Date().toISOString(),
          };

          setSession(newSession);
          setProblems(savedData.problems); // 문제는 복원

          // localStorage 업데이트 (새 세션 ID로)
          saveSessionToStorage(newSession, savedData.problems);

          console.log(`✅ 새 세션으로 이어하기 완료 - Session ID: ${sessionId}`);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('❌ 세션 재시작 실패:', err);
          setError('이어하기를 시작하는데 실패했습니다. 다시 시도해주세요.');
          setIsLoading(false);
        });
    } else {
      console.log('📝 새로운 세션 시작 대기');
      setIsLoading(false);
    }
  }, [parsedStudentId]);

  // 세션 시작 핸들러
  const handleStartAdventure = async () => {
    if (!parsedStudentId) {
      setError('유효하지 않은 학생 ID입니다.');
      return;
    }

    try {
      setIsStarting(true);
      setError(null);

      console.log('🚀 일일탐험 세션 시작 중...');

      // 1. 세션 생성
      const sessionId = await startAdventure(parsedStudentId, 'DAILY');

      setSession({
        sessionId,
        studyType: 'DAILY',
        isActive: true,
        startedAt: new Date().toISOString(),
      });

      console.log(`✅ 세션 시작됨 - Session ID: ${sessionId}`);

      // 2. 문제 불러오기
      const data = await getDailyProblems(parsedStudentId);

      if (!data.problems || data.problems.length === 0) {
        setError('오늘의 문제가 없습니다.');
        return;
      }

      setProblems(data.problems);
      console.log(`✅ 일일문제 ${data.problems.length}개 로드 완료`);

      // TODO: API 개발되면 수정 예정
      // 3. 세션 정보를 localStorage에 저장 (이어하기 기능용)
      const sessionData: SessionState = {
        sessionId,
        studyType: 'DAILY',
        isActive: true,
        startedAt: new Date().toISOString(),
      };
      saveSessionToStorage(sessionData, data.problems);

    } catch (err) {
      console.error('❌ 세션 시작 실패:', err);
      setError('탐험을 시작하는데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsStarting(false);
    }
  };

  // 세션 종료 핸들러
  const handleEndAdventure = async () => {
    if (!parsedStudentId || !session.isActive) return;

    try {
      console.log('🏁 세션 종료 중...');
      const success = await endAdventure(parsedStudentId);

      if (success) {
        console.log('✅ 세션 종료 성공');
        setSession({
          sessionId: null,
          studyType: null,
          isActive: false,
          startedAt: null,
        });

        // TODO: API 개발되면 수정 예정
        // 임시: localStorage에 완료 표시 및 세션 정보 삭제
        const completionKey = getCompletionKey();
        localStorage.setItem(completionKey, 'true');
        clearSessionFromStorage(); // 진행 중인 세션 정보 삭제
        setIsCompleted(true);
      }
    } catch (err) {
      console.error('❌ 세션 종료 실패:', err);
    }
  };

  // 완료 화면 (모든 문제를 다 풀었을 때)
  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-green-100">
        <div className="text-center bg-white p-10 rounded-2xl shadow-xl max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-green-600 mb-4">모든 문제 완료!</h1>
          <p className="text-xl text-gray-600 mb-2">오늘의 탐험을 성공적으로 마쳤어요!</p>
          <p className="text-sm text-gray-500 mb-8">내일 또 만나요! ✨</p>
          <button
            onClick={() => navigate('/student')}
            className="px-8 py-4 bg-green-500 text-white text-xl font-bold rounded-lg hover:bg-green-600 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 시작 대기 화면 (세션이 활성화되지 않았을 때) - 동영상 배경 추가
  if (!session.isActive && !isLoading && !error) {
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
            backgroundSize: 'cover', 
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

  // 에러 화면
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-2xl text-red-500 mb-4">⚠️ {error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            메인으로 돌아가기
          </button>
        </div>
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
          studentId={parsedStudentId!}
          onAdventureTypeChange={setCurrentAdventureTypeId}
          isTutorialMode={isTutorialMode}
          onComplete={handleEndAdventure}
          onProblemComplete={handleProblemComplete}  // TODO: API 개발되면 수정 예정
        />
      )}
    </AdventureLayout>
  );
};