-- ==============================================
-- Migration 001: Add curriculum_structure column (최소 스키마 변경)
-- ==============================================
-- 목적: 구조화된 커리큘럼 저장 (파싱 제거)
-- 작성일: 2025-11-10
-- 변경 이유: 기존 스키마 최대한 유지, 필수 변경만 적용
-- ==============================================

BEGIN;

-- ==============================================
-- 1. weekly_personal_report에 curriculum_structure 컬럼 추가
-- ==============================================

ALTER TABLE weekly_personal_report
ADD COLUMN IF NOT EXISTS curriculum_structure JSONB;

COMMENT ON COLUMN weekly_personal_report.curriculum_structure IS '파싱 없이 읽을 구조화된 커리큘럼: {"monday": [{"type_id": 1, "count": 2}, ...]}';

COMMIT;

-- ==============================================
-- 완료 메시지
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Migration 001 완료!';
    RAISE NOTICE '- weekly_personal_report.curriculum_structure 추가 (JSONB)';
    RAISE NOTICE '- 레벨 평가: jamo_stat.weekly_accuracy_rate 활용';
    RAISE NOTICE '- day_problem: TEXT[] 유지 (Python에서 list 변환)';
    RAISE NOTICE '==============================================';
END $$;
