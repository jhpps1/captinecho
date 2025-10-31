from crewai import Task

def build(agent, student_data=None):
    """
    학생의 데이터 기반, 부족한 부분 진단 + 다음주 커리큘럼 초안 제시
    """
    description = (
        "아래 학생의 학습 데이터를 분석해서, 오답률/출석률/성공률을 꼼꼼히 파악하고 "
        "학습 단계(난이도: 1~5단계) 기준대로 진단하세요.\n"
        "성공률 50% 이하이면 이전단계로, 80% 이상이면 다음단계로 제시합니다.\n"
        "1주일 목표·맞춤학습계획을 JSON 구조로 출력하세요.\n\n"
        f"{student_data}\n\n"
        "초안 제시 후 Wellbeing Agent의 심리 피드백을 참고해 다음 단계 논의를 준비하세요.\n"
        "답변은 반드시 한국어로 작성."
    )
    return Task(
        description=description,
        agent=agent,
        expected_output="맞춤 커리큘럼/목표 JSON + 피드백 요청"
    )
