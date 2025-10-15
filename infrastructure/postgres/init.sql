-- ==============================================
-- 교육 플랫폼 PostgreSQL 초기화 스크립트
-- ==============================================
-- 이 스크립트는 Docker 컨테이너 최초 실행시 자동으로 실행됩니다
-- Agent to Agent (A2A) 아키텍처를 위한 테이블 구조

-- ==============================================
-- 확장 기능 설치
-- ==============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ==============================================
-- 기본 사용자 및 권한 테이블
-- ==============================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'PARENT', 'TEACHER', 'ADMIN')),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    phone VARCHAR(20),
    profile_image_url VARCHAR(500)
);

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    grade INTEGER CHECK (grade BETWEEN 1 AND 12),
    school VARCHAR(100),
    birth_date DATE,
    learning_style VARCHAR(50), -- visual, auditory, kinesthetic, reading
    preferred_subjects TEXT[], -- ARRAY of subjects
    difficulty_level INTEGER DEFAULT 5 CHECK (difficulty_level BETWEEN 1 AND 10),
    study_goals TEXT,
    timezone VARCHAR(50) DEFAULT 'Asia/Seoul',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE parents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    occupation VARCHAR(100),
    education_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE student_parent_relation (
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES parents(id) ON DELETE CASCADE,
    relationship_type VARCHAR(20) DEFAULT 'PARENT' CHECK (relationship_type IN ('PARENT', 'GUARDIAN', 'RELATIVE')),
    PRIMARY KEY (student_id, parent_id)
);

-- ==============================================
-- 학습 데이터 테이블
-- ==============================================

CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE learning_records (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id),
    session_type VARCHAR(30) DEFAULT 'PRACTICE', -- PRACTICE, TEST, HOMEWORK, REVIEW
    score INTEGER CHECK (score BETWEEN 0 AND 100),
    max_score INTEGER DEFAULT 100,
    study_time INTEGER, -- 분 단위
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10),
    topics TEXT[], -- 학습한 주제들
    mistakes_count INTEGER DEFAULT 0,
    hints_used INTEGER DEFAULT 0,
    completion_rate FLOAT CHECK (completion_rate BETWEEN 0 AND 1),
    notes TEXT,
    metadata JSONB, -- 추가적인 학습 데이터
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE test_results (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    test_name VARCHAR(100) NOT NULL,
    subject_id INTEGER REFERENCES subjects(id),
    test_type VARCHAR(30) DEFAULT 'QUIZ', -- QUIZ, EXAM, MOCK_TEST, ASSESSMENT
    score INTEGER CHECK (score BETWEEN 0 AND 100),
    max_score INTEGER NOT NULL,
    time_taken INTEGER, -- 소요 시간 (분)
    questions_total INTEGER,
    questions_correct INTEGER,
    questions_wrong INTEGER,
    questions_skipped INTEGER DEFAULT 0,
    difficulty_distribution JSONB, -- {easy: 10, medium: 15, hard: 5}
    topic_scores JSONB, -- {algebra: 85, geometry: 70}
    test_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE learning_progress (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id),
    topic VARCHAR(100) NOT NULL,
    mastery_level FLOAT DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 1), -- 0: 초보, 1: 완전 숙달
    practice_count INTEGER DEFAULT 0,
    correct_streak INTEGER DEFAULT 0,
    last_practiced_at TIMESTAMP,
    estimated_next_review TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, subject_id, topic)
);

-- ==============================================
-- AI Agent 메모리 테이블 (A2A 아키텍처 핵심)
-- ==============================================

