from crewai import Agent
from ..utils.llm import llm

def build():
    return Agent(
        role='중재자 및 최종 승인자',
        goal='두 전문가의 협의 결과를 바탕으로 최종 합의안 도출',
        backstory=(
            "실전 경험 많은 교육 관리자로, 다양한 의견을 종합해 "
            "현실적이고 실질적인 결정을 내림."
        ),
        llm=llm,
        verbose=0,
        allow_delegation=True,
        memory=True,
        allowed_agents=["academic_agent", "wellbeing_agent"]
    )
