import { useEffect, useState, useRef } from 'react'; // [수정] useRef 추가
import { useParams, useNavigate } from 'react-router-dom';
import { getSuppleProblems, startAdventure, endAdventure } from '../api/adventureApi';
import type { Problem, SessionState } from '../types/adventure';
import { ProblemRunner } from '../components/adventure/ProblemRunner';
import { AdventureLayout } from '../components/adventure/AdventureLayout';
import { SuppleCompletionModal } from '../components/adventure/modals/SuppleCompletionModal';
import { ErrorModal } from '../components/adventure/modals/ErrorModal';
import LoadingScreen from '../components/LoadingScreen';

/**
 * SuppleRunner - 추가학습 문제 관리 페이지
 */
export const SuppleRunner = () => {
  const navigate = useNavigate();
  const { typeId } = useParams<{ typeId: string }>();

  const [studentId, setStudentId] = useState<number | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const parsedTypeId = typeId ? parseInt(typeId, 10) : null;

  // [추가] BGM 재생 로직 (마운트 시 실행)
  useEffect(() => {
    bgmRef.current = new Audio('/adventurepage/wave.mp3');
    bgmRef.current.loop = true; 
    bgmRef.current.volume = 0.15;

    const playPromise = bgmRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn("BGM 자동 재생 실패 (사용자 인터랙션 필요):", error);
      });
    }

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

  // studentId 및 typeId 검증
  useEffect(() => {
    const storedStudentId = sessionStorage.getItem('studentId');
    const parsedStudentId = storedStudentId ? parseInt(storedStudentId, 10) : null;

    if (!parsedStudentId || isNaN(parsedStudentId)) {
      setError('학생 정보를 불러올 수 없습니다. 다시 로그인해주세요.');
      setIsLoading(false);
    } else if (!parsedTypeId || isNaN(parsedTypeId) || parsedTypeId < 1 || parsedTypeId > 4) {
      setError('유효하지 않은 탐험 타입입니다. (1~4)');
      setIsLoading(false);
    } else {
      setStudentId(parsedStudentId);
      setIsLoading(false); 
    }
  }, [parsedTypeId]);

  // 세션 시작 핸들러
  const handleStartAdventure = async () => {
    if (!studentId || !parsedTypeId) {
      setError('유효하지 않은 ID입니다.');
      return;
    }

    // [추가] 시작 버튼 클릭 시 BGM 정지
    if (bgmRef.current) {
      bgmRef.current.pause();
    }

    try {
      setIsStarting(true);
      setError(null);

      console.log('🚀 추가학습 세션 시작 중...');

      const sessionId = await startAdventure(studentId, 'SUPPLE');

      setSession({
        sessionId,
        studyType: 'SUPPLE',
        isActive: true,
        startedAt: new Date().toISOString(),
      });

      console.log(`✅ 세션 시작됨 - Session ID: ${sessionId}`);

      const data = await getSuppleProblems(studentId, parsedTypeId);

      if (!data.problems || data.problems.length === 0) {
        setError('추가학습 문제가 없습니다.');
        return;
      }

      setProblems(data.problems);
      console.log(`✅ 추가학습 문제 ${data.problems.length}개 로드 완료 (타입 ${parsedTypeId})`);

    } catch (err) {
      console.error('❌ 세션 시작 실패:', err);
      setError('추가학습을 시작하는데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndAdventure = () => {
    console.log('✅ 10문제 완료, 완료 모달 표시');
    setShowCompletionModal(true);
  };

  const handleRetry = async () => {
    if (!studentId || !parsedTypeId) return;

    try {
      console.log('🔄 추가학습 다시 시작...');
      if (session.isActive) {
        await endAdventure(studentId);
      }

      setShowCompletionModal(false);
      setProblems([]);
      setSession({
        sessionId: null,
        studyType: null,
        isActive: false,
        startedAt: null,
      });

      const sessionId = await startAdventure(studentId, 'SUPPLE');
      setSession({
        sessionId,
        studyType: 'SUPPLE',
        isActive: true,
        startedAt: new Date().toISOString(),
      });

      const data = await getSuppleProblems(studentId, parsedTypeId);
      if (data.problems && data.problems.length > 0) {
        setProblems(data.problems);
        console.log(`✅ 새로운 문제 ${data.problems.length}개 로드 완료`);
      }
    } catch (err) {
      console.error('❌ 다시 시작 실패:', err);
      setError('문제를 다시 불러오는데 실패했습니다.');
    }
  };

  const handleGoHome = async () => {
    if (!studentId) return;
    try {
      if (session.isActive) {
        await endAdventure(studentId);
      }
      navigate('/student');
    } catch (err) {
      console.error('❌ 세션 종료 실패:', err);
      navigate('/student');
    }
  };

  // ... (렌더링 로직 기존과 동일) ...
  if (session.isActive) {
    return (
      <>
        <AdventureLayout
          adventureTypeId={parsedTypeId as 1 | 2 | 3 | 4}
          onExitConfirm={handleGoHome}
        >
          {(isTutorialMode) => (
            <ProblemRunner
              problems={problems}
              mode="supple"
              studentId={studentId!}
              isTutorialMode={isTutorialMode}
              onComplete={handleEndAdventure}
            />
          )}
        </AdventureLayout>

        <SuppleCompletionModal
          isOpen={showCompletionModal}
          onRetry={handleRetry}
          onGoHome={handleGoHome}
        />
      </>
    );
  }

  const showLoadingScreen = isLoading || !isVideoLoaded;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      
      {showLoadingScreen && <LoadingScreen />}

      <video
        src="/adventurepage/beforegamebackground.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-10"
        onLoadedData={() => {
            console.log("배경 비디오 로딩 완료");
            setIsVideoLoaded(true);
        }}
      />
      
      <div className="absolute inset-0 bg-black/30 -z-10" />

      {!isLoading && (
        <div 
            className="text-center p-30 rounded-2xl"
            style={{ 
            backgroundImage: `url('/adventurepage/layoutmap.png')`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center', 
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'transparent'
            }}
        >
            <h1 className="text-4xl font-bold text-blue-700 mb-4">추가학습</h1>
            <p className="text-xl text-[#623d14] mb-8">선택한 유형의 학습을 시작할 준비가 되셨나요?</p>
            <button
            onClick={handleStartAdventure}
            disabled={isStarting}
            className="px-8 py-4 bg-blue-500 text-white text-xl font-bold rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
            {isStarting ? '시작 중...' : '학습 시작하기'}
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