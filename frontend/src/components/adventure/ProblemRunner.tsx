import { useState, useEffect } from 'react';
import type { ComponentType } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Problem, AnswerResult } from '../../types/adventure';
import { submitSingleProblemResult, submitSessionCorrect } from '../../api/adventureApi';

// Adventure 컴포넌트 Props 인터페이스
export interface AdventureViewProps {
  problem: Problem;
  onSubmit: (answer: unknown, attemptCount: number) => void;
  isTutorialMode: boolean;
  mode: 'daily' | 'supple';
  studentId: number;
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

  // [수정됨] URL idx 파라미터와 currentIndex 동기화
  useEffect(() => {
    if (mode === 'daily') {
      // 일일문제는 진행도 URL에 반영 (새로고침 시 복원)
      // studentId를 URL에서 제거합니다.
      navigate(`/daily/${currentIndex}`, { replace: true });
    }
    // [수정됨] 의존성 배열에서 studentId 제거
  }, [currentIndex, mode, navigate]);

  // 정답 제출 핸들러
  const handleSubmit = async (answer: unknown, attempts: number) => {
    console.log(`문제 ${currentProblem.dayProblemId} 제출:`, { answer, attempts });

    // ========================================
    // 1. 학습 데이터 수집 (/session/correct API)
    // ========================================
    // Adventure 타입에 따라 학습 데이터 추출
    const adventureTypeId = currentProblem.adventureTypeId;
    const correctAnswer = currentProblem.correctAnswer[0]; // 정답
    const isCorrect = true; // Adventure 컴포넌트에서 정답 검증 후 onSubmit 호출됨

    try {
      // Adventure 타입별 데이터 추출 및 API 호출
      if (adventureTypeId === 1 || adventureTypeId === 2) {
        // Adventure1 (음소 분해) 또는 Adventure2 (빈칸 채우기)
        // - answer: 사용자가 선택한 자모 (예: "ㄱ")
        // - correctAnswer: 정답 자모 (예: "ㄱ")
        // - blankPosition: 음소 위치 (INITIAL/MEDIAL/FINAL)

        await submitSessionCorrect(studentId, {
          isCorrect: isCorrect,
          realJamo: correctAnswer, // 정답 자모
          confusionJamo: null,  // 정답이므로 혼동 자모 없음
          phonemePosition: currentProblem.blankPosition, // 음소 위치
          studyType: mode.toUpperCase() as 'DAILY' | 'SUPPLE', // 'daily' → 'DAILY'
          dayProblemId: currentProblem.dayProblemId,  // 문제 ID
        });
        console.log(`✅ 학습 데이터 수집 완료 (Adventure${adventureTypeId}): 자모=${correctAnswer}, 위치=${currentProblem.blankPosition}`);

      } else if (adventureTypeId === 3) {
        // Adventure3 (단어 선택)
        // - answer: 사용자가 선택한 단어 (예: "사과")
        // - correctAnswer: 정답 단어 (예: "사과")
        // - phonemePosition: null (단어 문제는 음소 위치 없음)
        // Adventure3은 자모통계에 일단 제외 -> 추후 다른 로직 구현

        await submitSessionCorrect(studentId, {
          isCorrect: isCorrect,
          realJamo: null,   // 정답 단어
          confusionJamo: null,  // 정답이므로 혼동 없음
          phonemePosition: null, // 단어 문제는 음소 위치 없음
          studyType: mode.toUpperCase() as 'DAILY' | 'SUPPLE', // 'daily' → 'DAILY'
          dayProblemId: currentProblem.dayProblemId,  // 문제 ID
        });
        console.log(`✅ 학습 데이터 수집 완료 (Adventure3): is_completed만 처리, jamo_stat 건너뜀`);

      } else if (adventureTypeId === 4) {
        // Adventure4 (말하기)
        // - answer: 'voice-answer' (고정값)
        // - questionText: 정답 단어
        // - phonemePosition: null
        // Adventure4는 자모통계에서 일단 제외 -> 추후 다른 로직 구현

        await submitSessionCorrect(studentId, {
          isCorrect: isCorrect,
          realJamo: null, // 정답 단어
          confusionJamo: null,  // 말하기는 혼동 자모 없음
          phonemePosition: null,  // 말하기 문제는 음소 위치 없음
          studyType: mode.toUpperCase() as 'DAILY' | 'SUPPLE', // 'daily' → 'DAILY'
          dayProblemId: currentProblem.dayProblemId,  // 문제 ID
        });
        console.log(`✅ 학습 데이터 수집 완료 (Adventure4): 단어=${currentProblem.questionText}`);
      }
    } catch (error) {
      console.error('❌ 학습 데이터 수집 실패:', error);
      // 학습 데이터 수집 실패해도 문제 진행은 계속
    }

    // ========================================
    // 2. 문제 완료 처리
    // ========================================
    // /session/correct API에서 is_completed를 이미 처리하므로
    // 별도의 result API 호출은 불필요
    // 로컬 상태 업데이트
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
      // ✅ 실제로 모든 문제가 완료되었는지 확인
      const allCompleted = problems.every(p => p.isCompleted);

      if (allCompleted) {
        // 모든 문제 완료
        console.log('🎉 모든 문제 완료!');
        setIsAllCompleted(true);

        // 👇 세션 종료 콜백 호출
        if (onComplete) {
          try {
            await onComplete();
            console.log('✅ 세션 종료 완료');
          } catch (error) {
            console.error('❌ 세션 종료 실패:', error);
          }
        }
      } else {
        // 미완료 문제가 있으면 첫 번째 미완료 문제로 이동
        console.log('⚠️ 아직 미완료 문제가 있습니다. 첫 번째 미완료 문제로 이동합니다.');
        const nextIncomplete = problems.findIndex(p => !p.isCompleted);
        if (nextIncomplete >= 0) {
          setCurrentIndex(nextIncomplete);
          setAttemptCount(1);
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
    // ✅ 현재 문제를 풀지 않았다면 경고
    if (!currentProblem.isCompleted) {
      alert('⚠️ 현재 문제를 먼저 풀어주세요!');
      return;
    }

    if (currentIndex < problems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setAttemptCount(1); // 시도 횟수 초기화
    }
  };
  // ==================================================

  // 완료 화면 - 부모 컴포넌트(DailyRunner/SuppleRunner)에서 관리
  // 완료 시 onComplete() 콜백이 호출되면 부모에서 완료 UI 처리
  if (isAllCompleted) {
    return null; // 부모 컴포넌트로 제어권 넘김
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
        mode={mode}
        studentId={studentId}
      />

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