from crewai import Task

def build(agent, context_tasks):
    return Task(
        description=(
            "이전 논의/협의 내용을 바탕으로 학습 계획을 수정 보완하라. "
            "반드시 한국어로 답변하세요."
        ),
        agent=agent,
        context=context_tasks,
        expected_output="수정된 계획 혹은 3자 협의/중재 요청"
    )
