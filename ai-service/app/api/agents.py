"""
AI Agents API Endpoints
========================
CrewAI 에이전트 관련 API
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

# dyslexia_crew 모듈을 가져옵니다.
from app.src.dyslexia_crew.main import run_crew_analysis
import uuid

router = APIRouter()

# 요청/응답 모델
class AgentRequest(BaseModel):
    """에이전트 실행 요청 모델"""
    task_type: str  # curriculum, feedback, quiz, etc.
    input_data: Dict[str, Any] # 예: {"student_id": 1}
    user_id: Optional[str] = None
    session_id: Optional[str] = None

class AgentResponse(BaseModel):
    """에이전트 실행 응답 모델"""
    task_id: str
    status: str  # pending, processing, completed, failed
    result: Optional[Dict[str, Any]] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

# 임시 작업 저장소 (실제로는 Redis나 DB 사용)
tasks_store = {}

@router.post("/execute", response_model=AgentResponse)
async def execute_agent(
    request: AgentRequest,
    background_tasks: BackgroundTasks
):
    """
    AI 에이전트 실행 요청

    지원하는 작업 유형:
    - curriculum: 커리큘럼 생성
    - feedback: 학습 피드백 생성
    - quiz: 퀴즈 생성
    - assessment: 평가 분석
    """
    # 작업 ID 생성
    task_id = str(uuid.uuid4())

    # 작업 정보 저장
    task_info = AgentResponse(
        task_id=task_id,
        status="pending",
        created_at=datetime.utcnow(),
        completed_at=None,
        result=None
    )
    tasks_store[task_id] = task_info

    # 백그라운드 작업으로 에이전트 실행
    background_tasks.add_task(
        process_agent_task,
        task_id,
        request.task_type,
        request.input_data
    )

    return task_info

async def process_agent_task(task_id: str, task_type: str, input_data: Dict[str, Any]):
    """백그라운드에서 에이전트 작업 처리"""
    try:
        # 작업 상태 업데이트
        tasks_store[task_id].status = "processing"

        result = {}
        # task_type에 따라 적절한 crew 실행
        if task_type == "dyslexia_analysis":
            student_id = input_data.get("student_id")
            if student_id:
                # dyslexia_crew/main.py에서 가져온 함수를 사용합니다.
                # 실제 DB에서 데이터를 가져오도록 dyslexia_crew/main.py의 get_student_data 함수를 구현해야 합니다.
                # 지금은 예시 데이터를 사용합니다.
                student_data_for_crew = f"학생 ID: {student_id}, 이름: 김철수, 최근 학습 성공률: 65%, 출석률: 90%"
                result = run_crew_analysis(student_data=student_data_for_crew)
            else:
                raise ValueError("student_id is required for dyslexia_analysis")
        else:
            # 다른 작업 유형에 대한 처리
            raise NotImplementedError(f"Task type '{task_type}' is not implemented.")

        # 작업 완료
        tasks_store[task_id].status = "completed"
        tasks_store[task_id].result = result
        tasks_store[task_id].completed_at = datetime.utcnow()

    except Exception as e:
        print(f"Error processing task {task_id}: {e}") # 디버깅을 위한 로그
        tasks_store[task_id].status = "failed"
        tasks_store[task_id].result = {"error": str(e)}
        tasks_store[task_id].completed_at = datetime.utcnow()

@router.get("/task/{task_id}", response_model=AgentResponse)
async def get_task_status(task_id: str):
    """작업 상태 조회"""
    if task_id not in tasks_store:
        raise HTTPException(status_code=404, detail="Task not found")

    return tasks_store[task_id]

@router.get("/agents")
async def list_available_agents():
    """사용 가능한 AI 에이전트 목록"""
    return {
        "agents": [
            {
                "name": "CurriculumAgent",
                "description": "학습 커리큘럼 생성 에이전트",
                "task_type": "curriculum",
                "capabilities": ["course_planning", "learning_path", "prerequisite_analysis"]
            },
            {
                "name": "FeedbackAgent",
                "description": "학습 피드백 생성 에이전트",
                "task_type": "feedback",
                "capabilities": ["performance_analysis", "improvement_suggestions", "personalized_feedback"]
            },
            {
                "name": "QuizAgent",
                "description": "퀴즈 및 평가 생성 에이전트",
                "task_type": "quiz",
                "capabilities": ["quiz_generation", "difficulty_adjustment", "answer_evaluation"]
            },
            {
                "name": "AssessmentAgent",
                "description": "학습 평가 분석 에이전트",
                "task_type": "assessment",
                "capabilities": ["skill_assessment", "progress_tracking", "competency_mapping"]
            }
        ]
    }