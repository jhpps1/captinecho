import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSuppleProblems } from '../../api/adventureApi';
import type{ Problem } from '../../types/adventure';
import { ProblemRunner } from './ProblemRunner';
import { AdventureLayout } from './AdventureLayout';

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

  // studentId, typeId 검증
  const parsedStudentId = studentId ? parseInt(studentId, 10) : null;
  const parsedTypeId = typeId ? parseInt(typeId, 10) : null;

  useEffect(() => {
    // studentId나 typeId가 없거나 유효하지 않으면 에러
    if (!parsedStudentId || isNaN(parsedStudentId)) {
      setError('유효하지 않은 학생 ID입니다.');
      setIsLoading(false);
      return;
    }

    if (!parsedTypeId || isNaN(parsedTypeId) || parsedTypeId < 1 || parsedTypeId > 4) {
      setError('유효하지 않은 탐험 타입입니다. (1~4)');
      setIsLoading(false);
      return;
    }

    // 추가학습 문제 데이터 fetch
    const fetchProblems = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getSuppleProblems(parsedStudentId, parsedTypeId);

        // 문제가 없는 경우
        if (!data.problems || data.problems.length === 0) {
          setError('추가학습 문제가 없습니다.');
          setIsLoading(false);
          return;
        }

        setProblems(data.problems);
        setIsLoading(false);

        console.log(`✅ 추가학습 문제 ${data.problems.length}개 로드 완료 (타입 ${parsedTypeId})`);
      } catch (err) {
        console.error('❌ 추가학습 문제 로드 실패:', err);
        setError('문제를 불러오는데 실패했습니다. 다시 시도해주세요.');
        setIsLoading(false);
      }
    };

    fetchProblems();
  }, [parsedStudentId, parsedTypeId]);

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

  // ProblemRunner에 데이터 전달 (AdventureLayout으로 감싸기)
  // 추가학습은 모든 문제가 같은 타입이므로 parsedTypeId를 직접 사용
  return (
    <AdventureLayout adventureTypeId={parsedTypeId as 1 | 2 | 3 | 4}>
      <ProblemRunner
        problems={problems}
        mode="supple"
        studentId={parsedStudentId!}
      />
    </AdventureLayout>
  );
};
