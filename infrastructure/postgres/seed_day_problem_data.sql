-- ==============================================
-- Day Problem 더미 데이터 (일일 목표/완료 문제)
-- ==============================================
-- 생성일: 2025-11-05
-- 목적: 보호자 대시보드 일일/주간 목표 API 테스트
-- ==============================================

-- ==============================================
-- 1. Adventure Type (4개 동굴)
-- ==============================================

INSERT INTO adventure_type (adventure_type_id, adventure_name, adventure_info, adventure_info_image)
VALUES
    (1, '음소 분절', '소리를 나누는 탐험! 단어를 자음과 모음으로 분리해보세요.', 'https://example.com/adventure1.jpg'),
    (2, '음소 합성', '소리를 모으는 탐험! 자음과 모음을 합쳐 단어를 만들어보세요.', 'https://example.com/adventure2.jpg'),
    (3, '단어 읽기', '단어를 읽는 탐험! 다양한 단어를 정확하게 읽어보세요.', 'https://example.com/adventure3.jpg'),
    (4, '문장 읽기', '문장을 읽는 탐험! 긴 문장을 유창하게 읽어보세요.', 'https://example.com/adventure4.jpg');

-- 시퀀스 동기화
SELECT setval('adventure_type_adventure_type_id_seq', 4, true);

-- ==============================================
-- 2. Day Problem - 김민준 (student_id: 1)
--    목표: 20문제, 완료: 15문제
-- ==============================================

INSERT INTO day_problem (
    student_id, adventure_type_id, assigned_date, seq_no, level,
    question_text, sound_url, question_phonemes, is_completed
)
VALUES
    -- 완료된 문제 (15개)
    (1, 1, CURRENT_DATE, 1, 3, '가방', 'https://example.com/sound1.mp3', ARRAY['ㄱ','ㅏ','ㅂ','ㅏ','ㅇ'], true),
    (1, 1, CURRENT_DATE, 2, 3, '사과', 'https://example.com/sound2.mp3', ARRAY['ㅅ','ㅏ','ㄱ','ㅗ','ㅏ'], true),
    (1, 1, CURRENT_DATE, 3, 3, '나무', 'https://example.com/sound3.mp3', ARRAY['ㄴ','ㅏ','ㅁ','ㅜ'], true),
    (1, 1, CURRENT_DATE, 4, 3, '바다', 'https://example.com/sound4.mp3', ARRAY['ㅂ','ㅏ','ㄷ','ㅏ'], true),
    (1, 1, CURRENT_DATE, 5, 3, '하늘', 'https://example.com/sound5.mp3', ARRAY['ㅎ','ㅏ','ㄴ','ㅡ','ㄹ'], true),
    (1, 2, CURRENT_DATE, 1, 3, '학교', 'https://example.com/sound6.mp3', ARRAY['ㅎ','ㅏ','ㄱ','ㄱ','ㅛ'], true),
    (1, 2, CURRENT_DATE, 2, 3, '선생님', 'https://example.com/sound7.mp3', ARRAY['ㅅ','ㅓ','ㄴ','ㅅ','ㅐ','ㅇ','ㄴ','ㅣ','ㅁ'], true),
    (1, 2, CURRENT_DATE, 3, 3, '친구', 'https://example.com/sound8.mp3', ARRAY['ㅊ','ㅣ','ㄴ','ㄱ','ㅜ'], true),
    (1, 2, CURRENT_DATE, 4, 3, '공책', 'https://example.com/sound9.mp3', ARRAY['ㄱ','ㅗ','ㅇ','ㅊ','ㅐ','ㄱ'], true),
    (1, 2, CURRENT_DATE, 5, 3, '연필', 'https://example.com/sound10.mp3', ARRAY['ㅇ','ㅕ','ㄴ','ㅍ','ㅣ','ㄹ'], true),
    (1, 3, CURRENT_DATE, 1, 3, '강아지', 'https://example.com/sound11.mp3', ARRAY['ㄱ','ㅏ','ㅇ','ㅏ','ㅈ','ㅣ'], true),
    (1, 3, CURRENT_DATE, 2, 3, '고양이', 'https://example.com/sound12.mp3', ARRAY['ㄱ','ㅗ','ㅇ','ㅏ','ㅇ','ㅣ'], true),
    (1, 3, CURRENT_DATE, 3, 3, '토끼', 'https://example.com/sound13.mp3', ARRAY['ㅌ','ㅗ','ㄲ','ㅣ'], true),
    (1, 3, CURRENT_DATE, 4, 3, '거북이', 'https://example.com/sound14.mp3', ARRAY['ㄱ','ㅓ','ㅂ','ㅜ','ㄱ','ㅣ'], true),
    (1, 3, CURRENT_DATE, 5, 3, '햄스터', 'https://example.com/sound15.mp3', ARRAY['ㅎ','ㅐ','ㅁ','ㅅ','ㅡ','ㅌ','ㅓ'], true),

    -- 미완료 문제 (5개)
    (1, 3, CURRENT_DATE, 6, 3, '앵무새', 'https://example.com/sound16.mp3', ARRAY['ㅇ','ㅐ','ㅇ','ㅁ','ㅜ','ㅅ','ㅐ'], false),
    (1, 3, CURRENT_DATE, 7, 3, '금붕어', 'https://example.com/sound17.mp3', ARRAY['ㄱ','ㅡ','ㅁ','ㅂ','ㅜ','ㅇ','ㅓ'], false),
    (1, 4, CURRENT_DATE, 1, 3, '강아지가 짖어요', 'https://example.com/sound18.mp3', ARRAY['ㄱ','ㅏ','ㅇ','ㅏ','ㅈ','ㅣ','ㄱ','ㅏ','ㅉ','ㅣ','ㅈ','ㅓ','ㅇ','ㅛ'], false),
    (1, 4, CURRENT_DATE, 2, 3, '친구와 놀아요', 'https://example.com/sound19.mp3', ARRAY['ㅊ','ㅣ','ㄴ','ㄱ','ㅜ','ㅇ','ㅘ','ㄴ','ㅗ','ㄹ','ㅏ','ㅇ','ㅛ'], false),
    (1, 4, CURRENT_DATE, 3, 3, '학교에 가요', 'https://example.com/sound20.mp3', ARRAY['ㅎ','ㅏ','ㄱ','ㄱ','ㅛ','ㅇ','ㅔ','ㄱ','ㅏ','ㅇ','ㅛ'], false);

