import { useState, useEffect } from 'react';
import type { ComponentType } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Problem, AnswerResult } from '../../types/adventure';
import { submitSingleProblemResult } from '../../api/adventureApi';

// Adventure 컴포넌트 Props 인터페이스
export interface AdventureViewProps {
  problem: Problem;
  onSubmit: (answer: unknown, attemptCount: number) => void;
  isTutorialMode: boolean;
}

// ProblemRunner Props
interface ProblemRunnerProps {
  problems: Problem[];
  mode: 'daily' | 'supple';
  studentId: number;
  onAdventureTypeChange?: (typeId: 1 | 2 | 3 | 4) => void; // 배경 변경을 위한 콜백
  isTutorialMode: boolean;
  onComplete?: () => void | Promise<void>; // 모든 문제 완료 시 호출되는 콜백
  onProblemComplete?: (problemId: number) => void; // TODO: API 개발되면 수정 예정 - 문제 하나 완료 시 호출되는 콜백 (localStorage 업데이트용)
}

// Adventure 컴포넌트 import
import { Adventure1 } from './Adventure1';
import { Adventure2 } from './Adventure2';
import { Adventure3 } from './Adventure3';
import { Adventure4 } from './Adventure4';

// adventureTypeId → Component 매핑
const ADVENTURE_VIEWS: Record<number, ComponentType<AdventureViewProps>> = {
  1: Adventure1, // 음소 분해
  2: Adventure2, // 빈칸 채우기
  3: Adventure3, // 단어 선택
  4: Adventure4, // 말하기
};

/**
 * ProblemRunner - 문제 실행 총괄 컴포넌트
 *
 * @description
 * - 문제 배열을 받아 순차적으로 표시
 * - adventureTypeId에 따라 Adventure1~4 컴포넌트 동적 렌더링
 * - 현재 문제 인덱스 관리 및 진행도 복원 (URL idx 파라미터)
 * - 정답/오답 처리 및 시도 횟수 추적
 * - 완료 시 결과를 백엔드로 제출
 *
 * @param problems - 문제 배열 (10개)
 * @param mode - 'daily' (일일문제) | 'supple' (추가학습)
 * @param studentId - 학생 ID
 */
