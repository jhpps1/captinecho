import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSuppleProblems, startAdventure, endAdventure } from '../api/adventureApi';
import type { Problem, SessionState } from '../types/adventure';
import { ProblemRunner } from '../components/adventure/ProblemRunner';
import { AdventureLayout } from '../components/adventure/AdventureLayout';
import { SuppleCompletionModal } from '../components/adventure/modals/SuppleCompletionModal';
import { ErrorModal } from '../components/adventure/modals/ErrorModal';

/**
 * SuppleRunner - 추가학습 문제 관리 페이지
 *
 * @description
 * - URL에서 studentId, typeId 추출
 * - 특정 탐험 타입의 추가학습 문제 10개 fetch
 * - 로딩/에러 처리
 * - ProblemRunner에 데이터 전달
 *
 * @route /adventure/:studentId/:typeId
 */
export const SuppleRunner = () => {
  const navigate = useNavigate();
  // [수정됨] typeId만 useParams에서 가져옵니다.
  const { typeId } = useParams<{ typeId: string }>();

  // [추가됨] studentId를 state로 관리합니다.
  const [studentId, setStudentId] = useState<number | null>(null);

  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 세션 관리 상태 추가
  const [session, setSession] = useState<SessionState>({
    sessionId: null,
    studyType: null,
    isActive: false,
    startedAt: null,
  });

  const [isStarting, setIsStarting] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false); // 완료 모달 표시 여부

  // [수정됨] typeId만 파싱합니다.
  const parsedTypeId = typeId ? parseInt(typeId, 10) : null;

  // 페이지 이탈 시 세션 종료
  useEffect(() => {
    // [수정됨] parsedStudentId 대신 state의 studentId 사용
    if (!studentId || !session.isActive) return;

    // 컴포넌트 언마운트 시 세션 종료 (다른 페이지로 이동)
    const cleanup = async () => {
      try {
        console.log('🚪 페이지 이탈 감지, 세션 종료 중...');
        await endAdventure(studentId); // [수정됨]
      } catch (err) {
        console.error('❌ 페이지 이탈 시 세션 종료 실패:', err);
      }
    };

    // 브라우저 닫기/새로고침 감지
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (session.isActive) {
        // 세션이 활성화되어 있으면 동기적으로 종료 시도
        // [수정됨] URL에 studentId 동적 삽입
        navigator.sendBeacon(`/api/student/${studentId}/adventure/end`);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanup(); // 언마운트 시 세션 종료
    };
    // [수정됨] 의존성 배열 변경
  }, [session.isActive, studentId]);

  // [수정됨] studentId(세션 스토리지) 및 typeId(URL) 검증
  useEffect(() => {
    const storedStudentId = sessionStorage.getItem('studentId'); // "studentId" 키로 가정
    const parsedStudentId = storedStudentId ? parseInt(storedStudentId, 10) : null;

    if (!parsedStudentId || isNaN(parsedStudentId)) {
      setError('학생 정보를 불러올 수 없습니다. 다시 로그인해주세요.');
      setIsLoading(false);
    } else if (!parsedTypeId || isNaN(parsedTypeId) || parsedTypeId < 1 || parsedTypeId > 4) {
      setError('유효하지 않은 탐험 타입입니다. (1~4)');
      setIsLoading(false);
    } else {
      setStudentId(parsedStudentId); // [추가됨] 유효한 studentId를 state에 설정
      setIsLoading(false); // 초기 로딩 완료
    }
    // [수정됨] 의존성 배열 변경
  }, [parsedTypeId]);

  // 세션 시작 핸들러
  const handleStartAdventure = async () => {
    // [수정됨] state의 studentId 사용
    if (!studentId || !parsedTypeId) {
      setError('유효하지 않은 ID입니다.');
      return;
    }

    try {
      setIsStarting(true);
      setError(null);

      console.log('🚀 추가학습 세션 시작 중...');

      // 1. 세션 생성 (state의 studentId 사용)
      const sessionId = await startAdventure(studentId, 'SUPPLE');

      setSession({
        sessionId,
        studyType: 'SUPPLE',
        isActive: true,
        startedAt: new Date().toISOString(),
      });

      console.log(`✅ 세션 시작됨 - Session ID: ${sessionId}`);

      // 2. 문제 불러오기 (state의 studentId 사용)
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

  // 문제 완료 핸들러 (완료 시 호출)
  const handleEndAdventure = () => {
    // 세션 종료하지 않고 모달만 표시
    console.log('✅ 10문제 완료, 완료 모달 표시');
    setShowCompletionModal(true);
  };

  // "다시 10문제 풀기" 핸들러
  const handleRetry = async () => {
    if (!studentId || !parsedTypeId) return;

    try {
      console.log('🔄 추가학습 다시 시작...');

      // 1. 기존 세션 종료
      if (session.isActive) {
        await endAdventure(studentId);
      }

      // 2. 상태 초기화
      setShowCompletionModal(false);
      setProblems([]);
      setSession({
        sessionId: null,
        studyType: null,
        isActive: false,
        startedAt: null,
      });

      // 3. 새 세션 시작
      const sessionId = await startAdventure(studentId, 'SUPPLE');
      setSession({
        sessionId,
        studyType: 'SUPPLE',
        isActive: true,
        startedAt: new Date().toISOString(),
      });

      // 4. 새 문제 로드
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

  // "학생 대시보드로 돌아가기" 핸들러
  const handleGoHome = async () => {
    if (!studentId) return;

    try {
      // 세션 종료
      if (session.isActive) {
        await endAdventure(studentId);
      }
      // 대시보드로 이동
      navigate('/student');
    } catch (err) {
      console.error('❌ 세션 종료 실패:', err);
      navigate('/student'); // 에러가 나도 대시보드로 이동
    }
  };

  // 시작 대기 화면 (세션이 활성화되지 않았을 때)
  if (!session.isActive && !isLoading) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
        {/* 동영상 배경 */}
        <video
          src="/adventurepage/beforegamebackground.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />
        {/* 가독성을 위한 어두운 오버레이 (선택 사항) */}
        <div className="absolute inset-0 bg-black/30 -z-10" />

        {/* 기존 콘텐츠 (z-index가 비디오보다 높으므로 위에 표시됨) */}
        <div 
          className="text-center p-30 rounded-2xl"
          style={{ 
            backgroundImage: `url('/adventurepage/layoutmap.png')`, 
            backgroundSize: 'cover', // 이미지가 div를 꽉 채우도록
            backgroundPosition: 'center', // 이미지가 중앙에 오도록
            backgroundRepeat: 'no-repeat', // 이미지가 반복되지 않도록
            backgroundColor: 'transparent' // 기존 bg-white 대신 투명 배경
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
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-4"></div>
        <p className="text-xl text-gray-600">추가학습 문제를 불러오는 중...</p>
      </div>
    );
  }

  // ProblemRunner에 데이터 전달 (AdventureLayout으로 감싸기)
  // 추가학습은 모든 문제가 같은 타입이므로 parsedTypeId를 직접 사용
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

      {/* 완료 모달 */}
      <SuppleCompletionModal
        isOpen={showCompletionModal}
        onRetry={handleRetry}
        onGoHome={handleGoHome}
      />
    </>
  );
};