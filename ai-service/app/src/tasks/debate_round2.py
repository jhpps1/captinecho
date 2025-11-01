from crewai import Task

def build(agent, context_task):
    description = (
        "Academic Agent가 제안한 학습 계획·목표를 동기·심리·스트레스 관점에서 "
        "꼼꼼하게 분석하세요.\n"
        "학습 흥미, 몰입, 부담, 스트레스 체크 후 필요한 수정/보완안을 상세하게 제시합니다.\n"
        "협의 포인트와 비판·수정제안은 학습 전문가에게 다시 구체적으로 전달하세요.\n"
        "결과와 논의사항을 JSON 형태로 작성, 이후 합의·중재 단계에서 활용할 수 있도록 합니다.\n"
        "답변은 반드시 한국어."
    )
    return Task(
        description=description,
        agent=agent,
        context=[context_task],
        expected_output="심리·동기 평가/수정안(JSON) + 협의 요청"
    )
