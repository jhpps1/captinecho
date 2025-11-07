import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDailyProblems } from '../../api/adventureApi';
import type{ Problem } from '../../types/adventure';
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

  // studentId 검증
  const parsedStudentId = studentId ? parseInt(studentId, 10) : null;

  useEffect(() => {
    // studentId가 없거나 유효하지 않으면 에러
    if (!parsedStudentId || isNaN(parsedStudentId)) {
      setError('유효하지 않은 학생 ID입니다.');
      setIsLoading(false);
      return;
    }

    // 일일문제 데이터 fetch
    const fetchProblems = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getDailyProblems(parsedStudentId);

        // 문제가 없는 경우
        if (!data.problems || data.problems.length === 0) {
          setError('오늘의 문제가 없습니다.');
          setIsLoading(false);
          return;
        }

        setProblems(data.problems);
        setIsLoading(false);

        console.log(`✅ 일일문제 ${data.problems.length}개 로드 완료`);
      } catch (err) {
        console.error('❌ 일일문제 로드 실패:', err);
        setError('문제를 불러오는데 실패했습니다. 다시 시도해주세요.');
        setIsLoading(false);
      }
    };

    fetchProblems();
  }, [parsedStudentId]);

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
    <AdventureLayout adventureTypeId={currentAdventureTypeId}>
      <ProblemRunner
        problems={problems}
        mode="daily"
        studentId={parsedStudentId!}
        onAdventureTypeChange={setCurrentAdventureTypeId}
      />
    </AdventureLayout>
  );
};
