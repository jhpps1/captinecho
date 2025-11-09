import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSuppleProblems, startAdventure, endAdventure } from '../../api/adventureApi';
import type { Problem, SessionState } from '../../types/adventure';
import { ProblemRunner } from './ProblemRunner';
import { AdventureLayout } from './AdventureLayout';
import { CompletionModal } from './modals/CompletionModal';

/**
 * SuppleRunner - 추가학습 문제 관리 컴포넌트
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
  const { studentId, typeId } = useParams<{ studentId: string; typeId: string }>();

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
  const [isCompleted, setIsCompleted] = useState(false); // 완료 여부 추가
  // studentId, typeId 검증
  const parsedStudentId = studentId ? parseInt(studentId, 10) : null;
  const parsedTypeId = typeId ? parseInt(typeId, 10) : null;

  // studentId, typeId 검증만 수행 (자동 로드 제거)
  useEffect(() => {
    if (!parsedStudentId || isNaN(parsedStudentId)) {
      setError('유효하지 않은 학생 ID입니다.');
      setIsLoading(false);
    } else if (!parsedTypeId || isNaN(parsedTypeId) || parsedTypeId < 1 || parsedTypeId > 4) {
      setError('유효하지 않은 탐험 타입입니다. (1~4)');
      setIsLoading(false);
    } else {
      setIsLoading(false); // 초기 로딩 완료
    }
  }, [parsedStudentId, parsedTypeId]);

  // 세션 시작 핸들러
  const handleStartAdventure = async () => {
    if (!parsedStudentId || !parsedTypeId) {
      setError('유효하지 않은 ID입니다.');
      return;
    }

    try {
      setIsStarting(true);
      setError(null);

      console.log('🚀 추가학습 세션 시작 중...');

      // 1. 세션 생성
      const sessionId = await startAdventure(parsedStudentId, 'SUPPLE');

      setSession({
        sessionId,
        studyType: 'SUPPLE',
        isActive: true,
        startedAt: new Date().toISOString(),
      });

      console.log(`✅ 세션 시작됨 - Session ID: ${sessionId}`);

      // 2. 문제 불러오기
      const data = await getSuppleProblems(parsedStudentId, parsedTypeId);

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

  // 세션 종료 핸들러 (완료 시 호출)
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
        setIsCompleted(true); // 완료 상태 설정 → 모달 표시
      }
    } catch (err) {
      console.error('❌ 세션 종료 실패:', err);
    }
  };

  // 완료 모달 확인 버튼 클릭 시 학생 대시보드로 이동
  const handleCompletionConfirm = () => {
    navigate(`/student`);
  };
 // 시작 대기 화면 (세션이 활성화되지 않았을 때)
  if (!session.isActive && !isLoading && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50
  to-green-100">
        <div className="text-center bg-white p-10 rounded-2xl shadow-xl">
          <h1 className="text-4xl font-bold text-green-600 mb-4">📚 추가학습</h1>
          <p className="text-xl text-gray-600 mb-8">선택한 유형의 학습을 시작할 준비가 되셨나요?</p>
          <button
            onClick={handleStartAdventure}
            disabled={isStarting}
            className="px-8 py-4 bg-green-500 text-white text-xl font-bold rounded-lg hover:bg-green-600
  disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isStarting ? '시작 중...' : '학습 시작하기'}
          </button>
        </div>
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

  // 에러 화면
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-2xl text-red-500 mb-4">⚠️ {error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 완료 화면 - CompletionModal만 표시
  if (isCompleted) {
    return (
      <CompletionModal
        isOpen={true}
        onConfirm={handleCompletionConfirm}
      />
    );
  }

  // ProblemRunner에 데이터 전달 (AdventureLayout으로 감싸기)
  // 추가학습은 모든 문제가 같은 타입이므로 parsedTypeId를 직접 사용
  return (
    <AdventureLayout adventureTypeId={parsedTypeId as 1 | 2 | 3 | 4}>
      {(isTutorialMode) => (
        <ProblemRunner
          problems={problems}
          mode="supple"
          studentId={parsedStudentId!}
          isTutorialMode={isTutorialMode}
          onComplete={handleEndAdventure}
        />
      )}
    </AdventureLayout>
  );
};
