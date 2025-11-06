# app/src/tasks/question.py

from sqlalchemy.orm import Session
from app.src.core.models import WeeklyPersonalReport, DayProblem
from datetime import datetime
from typing import List

# 커리큘럼 조회 task
def get_latest_curriculum(session: Session, student_id: int):
    return (
        session.query(WeeklyPersonalReport.curriculum)
        .filter(WeeklyPersonalReport.student_id == student_id)
        .order_by(WeeklyPersonalReport.created_at.desc())
        .first()
    )


# DayProblem 문제 데이터 생성
def create_day_problem(session: Session, **kwargs) -> DayProblem:
    """
    DayProblem row를 생성하고 DB에 저장.
    kwargs: {column_name: value}로 전달
    예시: {'student_id': 1, 'adventure_type_id':2, ...}
    """
    problem = DayProblem(
        created_at=datetime.now(),
        is_completed=False,
        **kwargs
    )
    session.add(problem)
    session.commit()
    session.refresh(problem)
    return problem

# 지정 학생/날짜별 문제 리스트 조회
def get_day_problems_by_date(session: Session, student_id: int, assigned_date) -> List[DayProblem]:
    """학생, 날짜별로 생성된 문제 리스트를 가져옴."""
    return (
        session.query(DayProblem)
        .filter(DayProblem.student_id == student_id, DayProblem.assigned_date == assigned_date)
        .order_by(DayProblem.seq_no)
        .all()
    )

# 특정 문제 풀이 완료 처리
def update_day_problem_complete(session: Session, day_problem_id: int, is_completed: bool = True) -> DayProblem:
    """is_completed(풀이완료) 값 업데이트."""
    problem = session.query(DayProblem).get(day_problem_id)
    if not problem:
        return None
    problem.is_completed = is_completed
    session.commit()
    return problem
