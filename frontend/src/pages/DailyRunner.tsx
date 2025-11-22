import { useEffect, useState, useRef } from 'react'; // [수정] useRef 추가
import { useParams, useNavigate } from 'react-router-dom';
import { getDailyProblems, startAdventure, endAdventure } from '../api/adventureApi';
import type { Problem, SessionState } from '../types/adventure';
import { ProblemRunner } from '../components/adventure/ProblemRunner';
import { AdventureLayout } from '../components/adventure/AdventureLayout';
import { ErrorModal } from '../components/adventure/modals/ErrorModal';
import LoadingScreen from '../components/LoadingScreen';

/**
 * DailyRunner - 일일탐험 문제 관리 페이지
 */
export const DailyRunner = () => {
  const navigate = useNavigate();
  const { idx } = useParams<{ idx?: string }>();

  const [studentId, setStudentId] = useState<number | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAdventureTypeId, setCurrentAdventureTypeId] = useState<1 | 2 | 3 | 4 | undefined>();

  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // [추가] BGM 관련 Ref
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  const [session, setSession] = useState<SessionState>({
    sessionId: null,
    studyType: null,
    isActive: false,
    startedAt: null,
  });
  const [isStarting, setIsStarting] = useState(false);
  const [isAllCompleted, setIsAllCompleted] = useState(false);

  // [추가] BGM 재생 로직 (마운트 시 실행)
  useEffect(() => {
    // 오디오 객체 생성
    bgmRef.current = new Audio('/adventurepage/wave.mp3');
    bgmRef.current.loop = true; // 반복 재생
    bgmRef.current.volume = 0.15; // 볼륨 설정 (필요시 조절)

    // 재생 시도
    const playPromise = bgmRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn("BGM 자동 재생 실패 (사용자 인터랙션 필요):", error);
      });
    }

    // 언마운트 시 정리 (Cleanup)
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
    };
  }, []);

  // ... (페이지 이탈 감지 useEffect 기존과 동일) ...
  useEffect(() => {
    if (!studentId || !session.isActive) return;
    const cleanup = async () => {
      try {
        console.log('🚪 페이지 이탈 감지, 세션 종료 중...');
        await endAdventure(studentId);
      } catch (err) {
        console.error('❌ 페이지 이탈 시 세션 종료 실패:', err);
      }
    };
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (session.isActive) {
        navigator.sendBeacon(`/api/student/${studentId}/adventure/end`);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanup();
    };
  }, [session.isActive, studentId]);

  // 1. studentId 검증
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

  // 2. API 기반 완료 여부 확인
  useEffect(() => {
    if (!studentId) return;

    const checkCompletion = async () => {
      try {
        console.log('🔍 API로 일일문제 완료 여부 확인 중...');
        const data = await getDailyProblems(studentId);

        if (!data.problems || data.problems.length === 0) {
          console.log('❌ 일일문제 데이터가 없음');
          setError('일일문제가 아직 준비되지 않았습니다.');
          setIsLoading(false);
          return;
        }

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

  const handleStartAdventure = async () => {
    if (!studentId) {
      setError('유효하지 않은 학생 ID입니다.');
      return;
    }
    
    // [추가] 시작 버튼 클릭 시 BGM 즉시 정지
    if (bgmRef.current) {
      bgmRef.current.pause();
    }

    try {
      setIsStarting(true);
      setError(null);
      console.log('🚀 일일탐험 세션 시작 중...');

      const sessionId = await startAdventure(studentId, 'DAILY');
      setSession({
        sessionId,
        studyType: 'DAILY',
        isActive: true,
        startedAt: new Date().toISOString(),
      });
      console.log(`✅ 세션 시작됨 - Session ID: ${sessionId}`);

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
      
      // [선택] 에러가 나서 시작을 못한 경우 다시 BGM을 틀고 싶다면 아래 주석 해제
      // if (bgmRef.current) bgmRef.current.play();
    } finally {
      setIsStarting(false);
    }
  };

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
        setIsAllCompleted(true);
      }
    } catch (err) {
      console.error('❌ 세션 종료 실패:', err);
    }
  };

  // ... (렌더링 로직 기존과 동일) ...
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

  if (session.isActive) {
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
  }

  const showLoadingScreen = isLoading || !isVideoLoaded;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      {showLoadingScreen && <LoadingScreen />}

      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/adventurepage/todaysgamebackground.mp4"
        onLoadedData={() => {
            console.log("배경 비디오 로딩 완료");
            setIsVideoLoaded(true);
        }}
      >
        Your browser does not support the video tag.
      </video>

      {!isLoading && (
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
      )}

      <ErrorModal
        isOpen={!!error}
        errorMessage={error || ''}
        onConfirm={() => navigate('/student')}
      />
    </div>
  );
};