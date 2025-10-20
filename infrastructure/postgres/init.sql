-- ==============================================
-- Captain Echo PostgreSQL 초기화 스크립트
-- ==============================================
-- 프로젝트: Captain Echo (꼬마선장 에코)
-- 목적: 난독증 어린이를 위한 게임형 학습 플랫폼
-- 생성일: 2025-10-20
-- 이 스크립트는 Docker 컨테이너 최초 실행시 자동으로 실행됩니다

-- ==============================================
-- 확장 기능 설치
-- ==============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ==============================================
-- 1. 사용자 및 권한 테이블
-- ==============================================

-- 부모 계정 (사용자)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_image_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP
);

-- 자녀 프로필 (넷플릭스 스타일 다중 프로필)
CREATE TABLE children (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    nickname VARCHAR(50),
    birth_date DATE,
    avatar_url VARCHAR(500),
    grade VARCHAR(20), -- 초등학교 저학년, 고학년 등
    diagnosis_level VARCHAR(50), -- 난독증 진단 레벨
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- 자녀 선호도 및 설정
CREATE TABLE child_preferences (
    id SERIAL PRIMARY KEY,
    child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
    difficulty_level INTEGER DEFAULT 5 CHECK (difficulty_level BETWEEN 1 AND 10),
    daily_goal_minutes INTEGER DEFAULT 20, -- 일일 학습 목표 (분)
    preferred_study_time VARCHAR(20), -- 선호 학습 시간 (아침, 오후, 저녁)
    sound_effects_enabled BOOLEAN DEFAULT TRUE,
    background_music_enabled BOOLEAN DEFAULT TRUE,
    tts_speed FLOAT DEFAULT 1.0, -- TTS 속도 (0.5 ~ 2.0)
    parent_notes TEXT, -- 부모의 특이사항 메모
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(child_id)
);

-- ==============================================
-- 2. 메아리 동굴 (학습 컨텐츠)
-- ==============================================

-- 동굴 정보 (4개 고정)
CREATE TABLE caves (
    id SERIAL PRIMARY KEY,
    cave_number INTEGER UNIQUE NOT NULL CHECK (cave_number BETWEEN 1 AND 4),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    learning_type VARCHAR(50) NOT NULL, -- PHONEME_SEGMENTATION, PHONEME_SYNTHESIS, WORD_READING, SENTENCE_READING
    icon_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 초기 동굴 데이터 삽입
INSERT INTO caves (cave_number, name, description, learning_type) VALUES
(1, '음소 분절 동굴', '소리를 나누는 동굴이에요', 'PHONEME_SEGMENTATION'),
(2, '음소 합성 동굴', '소리를 모으는 동굴이에요', 'PHONEME_SYNTHESIS'),
(3, '단어 읽기 동굴', '단어를 읽는 동굴이에요', 'WORD_READING'),
(4, '문장 읽기 동굴', '문장을 읽는 동굴이에요', 'SENTENCE_READING');

-- 학습 문제 (콘텐츠)
CREATE TABLE learning_problems (
    id SERIAL PRIMARY KEY,
    cave_id INTEGER REFERENCES caves(id) ON DELETE CASCADE,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10),
    problem_text TEXT NOT NULL, -- 문제 텍스트
    correct_answer TEXT NOT NULL, -- 정답
    phoneme_breakdown TEXT, -- 음소 분해 (JSON 형태)
    audio_url VARCHAR(500), -- TTS 생성된 오디오 URL (S3)
    created_by VARCHAR(50) DEFAULT 'AI', -- AI 또는 ADMIN
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- ==============================================
-- 3. 학습 세션 및 진행도
-- ==============================================

-- 학습 세션 (동굴 입장 ~ 퇴장)
CREATE TABLE learning_sessions (
    id SERIAL PRIMARY KEY,
    child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
    cave_id INTEGER REFERENCES caves(id),
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    total_problems INTEGER DEFAULT 0, -- 총 문제 수
    correct_count INTEGER DEFAULT 0, -- 정답 수
    incorrect_count INTEGER DEFAULT 0, -- 오답 수
    accuracy_rate FLOAT, -- 정답률 (0.0 ~ 1.0)
    total_time_seconds INTEGER, -- 총 소요 시간 (초)
    session_status VARCHAR(20) DEFAULT 'IN_PROGRESS' CHECK (session_status IN ('IN_PROGRESS', 'COMPLETED', 'ABANDONED'))
);

-- 개별 문제 풀이 기록
CREATE TABLE problem_attempts (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES learning_sessions(id) ON DELETE CASCADE,
    problem_id INTEGER REFERENCES learning_problems(id),
    child_answer TEXT, -- 아이의 답변 (STT 인식 결과)
    is_correct BOOLEAN,
    attempt_number INTEGER DEFAULT 1, -- 시도 횟수
    time_taken_seconds INTEGER, -- 소요 시간 (초)
    hint_used BOOLEAN DEFAULT FALSE,
    voice_recording_url VARCHAR(500), -- S3에 저장된 음성 파일 URL
    confidence_score FLOAT, -- STT 신뢰도 (0.0 ~ 1.0)
    created_at TIMESTAMP DEFAULT NOW()
);

-- 동굴별 진행도
CREATE TABLE cave_progress (
    id SERIAL PRIMARY KEY,
    child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
    cave_id INTEGER REFERENCES caves(id),
    completed_problems INTEGER DEFAULT 0,
    total_problems INTEGER DEFAULT 0,
    completion_rate FLOAT DEFAULT 0.0, -- 완료율 (0.0 ~ 1.0)
    highest_difficulty INTEGER DEFAULT 1,
    last_studied_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(child_id, cave_id)
);

-- ==============================================
-- 4. 음성 녹음 파일 관리
-- ==============================================

-- 음성 녹음 메타데이터
CREATE TABLE voice_recordings (
    id SERIAL PRIMARY KEY,
    child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
    problem_attempt_id INTEGER REFERENCES problem_attempts(id),
    s3_url VARCHAR(500) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT,
    duration_seconds FLOAT,
    format VARCHAR(20), -- WAV, MP3, etc.
    stt_result TEXT, -- STT 인식 결과
    stt_confidence FLOAT, -- STT 신뢰도
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- 5. AI Agent 협상 시스템
-- ==============================================

-- AI Agent 학습 계획 (매일 생성)
CREATE TABLE ai_learning_plans (
    id SERIAL PRIMARY KEY,
    child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
    plan_date DATE NOT NULL,
    academic_agent_proposal TEXT, -- Academic Agent 제안
    wellbeing_agent_proposal TEXT, -- Wellbeing Agent 제안
    parent_agent_proposal TEXT, -- Parent Agent 제안
    final_consensus TEXT NOT NULL, -- 최종 합의 결과
    recommended_cave_id INTEGER REFERENCES caves(id),
    recommended_difficulty INTEGER,
    recommended_duration_minutes INTEGER,
    recommended_problems_count INTEGER,
    negotiation_log TEXT, -- 협상 과정 로그 (JSON)
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(child_id, plan_date)
);

-- AI 생성 리포트
CREATE TABLE ai_reports (
    id SERIAL PRIMARY KEY,
    child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL, -- DAILY, WEEKLY, MONTHLY
    report_period_start DATE NOT NULL,
    report_period_end DATE NOT NULL,
    strengths TEXT, -- 강점 영역
    weaknesses TEXT, -- 약점 영역
    recommendations TEXT, -- 개선 권장사항
    overall_progress TEXT, -- 전체 진도 분석
    generated_by_agent VARCHAR(50), -- 생성한 Agent
    generated_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- 6. 약점 분석
-- ==============================================

-- 음소별 약점 분석
CREATE TABLE phoneme_weaknesses (
    id SERIAL PRIMARY KEY,
    child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
    phoneme VARCHAR(10) NOT NULL, -- 음소 (예: 'ㄱ', 'ㅏ', '가')
    error_count INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    error_rate FLOAT, -- 오류율 (0.0 ~ 1.0)
    last_error_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(child_id, phoneme)
);

-- 단어 유형별 약점 분석
CREATE TABLE word_type_weaknesses (
    id SERIAL PRIMARY KEY,
    child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
    word_type VARCHAR(50) NOT NULL, -- EASY, MEDIUM, HARD, SIMILAR_SOUNDS, etc.
    error_count INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    error_rate FLOAT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(child_id, word_type)
);

-- ==============================================
-- 7. 업적 및 보상 시스템
-- ==============================================

-- 업적 정의
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    badge_icon_url VARCHAR(500),
    achievement_type VARCHAR(50), -- CAVE_COMPLETION, STREAK, ACCURACY, etc.
    requirement_value INTEGER, -- 요구 조건 값
    created_at TIMESTAMP DEFAULT NOW()
);

-- 자녀 업적 달성 기록
CREATE TABLE child_achievements (
    id SERIAL PRIMARY KEY,
    child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id),
    achieved_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(child_id, achievement_id)
);

-- 일일 출석 및 연속 학습 기록
CREATE TABLE daily_streaks (
    id SERIAL PRIMARY KEY,
    child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
    study_date DATE NOT NULL,
    minutes_studied INTEGER DEFAULT 0,
    problems_solved INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(child_id, study_date)
);

-- ==============================================
-- 8. 부모 대시보드 데이터
-- ==============================================

-- 부모 알림 설정
CREATE TABLE parent_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- DAILY_REPORT, WEEKLY_SUMMARY, ACHIEVEMENT, etc.
    is_enabled BOOLEAN DEFAULT TRUE,
    notification_time TIME, -- 알림 시간
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 학습 목표 설정 (부모가 설정)
CREATE TABLE learning_goals (
    id SERIAL PRIMARY KEY,
    child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL, -- DAILY_MINUTES, WEEKLY_PROBLEMS, ACCURACY_TARGET, etc.
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE,
    is_achieved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- 9. 인덱스 생성 (성능 최적화)
-- ==============================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- Children
CREATE INDEX idx_children_user_id ON children(user_id);
CREATE INDEX idx_children_is_active ON children(is_active);

-- Learning Sessions
CREATE INDEX idx_learning_sessions_child_id ON learning_sessions(child_id);
CREATE INDEX idx_learning_sessions_cave_id ON learning_sessions(cave_id);
CREATE INDEX idx_learning_sessions_started_at ON learning_sessions(started_at);

-- Problem Attempts
CREATE INDEX idx_problem_attempts_session_id ON problem_attempts(session_id);
CREATE INDEX idx_problem_attempts_problem_id ON problem_attempts(problem_id);
CREATE INDEX idx_problem_attempts_is_correct ON problem_attempts(is_correct);

-- Cave Progress
CREATE INDEX idx_cave_progress_child_id ON cave_progress(child_id);
CREATE INDEX idx_cave_progress_cave_id ON cave_progress(cave_id);

-- Voice Recordings
CREATE INDEX idx_voice_recordings_child_id ON voice_recordings(child_id);
CREATE INDEX idx_voice_recordings_uploaded_at ON voice_recordings(uploaded_at);

-- AI Learning Plans
CREATE INDEX idx_ai_learning_plans_child_id ON ai_learning_plans(child_id);
CREATE INDEX idx_ai_learning_plans_plan_date ON ai_learning_plans(plan_date);

-- Phoneme Weaknesses
CREATE INDEX idx_phoneme_weaknesses_child_id ON phoneme_weaknesses(child_id);
CREATE INDEX idx_phoneme_weaknesses_error_rate ON phoneme_weaknesses(error_rate DESC);

-- Daily Streaks
CREATE INDEX idx_daily_streaks_child_id ON daily_streaks(child_id);
CREATE INDEX idx_daily_streaks_study_date ON daily_streaks(study_date);

-- ==============================================
-- 10. 트리거 함수 (자동 업데이트)
-- ==============================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_child_preferences_updated_at BEFORE UPDATE ON child_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cave_progress_updated_at BEFORE UPDATE ON cave_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_phoneme_weaknesses_updated_at BEFORE UPDATE ON phoneme_weaknesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_word_type_weaknesses_updated_at BEFORE UPDATE ON word_type_weaknesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_goals_updated_at BEFORE UPDATE ON learning_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 11. 샘플 데이터 (개발용)
-- ==============================================

-- 샘플 업적 데이터
INSERT INTO achievements (name, description, achievement_type, requirement_value) VALUES
('첫 걸음', '첫 번째 문제를 풀었어요!', 'FIRST_PROBLEM', 1),
('동굴 정복자 1', '음소 분절 동굴을 완료했어요!', 'CAVE_COMPLETION', 1),
('동굴 정복자 2', '음소 합성 동굴을 완료했어요!', 'CAVE_COMPLETION', 2),
('동굴 정복자 3', '단어 읽기 동굴을 완료했어요!', 'CAVE_COMPLETION', 3),
('동굴 정복자 4', '문장 읽기 동굴을 완료했어요!', 'CAVE_COMPLETION', 4),
('모든 동굴 마스터', '모든 동굴을 완료했어요!', 'ALL_CAVES_COMPLETE', 4),
('꾸준이', '7일 연속 학습했어요!', 'STREAK', 7),
('완벽주의자', '정확도 95% 이상 달성!', 'ACCURACY', 95),
('스피드 러너', '문제를 빠르게 풀었어요!', 'SPEED', 1);

-- ==============================================
-- 12. 권한 설정
-- ==============================================

-- captain_echo 데이터베이스에 대한 권한 부여
GRANT ALL PRIVILEGES ON DATABASE captain_echo TO doonki;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO doonki;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO doonki;

-- ==============================================
-- 완료 메시지
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Captain Echo 데이터베이스 초기화 완료!';
    RAISE NOTICE '데이터베이스: captain_echo';
    RAISE NOTICE '사용자: doonki';
    RAISE NOTICE '==============================================';
END $$;
