-- 테스트 데이터 삽입

-- 1. 보호자 생성
INSERT INTO protector (protector_pin, provider, social_id, email, max_student_count, terms_agreed, created_at, is_deleted)
VALUES ('1234', 'GOOGLE', 'google_test_123', 'test@example.com', 2, TRUE, NOW(), FALSE);

-- 2. 학생 생성
INSERT INTO student (protector_id, name, gender, level)
VALUES (1, '박준형', 'MALE', 1);

-- 3. 학생 관심사 추가
INSERT INTO sub_interest (sub_interest_id, small_interest_name)
VALUES (1, '동물')
ON CONFLICT (sub_interest_id) DO NOTHING;

INSERT INTO student_interest (student_id, interest_id)
VALUES (1, 1);

-- 4. 자모 통계 추가 (레벨 평가용)
INSERT INTO jamo_stat (student_id, jamo, total_attempts, fail_count, weekly_fail_rate, weekly_accuracy_rate, created_at, updated_at)
VALUES
    (1, 'ㄱ', 10, 4, 0.4, 0.6, NOW(), NOW()),
    (1, 'ㄴ', 10, 5, 0.5, 0.5, NOW(), NOW()),
    (1, 'ㄷ', 10, 2, 0.2, 0.8, NOW(), NOW());

-- 5. 주간 리포트 생성 (빈 리포트 - CrewAI가 채울 예정)
INSERT INTO weekly_personal_report (student_id, total_time, curriculum, discussion_log, curriculum_structure, protector_goal, created_at)
VALUES (1, 0, NULL, NULL, NULL, 'FOCUS_ON_WEAKNESS', NOW());

SELECT 'Test data inserted successfully!' AS result;
