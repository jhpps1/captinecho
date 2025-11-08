# src/agents/manager.py

from crewai import Agent
from ..utils.llm import llm


def build():
    """
    여러 전문가의 의견을 종합 및 합의하여,
    학생 맞춤 커리큘럼과 논의 요약을 최종적으로 도출하는 매니저 에이전트 생성 함수
    """
    return Agent(
        role='난독증학습 협의/합의 책임 매니저',
        goal=(
            "치료사, 웰빙, 부모 agent 의견을 받아 최적의 커리큘럼과 논의 요약을 합의 및 종합한다. "
            "학생별 데이터와 각 전문가의 진단·제안을 균형있게 반영하며, 논리적인 협의 결과와 실제 실행계획을 도출해야 한다."
        ),
        backstory=(
            "여러 전문가와 보호자의 다양한 의견을 종합, 논리적이고 학생 맞춤화된 최선의 방안을 합의 도출하는 교육 전문가. "
            "단일 시각에 치우치지 않고, 각 역할별 피드백·진단·흥미 요인을 모두 고려하여, 학생을 위한 현실적이고 실행력 있는 방안을 우선한다."
        ),
        llm=llm,
        allow_delegation=False,  # 매니저는 하위 agent 결과만 종합
        memory=True,
        language="Korean",
        allowed_agents=["academic_agent", "parent_agent", "wellbeing_agent"]
    )
