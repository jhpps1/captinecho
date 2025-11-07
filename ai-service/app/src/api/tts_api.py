import os
import hashlib
import time
import requests
from app.src.utils.s3 import upload_to_local 
from dotenv import load_dotenv


load_dotenv()


TTS_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://gms.ssafy.io/gmsapi/api.openai.com/v1")
TTS_ENDPOINT = f"{TTS_BASE_URL.rstrip('/')}/audio/speech"


def call_gms_tts_api(text: str, api_key: str) -> bytes | None:
    """
    GMS 플랫폼의 OpenAI 호환 TTS API를 호출하고 MP3 바이너리 데이터를 반환합니다.
    """
    if not TTS_ENDPOINT:
        print("❌ TTS API 엔드포인트가 설정되지 않았습니다.")
        return None
        
    payload = {
        "model": "gpt-4o-mini-tts",
        "input": text,
        "voice": "nova",
        "response_format": "mp3"
    }

    try:
        response = requests.post(
            TTS_ENDPOINT,
            json=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}"
            },
            timeout=15
        )
        response.raise_for_status()
        
        if response.headers.get('content-type') == 'audio/mpeg':
            return response.content
        else:
            print(f"❌ GMS TTS API 응답이 오디오 형식이 아님. Status: {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"❌ GMS TTS API 호출 중 오류 발생: {e}")
        return None


def generate_tts_and_upload(text_to_speak: str, student_id: int, key_prefix: str = 'problems/sound/') -> str:
    """
    GMS TTS API를 호출하여 음성 파일을 생성하고 로컬에 저장 후 경로를 반환합니다.
    """
    GMS_API_KEY = os.getenv("OPENAI_API_KEY") 
    
    if not GMS_API_KEY:
        print("❌ OPENAI_API_KEY가 없어 음성 생성을 건너뜁니다.")
        return ""
        
    if not text_to_speak or len(text_to_speak) > 4096:
        print("❌ 음성 합성 텍스트가 없거나 너무 깁니다.")
        return ""

    print(f"📝 GMS TTS 생성 시작: '{text_to_speak}'")

    try:
        # 1. GMS TTS API 호출 및 MP3 바이너리 데이터 획득
        audio_content = call_gms_tts_api(text_to_speak, GMS_API_KEY)
        
        if not audio_content:
            print("❌ TTS 음성 생성 실패")
            return ""

        # 2. ✅ 수정: 직접 upload_to_local 호출
        uploaded_url = upload_to_local(
            file_data=audio_content,
            key_prefix=key_prefix,
            file_extension='mp3'
        )

        if uploaded_url:
            print(f"✅ TTS 파일 업로드 성공: {uploaded_url}")
            return uploaded_url
        else:
            print("❌ TTS 파일 업로드 실패.")
            return ""

    except Exception as e:
        print(f"❌ TTS 처리 중 일반 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        return ""
