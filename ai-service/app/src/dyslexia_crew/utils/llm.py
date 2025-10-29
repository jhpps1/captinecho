import os
from dotenv import load_dotenv
from crewai import LLM

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-nano")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL")

print("Loaded OPENAI_API_KEY:", OPENAI_API_KEY)
print("Loaded OPENAI_MODEL:", OPENAI_MODEL)
print("Loaded OPENAI_BASE_URL:", OPENAI_BASE_URL)

llm = LLM(
    api_key=OPENAI_API_KEY,
    model=OPENAI_MODEL,
    base_url=OPENAI_BASE_URL      # 여기가 중요!
)
print("LLM object:", llm)
