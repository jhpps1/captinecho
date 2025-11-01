from crewai import LLM
from app.core.config import settings

# 더 이상 load_dotenv()와 os.getenv()를 직접 사용하지 않습니다.
# 모든 설정은 중앙 config 객체에서 가져옵니다.

print("Using OPENAI_API_KEY from settings.")
print("Using OPENAI_MODEL_NAME from settings:", settings.OPENAI_MODEL_NAME)
print("Using OPENAI_BASE_URL from settings:", settings.OPENAI_BASE_URL)

llm = LLM(
    # crewai v1.0.0 이상에서는 LLM 대신 ChatOpenAI를 사용하는 것이 좋습니다.
    # 여기서는 기존 LLM 클래스를 유지하되, 설정만 중앙에서 가져옵니다.
    api_key=settings.OPENAI_API_KEY,
    model=settings.OPENAI_MODEL_NAME,
    base_url=settings.OPENAI_BASE_URL
)
print("LLM object:", llm)
