-- ==============================================
-- Migration: Add fields to initial_diagnosis_problem table
-- Date: 2025-11-11
-- Description: Adventure 1, 2 문제에 필요한 필드 추가
-- ==============================================

-- initial_diagnosis_problem 테이블에 필드 추가
ALTER TABLE initial_diagnosis_problem
ADD COLUMN IF NOT EXISTS problem_phonemes TEXT[],           -- 음소 배열 (이중모음 포함)
ADD COLUMN IF NOT EXISTS blank_position VARCHAR(20),        -- 빈칸 위치 (INITIAL/MEDIAL/FINAL)
ADD COLUMN IF NOT EXISTS blank_phoneme VARCHAR(5);          -- 빈칸에 들어갈 음소

-- 코멘트 추가
COMMENT ON COLUMN initial_diagnosis_problem.problem_phonemes IS '음소 배열 (이중모음 포함), 예: [''ㅅ'',''ㅏ'',''ㄱ'',''ㅘ'']';
COMMENT ON COLUMN initial_diagnosis_problem.blank_position IS '빈칸 위치 (Adventure 1 전용): INITIAL(초성), MEDIAL(중성), FINAL(종성)';
COMMENT ON COLUMN initial_diagnosis_problem.blank_phoneme IS '빈칸에 들어갈 음소 (Adventure 1, 2 전용)';

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Migration 001 완료: initial_diagnosis_problem 테이블 필드 추가';
    RAISE NOTICE '추가된 필드: problem_phonemes, blank_position, blank_phoneme';
    RAISE NOTICE '==============================================';
END $$;
