import os
import requests

def call_gms_openai(prompt, model=None, temperature=0.3, max_tokens=4096):
    """
    텍스트 생성(gpt, chat, 분석, 에이전트 답변 등)이 필요할 때 호출하는 함수.
    - prompt: 프롬프트(질문/지시/명령어)
    - model: 사용할 LLM(gpt-4o 등, .env의 OPENAI_MODEL로 읽게 하면 좋음)
    - temperature, max_tokens 등은 필요에 따라 조절
    """
    # .env에서 모델명 없으면 default
    if model is None:
        model = os.getenv("OPENAI_MODEL", "gpt-4o")
    api_key = os.getenv("OPENAI_API_KEY")
    url = os.getenv("OPENAI_BASE_URL", "https://gms.ssafy.io/gmsapi/api.openai.com/v1/chat/completions")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "Answer in Korean"},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": max_tokens,
        "temperature": temperature
    }
    response = requests.post(url, headers=headers, json=payload)
    return response.json()

def call_gms_embedding(text, model=None):
    """
    임베딩(텍스트→벡터화, 메모리, 유사도 검색 등)할 때 호출하는 함수.
    - text: 벡터로 변환할 문장(문단, 토큰 등)
    - model: gms가 지원하는 임베딩 모델명(.env에서 EMBEDDING_MODEL로 읽게 하면 좋음)
    """
    if model is None:
        model = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    api_key = os.getenv("OPENAI_API_KEY")
    url = os.getenv("EMBEDDING_BASE_URL", "https://gms.ssafy.io/gmsapi/api.openai.com/v1/embeddings")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "input": text
    }
    response = requests.post(url, headers=headers, json=payload)
    return response.json()
