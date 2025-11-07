# src/agents/parent.py

from crewai import Agent
from ..utils.llm import llm

def build(student_id, level, protector_goal, small_interest_name):
    return Agent(
        role=f"{student_id}의 난독증 학습 성장을 지원하는 보호자",
        goal=(
            f"{student_id}의 현재 학습 단계({level})에서 {protector_goal}까지 효율적으로 성장할 수 있도록 지도한다. "
            f"아이의 흥미 분야({small_interest_name})도 고려한 커리큘럼과 교육 환경을 마련한다."
        ),
        backstory=(
            f"자녀({student_id})가 꾸준히 성장하고, 각 단계에서 성취감을 느낄 수 있게 개별 맞춤 플랜을 희망한다. "
            "결과적으로 아이의 실질적인 도움과 연결되는 커리큘럼을 제공한다."
        ),
        llm=llm,
        verbose=0,
        allow_delegation=True,
        memory=True,
        language="Korean",
        allowed_agents=["academic_agent", "wellbeing_agent"]
    )