-- ==============================================
-- 3. Day Problem - 이서윤 (student_id: 2)
--    목표: 25문제, 완료: 22문제
-- ==============================================

INSERT INTO day_problem (
    student_id, adventure_type_id, assigned_date, seq_no, level,
    question_text, sound_url, question_phonemes, is_completed
)
VALUES
    -- 완료된 문제 (22개)
    (2, 2, CURRENT_DATE, 1, 5, '나뭇잎', 'https://example.com/sound21.mp3', ARRAY['ㄴ','ㅏ','ㅁ','ㅜ','ㅅ','ㅣ','ㅍ'], true),
    (2, 2, CURRENT_DATE, 2, 5, '별똥별', 'https://example.com/sound22.mp3', ARRAY['ㅂ','ㅕ','ㄹ','ㄸ','ㅗ','ㅇ','ㅂ','ㅕ','ㄹ'], true),
    (2, 2, CURRENT_DATE, 3, 5, '무지개', 'https://example.com/sound23.mp3', ARRAY['ㅁ','ㅜ','ㅈ','ㅣ','ㄱ','ㅐ'], true),
    (2, 2, CURRENT_DATE, 4, 5, '나비', 'https://example.com/sound24.mp3', ARRAY['ㄴ','ㅏ','ㅂ','ㅣ'], true),
    (2, 2, CURRENT_DATE, 5, 5, '잠자리', 'https://example.com/sound25.mp3', ARRAY['ㅈ','ㅏ','ㅁ','ㅈ','ㅏ','ㄹ','ㅣ'], true),
    (2, 2, CURRENT_DATE, 6, 5, '개미', 'https://example.com/sound26.mp3', ARRAY['ㄱ','ㅐ','ㅁ','ㅣ'], true),
    (2, 2, CURRENT_DATE, 7, 5, '사마귀', 'https://example.com/sound27.mp3', ARRAY['ㅅ','ㅏ','ㅁ','ㅏ','ㄱ','ㅟ'], true),
    (2, 3, CURRENT_DATE, 1, 5, '도서관', 'https://example.com/sound28.mp3', ARRAY['ㄷ','ㅗ','ㅅ','ㅓ','ㄱ','ㅘ','ㄴ'], true),
    (2, 3, CURRENT_DATE, 2, 5, '박물관', 'https://example.com/sound29.mp3', ARRAY['ㅂ','ㅏ','ㄱ','ㅁ','ㅜ','ㄹ','ㄱ','ㅘ','ㄴ'], true),
    (2, 3, CURRENT_DATE, 3, 5, '미술관', 'https://example.com/sound30.mp3', ARRAY['ㅁ','ㅣ','ㅅ','ㅜ','ㄹ','ㄱ','ㅘ','ㄴ'], true),
    (2, 3, CURRENT_DATE, 4, 5, '운동장', 'https://example.com/sound31.mp3', ARRAY['ㅇ','ㅜ','ㄴ','ㄷ','ㅗ','ㅇ','ㅈ','ㅏ','ㅇ'], true),
    (2, 3, CURRENT_DATE, 5, 5, '놀이터', 'https://example.com/sound32.mp3', ARRAY['ㄴ','ㅗ','ㄹ','ㅣ','ㅌ','ㅓ'], true),
    (2, 3, CURRENT_DATE, 6, 5, '수영장', 'https://example.com/sound33.mp3', ARRAY['ㅅ','ㅜ','ㅇ','ㅕ','ㅇ','ㅈ','ㅏ','ㅇ'], true),
    (2, 3, CURRENT_DATE, 7, 5, '병원', 'https://example.com/sound34.mp3', ARRAY['ㅂ','ㅕ','ㅇ','ㅇ','ㅜ','ㅓ','ㄴ'], true),
    (2, 4, CURRENT_DATE, 1, 5, '나는 학교에 갑니다', 'https://example.com/sound35.mp3', ARRAY['ㄴ','ㅏ','ㄴ','ㅡ','ㄴ','ㅎ','ㅏ','ㄱ','ㄱ','ㅛ','ㅇ','ㅔ','ㄱ','ㅏ','ㅂ','ㄴ','ㅣ','ㄷ','ㅏ'], true),
    (2, 4, CURRENT_DATE, 2, 5, '친구와 함께 놀아요', 'https://example.com/sound36.mp3', ARRAY['ㅊ','ㅣ','ㄴ','ㄱ','ㅜ','ㅇ','ㅘ','ㅎ','ㅏ','ㅁ','ㄲ','ㅔ','ㄴ','ㅗ','ㄹ','ㅏ','ㅇ','ㅛ'], true),
    (2, 4, CURRENT_DATE, 3, 5, '오늘 날씨가 좋아요', 'https://example.com/sound37.mp3', ARRAY['ㅇ','ㅗ','ㄴ','ㅡ','ㄹ','ㄴ','ㅏ','ㄹ','ㅆ','ㅣ','ㄱ','ㅏ','ㅈ','ㅗ','ㅎ','ㅏ','ㅇ','ㅛ'], true),
    (2, 4, CURRENT_DATE, 4, 5, '책을 읽는 것이 재미있어요', 'https://example.com/sound38.mp3', ARRAY['ㅊ','ㅐ','ㄱ','ㅡ','ㄹ','ㅇ','ㅣ','ㄱ','ㄴ','ㅡ','ㄴ','ㄱ','ㅓ','ㅅ','ㅣ','ㅈ','ㅐ','ㅁ','ㅣ','ㅇ','ㅣ','ㅆ','ㅓ','ㅇ','ㅛ'], true),
    (2, 4, CURRENT_DATE, 5, 5, '엄마와 시장에 다녀왔어요', 'https://example.com/sound39.mp3', ARRAY['ㅇ','ㅓ','ㅁ','ㅁ','ㅏ','ㅇ','ㅘ','ㅅ','ㅣ','ㅈ','ㅏ','ㅇ','ㅇ','ㅔ','ㄷ','ㅏ','ㄴ','ㅕ','ㅇ','ㅘ','ㅆ','ㅓ','ㅇ','ㅛ'], true),
    (2, 4, CURRENT_DATE, 6, 5, '동생이 장난감을 가지고 놀아요', 'https://example.com/sound40.mp3', ARRAY['ㄷ','ㅗ','ㅇ','ㅅ','ㅐ','ㅇ','ㅇ','ㅣ','ㅈ','ㅏ','ㅇ','ㄴ','ㅏ','ㄴ','ㄱ','ㅏ','ㅁ','ㅇ','ㅡ','ㄹ','ㄱ','ㅏ','ㅈ','ㅣ','ㄱ','ㅗ','ㄴ','ㅗ','ㄹ','ㅏ','ㅇ','ㅛ'], true),
    (2, 4, CURRENT_DATE, 7, 5, '할머니께서 맛있는 음식을 만들어주셨어요', 'https://example.com/sound41.mp3', ARRAY['ㅎ','ㅏ','ㄹ','ㅁ','ㅓ','ㄴ','ㅣ','ㄲ','ㅔ','ㅅ','ㅓ','ㅁ','ㅏ','ㅅ','ㅇ','ㅣ','ㅆ','ㄴ','ㅡ','ㄴ','ㅇ','ㅡ','ㅁ','ㅅ','ㅣ','ㄱ','ㅇ','ㅡ','ㄹ','ㅁ','ㅏ','ㄴ','ㄷ','ㅡ','ㄹ','ㅓ','ㅈ','ㅜ','ㅅ','ㅕ','ㅆ','ㅓ','ㅇ','ㅛ'], true),
    (2, 4, CURRENT_DATE, 8, 5, '아빠와 자전거를 타러 공원에 갔어요', 'https://example.com/sound42.mp3', ARRAY['ㅇ','ㅏ','ㅃ','ㅏ','ㅇ','ㅘ','ㅈ','ㅏ','ㅈ','ㅓ','ㄴ','ㄱ','ㅓ','ㄹ','ㅡ','ㄹ','ㅌ','ㅏ','ㄹ','ㅓ','ㄱ','ㅗ','ㅇ','ㅇ','ㅜ','ㅓ','ㄴ','ㅇ','ㅔ','ㄱ','ㅏ','ㅆ','ㅓ','ㅇ','ㅛ'], true),

    -- 미완료 문제 (3개)
    (2, 4, CURRENT_DATE, 9, 5, '선생님께서 숙제를 내주셨어요', 'https://example.com/sound43.mp3', ARRAY['ㅅ','ㅓ','ㄴ','ㅅ','ㅐ','ㅇ','ㄴ','ㅣ','ㅁ','ㄲ','ㅔ','ㅅ','ㅓ','ㅅ','ㅜ','ㄱ','ㅈ','ㅔ','ㄹ','ㅡ','ㄹ','ㄴ','ㅐ','ㅈ','ㅜ','ㅅ','ㅕ','ㅆ','ㅓ','ㅇ','ㅛ'], false),
    (2, 4, CURRENT_DATE, 10, 5, '비가 와서 우산을 썼어요', 'https://example.com/sound44.mp3', ARRAY['ㅂ','ㅣ','ㄱ','ㅏ','ㅇ','ㅘ','ㅅ','ㅓ','ㅇ','ㅜ','ㅅ','ㅏ','ㄴ','ㅇ','ㅡ','ㄹ','ㅆ','ㅓ','ㅆ','ㅓ','ㅇ','ㅛ'], false),
    (2, 1, CURRENT_DATE, 1, 5, '컴퓨터', 'https://example.com/sound45.mp3', ARRAY['ㅋ','ㅓ','ㅁ','ㅍ','ㅠ','ㅌ','ㅓ'], false);

