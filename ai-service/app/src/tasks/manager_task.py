# src/tasks/manager_task.py

from crewai import Task

# expected_output 구역을 반드시 구분! (파싱/저장에 중요)
def build(agent, student_data, context):
    """
    하위 에이전트들의 진단/피드백(context)을 모두 받아,
    최종 합의된 [대화]와 [월~금 커리큘럼]을 생성하는 매니저 Task
    """
    description = (
        "세 전문가(치료사, 웰빙, 보호자)의 의견이 아래 context로 들어갑니다.\n"
        "학생 데이터도 함께 참고하여, 이 세 의견을 충분히 조율·합의해서\n"
        "1. [대화] 영역: 전문가들 간 토론/협의 과정을 꼭 포함(대화체, 줄글),\n"
        "2. [월~금 커리큘럼] 영역: 월~금요일별 합의 최종 계획을 출력. 월요일 : 탐험1(2문제/2단계), 탐험2(3문제/2단계), 탐험3(...), 탐험4(...)a  화요일:탐험1(2문제/2단계), 탐험2(3문제/2단계), 탐험3(...), 탐험4(...) 이런형식으로 출력.\n"
        "두 영역 모두 명확히 표기해주세요.\n"
        f"학생 데이터: {student_data}\n"
        "★ 출력 예시를 꼭 따른다.\n"
    )
    expected_output = """
[대화]
치료사: ...
부모: ...
웰빙코치: ...
논의 요약: ...

[월~금 커리큘럼]
월요일: 탐험1(2문제/2단계), 탐험2(3문제/2단계), 탐험3(2문제/1단계), 탐험4(3문제/2단계)
화요일: ...
수요일: ...
목요일: ...
금요일: ...
    """
    return Task(
        description=description,
        agent=agent,
        context=context,  # 하위 3개 태스크의 결과 리스트
        expected_output=expected_output
    )
