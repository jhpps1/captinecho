#!/usr/bin/env python3
"""
리팩토링된 AI 서비스 테스트 스크립트
- Hierarchical CrewAI 커리큘럼 생성 테스트
- JSON 기반 문제 생성 테스트
"""
import requests
import json
import time

BASE_URL = "http://localhost:8000"
STUDENT_ID = 1

def print_section(title):
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)

def test_curriculum_generation():
    """커리큘럼 생성 API 테스트"""
    print_section("1. 커리큘럼 생성 테스트 (Hierarchical CrewAI)")

    url = f"{BASE_URL}/curriculum/generate/{STUDENT_ID}"
    print(f"📡 Request: POST {url}")

    start_time = time.time()

    try:
        response = requests.post(url, timeout=120)
        elapsed = time.time() - start_time

        print(f"⏱️  Elapsed: {elapsed:.2f}s")
        print(f"📊 Status Code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"✅ 성공!")
            print(f"\n📋 응답 구조:")
            print(json.dumps(data, indent=2, ensure_ascii=False))

            # curriculum_structure 확인
            if "curriculum_structure" in data:
                print(f"\n✨ curriculum_structure (JSONB):")
                print(json.dumps(data["curriculum_structure"], indent=2, ensure_ascii=False))

            # discussion_log 확인
            if "discussion_log" in data:
                print(f"\n💬 discussion_log (JSONB):")
                print(json.dumps(data["discussion_log"][:3] if isinstance(data["discussion_log"], list) else data["discussion_log"], indent=2, ensure_ascii=False))
                if isinstance(data["discussion_log"], list) and len(data["discussion_log"]) > 3:
                    print(f"   ... (총 {len(data['discussion_log'])}개 대화)")

            # 레벨 변경 확인
            if data.get("level_changed"):
                print(f"\n📈 레벨 변경:")
                print(f"   {data['current_level']} → {data['new_level']}")
                print(f"   사유: {data.get('level_change_reason', 'N/A')}")

            return True
        else:
            print(f"❌ 실패: {response.text}")
            return False

    except Exception as e:
        print(f"❌ 에러: {e}")
        return False

def test_problem_generation():
    """문제 생성 API 테스트"""
    print_section("2. 문제 생성 테스트 (JSON 직접 읽기)")

    url = f"{BASE_URL}/problems/generate/{STUDENT_ID}"
    print(f"📡 Request: POST {url}")

    start_time = time.time()

    try:
        response = requests.post(url, timeout=120)
        elapsed = time.time() - start_time

        print(f"⏱️  Elapsed: {elapsed:.2f}s")
        print(f"📊 Status Code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"✅ 성공!")
            print(f"\n📋 응답 구조:")
            print(json.dumps(data, indent=2, ensure_ascii=False))

            # 생성된 문제 샘플
            if "problems" in data and data["problems"]:
                print(f"\n📝 생성된 문제 샘플 (첫 5개):")
                for problem in data["problems"][:5]:
                    print(f"   - {problem.get('date')} 탐험{problem.get('adventure_type')}: {problem.get('problem')}")

            return True
        else:
            print(f"❌ 실패: {response.text}")
            return False

    except Exception as e:
        print(f"❌ 에러: {e}")
        return False

def main():
    print_section("🚀 리팩토링된 AI 서비스 테스트 시작")
    print(f"Base URL: {BASE_URL}")
    print(f"Student ID: {STUDENT_ID}")

    # 1. 커리큘럼 생성 테스트
    curriculum_success = test_curriculum_generation()

    if not curriculum_success:
        print("\n⚠️  커리큘럼 생성 실패. 문제 생성 테스트 생략.")
        return

    # 2. 문제 생성 테스트
    time.sleep(2)  # 잠시 대기
    problem_success = test_problem_generation()

    # 결과 요약
    print_section("✅ 테스트 결과 요약")
    print(f"1. 커리큘럼 생성: {'✅ 성공' if curriculum_success else '❌ 실패'}")
    print(f"2. 문제 생성: {'✅ 성공' if problem_success else '❌ 실패'}")

    if curriculum_success and problem_success:
        print("\n🎉 모든 테스트 통과!")
    else:
        print("\n⚠️  일부 테스트 실패")

if __name__ == "__main__":
    main()
