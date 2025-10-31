from crewai import Crew, Process # Crew와 토론 프로세스(순차, 병렬 등) 관리하는 핵심 클래스 임포트
from app.src.dyslexia_crew.agents import build_academic_agent, build_wellbeing_agent, build_parent_agent
from app.src.dyslexia_crew.tasks import build_debate_round1, build_debate_round2, build_negotiation, build_consensus

def build_crew(student_data=None):
    academic_agent = build_academic_agent()
    wellbeing_agent = build_wellbeing_agent()
    parent_agent = build_parent_agent()

    # 라운드별 협의 Task 객체 생성
    t1 = build_debate_round1(agent=academic_agent, student_data=student_data)
    t2 = build_debate_round2(agent=wellbeing_agent, context_task=t1)
    t3 = build_negotiation(agent=academic_agent, context_tasks=[t1, t2])
    t4 = build_consensus(agent=parent_agent, context_tasks=[t1, t2, t3])

    crew = Crew(
        agents=[academic_agent, wellbeing_agent, parent_agent],
        tasks=[t1, t2, t3, t4],
        process=Process.sequential,  # 순차적 라운드 + 내부 delegation/memory 가능
        memory=True,                  # 토론 내역 누적
        verbose=1
    )
    return crew
