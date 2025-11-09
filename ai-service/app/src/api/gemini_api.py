# app/src/api/gemini_api.py (Gemini 이미지 생성 API 구현)

import os
import io
import re
import datetime
import tempfile # PIL 객체 변환 실패 시 임시 파일 사용을 위해 필요
from google import genai
from google.genai.errors import APIError
from PIL import Image
import unicodedata


# 로컬에 이미지 파일을 저장할 기본 디렉토리
IMAGE_OUTPUT_DIR = "static/problems/images"
# 디렉토리가 없으면 생성합니다.
os.makedirs(IMAGE_OUTPUT_DIR, exist_ok=True)


def is_hangul_jamo(word: str) -> bool:
    """
    입력이 한글 자모(초성/중성/종성)만으로 되어 있으면 True를 반환
    """
    word = word.strip()
    if not word:
        return False
    for char in word:
        name = unicodedata.name(char, '')
        # 한글 CHOSEONG(초성), JUNGSEONG(중성), JONGSEONG(종성)이 포함되면 자모임
        if not ('HANGUL' in name and (
            'CHOSEONG' in name or 'JUNGSEONG' in name or 'JONGSEONG' in name
        )):
            return False
    return True



def generate_image_with_gemini_flash(problem_text: str, api_key: str) -> str:
    """
    Google GenAI SDK (Imagen 모델)을 사용하여 이미지를 생성하고 로컬 파일 경로를 반환합니다.
    
    Args:
        problem_text (str): 이미지 생성 프롬프트 (correct_answer 텍스트).
        api_key (str): Gemini API Key.
        
    Returns:
        str: 로컬에 저장된 이미지 파일의 상대 경로 (DB 저장용) 또는 실패 시 빈 문자열.
    """
    if not api_key:
        print("❌ Gemini API Key가 제공되지 않았습니다.")
        return ""
    
    # 1. GenAI Client 초기화
    try:
        client = genai.Client(api_key=api_key)
    except Exception as e:
        print(f"❌ Gemini 클라이언트 초기화 오류: {e}")
        return ""

    # 2. 이미지 생성 설정 및 프롬프트 구성
    model_name = 'imagen-3.0-generate-002'
    
    # 상세 스타일을 반영한 프롬프트 템플릿
    full_prompt_template = (
        f"Subject: {problem_text}\n"
        "style : simple background, bright colors "
    )
    # print(f"✨ Gemini 이미지 생성 요청 프롬프트: '{full_prompt}'")

    full_prompt = full_prompt_template.format(problem_text=problem_text) 
    
    print(f"✨ Gemini 이미지 생성 요청 프롬프트: '{full_prompt}'") 
    
    try:
        # 3. 이미지 생성 API 호출
        result = client.models.generate_images(
            model=model_name,
            prompt=full_prompt, 
            config={
                'number_of_images': 1,
                'output_mime_type': 'image/png', 
                'aspect_ratio': '1:1'
            }
        )

        if not result.generated_images:
            print("❌ Gemini 이미지 생성 결과가 비어 있습니다.")
            return ""

        # 4. 생성된 이미지 처리 및 바이트 변환 (🚨 핵심 수정 로직)
        
        image_object_pil = result.generated_images[0].image
        image_data_bytes = None

        try:
            # 4-1. 표준 PIL save 로직 시도 (가장 깔끔한 방법)
            buffer = io.BytesIO()
            image_object_pil.save(buffer, format="PNG") 
            image_data_bytes = buffer.getvalue()
        except Exception:
            # 4-2. 실패 시: 임시 파일 저장 후 바이트로 읽어오는 안전 로직
            # 이 로직은 .save(format='...') 관련 오류를 회피합니다.
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_file:
                image_object_pil.save(tmp_file.name)
                tmp_file_path = tmp_file.name
            
            with open(tmp_file_path, "rb") as f:
                image_data_bytes = f.read()
            
            os.unlink(tmp_file_path) # 임시 파일 삭제

        if not image_data_bytes:
            raise ValueError("이미지 바이트 변환에 실패했습니다.")

        # 4-3. 파일명 생성 및 경로 설정
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S%f")
        safe_problem_text = re.sub(r'[^\w\s-]', '', problem_text, flags=re.UNICODE)[:15].strip()
        filename = f"{safe_problem_text}_{timestamp}.png"
        local_path = os.path.join(IMAGE_OUTPUT_DIR, filename)
        
        # 4-4. 바이트 데이터 저장
        with open(local_path, "wb") as f:
            f.write(image_data_bytes)
        
        # DB에 저장될 최종 URL/경로
        db_path = f"problems/images/{filename}" 
        
        return db_path

    except APIError as e:
        # 🚨 결제 문제(400 INVALID_ARGUMENT) 포함 모든 API 오류 처리
        print(f"❌ Gemini API 호출 실패 (HTTP 오류): {e}")
        return ""
    except Exception as e:
        print(f"❌ 이미지 생성 중 예상치 못한 오류 발생: {e}")
        return ""