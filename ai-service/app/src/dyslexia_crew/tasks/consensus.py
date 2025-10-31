from crewai import Task

def build(agent, context_tasks):
    description = (
        "모든 협의 결과를 종합하여 최종 맞춤 커리큘럼을 확정하고, "
        "의사결정 과정을 논리적으로 정리하세요.\n"
        "결과물은 학습 목표, 단계/수정 결정 과정, 동기 심리 고려사항, 부모용 핵심 보고서(요점), 협의 로그를 "
        "JSON 구조로 제공해야 합니다.\n"
        "답변은 반드시 한국어로 상세/정확하게 작성."
    )
    return Task(
        description=description,
        agent=agent,
        context=context_tasks,
        expected_output="최종 커리큘럼+보고서(JSON) + 협의 내역"
    )
