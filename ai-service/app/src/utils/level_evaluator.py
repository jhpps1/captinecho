#!/usr/bin/env python3
"""
레벨 평가 로직 (jamo_stat 기반)
problem_result 테이블 없이 jamo_stat의 weekly_accuracy_rate로 레벨 평가
"""
from datetime import datetime
from sqlalchemy.orm import Session
from app.src.core.models import Student, JamoStat, LevelHistory


def analyze_student_performance(db: Session, student_id: int) -> dict:
    """
    학생의 최근 성과 분석 (jamo_stat 기반)

    Args:
        db: DB 세션
        student_id: 학생 ID

    Returns:
        성과 분석 결과 딕셔너리
    """
    # JamoStat 조회
    jamo_stats = db.query(JamoStat).filter_by(student_id=student_id).all()

    if not jamo_stats:
        return {
            "has_data": False,
            "avg_accuracy": 0.0,
            "avg_fail_rate": 0.0,
            "total_jamos": 0
        }

    # 평균 정확도 및 실패율 계산
    total_accuracy = sum(j.weekly_accuracy_rate or 0.0 for j in jamo_stats)
    total_fail_rate = sum(j.weekly_fail_rate or 0.0 for j in jamo_stats)

    avg_accuracy = total_accuracy / len(jamo_stats)
    avg_fail_rate = total_fail_rate / len(jamo_stats)

    return {
        "has_data": True,
        "avg_accuracy": avg_accuracy,
        "avg_fail_rate": avg_fail_rate,
        "total_jamos": len(jamo_stats),
        "jamo_stats": jamo_stats
    }


def should_adjust_level(current_level: int, avg_accuracy: float) -> tuple[bool, int, str]:
    """
    레벨 조정 여부 판단

    Args:
        current_level: 현재 레벨
        avg_accuracy: 평균 정확도 (0.0 ~ 1.0)

    Returns:
        (조정 필요 여부, 새 레벨, 사유) 튜플
    """
    # 정확도 80% 이상 → 레벨 상승
    if avg_accuracy >= 0.8:
        new_level = min(current_level + 1, 6)  # 최대 레벨 6
        if new_level == current_level:
            return False, current_level, "이미 최고 레벨입니다"
        return True, new_level, f"정확도 {avg_accuracy:.1%}로 우수한 성과를 보여 레벨 상승"

    # 정확도 50% 이하 → 레벨 하락
    elif avg_accuracy <= 0.5:
        new_level = max(current_level - 1, 1)  # 최소 레벨 1
        if new_level == current_level:
            return False, current_level, "이미 최저 레벨입니다"
        return True, new_level, f"정확도 {avg_accuracy:.1%}로 어려움을 겪고 있어 레벨 조정"

    # 50% ~ 80% → 현재 레벨 유지
    else:
        return False, current_level, f"정확도 {avg_accuracy:.1%}로 적정 난이도 유지"


def update_student_level(db: Session, student_id: int, new_level: int, reason: str) -> bool:
    """
    학생 레벨 업데이트 및 이력 저장

    Args:
        db: DB 세션
        student_id: 학생 ID
        new_level: 새 레벨
        reason: 변경 사유

    Returns:
        성공 여부
    """
    try:
        # Student 조회
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            return False

        prev_level = student.level or 1

        # 레벨이 같으면 변경 안함
        if prev_level == new_level:
            return False

        # Student 레벨 업데이트
        student.level = new_level

        # LevelHistory 기록
        history = LevelHistory(
            student_id=student_id,
            prev_level=prev_level,
            new_level=new_level,
            reason=reason,
            changed_at=datetime.now()
        )
        db.add(history)
        db.commit()

        return True

    except Exception as e:
        db.rollback()
        print(f"레벨 업데이트 실패: {e}")
        return False


def get_level_adjustment_recommendation(db: Session, student_id: int) -> dict:
    """
    레벨 조정 추천 (CrewAI Manager에게 제공할 정보)

    Args:
        db: DB 세션
        student_id: 학생 ID

    Returns:
        레벨 조정 추천 정보
    """
    # 성과 분석
    performance = analyze_student_performance(db, student_id)

    if not performance["has_data"]:
        return {
            "current_level": 1,
            "recommended_level": 1,
            "should_adjust": False,
            "reason": "학습 데이터가 부족합니다",
            "avg_accuracy": 0.0
        }

    # 현재 레벨 조회
    student = db.query(Student).filter(Student.student_id == student_id).first()
    current_level = student.level or 1

    # 레벨 조정 판단
    should_adjust, new_level, reason = should_adjust_level(
        current_level,
        performance["avg_accuracy"]
    )

    return {
        "current_level": current_level,
        "recommended_level": new_level,
        "should_adjust": should_adjust,
        "reason": reason,
        "avg_accuracy": performance["avg_accuracy"],
        "avg_fail_rate": performance["avg_fail_rate"]
    }
