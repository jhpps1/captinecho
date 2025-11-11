# src/core/models.py

from sqlalchemy import Column, Integer, String, Date, DateTime, Text, ForeignKey, JSON, Float, Boolean, Enum, SmallInteger, TIMESTAMP, CHAR
from sqlalchemy.dialects.postgresql import ARRAY
import enum
from sqlalchemy.orm import relationship
from .database import Base

# ============================================
# ENUM 타입 정의 (init.sql 기반)
# ============================================

class Gender(enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"

class ProtectorGoalType(enum.Enum):
    FOCUS_ON_WEAKNESS = "FOCUS_ON_WEAKNESS"
    BUILD_CONFIDENCE = "BUILD_CONFIDENCE"
    INCREASE_DIFFICULTY = "INCREASE_DIFFICULTY"

class StudyType(enum.Enum):
    DAILY = "DAILY"
    SUPPLE = "SUPPLE"

class ProviderType(enum.Enum):
    GOOGLE = "GOOGLE"
    KAKAO = "KAKAO"

# ============================================
# 테이블 모델 정의 (init.sql ERD 2.3 기반)
# ============================================

class Protector(Base):
    """보호자 (ERD 2.3 기반)"""
    __tablename__ = "protector"
    protector_id = Column(Integer, primary_key=True, autoincrement=True)
    protector_pin = Column(CHAR(100), nullable=True)
    provider = Column(Enum(ProviderType), nullable=False)
    social_id = Column(String(255), nullable=False)
    email = Column(String(500), nullable=True)
    max_student_count = Column(SmallInteger, default=2)
    terms_agreed = Column(SmallInteger, default=False, nullable=False)
    created_at = Column(DateTime, nullable=False)
    is_deleted = Column(SmallInteger, default=False, nullable=False)
    deleted_at = Column(DateTime, nullable=True)

class Student(Base):
    __tablename__ = "student"
    student_id = Column(Integer, primary_key=True, autoincrement=True)
    protector_id = Column(Integer, ForeignKey("protector.protector_id"))
    name = Column(String(30), nullable=False)
    gender = Column(Enum(Gender), nullable=True)
    level = Column(SmallInteger, nullable=True)

class ErrorPattern(Base):
    """오류 패턴 (ERD 2.3 기반)"""
    __tablename__ = "error_pattern"
    error_pattern_id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("learning_session.session_id"), nullable=False)
    real_jamo = Column(CHAR(1), nullable=False)
    confusion_jamo = Column(CHAR(1), nullable=False)
    phoneme_position = Column(String(10), nullable=True)
    created_at = Column(DateTime, nullable=False)

class LearningSession(Base):
    """학습 세션 (ERD 2.3 기반)"""
    __tablename__ = "learning_session"
    session_id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("student.student_id"), nullable=False)
    study_type = Column(Enum(StudyType), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False)

class LevelHistory(Base):
    __tablename__ = "level_history"
    level_history_id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("student.student_id"))
    prev_level = Column(SmallInteger, nullable=False)
    new_level = Column(SmallInteger, nullable=False)
    reason = Column(String(300), nullable=False)
    changed_at = Column(DateTime, nullable=False)

class WeeklyPersonalReport(Base):
    """주간 학습 리포트 (ERD 2.3 기반)"""
    __tablename__ = "weekly_personal_report"
    report_id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("student.student_id"), nullable=False)
    total_time = Column(Integer, default=0)
    curriculum = Column(Text, nullable=True)
    discussion_log = Column(JSON, nullable=True)  # A2A 협의 로그 (UI용) - JSONB
    curriculum_structure = Column(JSON, nullable=True)  # 구조화된 커리큘럼 (AI용) - JSONB
    protector_goal = Column(Enum(ProtectorGoalType), nullable=False)
    created_at = Column(DateTime, nullable=False)

class WeeklyJamoStat(Base):
    """주간 자모 통계 (ERD 2.3 기반)"""
    __tablename__ = "weekly_jamo_stat"
    stat_id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("student.student_id"), nullable=False)
    report_id = Column(Integer, ForeignKey("weekly_personal_report.report_id"), nullable=False)
    jamo = Column(String(5), nullable=False)
    total_attempts = Column(SmallInteger, nullable=False, default=0)
    fail_count = Column(SmallInteger, nullable=False, default=0)
    weekly_fail_rate = Column(Float, nullable=False)
    weekly_accuracy_rate = Column(Float, nullable=False)
    created_at = Column(DateTime, nullable=False)

class JamoStat(Base):
    """자모별 누적/주간 통계 (ERD 2.3 기반)"""
    __tablename__ = "jamo_stat"
    stat_id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("student.student_id"), nullable=False)
    jamo = Column(String(5), nullable=False)
    total_attempts = Column(SmallInteger, nullable=False, default=0)
    fail_count = Column(SmallInteger, nullable=False, default=0)
    weekly_fail_rate = Column(Float, nullable=False)
    weekly_accuracy_rate = Column(Float, nullable=False)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)

class MajorInterest(Base):
    """대분류 관심사 (ERD 2.3 기반)"""
    __tablename__ = "major_interest"
    major_interest_id = Column(SmallInteger, primary_key=True, autoincrement=True)
    major_interest_name = Column(String(50), nullable=False)

class SubInterest(Base):
    """소분류 관심사 (ERD 2.3 기반)"""
    __tablename__ = "sub_interest"
    sub_interest_id = Column(SmallInteger, primary_key=True, autoincrement=True)
    major_interest_id = Column(SmallInteger, ForeignKey("major_interest.major_interest_id"), nullable=False)
    small_interest_name = Column(String(50), nullable=False)

class StudentInterest(Base):
    """학생-관심사 연결 테이블 (ERD 2.3 기반)"""
    __tablename__ = "student_interest"
    student_interest_id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("student.student_id"), nullable=False)
    interest_id = Column(SmallInteger, ForeignKey("sub_interest.sub_interest_id"), nullable=True)
    created_at = Column(DateTime, nullable=False)

class AdventureType(Base):
    """탐험 유형 (ERD 2.3 기반)"""
    __tablename__ = "adventure_type"
    adventure_type_id = Column(Integer, primary_key=True, autoincrement=True)
    adventure_name = Column(String(50), nullable=False)
    adventure_info = Column(String(500), nullable=False)
    adventure_info_image = Column(String(2048), nullable=True)

class DayProblem(Base):
    """일일 문제 (ERD 2.3 기반)"""
    __tablename__ = "day_problem"
    day_problem_id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("student.student_id"), nullable=False)
    interest_id = Column(SmallInteger, ForeignKey("sub_interest.sub_interest_id"), nullable=False)
    adventure_type_id = Column(Integer, ForeignKey("adventure_type.adventure_type_id"), nullable=False)
    assigned_date = Column(Date, nullable=False)
    seq_no = Column(SmallInteger, nullable=False)
    level = Column(SmallInteger, nullable=False)
    problem_text = Column(String(150), nullable=False)
    image_url = Column(String(2048), nullable=True)
    sound_url = Column(String(2048), nullable=True)
    problem_phonemes = Column(ARRAY(String), nullable=False)  # PostgreSQL TEXT[] (Python list)
    blank_position = Column(String(20), nullable=True)
    blank_phoneme = Column(String(5), nullable=True)
    choices = Column(ARRAY(String), nullable=True)  # PostgreSQL TEXT[] (Python list)
    correct_answer = Column(String(100), nullable=True)
    created_at = Column(DateTime, nullable=False)
    is_completed = Column(SmallInteger, default=False, nullable=False)
