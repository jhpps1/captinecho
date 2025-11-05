# src/core/models.py

from sqlalchemy import Column, Integer, String, Date, DateTime, Text, ForeignKey, JSON, Float, Enum, SmallInteger, TIMESTAMP
import enum
from sqlalchemy.orm import relationship
from .database import Base

class Gender(enum.Enum):
    남 = "남"
    여 = "여"

class Student(Base):
    __tablename__ = "student"
    student_id = Column(Integer, primary_key=True, autoincrement=True)
    protector_id = Column(Integer, ForeignKey("protector.protector_id"))
    name = Column(String, nullable=False)
    gender = Column(Enum(Gender), nullable=True)
    level = Column(SmallInteger)

class ErrorPattern(Base):
    __tablename__ = "error_pattern"
    error_pattern_id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("student.student_id"))
    session_detail_id = Column(Integer, ForeignKey("session_detail.session_detail_id"))
    real_jamo = Column(String(50))
    error_type = Column(String(100))
    occurred_at = Column(DateTime)
    # 기타 오류 패턴 필드

class LearningSession(Base):
    __tablename__ = "learning_session"
    learning_session_id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("student.student_id"))
    started_at = Column(DateTime)
    ended_at = Column(DateTime)
    study_type = Column(String(20))
    # 기타 세션 관련 필드

class SessionDetail(Base):
    __tablename__ = "session_detail"
    session_detail_id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("learning_session.learning_session_id"))
    day_problem_id = Column(Integer)
    # 기타 풀이 상세 필드

class LevelHistory(Base):
    __tablename__ = "level_history"
    level_history_id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("student.student_id"))
    changed_at = Column(DateTime)
    previous_level = Column(String(10))
    new_level = Column(String(10))

class ProtectorGoalType(enum.Enum):
    자모학습 = "자모 학습"
    받침학습 = "받침학습"
    단어연습 = "단어 연습"
    취약점위주 = "취약점 위주"

# 3. WEEKLY_PERSONAL_REPORT (네가 이미 쓰던 리포트)
class WeeklyPersonalReport(Base):
    __tablename__ = "weekly_personal_report"
    report_id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("student.student_id"))
    total_time = Column(Integer)
    error_rate = Column(Float)
    improvement_rate = Column(Float)
    curriculum = Column(Text)
    discussion_log = Column(Text)
    protector_goal = Column(
        Enum(
            ProtectorGoalType,
            values_callable=lambda x: [e.value for e in x]
        ),
        nullable=True
    )
    created_at = Column(DateTime)

# 2. WEEKLY_JAMO_STAT (주간 자모 통계)
class WeeklyJamoStat(Base):
    __tablename__ = "weekly_jamo_stat"
    stat_id = Column(Integer, primary_key=True)
    student_id = Column(Integer, nullable=False)
    report_id = Column(Integer, nullable=False)
    jamo = Column(String(5), nullable=False)
    total_attempts = Column(SmallInteger, nullable=False, default=0)
    fail_count = Column(SmallInteger, nullable=False, default=0)
    weekly_fail_rate = Column(Float, nullable=False)
    weekly_accuracy_rate = Column(Float, nullable=False)
    created_at = Column(DateTime, nullable=False)

    
# JAMO_STAT (자모별 누적/주간 통계)
class JamoStat(Base):
    __tablename__ = "jamo_stat"
    stat_id = Column(Integer, primary_key=True)  # ← 반드시 stat_id!
    student_id = Column(Integer, ForeignKey("student.student_id"))
    jamo = Column(String(10), nullable=False)
    total_attempts = Column(Integer, default=0)
    fail_count = Column(Integer, default=0)
    weekly_fail_rate = Column(Float, default=0.0)
    weekly_accuracy_rate = Column(Float, default=0.0)
    updated_at = Column(DateTime)

