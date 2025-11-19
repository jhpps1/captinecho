import { Brain, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import ParentGoalSelector from './ParentGoalSelector';
import { useState } from 'react';

interface CurriculumCardProps {
  curriculum: {
    title: string;
    description: string;
    goals: string[];
    createdAt: string;
  };
  currentGoal?: string | null;
  onGoalChange: (goal: string) => void;
  onViewAgentLog?: () => void;
  error?: string | null;
  onRetry?: () => void;
}

export default function CurriculumCard({
  curriculum,
  currentGoal,
  onGoalChange,
  onViewAgentLog,
  error,
  onRetry,
}: CurriculumCardProps) {
  // 에러 상태 처리
  if (error) {
    return (
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/20">
        <div className="flex flex-col items-center justify-center py-12 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle size={48} className="text-red-400 mb-4" />
          <p className="text-red-700 font-semibold font-pretendard mb-2">
            커리큘럼을 불러올 수 없습니다
          </p>
          <p className="text-sm text-red-600 font-pretendard mb-4">
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold font-pretendard hover:bg-red-700 transition-colors"
            >
              <RefreshCw size={16} />
              다시 시도
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/20">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
          <Brain size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-neutral-800 font-pretendard">
              AI 학습 커리큘럼
            </h3>
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-semibold">
              NEW
            </span>
          </div>
          <p className="text-sm text-neutral-600 font-pretendard">
            3명의 AI 에이전트가 협의하여 생성한 맞춤 학습 계획
          </p>
        </div>
        {onViewAgentLog && (
          <button
            onClick={onViewAgentLog}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            title="에이전트 로그 확인"
          >
            <FileText size={20} className="text-neutral-600" />
          </button>
        )}
      </div>

      {/* Curriculum Content */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <h4 className="font-bold text-neutral-800 font-pretendard mb-2">
          {curriculum.title}
        </h4>
        <p className="text-sm text-neutral-600 font-pretendard mb-3">
          {curriculum.description}
        </p>

        {/* Goals List */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-neutral-500 font-pretendard">
            이번 주 학습 목표
          </p>
          <ul className="space-y-2">
            {curriculum.goals.map((goal, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-neutral-700 font-pretendard"
              >
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Created At */}
        <p className="text-xs text-neutral-400 font-pretendard mt-3">
          생성 시간: {new Date(curriculum.createdAt).toLocaleString('ko-KR')}
        </p>
      </div>

      {/* Parent Goal Selector */}
      <ParentGoalSelector
        currentGoal={currentGoal}
        onChange={onGoalChange}
      />
    </div>
  );
}