-- Agent 1: 학습 분석가 메모리
CREATE TABLE agent_analyzer_memory (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    conversation_id UUID DEFAULT uuid_generate_v4(),
    session_id VARCHAR(100), -- 학습 세션 식별자

    -- 분석 결과
    analysis_result JSONB NOT NULL, -- 학습 패턴, 강약점 분석 결과
    learned_patterns JSONB, -- 학습된 패턴들
    insights TEXT, -- 텍스트 형태의 인사이트
    confidence_score FLOAT CHECK (confidence_score BETWEEN 0 AND 1),

    -- 분석 메타데이터
    data_sources JSONB, -- 분석에 사용된 데이터 소스들
    analysis_type VARCHAR(50), -- PERFORMANCE, PATTERN, WEAKNESS, STRENGTH
    time_range JSONB, -- {start_date, end_date}

    -- Agent 학습 상태
    model_version VARCHAR(20) DEFAULT '1.0',
    learning_iteration INTEGER DEFAULT 1,
    feedback_incorporated BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Agent 2: 교육 설계자 메모리
CREATE TABLE agent_planner_memory (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    conversation_id UUID DEFAULT uuid_generate_v4(),
    analyzer_reference_id INTEGER REFERENCES agent_analyzer_memory(id),

    -- 계획 데이터
    generated_plans JSONB NOT NULL, -- 생성된 학습 계획들
    plan_type VARCHAR(50), -- DAILY, WEEKLY, MONTHLY, EXAM_PREP, REMEDIAL
    target_goals JSONB, -- 목표 설정
    timeline JSONB, -- 계획 타임라인
    resources JSONB, -- 추천 학습 자료

    -- 계획 효과성
    effectiveness_score FLOAT CHECK (effectiveness_score BETWEEN 0 AND 5),
    implementation_status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, ACTIVE, COMPLETED, CANCELLED
    completion_rate FLOAT DEFAULT 0 CHECK (completion_rate BETWEEN 0 AND 1),

    -- 피드백 및 조정
    feedback TEXT,
    adjustments_made JSONB, -- 수정된 내용들
    student_preferences JSONB, -- 학생 선호도 반영

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Agent 3: 학습 코치 메모리
CREATE TABLE agent_coach_memory (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    conversation_id UUID DEFAULT uuid_generate_v4(),
    planner_reference_id INTEGER REFERENCES agent_planner_memory(id),

    -- 코칭 데이터
    feedback_history JSONB NOT NULL, -- 과거 피드백 히스토리
    coaching_style VARCHAR(50), -- ENCOURAGING, CHALLENGING, SUPPORTIVE, STRICT
    student_preferences JSONB, -- 학생 성향 및 선호도
    communication_patterns JSONB, -- 효과적인 의사소통 패턴

    -- 동기부여 관리
    motivation_level INTEGER CHECK (motivation_level BETWEEN 1 AND 10),
    engagement_metrics JSONB, -- 참여도 메트릭
    reward_system JSONB, -- 보상 체계

    -- 코칭 효과성
    coaching_effectiveness FLOAT CHECK (coaching_effectiveness BETWEEN 0 AND 5),
    response_patterns JSONB, -- 학생 반응 패턴
    adaptation_notes TEXT, -- 적응 관련 노트

    -- 장기 추적
    long_term_progress JSONB, -- 장기적 발전 추적
    milestone_achievements JSONB, -- 성취한 마일스톤들

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- 인덱스 생성 (성능 최적화)
-- ==============================================

-- 기본 테이블 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_grade ON students(grade);
CREATE INDEX idx_parents_user_id ON parents(user_id);

-- 학습 데이터 인덱스
CREATE INDEX idx_learning_records_student ON learning_records(student_id);
CREATE INDEX idx_learning_records_subject ON learning_records(subject_id);
CREATE INDEX idx_learning_records_created ON learning_records(created_at);
CREATE INDEX idx_learning_records_session_type ON learning_records(session_type);

CREATE INDEX idx_test_results_student ON test_results(student_id);
CREATE INDEX idx_test_results_subject ON test_results(subject_id);
CREATE INDEX idx_test_results_test_date ON test_results(test_date);
CREATE INDEX idx_test_results_test_type ON test_results(test_type);

CREATE INDEX idx_learning_progress_student_subject ON learning_progress(student_id, subject_id);
CREATE INDEX idx_learning_progress_mastery ON learning_progress(mastery_level);
CREATE INDEX idx_learning_progress_last_practiced ON learning_progress(last_practiced_at);

-- Agent 메모리 인덱스 (A2A 성능 중요)
CREATE INDEX idx_agent_analyzer_student ON agent_analyzer_memory(student_id);
CREATE INDEX idx_agent_analyzer_conversation ON agent_analyzer_memory(conversation_id);
CREATE INDEX idx_agent_analyzer_session ON agent_analyzer_memory(session_id);
CREATE INDEX idx_agent_analyzer_created ON agent_analyzer_memory(created_at);
CREATE INDEX idx_agent_analyzer_type ON agent_analyzer_memory(analysis_type);

CREATE INDEX idx_agent_planner_student ON agent_planner_memory(student_id);
CREATE INDEX idx_agent_planner_conversation ON agent_planner_memory(conversation_id);
CREATE INDEX idx_agent_planner_analyzer_ref ON agent_planner_memory(analyzer_reference_id);
CREATE INDEX idx_agent_planner_plan_type ON agent_planner_memory(plan_type);
CREATE INDEX idx_agent_planner_status ON agent_planner_memory(implementation_status);

CREATE INDEX idx_agent_coach_student ON agent_coach_memory(student_id);
CREATE INDEX idx_agent_coach_conversation ON agent_coach_memory(conversation_id);
CREATE INDEX idx_agent_coach_planner_ref ON agent_coach_memory(planner_reference_id);
CREATE INDEX idx_agent_coach_motivation ON agent_coach_memory(motivation_level);

-- JSONB 인덱스 (중요한 쿼리 성능 향상)
CREATE INDEX idx_agent_analyzer_analysis_gin ON agent_analyzer_memory USING gin(analysis_result);
CREATE INDEX idx_agent_planner_plans_gin ON agent_planner_memory USING gin(generated_plans);
CREATE INDEX idx_agent_coach_feedback_gin ON agent_coach_memory USING gin(feedback_history);

-- ==============================================
-- 기본 데이터 삽입
-- ==============================================

-- 기본 과목 데이터
INSERT INTO subjects (name, category, description) VALUES
    ('수학', '주요과목', '수학 전반'),
    ('국어', '주요과목', '국어 전반'),
    ('영어', '주요과목', '영어 전반'),
    ('과학', '주요과목', '과학 전반'),
    ('사회', '주요과목', '사회 전반'),
    ('대수학', '수학', '대수학 영역'),
    ('기하학', '수학', '기하학 영역'),
    ('통계학', '수학', '통계학 영역'),
    ('물리', '과학', '물리학'),
    ('화학', '과학', '화학'),
    ('생물', '과학', '생물학'),
    ('지구과학', '과학', '지구과학'),
    ('한국사', '사회', '한국사'),
    ('세계사', '사회', '세계사'),
    ('지리', '사회', '지리'),
    ('문법', '국어', '국어 문법'),
    ('문학', '국어', '국어 문학'),
    ('독해', '영어', '영어 독해'),
    ('문법', '영어', '영어 문법'),
    ('회화', '영어', '영어 회화');

-- 샘플 사용자 데이터 (테스트용)
INSERT INTO users (email, password, name, role, email_verified) VALUES
    ('student1@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '김학생', 'STUDENT', true),
    ('parent1@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '김학부모', 'PARENT', true),
    ('admin@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '관리자', 'ADMIN', true);

-- 샘플 학생 데이터
INSERT INTO students (user_id, grade, school, birth_date, learning_style, preferred_subjects, difficulty_level, study_goals) VALUES
    (1, 10, '서울고등학교', '2007-03-15', 'visual', ARRAY['수학', '과학'], 6, '대학 입시 준비, 수학 실력 향상');

-- 샘플 학부모 데이터
INSERT INTO parents (user_id, occupation, education_level) VALUES
    (2, '회사원', '대학교 졸업');

-- 관계 설정
INSERT INTO student_parent_relation (student_id, parent_id, relationship_type) VALUES
    (1, 1, 'PARENT');

-- 샘플 학습 기록
INSERT INTO learning_records (student_id, subject_id, session_type, score, study_time, difficulty_level, topics, completion_rate, notes) VALUES
    (1, 1, 'PRACTICE', 85, 120, 6, ARRAY['대수', '방정식'], 0.9, '방정식 부분에서 약간의 실수가 있었음'),
    (1, 3, 'PRACTICE', 90, 90, 5, ARRAY['독해', '어휘'], 1.0, '영어 독해 실력이 향상됨'),
    (1, 4, 'TEST', 75, 60, 7, ARRAY['물리', '역학'], 0.8, '물리 개념 이해 필요');

-- 샘플 테스트 결과
INSERT INTO test_results (student_id, test_name, subject_id, test_type, score, max_score, time_taken, questions_total, questions_correct, questions_wrong) VALUES
    (1, '중간고사 모의고사', 1, 'MOCK_TEST', 82, 100, 90, 20, 16, 4),
    (1, '영어 단어 퀴즈', 3, 'QUIZ', 95, 100, 15, 50, 47, 3);

-- 샘플 Agent 메모리 데이터 (A2A 테스트용)
INSERT INTO agent_analyzer_memory (student_id, analysis_result, learned_patterns, insights, confidence_score, analysis_type) VALUES
    (1,
     '{"strengths": ["영어 독해", "기본 대수"], "weaknesses": ["물리 개념", "복잡한 방정식"], "learning_pattern": "visual_learner", "optimal_study_time": "오후 2-4시"}',
     '{"consistent_errors": ["부호 계산 실수", "단위 환산"], "improvement_areas": ["물리 공식 암기", "계산 정확도"]}',
     '학생은 시각적 학습자로 도표와 그래프를 활용한 학습이 효과적입니다. 오후 시간대에 집중력이 높으며, 반복 학습을 통해 계산 정확도를 높일 필요가 있습니다.',
     0.85,
     'PERFORMANCE'
    );

INSERT INTO agent_planner_memory (student_id, analyzer_reference_id, generated_plans, plan_type, effectiveness_score) VALUES
    (1, 1,
     '{"daily_goals": ["수학 문제 10개 풀기", "영어 단어 20개 암기"], "weekly_goals": ["물리 개념 정리", "오답노트 작성"], "study_schedule": {"monday": "수학 2시간", "tuesday": "영어 1.5시간", "wednesday": "물리 2시간"}}',
     'WEEKLY',
     4.2
    );

INSERT INTO agent_coach_memory (student_id, planner_reference_id, feedback_history, coaching_style, motivation_level) VALUES
    (1, 1,
     '{"recent_feedback": ["계산 실수가 줄어들고 있어요! 꾸준히 연습하면 더 좋아질 거예요.", "물리 공식을 잘 외우고 있네요. 이제 문제 적용 연습을 해봐요."], "encouragement_type": "progress_focused"}',
     'ENCOURAGING',
     7
    );

-- ==============================================
-- 뷰 생성 (자주 사용하는 쿼리 최적화)
-- ==============================================

-- 학생 전체 정보 뷰
CREATE VIEW student_overview AS
SELECT
    s.id as student_id,
    u.name as student_name,
    u.email,
    s.grade,
    s.school,
    s.learning_style,
    s.preferred_subjects,
    s.difficulty_level,
    COUNT(lr.id) as total_learning_records,
    AVG(lr.score) as avg_score,
    SUM(lr.study_time) as total_study_time
FROM students s
JOIN users u ON s.user_id = u.id
LEFT JOIN learning_records lr ON s.id = lr.student_id
GROUP BY s.id, u.name, u.email, s.grade, s.school, s.learning_style, s.preferred_subjects, s.difficulty_level;

-- Agent 통합 메모리 뷰
CREATE VIEW agent_memory_overview AS
SELECT
    aam.student_id,
    aam.conversation_id,
    aam.analysis_result,
    aam.insights as analyzer_insights,
    apm.generated_plans,
    apm.plan_type,
    apm.effectiveness_score,
    acm.coaching_style,
    acm.motivation_level,
    acm.feedback_history,
    aam.created_at as analysis_date,
    apm.created_at as plan_date,
    acm.created_at as coaching_date
FROM agent_analyzer_memory aam
LEFT JOIN agent_planner_memory apm ON aam.id = apm.analyzer_reference_id
LEFT JOIN agent_coach_memory acm ON apm.id = acm.planner_reference_id
ORDER BY aam.created_at DESC;

-- ==============================================
-- 함수 생성 (자주 사용하는 로직)
-- ==============================================

-- 학생 성과 계산 함수
CREATE OR REPLACE FUNCTION calculate_student_performance(student_id_param INTEGER, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    avg_score NUMERIC,
    total_study_time INTEGER,
    improvement_rate NUMERIC,
    mastery_subjects TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ROUND(AVG(lr.score), 2) as avg_score,
        SUM(lr.study_time)::INTEGER as total_study_time,
        CASE
            WHEN COUNT(lr.id) > 1 THEN
                ROUND(
                    (AVG(CASE WHEN lr.created_at >= NOW() - INTERVAL '14 days' THEN lr.score END) -
                     AVG(CASE WHEN lr.created_at < NOW() - INTERVAL '14 days' THEN lr.score END))::NUMERIC, 2
                )
            ELSE 0
        END as improvement_rate,
        ARRAY_AGG(DISTINCT s.name) FILTER (WHERE lp.mastery_level > 0.8) as mastery_subjects
    FROM learning_records lr
    LEFT JOIN subjects s ON lr.subject_id = s.id
    LEFT JOIN learning_progress lp ON lr.student_id = lp.student_id AND lr.subject_id = lp.subject_id
    WHERE lr.student_id = student_id_param
    AND lr.created_at >= NOW() - INTERVAL '1 day' * days_back;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 트리거 생성 (자동화)
-- ==============================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 updated_at 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON parents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_progress_updated_at BEFORE UPDATE ON learning_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_analyzer_memory_updated_at BEFORE UPDATE ON agent_analyzer_memory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_planner_memory_updated_at BEFORE UPDATE ON agent_planner_memory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_coach_memory_updated_at BEFORE UPDATE ON agent_coach_memory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 권한 설정
-- ==============================================

-- 읽기 전용 사용자 (분석/리포트용)
CREATE USER readonly_user WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE edudb TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO readonly_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_user;

-- ==============================================
-- 완료 메시지
-- ==============================================

-- 초기화 완료 로그
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE '교육 플랫폼 데이터베이스 초기화 완료!';
    RAISE NOTICE '- 기본 테이블: % 개', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE');
    RAISE NOTICE '- 인덱스: % 개', (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public');
    RAISE NOTICE '- 뷰: % 개', (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public');
    RAISE NOTICE '- 함수: % 개', (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public');
    RAISE NOTICE '- 기본 과목: % 개', (SELECT COUNT(*) FROM subjects);
    RAISE NOTICE '- 샘플 사용자: % 개', (SELECT COUNT(*) FROM users);
    RAISE NOTICE '==============================================';
END $$;