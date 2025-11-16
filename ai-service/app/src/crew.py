# src/crew.py
"""
Hierarchical CrewAI 구현 (진짜 A2A)
Manager LLM이 Academic, Wellbeing, Parent Agent를 자유롭게 활용하여 커리큘럼 생성
"""

from crewai import Crew, Agent, Task, Process, LLM
from app.src.core.config import settings

def build_hierarchical_crew(student_data: dict):
    """
    Hierarchical Process로 진짜 Agent 간 협상 구현
    Manager가 3명의 전문가를 자유롭게 활용하여 커리큘럼 생성

    Args:
        student_data: 학생 정보 (student_id, name, level, protector_goal, small_interest_name, ...)

    Returns:
        Crew 인스턴스
    """

    # Manager LLM (gpt-4o) - CrewAI 1.x LLM 초기화
    manager_llm = LLM(
        model=settings.OPENAI_MODEL,
        base_url=settings.OPENAI_BASE_URL,
        api_key=settings.OPENAI_API_KEY,
        temperature=settings.OPENAI_TEMPERATURE
    )

    # ============================================
    # 3개 Agent 정의 (Hierarchical Process용)
    # ============================================

    academic_agent = Agent(
        role="난독증 치료 전문가",
        goal="학생의 약점 진단 및 효과적인 학습 계획 수립",
        backstory=(
            "10년 경력의 난독증 치료사입니다. "
            "자모 인식 장애, 음소 혼동 패턴 분석 전문가로, "
            f"({student_data.get('confusion_jamo')})와 ({student_data.get('real_jamo')})를 분석하여 학생에게 맞는 최적의 문제를 찾습니다."
            f"({student_data.get('avg_fail')})과 ({student_data.get('avg_accuracy')})을 기반으로 최적의 난이도와 탐험 유형을 설계합니다. "
        
            "데이터 기반의 객관적 진단을 제공하며, 학습 성과를 최우선으로 고려합니다."
        ),
        allow_delegation=False,
        verbose=settings.CREW_VERBOSE
    )

    wellbeing_agent = Agent(
        role="아동 심리 전문가",
        goal="학습 동기 유지 및 스트레스 최소화",
        backstory=(
            "아동 심리학 박사이며, 학습 장애 아동의 정서 관리 전문가입니다. "
            "과도한 학습 부담은 오히려 역효과를 낸다는 것을 잘 알고 있으며, "
            "아이의 흥미와 성취감을 고려한 균형 잡힌 학습 계획을 추천합니다. "
            "난이도가 너무 높거나 문제 수가 많으면 적극적으로 조정을 요청합니다."
        ),
        allow_delegation=False,
        verbose=settings.CREW_VERBOSE
    )

    parent_agent = Agent(
        role="학부모 대리인",
        goal="보호자 목표를 커리큘럼에 반영",
        backstory=(
            f"학부모 커뮤니티 대표입니다. "
            f"보호자가 설정한 목표({student_data.get('protector_goal')})를 "
            f"커리큘럼에 반드시 반영해야 합니다. "
            f"아이의 관심사({student_data.get('small_interest_name')})를 문제에 활용하여 "
            f"학습 동기를 높이는 것도 중요하게 생각합니다. "
            f"아이의 성장과 자신감을 우선시하며, 무리한 학습보다는 꾸준한 발전을 원합니다."
        ),
        allow_delegation=False,
        verbose=settings.CREW_VERBOSE
    )

    # ============================================
    # 단일 Task (Manager가 자유롭게 Agent 활용)
    # ============================================

    curriculum_task = Task(
        description=f"""
당신은 난독증 학생의 주간 커리큘럼을 만드는 **Manager**입니다.
3명의 전문가를 **자유롭게 활용**하여 최적의 커리큘럼을 만드세요.

## 📊 학생 정보 (DB에서 조회됨)
- 이름: {student_data.get('name', '학생')}
- 현재 레벨: {student_data.get('level', 1)}
- 약점 자모: {student_data.get('real_jamo', 'ㄱ')} ↔ {student_data.get('confusion_jamo', 'ㄴ')} 혼동
- 관심사: {student_data.get('small_interest_name', '동물')}
- 보호자 목표: {student_data.get('protector_goal', 'FOCUS_ON_WEAKNESS')}
- 저번 주 정확도: {student_data.get('weekly_accuracy_rate', 0.0):.1%}
- 저번 주 실패율: {student_data.get('weekly_fail_rate', 0.0):.1%}

## 🎯 사용 가능한 전문가 (자유롭게 상담 가능)
1. **난독증 치료 전문가** - 학습 진단, 레벨 평가, 탐험 유형 설계
2. **아동 심리 전문가** - 동기 부여, 스트레스 관리, 과부담 방지
3. **학부모 대리인** - 보호자 목표 반영, 관심사 활용, 자신감 향상

## 📋 탐험 유형 정의
**탐험1: 자모(음소) 맞추기**
  - 한 음절 단어 제시, 맞춰야 할 음소는 회색 표시
  - 선택지 3개 중에서 해당 음소를 고르는 게임
  - 예: '사**ㄱ**과' → ['ㄱ','ㄷ','ㄹ']에서 'ㄱ' 선택

**탐험2: 빈칸 맞추기**
  - 이미지와 단어 제시, 음소 하나가 빈칸
  - 선택지 3개 중에서 빠진 음소 선택
  - 예: 🍎 + '사□' → ['과','가','놔']에서 '과' 선택

**탐험3: 단어 맞추기**
  - 이미지만 제시, 알맞은 단어 선택
  - 예: 🍎 → ['사과','수박','포도']에서 '사과' 선택

**탐험4: 단어 읽기**
  - 단어 제시, 마이크로 발음 → STT 평가
  - 예: '강아지' → 학생 발음 → 정답/오답

**레벨별 권장 배치:**
- 레벨 1~2: 탐험1(5), 탐험2(3), 탐험3(1), 탐험4(1) = 10문제
- 레벨 3~4: 탐험1(2), 탐험2(3), 탐험3(3), 탐험4(2) = 10문제
- 레벨 5~6: 탐험1(1), 탐험2(2), 탐험3(4), 탐험4(3) = 10문제

## 🎯 당신의 미션
1. **레벨 재평가**
   - 정확도 80% 이상 → 레벨 상승 고려
   - 정확도 50% 이하 → 레벨 하락 고려
   - 전문가들과 상의하여 결정

2. **커리큘럼 설계** (월~금, 하루 10문제)
   - 레벨에 맞는 탐험 배치
   - 약점 자모 집중 훈련
   - 관심사 활용으로 흥미 유발

3. **전문가 협의**
   - 순서는 자유: 치료사 → 심리코치 → 부모 또는 역순 가능
   - 여러 번 왔다 갔다 가능
   - 만장일치까지 협상

## 📤 최종 출력 (반드시 JSON)
{{
  "level_adjustment": {{
    "current_level": {student_data.get('level', 1)},
    "new_level": 2,
    "reason": "정확도 85%로 괄목할 성장. 다음 단계 도전 준비됨"
  }},
  "curriculum_structure": {{
    "monday": [
      {{"type_id": 1, "count": 5}},
      {{"type_id": 2, "count": 3}},
      {{"type_id": 3, "count": 1}},
      {{"type_id": 4, "count": 1}}
    ],
    "tuesday": [...],
    "wednesday": [...],
    "thursday": [...],
    "friday": [...]
  }},
  "dialogue": [
    {{"role": "Manager", "message": "오늘 회의 시작하겠습니다. 치료사님 먼저 진단 부탁드립니다."}},
    {{"role": "치료사", "message": "학생의 ㄱ/ㄴ 혼동이 심하고 정확도 60%입니다. 레벨 2 유지하며 탐험1을 강화해야 합니다."}},
    {{"role": "심리코치", "message": "탐험1을 너무 많이 하면 지루해할 수 있어요. 탐험3,4도 적절히 섞어주세요."}},
    {{"role": "부모", "message": "아이가 {student_data.get('small_interest_name', '동물')}을 좋아하니 그 주제로 문제를 만들어주세요."}},
    {{"role": "Manager", "message": "좋습니다. 탐험1(5문제), 탐험2(3문제), 탐험3(1문제), 탐험4(1문제)로 균형있게 배치하고, {student_data.get('small_interest_name', '동물')} 주제를 활용하겠습니다."}}
  ],
  "discussion_summary": "3명의 전문가가 협의한 결과, 레벨 2를 유지하면서 약점 자모(ㄱ/ㄴ)를 집중 훈련하되, 지루함을 방지하기 위해 탐험 유형을 다양하게 배치하고 {student_data.get('small_interest_name', '동물')} 주제를 활용하기로 결정했습니다."
}}

**중요**: 반드시 JSON 형식으로 출력하세요. JSON 외 다른 텍스트는 포함하지 마세요.
""",
        expected_output="JSON 형식의 커리큘럼 (level_adjustment, curriculum_structure, dialogue, discussion_summary 포함)",
        agent=None  # Hierarchical에서는 None (Manager가 직접 처리)
    )

    # ============================================
    # Hierarchical Crew 생성
    # ============================================

    crew = Crew(
        agents=[academic_agent, wellbeing_agent, parent_agent],
        tasks=[curriculum_task],
        process=Process.hierarchical,  # 계층형 프로세스 (진짜 A2A!)
        manager_llm=manager_llm,
        memory=settings.CREW_MEMORY,
        verbose=settings.CREW_VERBOSE  # emoji 로깅 제어 (Windows cp949 에러 방지)
    )

    return crew
