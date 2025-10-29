import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import time
from dyslexia_crew.crew import build_crew

from dotenv import load_dotenv
import os

from rich.console import Console
from rich.markdown import Markdown

load_dotenv()

dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env"))
load_dotenv(dotenv_path)

def run():
    console = Console()

    crew = build_crew()
    console.print("\n--- Dyslexia Debate Crew 시작 ---", style="bold green")
    start_time = time.time()             # 시작 시각 측정
    result = crew.kickoff()
    end_time = time.time()               # 종료 시각 측정
    duration = end_time - start_time     # 소요 시간 계산
    console.print("\n--- 최종 결과 (합의/요약) ---", style="bold green")
    console.print(Markdown(str(result))) # crew 실행 결과를 Markdown으로 렌더링하여 출력합니다.
    console.print(f"\n총 협의 소요 시간: {duration:.2f}초", style="bold yellow")

if __name__ == "__main__":
    run()