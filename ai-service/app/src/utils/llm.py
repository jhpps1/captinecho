import openai
from crewai import LLM
from app.src.core.config import settings
import logging

logger = logging.getLogger(__name__)

print("Using OPENAI_API_KEY from settings.")
print("Using OPENAI_BASE_URL from settings:", settings.OPENAI_BASE_URL)

llm = LLM(
    api_key=settings.OPENAI_API_KEY,
    base_url=settings.OPENAI_BASE_URL,
    model=settings.OPENAI_MODEL, 
)
print("LLM object:", llm)

client = openai.OpenAI(
    api_key=settings.OPENAI_API_KEY,
    base_url=settings.OPENAI_BASE_URL
)

def llm_problem(prompt):
    """난독증 문제 생성용 LLM 호출"""
    try:
        logger.info(f"[LLM 호출] Model: {settings.OPENAI_MODEL}")
        logger.info(f"[LLM 호출] Prompt: {prompt[:100]}...")
        
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "developer",
                    "content": """You are an expert at generating dyslexia-friendly educational problems.
When generating problems:
1. Use simple, short sentences with clear structure
2. Avoid complex vocabulary and word confusion
3. Use bullet points instead of dense paragraphs
4. Provide visual descriptions where helpful
5. Ensure JSON response is properly formatted
Answer in Korean."""
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_completion_tokens=4096
        )
        
        logger.info(f"[LLM 응답] {response}")
        content = response.choices[0].message.content
        logger.info(f"[LLM 응답 내용] {content[:100] if content else 'EMPTY'}")
        
        if not content or content.strip() == "":
            logger.error("LLM 응답이 비어 있음!")
            return None
        
        return content
        
    except Exception as e:
        logger.error(f"[LLM 에러] {type(e).__name__}: {str(e)}")
        raise
