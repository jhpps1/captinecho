from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.src.agents.parent import build as build_parent_agent

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post('/api/build-parent-agent')
async def build_parent_agent_api(request: Request):
    data = await request.json()
    
    # 필드 파싱 + 타입 변환
    student_id = data.get('student_id')
    level = int(data.get('level'))
    protector_goal = data.get('protector_goal')
    small_interest_name = data.get('small_interest_name')
    
    # Agent 생성
    agent = build_parent_agent(student_id, level, protector_goal, small_interest_name)
    
    # 결과 내보내기 (핵심 프롬프트 내용만 JSON 예시)
    return {
        "role": agent.role,
        "goal": agent.goal,
        "backstory": agent.backstory
    }
