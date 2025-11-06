#src/crew.py

from crewai import Crew, Agent, Process
from crewai.flow.flow import Flow, start, listen
from app.src.agents import build_academic_agent, build_wellbeing_agent, build_parent_agent
from app.src.tasks import build_debate_round1
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
        # Task 하나만 사용하는 구조
        t1 = build_debate_round1(agent=academic_agent, student_data=self.student_data)
        crew = Crew(
            agents=[academic_agent, wellbeing_agent, parent_agent],
            tasks=[t1],
            process=Process.sequential,
            memory=True,
            verbose=1
        )
        result = crew.kickoff(inputs={"user_input": self.state.user_input})
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
