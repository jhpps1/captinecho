from crewai import Task

def build(agent, context_task):
    return Task(
        description=(
            "Academic Agent(학습 전문가)의 제안을 토대로 "
            "동기·스트레스 관리 관점에서 문제점을 지적하고, 보완/수정안을 협의용으로 제시하라. "
            "의견을 Academic Agent에게 다시 전달하여 논의를 이어가세요."
            "반드시 한국어로 답변하세요."
        ),
        agent=agent,
        context=[context_task],
        expected_output="비판 및 수정제안 + 추가 협의 요청"
    )
