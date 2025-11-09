from crewai import Crew, Process
from crewai.flow.flow import Flow, start, listen
from app.src.agents import (
    build_academic_agent, build_wellbeing_agent, build_parent_agent, build_manager_agent
)
from app.src.tasks import build_debate_round1, build_manager_task
from pydantic import BaseModel

class ConvState(BaseModel):
    turns: int = 0
    history: list[str] = []
    user_input: str | None = None
    last_output: str | None = None
    done: bool = False

class DyslexiaConversationFlow(Flow[ConvState]):
    def __init__(self, student_data):
        super().__init__()
        self.student_data = student_data

    @start()
    def greet(self):
        return "await_input"

    @listen("await_input")
    def get_agent_response(self):
        academic_agent = build_academic_agent(
            student_id=self.student_data.get("student_id"),
            real_jamo=self.student_data.get("real_jamo"),
            confusion_jamo=self.student_data.get("confusion_jamo"),
            weekly_accuracy_rate=self.student_data.get("weekly_accuracy_rate"),
            weekly_fail_rate=self.student_data.get("weekly_fail_rate")
        )
        wellbeing_agent = build_wellbeing_agent()
        parent_agent = build_parent_agent(
            student_id=self.student_data.get("student_id"),
            level=self.student_data.get("level"),
            protector_goal=self.student_data.get("protector_goal"),
            small_interest_name=self.student_data.get("small_interest_name")
        )
        manager_agent = build_manager_agent()

        # 1) 하위 에이전트 개별 진단 Tasks (병렬 실행)
        t_academic = build_debate_round1(agent=academic_agent, student_data=self.student_data)
        t_wellbeing = build_debate_round1(agent=wellbeing_agent, student_data=self.student_data)
        t_parent = build_debate_round1(agent=parent_agent, student_data=self.student_data)
        # 2) 매니저 통합 Task(포맷 완전 고정)
        t_manager = build_manager_task(
            agent=manager_agent,
            student_data=self.student_data,
            context=[t_academic, t_wellbeing, t_parent]
        )

        crew = Crew(
            agents=[academic_agent, wellbeing_agent, parent_agent],
            tasks=[t_academic, t_wellbeing, t_parent, t_manager],
            manager_agent=manager_agent,
            process=Process.hierarchical,  # ★ 계층형 병렬 구조로 변경!!
            memory=True,
            verbose=1
        )
        result = crew.kickoff(inputs={"user_input": self.state.user_input})

        # 매니저 Task의 output(=포맷 고정 결과)만 리턴/저장
        output = str(getattr(result, "raw", result))
        self.state.last_output = output
        self.state.history.append(f"USER: {self.state.user_input}")
        self.state.history.append(f"CREW: {output}")
        self.state.turns += 1
        if self.state.turns >= 10 or (self.state.user_input and self.state.user_input.strip() in ["종료", "그만"]):
            self.state.done = True
            return "end"
        return "await_input"

    @listen("end")
    def end_flow(self):
        return "\n".join(self.state.history)

# 실제로 사용할 때:
def build_conversation_flow(student_data=None):
    return DyslexiaConversationFlow(student_data)
