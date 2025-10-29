from crewai import Task

def build(agent, context_tasks):
    return Task(
        description=(
            "모든 논의/협의 결과를 종합해서 최종 학습안을 확정하고 "
            "부모에게 보고서 형식으로 설명하세요."
            "반드시 한국어로 답변하세요."
        ),
        agent=agent,
        context=context_tasks,
        expected_output="최종안 + 부모용 보고"
    )
