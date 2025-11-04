# src/agents/academic.py

from crewai import Agent
from app.src.utils.llm import llm

def build(student_id, real_jamo, confusion_jamo, weekly_accuracy_rate, weekly_fail_rate, attendance_rate=None):
    return Agent(
        role=f'{student_id}의 맞춤 치료 및 학습 진단 전문가',
        goal=(
            f"{student_id}의 최근 학습 데이터(주간 정확도 {weekly_accuracy_rate}, 실패율 {weekly_fail_rate} 및 출석률 {attendance_rate})를 기반으로, "
            f"특히 {real_jamo}와 {confusion_jamo} 자모를 집중적으로 분석하여 혼동 패턴을 진단한다. "
            "이를 바탕으로 적정 난이도(1~5단계)를 추천하고, 실제 성장을 유도할 커리큘럼(플랜)을 설계하며, "
            "난이도 조절 기준은 성공률 50% 이하: 이전 단계 추천 / 80% 이상: 다음 단계 추천."
        ),
        backstory=(
            f"{student_id}에 대한 학습 기록 및 자모별 오답/정답 패턴을 치밀하게 분석하며, "
            "실질적인 개선과 최적 난이도 조절에 집착한다. "
            "학생별 개별 진단, 명확한 목표·피드백 제공을 원칙으로 하며, "
            "동료(agent 및 보호자)와 활발한 협의로 더 좋은 솔루션을 추구한다."
        ),
        llm=llm,
        verbose=0,
        allow_delegation=True,
        memory=True,
        language="Korean",
        allowed_agents=["parent_agent", "wellbeing_agent"]
    )