export const ProblemRunner = ({ problems, mode, studentId, onAdventureTypeChange, isTutorialMode, onComplete, onProblemComplete }: ProblemRunnerProps) => {
  const navigate = useNavigate();
  const { idx } = useParams<{ idx?: string }>();

  // TODO: API 개발되면 수정 예정
  // 현재 문제 인덱스 (이어하기 기능: 첫 번째 미완료 문제부터 시작)
  const [currentIndex, setCurrentIndex] = useState(() => {
    // localStorage에서 세션을 복원한 경우, 첫 번째 미완료 문제부터 시작
    const firstIncompleteIndex = problems.findIndex(p => !p.isCompleted);

    // 미완료 문제가 있으면 그 인덱스로, 없으면 0번부터
    const startIndex = firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0;

    console.log(`🎯 시작 인덱스: ${startIndex} (전체 ${problems.length}문제)`);
    return startIndex;
  });

  // 현재 문제의 시도 횟수 추적
  const [attemptCount, setAttemptCount] = useState(1);

  // 완료된 문제 결과 저장
  const [completedResults, setCompletedResults] = useState<AnswerResult[]>([]);

  // 모든 문제 완료 여부
  const [isAllCompleted, setIsAllCompleted] = useState(false);

  const currentProblem = problems[currentIndex];

  // 현재 문제의 adventureTypeId가 변경될 때마다 부모에게 알림 (배경 변경용)
  useEffect(() => {
    if (currentProblem && onAdventureTypeChange) {
      onAdventureTypeChange(currentProblem.adventureTypeId);
    }
  }, [currentProblem, onAdventureTypeChange]);

  // URL idx 파라미터와 currentIndex 동기화
  useEffect(() => {
    if (mode === 'daily') {
      // 일일문제는 진행도 URL에 반영 (새로고침 시 복원)
      navigate(`/daily/${studentId}/${currentIndex}`, { replace: true });
    }
  }, [currentIndex, mode, studentId, navigate]);

  // 정답 제출 핸들러
  const handleSubmit = async (answer: unknown, attempts: number) => {
    console.log(`문제 ${currentProblem.dayProblemId} 제출:`, { answer, attempts });

    // 결과 데이터 생성
    const result: AnswerResult = {
      dayProblemId: currentProblem.dayProblemId,
      studentId: currentProblem.studentId,
      isCorrect: true, // 프론트엔드에서 검증 완료 후 호출되므로 true
      attemptCount: attempts,
      submittedAt: new Date().toISOString(),
    };

    // TODO: API 개발되면 수정 예정
    // 현재: POST /api/student/{studentId}/adventure/result 엔드포인트 미구현 (404 에러)
    // 추후: 백엔드 API 구현 후 isCompleted 필드 업데이트 처리
    // ✅ 매 문제마다 즉시 백엔드에 제출 시도
    try {
      await submitSingleProblemResult(studentId, result);
      console.log(`✅ 문제 ${currentProblem.dayProblemId} 결과 제출 완료`);

      // 제출 성공 후 로컬 상태에도 기록
      setCompletedResults((prev) => [...prev, result]);
    } catch (error) {
      console.error(`❌ 문제 ${currentProblem.dayProblemId} 결과 제출 실패:`, error);
      // TODO: 에러 처리 (재시도, 사용자 알림 등)
      // 일단 로컬에는 저장하고 계속 진행
      setCompletedResults((prev) => [...prev, result]);
    }

    // TODO: API 개발되면 수정 예정
    // 임시: 현재 문제를 완료 상태로 표시하고 부모에게 알림 (localStorage 업데이트용)
    currentProblem.isCompleted = true;
    if (onProblemComplete) {
      onProblemComplete(currentProblem.dayProblemId);
    }

    // 다음 문제로 이동 또는 완료 처리
    if (currentIndex < problems.length - 1) {
      // 다음 문제로
      setCurrentIndex((prev) => prev + 1);
      setAttemptCount(1); // 시도 횟수 초기화
    } else {
      // 모든 문제 완료
      console.log('🎉 모든 문제 완료!');
      setIsAllCompleted(true);

      // 👇 추가: 세션 종료 콜백 호출
      if (onComplete) {
        try {
          await onComplete();
          console.log('✅ 세션 종료 완료');
        } catch (error) {
          console.error('❌ 세션 종료 실패:', error);
        }
      }
    }
  };

  // 오답 처리 (시도 횟수 증가)
  const handleWrongAnswer = () => {
    setAttemptCount((prev) => prev + 1);
  };

  // ========개발자용 버튼 : 추후 삭제 예정 ===============
  // 개발자용: 이전 문제로 이동
  const handlePrevProblem = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setAttemptCount(1); // 시도 횟수 초기화
    }
  };

  // 개발자용: 다음 문제로 이동
  const handleNextProblem = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setAttemptCount(1); // 시도 횟수 초기화
    }
  };
  // ==================================================
  
  // 완료 화면 - DailyRunner에서 관리하므로 여기서는 제거
  // 완료 시 onComplete() 콜백이 호출되어 DailyRunner의 isCompleted가 true로 설정됨
  if (isAllCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-4"></div>
        <p className="text-xl text-gray-600">완료 처리 중...</p>
      </div>
    );
  }

  // 문제가 없는 경우
  if (!currentProblem) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-500">문제를 불러올 수 없습니다.</p>
      </div>
    );
  }

  // adventureTypeId에 맞는 컴포넌트 선택
  const AdventureComponent = ADVENTURE_VIEWS[currentProblem.adventureTypeId];

  if (!AdventureComponent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-red-500">
          지원하지 않는 문제 유형입니다: {currentProblem.adventureTypeId}
        </p>
      </div>
    );
  }

  // 문제 렌더링
  return (
    <div className="w-full">
      {/* 진행도 표시 */}
      <div className="fixed top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md z-50">
        <span className="text-sm font-semibold">
          {currentIndex + 1} / {problems.length}
        </span>
      </div>

      {/* Adventure 컴포넌트 렌더링 */}
      <AdventureComponent
        key={currentProblem.dayProblemId}
        problem={currentProblem}
        onSubmit={(answer) => handleSubmit(answer, attemptCount)}
        isTutorialMode={isTutorialMode}
      />

      {/* 개발용: 오답 버튼 (실제로는 각 Adventure 컴포넌트 내부에서 처리) */}
      <div className="fixed bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md z-50">
        <button
          onClick={handleWrongAnswer}
          className="text-sm text-red-500 hover:text-red-700"
        >
          오답 처리 (시도: {attemptCount})
        </button>
      </div>

      {/* 개발용: 문제 네비게이션 버튼 */}
      <div className="fixed bottom-4 right-4 flex gap-2 z-50">
        <button
          onClick={handlePrevProblem}
          disabled={currentIndex === 0}
          className="px-3 py-2 bg-white rounded-lg shadow-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
        >
          ◀ 이전
        </button>
        <button
          onClick={handleNextProblem}
          disabled={currentIndex >= problems.length - 1}
          className="px-3 py-2 bg-white rounded-lg shadow-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
        >
          다음 ▶
        </button>
      </div>
    </div>
  );
};
