from crewai import Task

def build(agent, context_tasks):
    description = (
        "학습 전문가와 심리 담당자의 모든 논의·수정 제안을 바탕으로, "
        "학습 계획을 최종적으로 수정·보완합니다.\n"
        "반드시 주요 결정사항(예: 목표, 단계 조정, 심리조치, 부모 의견 등)을 명확히 기록하세요.\n"
        "구체적인 개선 방향, 협의 대화 로그를 JSON 결과물로 남깁니다.\n"
        "답변은 반드시 한국어."
    )
    return Task(
        description=description,
        agent=agent,
        context=context_tasks,
        expected_output="수정된 계획 및 협의 내역(JSON)"
    )
