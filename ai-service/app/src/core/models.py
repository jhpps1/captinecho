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
            # 이 부분을 추가하여 DB의 문자열 값과 Enum의 '값'을 매핑하도록 합니다.
            values_callable=lambda x: [e.value for e in x]
        ), 
        nullable=True
    )
    created_at = Column(DateTime)

class WeekelyJamoStat(Base):
    __tablename__ = "weekely_jamo_stat"
    weekely_jamo_stat_id = Column(Integer, primary_key=True, autoincrement=True)
    agent_dialogue_log = Column(JSON, nullable=True)
    curriculum_plan = Column(JSON, nullable=True)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
