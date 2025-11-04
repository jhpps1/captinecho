# src/tasks/negotiation.py

from crewai import Task

def build(agent, context_tasks):
    description = (
        "학습 전문가와 심리 담당자의 모든 논의·수정 제안을 바탕으로, "
        "학습 계획을 최종적으로 수정·보완합니다.\n"
        "구체적인 개선 방향, 협의 대화 로그를 JSON 결과물로 남깁니다.\n"
        "아래 JSON 구조로만, 불필요한 키 없이 출력:\n"
        "{\n"
        "  \"curriculum\": { \"최종 수정안\": \"...\" },\n"
        "  \"discussion_log\": [ { \"summary\": \"협의 로그\", \"participant_feedback\": {\"student\": \"...\", \"parents\": \"...\"} } ]\n"
        "}\n"
        "답변은 반드시 한국어."
    )
    return Task(
        description=description,
        agent=agent,
        context=context_tasks,
        expected_output="JSON 구조(curriculum, discussion_log)"
    )
