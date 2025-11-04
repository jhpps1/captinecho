# src/tasks/debate_round1.py

from crewai import Task

def build(agent, student_data=None):
    """
    학생의 데이터 기반, 부족한 부분 진단 + 다음주 커리큘럼 초안 제시
    """
    description = (
        "아래 단계 표를 참고해 해당 학생의 현재 학습 수준을 정확히 진단하세요.\n"

        "# 난이도 구조(단계별 결정 기준)\n"
        "1단계: CV (자음+모음, ex: 가/다/라/마/바 - 받침 없는 기본 단어)\n"
        "2단계: CVC (자음+모음+자음, ex: 각/난/달/밤/벽 등 - 받침 O, 단순)\n"
        "3단계: CGV (자음+이중모음+모음, ex: 뼈/궤/쥐/쒜 등 - 이중모음/모음 포함)\n"
        "4단계: CVCV (2음절, ex: 나비/가방 - 단순 2음절)\n"
        "5단계: CGVC (자음+이중모음+받침), 복합적 구조(예: 괭, 쓩 등)\n"
        "6단계: CVCCVC (복합 2음절, ex: 완벽한 난이도 최고 단어)\n\n"

        "1. 학생의 최근 오답률/성공률/출석률 등 데이터 분석을 먼저 하세요.\n"
        "- 성공률 50% 이하: 이전 단계 추천\n"
        "- 성공률 80% 이상: 다음 단계로 진도 조정\n"

        "2. 위 분석 결과를 바탕으로 이번 주 ‘월~금’ 각각의 핵심 학습 목표만 딱 1줄씩 요약해서 제시하세요.\n"

        "3. 답변은 반드시 아래 JSON 구조만 포함하세요. (**code block 금지**)\n"
        "{\n"
        "  \"curriculum\": { \"월\": \"학습 목표\", \"화\": \"...\", \"수\": \"...\", \"목\": \"...\", \"금\": \"...\" },\n"
        "  \"discussion_log\": [\n"
        "    { \"summary\": \"에이전트 논의요약\", \"participant_feedback\": { \"student\": \"...\" } }\n"
        "  ]\n"
        "}\n\n"
        
        f"# 학생 데이터:\n{student_data}\n"
        "# 반드시 위 JSON 구조, 단계별 진단, 월~금 목표만 제시. 불필요 정보/키/텍스트 절대 금지!\n"
        "답변은 반드시 한국어로 작성."
    )
    return Task(
        description=description,
        agent=agent,
        expected_output="JSON 구조(curriculum, discussion_log)"
    )
