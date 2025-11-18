-- =====================================================
-- Migration: 003_blank_position_trigger.sql
-- Author: Claude (AI Assistant)
-- Date: 2025-11-18
-- Description: blank_position 컬럼 빈 문자열 자동 NULL 변환 Trigger
-- =====================================================

-- 문제:
-- AI 서버가 day_problem 테이블에 INSERT 시 blank_position에 빈 문자열("") 저장
-- → Hibernate가 Enum(BlankPosition)으로 변환 실패
-- → IllegalArgumentException 발생 (500 에러)

-- 해결:
-- PostgreSQL Trigger로 빈 문자열을 자동으로 NULL로 변환
-- → BlankPositionConverter와 함께 이중 방어

-- =====================================================
-- Step 1: Trigger Function 생성
-- =====================================================

CREATE OR REPLACE FUNCTION convert_blank_position_empty_to_null()
RETURNS TRIGGER AS $$
BEGIN
    -- blank_position이 빈 문자열('')이면 NULL로 변환
    IF NEW.blank_position = '' THEN
        NEW.blank_position = NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION convert_blank_position_empty_to_null() IS
'day_problem 테이블의 blank_position 컬럼에 빈 문자열이 INSERT/UPDATE될 때 자동으로 NULL로 변환';

-- =====================================================
-- Step 2: Trigger 생성 (BEFORE INSERT OR UPDATE)
-- =====================================================

CREATE TRIGGER trg_blank_position_empty_to_null
BEFORE INSERT OR UPDATE ON day_problem
FOR EACH ROW
EXECUTE FUNCTION convert_blank_position_empty_to_null();

COMMENT ON TRIGGER trg_blank_position_empty_to_null ON day_problem IS
'AI 서버가 빈 문자열을 INSERT해도 자동으로 NULL로 변환하여 500 에러 방지';

-- =====================================================
-- Step 3: 기존 빈 문자열 데이터 정리 (선택사항)
-- =====================================================

-- 이미 저장된 빈 문자열을 NULL로 변경
-- (배포 서버에서는 이미 수동으로 실행됨)
UPDATE day_problem
SET blank_position = NULL
WHERE blank_position = '' OR LENGTH(blank_position) = 0;

-- =====================================================
-- 테스트 쿼리 (주석 해제하여 테스트 가능)
-- =====================================================

-- 빈 문자열 INSERT 테스트
/*
INSERT INTO day_problem (
    student_id, interest_id, adventure_type_id, assigned_date,
    problem_text, seq_no, level, problem_phonemes,
    blank_position, correct_answer, is_completed
)
VALUES (
    1, 1, 1, CURRENT_DATE,
    'TEST_빈문자열', 99, 1, ARRAY['ㅌ', 'ㅔ', 'ㅅ', 'ㅌ']::TEXT[],
    '', 'TEST', false
)
RETURNING day_problem_id, blank_position;
-- 예상 결과: blank_position = NULL
*/

-- 정상 값 INSERT 테스트
/*
INSERT INTO day_problem (
    student_id, interest_id, adventure_type_id, assigned_date,
    problem_text, seq_no, level, problem_phonemes,
    blank_position, correct_answer, is_completed
)
VALUES (
    1, 1, 1, CURRENT_DATE,
    'TEST_INITIAL', 100, 1, ARRAY['ㅌ', 'ㅔ', 'ㅅ', 'ㅌ']::TEXT[],
    'INITIAL', 'TEST', false
)
RETURNING day_problem_id, blank_position;
-- 예상 결과: blank_position = 'INITIAL'
*/

-- =====================================================
-- Rollback (필요 시)
-- =====================================================

/*
DROP TRIGGER IF EXISTS trg_blank_position_empty_to_null ON day_problem;
DROP FUNCTION IF EXISTS convert_blank_position_empty_to_null();
*/
