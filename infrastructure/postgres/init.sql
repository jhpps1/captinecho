-- ==============================================
-- Captain Echo PostgreSQL 초기화 스크립트 (ERD 기반)
-- ==============================================
-- 프로젝트: Captain Echo (꼬마선장 에코)
-- 목적: 난독증 어린이를 위한 게임형 학습 플랫폼
-- 생성일: 2025-11-07
-- ERD 기반 스키마 버전: 2.3 (ERD Cloud 최신 반영)
-- 이 스크립트는 Docker 컨테이너 최초 실행시 자동으로 실행됩니다
-- ==============================================

-- ==============================================
-- 확장 기능 설치
-- ==============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ==============================================
-- ENUM 타입 정의
-- ==============================================

-- 성별
CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE');

-- 학년
CREATE TYPE grade_type AS ENUM ('PRE_SCHOOL', 'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6');

-- 소셜 로그인 제공자
CREATE TYPE provider_type AS ENUM ('GOOGLE', 'KAKAO', 'LOCAL');

-- 초기 진단 문제 유형
CREATE TYPE diagnosis_type AS ENUM (
    'PHONEME_RECOGNITION',  -- 음소 인식 (Adventure 1)
    'SYLLABLE_DECODING',    -- 음절 디코딩 (Adventure 2)
    'WORD_READING',         -- 단어 읽기 (Adventure 3)
    'NONWORD_READING',      -- 무의미 단어 (사용 안함)
    'SENTENCE_COMPLETION'   -- 문장 완성 (Adventure 4)
);

-- 보호자 학습 목표
CREATE TYPE protector_goal_type AS ENUM ('FOCUS_ON_WEAKNESS', 'BUILD_CONFIDENCE', 'INCREASE_DIFFICULTY');

-- 학습 유형
CREATE TYPE study_type AS ENUM ('DAILY', 'SUPPLE');

-- ==============================================
-- 1. 보호자 (PROTECTOR)
-- ==============================================

CREATE TABLE protector (
    protector_id SERIAL PRIMARY KEY,
    id VARCHAR(50),
    password VARCHAR(50),
    protector_pin CHAR(100),
    provider provider_type NOT NULL,
    social_id VARCHAR(255),
    max_student_count SMALLINT DEFAULT 2,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT false NOT NULL,
    deleted_at TIMESTAMP,
    email VARCHAR(500),
    terms_agreed BOOLEAN DEFAULT false NOT NULL,
    UNIQUE(provider, social_id)
);

COMMENT ON TABLE protector IS '보호자 계정';
COMMENT ON COLUMN protector.protector_pin IS '부모용 대시보드 암호';
COMMENT ON COLUMN protector.provider IS '소셜 로그인 제공자 (GOOGLE, KAKAO)';
COMMENT ON COLUMN protector.social_id IS '소셜 로그인 고유 ID';
COMMENT ON COLUMN protector.email IS '보호자 이메일';
COMMENT ON COLUMN protector.max_student_count IS '최대 연결 가능한 학생 수';
COMMENT ON COLUMN protector.terms_agreed IS '서비스 약관 동의 여부';

-- ==============================================
-- 2. 학생 (STUDENT)
-- ==============================================

CREATE TABLE student (
    student_id SERIAL PRIMARY KEY,
    protector_id INTEGER NOT NULL REFERENCES protector(protector_id) ON DELETE CASCADE,
    name VARCHAR(30) NOT NULL,
    gender gender_type,
    birth DATE NOT NULL,
    profile_image VARCHAR(2048),
    coin INTEGER DEFAULT 0 NOT NULL CHECK (coin >= 0),
    grade grade_type NOT NULL,
    level SMALLINT,
    student_pin CHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    expired_at TIMESTAMP
);

COMMENT ON TABLE student IS '학생 정보';
COMMENT ON COLUMN student.gender IS '성별 (MALE/FEMALE) - 성별이 선호하는 단어에 비중을 좀 더 실어주기 위함';
COMMENT ON COLUMN student.birth IS '생년월일 (YYYY-MM-DD)';
COMMENT ON COLUMN student.coin IS '학습 보상 코인';
COMMENT ON COLUMN student.grade IS '학년 (PRE_SCHOOL, GRADE_1 ~ 6)';
COMMENT ON COLUMN student.level IS '레벨 (NULL이면 초기진단 필요)';

-- ==============================================
-- 3. 관심사 (INTEREST)
-- ==============================================

-- 대분류 관심사
CREATE TABLE major_interest (
    major_interest_id SMALLSERIAL PRIMARY KEY,
    major_interest_name VARCHAR(50) NOT NULL
);

COMMENT ON TABLE major_interest IS '대분류 관심사';
COMMENT ON COLUMN major_interest.major_interest_name IS '대분류 이름 (예: 동물, 과학)';

