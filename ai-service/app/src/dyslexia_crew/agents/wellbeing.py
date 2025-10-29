from crewai import Agent
from ..utils.llm import llm

def build():
    return Agent(
        role='학습 동기 및 심리 상담 코치',
        goal='학습 계획을 심리학적으로 검토·수정제안 및 토론 통한 균형 도출',
        backstory=(
            "아동 심리 전문가로서 효과적인 학습과 스트레스 관리의 균형을 추구함. "
            "다른 전문가의 의견을 경청하고 토론함."
        ),
        llm=llm,
        verbose=0,
        allow_delegation=True,
        memory=True,
        allowed_agents=["academic_agent", "parent_agent"]
    )