-- ==============================================
-- 4. Day Problem - 박지호 (student_id: 3)
--    목표: 10문제, 완료: 6문제
-- ==============================================

INSERT INTO day_problem (
    student_id, adventure_type_id, assigned_date, seq_no, level,
    question_text, sound_url, question_phonemes, is_completed
)
VALUES
    -- 완료된 문제 (6개)
    (3, 1, CURRENT_DATE, 1, 1, '공룡', 'https://example.com/sound46.mp3', ARRAY['ㄱ','ㅗ','ㅇ','ㄹ','ㅛ','ㅇ'], true),
    (3, 1, CURRENT_DATE, 2, 1, '티라노', 'https://example.com/sound47.mp3', ARRAY['ㅌ','ㅣ','ㄹ','ㅏ','ㄴ','ㅗ'], true),
    (3, 1, CURRENT_DATE, 3, 1, '스테고', 'https://example.com/sound48.mp3', ARRAY['ㅅ','ㅡ','ㅌ','ㅔ','ㄱ','ㅗ'], true),
    (3, 1, CURRENT_DATE, 4, 1, '로봇', 'https://example.com/sound49.mp3', ARRAY['ㄹ','ㅗ','ㅂ','ㅗ','ㅅ'], true),
    (3, 1, CURRENT_DATE, 5, 1, '사탕', 'https://example.com/sound50.mp3', ARRAY['ㅅ','ㅏ','ㅌ','ㅏ','ㅇ'], true),
    (3, 2, CURRENT_DATE, 1, 1, '가위', 'https://example.com/sound51.mp3', ARRAY['ㄱ','ㅏ','ㅇ','ㅟ'], true),

    -- 미완료 문제 (4개)
    (3, 2, CURRENT_DATE, 2, 1, '바위', 'https://example.com/sound52.mp3', ARRAY['ㅂ','ㅏ','ㅇ','ㅟ'], false),
    (3, 2, CURRENT_DATE, 3, 1, '보', 'https://example.com/sound53.mp3', ARRAY['ㅂ','ㅗ'], false),
    (3, 3, CURRENT_DATE, 1, 1, '엄마', 'https://example.com/sound54.mp3', ARRAY['ㅇ','ㅓ','ㅁ','ㅁ','ㅏ'], false),
    (3, 3, CURRENT_DATE, 2, 1, '아빠', 'https://example.com/sound55.mp3', ARRAY['ㅇ','ㅏ','ㅃ','ㅏ'], false);

-- ==============================================
-- 완료 메시지
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Day Problem 더미 데이터 삽입 완료!';
    RAISE NOTICE '김민준 (student_id: 1): 목표 20문제, 완료 15문제';
    RAISE NOTICE '이서윤 (student_id: 2): 목표 25문제, 완료 22문제';
    RAISE NOTICE '박지호 (student_id: 3): 목표 10문제, 완료 6문제';
    RAISE NOTICE '==============================================';
END $$;