-- 소분류 관심사
CREATE TABLE sub_interest (
    sub_interest_id SMALLSERIAL PRIMARY KEY,
    major_interest_id SMALLINT NOT NULL REFERENCES major_interest(major_interest_id) ON DELETE CASCADE,
    small_interest_name VARCHAR(50) NOT NULL
);

COMMENT ON TABLE sub_interest IS '소분류 관심사';
COMMENT ON COLUMN sub_interest.small_interest_name IS '소분류 이름 (예: 공룡, 우주)';

-- 학생 관심사 연결
CREATE TABLE student_interest (
    student_interest_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    interest_id SMALLINT REFERENCES sub_interest(sub_interest_id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE student_interest IS '학생-관심사 연결 테이블';

-- ==============================================
-- 4. 탐험 유형 (ADVENTURE_TYPE)
-- ==============================================

CREATE TABLE adventure_type (
    adventure_type_id SERIAL PRIMARY KEY,
    adventure_name VARCHAR(50) NOT NULL,
    adventure_info VARCHAR(500) NOT NULL,
    adventure_info_image VARCHAR(2048)
);

COMMENT ON TABLE adventure_type IS '탐험 유형 (동굴 1, 2, 3, 4 등)';
COMMENT ON COLUMN adventure_type.adventure_name IS '탐험 이름';
COMMENT ON COLUMN adventure_type.adventure_info IS '탐험 설명';

-- ==============================================
-- 5. 일일 문제 (DAY_PROBLEM)
-- ==============================================

CREATE TABLE day_problem (
    day_problem_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    interest_id SMALLINT NOT NULL REFERENCES sub_interest(sub_interest_id) ON DELETE CASCADE,
    adventure_type_id INTEGER NOT NULL REFERENCES adventure_type(adventure_type_id) ON DELETE CASCADE,
    assigned_date DATE NOT NULL,
    seq_no SMALLINT NOT NULL CHECK (seq_no BETWEEN 1 AND 10),
    level SMALLINT NOT NULL CHECK (level >= 0),
    problem_text VARCHAR(150) NOT NULL,
    image_url VARCHAR(2048),
    sound_url VARCHAR(2048),
    problem_phonemes TEXT[] NOT NULL,
    blank_position VARCHAR(20),
    blank_phoneme VARCHAR(5),
    choices TEXT[],
    correct_answer VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_completed BOOLEAN DEFAULT false NOT NULL
);

COMMENT ON TABLE day_problem IS '학생별 일일 학습 문제';
COMMENT ON COLUMN day_problem.seq_no IS '문제 순서 (1-10)';
COMMENT ON COLUMN day_problem.problem_text IS '문제 텍스트 (예: 고구마, 별똥별이 떨어진다)';
COMMENT ON COLUMN day_problem.problem_phonemes IS '음소 배열 (예: [[ㄱ,ㅏ], [ㄱ,ㅗ,ㅇ,ㄹ,ㅛ,ㅇ]])';
COMMENT ON COLUMN day_problem.blank_position IS '탐험 1 전용, 빈칸 위치 (초성/중성/종성)';
COMMENT ON COLUMN day_problem.blank_phoneme IS '탐험 1,2 전용, 빈칸에 들어갈 음소';
COMMENT ON COLUMN day_problem.choices IS '탐험 1,2,3 전용, 선택지 배열 (예: [ㅏ,ㅣ,ㅑ])';
COMMENT ON COLUMN day_problem.correct_answer IS '탐험 1,2,3 전용, 정답';

-- ==============================================
-- 6. 학습 세션 (LEARNING_SESSION)
-- ==============================================
CREATE TABLE learning_session (
    session_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    study_type study_type NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE learning_session IS '학습 세션 (학습 시작~종료)';
COMMENT ON COLUMN learning_session.study_type IS '학습 유형 (DAILY: 일일학습, SUPPLE: 보충학습)';
COMMENT ON COLUMN learning_session.start_time IS '학습 시작 시간';
COMMENT ON COLUMN learning_session.end_time IS '학습 종료 시간';

-- ==============================================
-- 7. 오류 패턴 (ERROR_PATTERN)
-- ==============================================
CREATE TABLE error_pattern (
    error_pattern_id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES learning_session(session_id) ON DELETE CASCADE,
    real_jamo CHAR(1) NOT NULL,
    confusion_jamo CHAR(1) NOT NULL,
    phoneme_position VARCHAR(10),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE error_pattern IS '학생별 음소 오류 패턴';
COMMENT ON COLUMN error_pattern.session_id IS '학습 세션 ID';
COMMENT ON COLUMN error_pattern.real_jamo IS '정답 음소';
COMMENT ON COLUMN error_pattern.confusion_jamo IS '학생이 입력한 오답 음소';
COMMENT ON COLUMN error_pattern.phoneme_position IS '음소 위치 (초성/중성/종성)';

-- ==============================================
-- 9. 자모 통계 (JAMO_STAT)
-- ==============================================

CREATE TABLE jamo_stat (
    stat_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    jamo VARCHAR(5) NOT NULL,
    total_attempts SMALLINT DEFAULT 0 NOT NULL CHECK (total_attempts >= 0),
    fail_count SMALLINT DEFAULT 0 NOT NULL CHECK (fail_count >= 0),
    weekly_fail_rate DOUBLE PRECISION NOT NULL,
    weekly_accuracy_rate DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE jamo_stat IS '학생별 자모 통계 (누적)';
COMMENT ON COLUMN jamo_stat.jamo IS '자음 또는 모음';
COMMENT ON COLUMN jamo_stat.total_attempts IS '총 시도 횟수';
COMMENT ON COLUMN jamo_stat.fail_count IS '총 실패 횟수';
COMMENT ON COLUMN jamo_stat.weekly_fail_rate IS '주간 실패율';
COMMENT ON COLUMN jamo_stat.weekly_accuracy_rate IS '주간 정확도';

-- ==============================================
-- 10. 주간 학습 리포트 (WEEKLY_PERSONAL_REPORT)
-- ==============================================

CREATE TABLE weekly_personal_report (
    report_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    total_time INTEGER DEFAULT 0,
    curriculum TEXT,
    curriculum_structure JSON, 
    discussion_log JSON,
    protector_goal protector_goal_type NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE weekly_personal_report IS '주간 학습 리포트';
COMMENT ON COLUMN weekly_personal_report.total_time IS '총 학습 시간 (초 단위)';
COMMENT ON COLUMN weekly_personal_report.curriculum IS 'AI가 제안한 커리큘럼';
COMMENT ON COLUMN weekly_personal_report.discussion_log IS 'AI 에이전트 협의 내용 및 결론';
COMMENT ON COLUMN weekly_personal_report.protector_goal IS '보호자가 선택한 학습 목표 (WEAKNESS_FOCUS, JAMO_PRACTICE 등)';
COMMENT ON COLUMN weekly_personal_report.created_at IS '주간 리포트 생성일';

-- ==============================================
-- 11. 주간 자모 통계 (WEEKLY_JAMO_STAT)
-- ==============================================

CREATE TABLE weekly_jamo_stat (
    stat_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    report_id INTEGER NOT NULL REFERENCES weekly_personal_report(report_id) ON DELETE CASCADE,
    jamo VARCHAR(5) NOT NULL,
    total_attempts SMALLINT DEFAULT 0 NOT NULL CHECK (total_attempts >= 0),
    fail_count SMALLINT DEFAULT 0 NOT NULL CHECK (fail_count >= 0),
    weekly_fail_rate DOUBLE PRECISION NOT NULL,
    weekly_accuracy_rate DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE weekly_jamo_stat IS '주간 리포트별 자모 통계';
COMMENT ON COLUMN weekly_jamo_stat.jamo IS '자음 또는 모음';

-- ==============================================
-- 12. 레벨 변경 이력 (LEVEL_HISTORY)
-- ==============================================

CREATE TABLE level_history (
    level_history_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    prev_level SMALLINT NOT NULL CHECK (prev_level >= 0),
    new_level SMALLINT NOT NULL CHECK (new_level >= 0),
    reason VARCHAR(300) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE level_history IS '학생 레벨 변경 이력';
COMMENT ON COLUMN level_history.reason IS '레벨 변경 사유 (예: 관리자 조정, 커리큘럼 결과)';

-- ==============================================
-- 13. 초기 진단 (DIAGNOSIS)
-- ==============================================

-- 초기 진단 세션
CREATE TABLE diagnosis_session (
    student_id INTEGER PRIMARY KEY REFERENCES student(student_id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP
);

COMMENT ON TABLE diagnosis_session IS '학생별 초기 진단 세션';

-- 초기 진단 문제
CREATE TABLE initial_diagnosis_problem (
    initial_diagnosis_problem_id SERIAL PRIMARY KEY,
    diagnosis_type diagnosis_type NOT NULL,
    problem VARCHAR(500) NOT NULL,
    choices TEXT[],
    problem_image_url VARCHAR(2048),
    problem_sound_url VARCHAR(2048),
    correct_answer VARCHAR(500) NOT NULL
);

COMMENT ON TABLE initial_diagnosis_problem IS '초기 진단 문제 풀';
COMMENT ON COLUMN initial_diagnosis_problem.problem_sound_url IS '모범 발음 오디오';

-- 초기 진단 결과
CREATE TABLE initial_diagnosis_result (
    initial_diagnosis_result_id SERIAL PRIMARY KEY,
    initial_diagnosis_problem_id INTEGER NOT NULL REFERENCES initial_diagnosis_problem(initial_diagnosis_problem_id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    student_answer VARCHAR(500) NOT NULL,
    is_correct BOOLEAN NOT NULL
);

COMMENT ON TABLE initial_diagnosis_result IS '학생별 초기 진단 결과';

-- ==============================================
-- 14. 음소 특성 (PHONEME_FEATURE)
-- ==============================================

CREATE TABLE phoneme_feature (
    phoneme CHAR(1) PRIMARY KEY,
    is_vowel BOOLEAN NOT NULL,
    place VARCHAR(10) NOT NULL,
    manner VARCHAR(10) NOT NULL
);

COMMENT ON TABLE phoneme_feature IS '한글 음소별 언어학적 특성';
COMMENT ON COLUMN phoneme_feature.phoneme IS '음소 (예: ㄱ, ㄴ, ㅏ, ㅑ)';
COMMENT ON COLUMN phoneme_feature.is_vowel IS '모음 여부';
COMMENT ON COLUMN phoneme_feature.place IS '조음 위치 (예: 양순음, 경구개음)';
COMMENT ON COLUMN phoneme_feature.manner IS '조음 방법 (예: 파열음, 마찰음)';

-- ==============================================
-- 15. 인덱스 생성 (성능 최적화)
-- ==============================================

-- PROTECTOR
CREATE INDEX idx_protector_provider_social_id ON protector(provider, social_id);
CREATE INDEX idx_protector_is_deleted ON protector(is_deleted);

-- STUDENT
CREATE INDEX idx_student_protector_id ON student(protector_id);
CREATE INDEX idx_student_level ON student(level);
CREATE INDEX idx_student_deleted_at ON student(deleted_at);

-- STUDENT_INTEREST
CREATE INDEX idx_student_interest_student_id ON student_interest(student_id);
CREATE INDEX idx_student_interest_interest_id ON student_interest(interest_id);

-- DAY_PROBLEM
CREATE INDEX idx_day_problem_student_id ON day_problem(student_id);
CREATE INDEX idx_day_problem_assigned_date ON day_problem(assigned_date);
CREATE INDEX idx_day_problem_adventure_type_id ON day_problem(adventure_type_id);
CREATE INDEX idx_day_problem_is_completed ON day_problem(is_completed);

-- LEARNING_SESSION
CREATE INDEX idx_learning_session_student_id ON learning_session(student_id);
CREATE INDEX idx_learning_session_start_time ON learning_session(start_time);
CREATE INDEX idx_learning_session_study_type ON learning_session(study_type);

-- ERROR_PATTERN
CREATE INDEX idx_error_pattern_session_id ON error_pattern(session_id);
CREATE INDEX idx_error_pattern_real_jamo ON error_pattern(real_jamo);

-- JAMO_STAT
CREATE INDEX idx_jamo_stat_student_id ON jamo_stat(student_id);
CREATE INDEX idx_jamo_stat_jamo ON jamo_stat(jamo);

-- WEEKLY_PERSONAL_REPORT
CREATE INDEX idx_weekly_report_student_id ON weekly_personal_report(student_id);
CREATE INDEX idx_weekly_report_created_at ON weekly_personal_report(created_at);

-- WEEKLY_JAMO_STAT
CREATE INDEX idx_weekly_jamo_stat_report_id ON weekly_jamo_stat(report_id);
CREATE INDEX idx_weekly_jamo_stat_student_id ON weekly_jamo_stat(student_id);

-- LEVEL_HISTORY
CREATE INDEX idx_level_history_student_id ON level_history(student_id);
CREATE INDEX idx_level_history_changed_at ON level_history(changed_at);

-- INITIAL_DIAGNOSIS_RESULT
CREATE INDEX idx_diagnosis_result_student_id ON initial_diagnosis_result(student_id);
CREATE INDEX idx_diagnosis_result_problem_id ON initial_diagnosis_result(initial_diagnosis_problem_id);

-- ==============================================
-- 16. 트리거 함수 (자동 업데이트)
-- ==============================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- jamo_stat 테이블에 트리거 적용
CREATE TRIGGER update_jamo_stat_updated_at
BEFORE UPDATE ON jamo_stat
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 17. 권한 설정
-- ==============================================

-- captain_echo 데이터베이스에 대한 권한 부여
GRANT ALL PRIVILEGES ON DATABASE captain_echo TO doonki;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO doonki;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO doonki;

-- ==============================================
-- 18. 완료 메시지
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Captain Echo 데이터베이스 초기화 완료! (ERD 기반)';
    RAISE NOTICE '데이터베이스: captain_echo';
    RAISE NOTICE '사용자: doonki';
    RAISE NOTICE '테이블: 19개';
    RAISE NOTICE 'ENUM 타입: 6개';
    RAISE NOTICE '스키마 버전: 2.3';
    RAISE NOTICE '==============================================';
END $$;