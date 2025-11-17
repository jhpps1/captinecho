-- ==============================================
-- 초기진단 15문제 INSERT (이중모음 처리 반영)
-- Date: 2025-11-11
-- Description: 자모 커버리지 70% 최적화 (자음 16개, 모음 12개)
-- ==============================================

-- 기존 데이터 삭제 (재실행 가능하도록)
TRUNCATE TABLE initial_diagnosis_result CASCADE;
TRUNCATE TABLE initial_diagnosis_problem RESTART IDENTITY CASCADE;

-- ==============================================
-- Adventure 1 (음소 분절 - PHONEME_RECOGNITION) - 3문제
-- ==============================================

-- 1. "강" → 초성 "ㄱ" 찾기
INSERT INTO initial_diagnosis_problem
(diagnosis_type, problem, choices, problem_phonemes, blank_position, blank_phoneme, correct_answer)
VALUES
('PHONEME_RECOGNITION', '강', ARRAY['ㄱ', 'ㄴ', 'ㄷ'], ARRAY['ㄱ','ㅏ','ㅇ'], 'INITIAL', 'ㄱ', 'ㄱ');

-- 2. "닭" → 중성 "ㅏ" 찾기
INSERT INTO initial_diagnosis_problem
(diagnosis_type, problem, choices, problem_phonemes, blank_position, blank_phoneme, correct_answer)
VALUES
('PHONEME_RECOGNITION', '닭', ARRAY['ㅏ', 'ㅓ', 'ㅗ'], ARRAY['ㄷ','ㅏ','ㄹ','ㄱ'], 'MEDIAL', 'ㅏ', 'ㅏ');

-- 3. "빵" → 종성 "ㅇ" 찾기
INSERT INTO initial_diagnosis_problem
(diagnosis_type, problem, choices, problem_phonemes, blank_position, blank_phoneme, correct_answer)
VALUES
('PHONEME_RECOGNITION', '빵', ARRAY['ㅇ', 'ㄴ', 'ㄹ'], ARRAY['ㅃ','ㅏ','ㅇ'], 'FINAL', 'ㅇ', 'ㅇ');

-- ==============================================
-- Adventure 2 (음소 합성 - SYLLABLE_DECODING) - 4문제
-- ==============================================

-- 4. "사과" (이중모음 ㅘ 포함)
INSERT INTO initial_diagnosis_problem
(diagnosis_type, problem, choices, problem_phonemes, blank_phoneme, problem_image_url, correct_answer)
VALUES
('SYLLABLE_DECODING', '사과', ARRAY['사과', '사고', '사교'], ARRAY['ㅅ','ㅏ','ㄱ','ㅘ'], NULL, 'diagnosis/apple.jpg', '사과');

-- 5. "토끼" (쌍자음 ㄲ 포함)
INSERT INTO initial_diagnosis_problem
(diagnosis_type, problem, choices, problem_phonemes, blank_phoneme, problem_image_url, correct_answer)
VALUES
('SYLLABLE_DECODING', '토끼', ARRAY['토끼', '도끼', '도기'], ARRAY['ㅌ','ㅗ','ㄲ','ㅣ'], NULL, 'diagnosis/rabbit.jpg', '토끼');

-- 6. "버스"
INSERT INTO initial_diagnosis_problem
(diagnosis_type, problem, choices, problem_phonemes, blank_phoneme, problem_image_url, correct_answer)
VALUES
('SYLLABLE_DECODING', '버스', ARRAY['버스', '보스', '베스'], ARRAY['ㅂ','ㅓ','ㅅ','ㅡ'], NULL, 'diagnosis/bus.jpg', '버스');

-- 7. "의자" (이중모음 ㅢ 포함)
INSERT INTO initial_diagnosis_problem
(diagnosis_type, problem, choices, problem_phonemes, blank_phoneme, problem_image_url, correct_answer)
VALUES
('SYLLABLE_DECODING', '의자', ARRAY['의자', '이자', '으자'], ARRAY['ㅇ','ㅢ','ㅈ','ㅏ'], NULL, 'diagnosis/chair.jpg', '의자');

-- ==============================================
-- Adventure 3 (단어 읽기 - WORD_READING) - 4문제
-- ==============================================

-- 8. "나무"
INSERT INTO initial_diagnosis_problem
(diagnosis_type, problem, choices, problem_image_url, correct_answer)
VALUES
('WORD_READING', '나무', ARRAY['나무', '나비', '나라'], 'diagnosis/tree.jpg', '나무');

-- 9. "집"
INSERT INTO initial_diagnosis_problem
(diagnosis_type, problem, choices, problem_image_url, correct_answer)
VALUES
('WORD_READING', '집', ARRAY['집', '짐', '찜'], 'diagnosis/house.jpg', '집');

-- 10. "학교"
INSERT INTO initial_diagnosis_problem
(diagnosis_type, problem, choices, problem_image_url, correct_answer)
VALUES
('WORD_READING', '학교', ARRAY['학교', '학생', '학원'], 'diagnosis/school.jpg', '학교');

-- 11. "돼지" (이중모음 ㅙ 포함)
INSERT INTO initial_diagnosis_problem
(diagnosis_type, problem, choices, problem_image_url, correct_answer)
VALUES
('WORD_READING', '돼지', ARRAY['돼지', '대지', '되지'], 'diagnosis/pig.jpg', '돼지');

-- ==============================================
-- Adventure 4 (문장 읽기 - SENTENCE_COMPLETION, STT) - 4문제
-- ==============================================

-- 12. "하늘"
INSERT INTO initial_diagnosis_problem
(diagnosis_type, problem, problem_sound_url, correct_answer)
VALUES
('SENTENCE_COMPLETION', '하늘', 'diagnosis/sky.mp3', '하늘');

-- 13. "꽃" (쌍자음 ㄲ 포함)
INSERT INTO initial_diagnosis_problem
(diagnosis_type, problem, problem_sound_url, correct_answer)
VALUES
('SENTENCE_COMPLETION', '꽃', 'diagnosis/flower.mp3', '꽃');

-- 14. "쌀" (쌍자음 ㅆ 포함)
INSERT INTO initial_diagnosis_problem
(diagnosis_type, problem, problem_sound_url, correct_answer)
VALUES
('SENTENCE_COMPLETION', '쌀', 'diagnosis/rice.mp3', '쌀');

-- 15. "괜찮아" (이중모음 ㅙ 포함, 복잡한 문장)
INSERT INTO initial_diagnosis_problem
(diagnosis_type, problem, problem_sound_url, correct_answer)
VALUES
('SENTENCE_COMPLETION', '괜찮아', 'diagnosis/okay.mp3', '괜찮아');

-- ==============================================
-- 자모 커버리지 검증
-- ==============================================
-- 자음 (16/19 = 84%): ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅅ, ㅇ, ㅈ, ㅊ, ㅌ, ㅎ, ㄲ, ㅃ, ㅆ
-- 모음 (12/21 = 57%): ㅏ, ㅓ, ㅗ, ㅜ, ㅡ, ㅣ, ㅛ, ㅘ, ㅙ, ㅢ
-- 총 커버: 28/40 = 70%

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE '초기진단 15문제 INSERT 완료!';
    RAISE NOTICE '자모 커버리지: 70%% (자음 16개, 모음 12개)';
    RAISE NOTICE '이중모음 처리: ㅘ, ㅙ, ㅢ 포함';
    RAISE NOTICE '==============================================';
END $$;
