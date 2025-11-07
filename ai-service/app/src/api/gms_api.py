# app/src/api/gms_api.py

import requests
import json
import os
import uuid
import base64
from typing import Optional
import binascii # binascii 모듈 import 추가

# --- 설정 ---
GMS_BASE_URL = "https://gms.ssafy.io/gmsapi"
LOCAL_UPLOAD_PATH = os.path.join(os.getcwd(), 'local_uploads', 'problems') # 로컬 저장 경로 설정

# 로컬 업로드 폴더가 없으면 생성
os.makedirs(LOCAL_UPLOAD_PATH, exist_ok=True)

def generate_image_with_gemini_flash(prompt_text, gms_key=None):
    """
    Gemini(GMS) Flash 이미지 생성 호출
    """
    if gms_key is None:
        gms_key = os.getenv("GMS_API_KEY")
    endpoint = f"https://gms.ssafy.io/gmsapi/generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key={gms_key}"

    enhanced_prompt = f"어린이 교육용, **비폭력적**이고 **밝은 색상**의 **2D 평면적**인 **귀여운 만화 스타일** 그림. 배경은 **단순한 흰색**이며, 명확한 형태의 **'{prompt_text}'** 이미지."
    print(f" GMS 이미지 생성 요청 프롬프트: '{enhanced_prompt}'")

    data = {
        "instances": [
            {
                "prompt": enhanced_prompt
            }
        ],
        "parameters": {
            "sampleCount": 1
        }
    }
    headers = {
        "Content-Type": "application/json"
    }
    
    response = None 
    try:
        response = requests.post(endpoint, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()

        # =================================================================
        # 🚨 추가: API 응답 본문 전체 출력 (실패 원인 확인용)
        # =================================================================
        # 터미널에 응답 전문을 출력합니다.
        print(f"DEBUG: GMS Full Response Text: {response.text}") 
        
        result = response.json()


        # =================================================================
        # 🚨 최종 추가: KeyError 방지 및 API 오류 메시지 추출 로직
        # =================================================================
        # predictions 키가 있는지, 그리고 그 안에 image 키가 있는지 안전하게 확인합니다.
        predictions = result.get("predictions")
        if not predictions:
            error_message = result.get("error", {}).get("message", "응답에 'predictions' 키가 없습니다.")
            print(f"❌ GMS API 이미지 생성 실패 (API Message): {error_message}")
            return None

        img_pred = predictions[0]
        image_b64 = img_pred.get("bytesBase64Encoded") or img_pred.get("image")
        if not image_b64:
            error_message = result.get("error", {}).get("message", "응답에 이미지 데이터가 없습니다.")
            print(f"❌ GMS API 이미지 생성 실패 (API Message): {error_message}")
            return None
        
        # 1. Base64 데이터 추출 (KeyError 방지를 위해 이전 디버깅 코드 유지)
        image_b64 = result["predictions"][0]["bytesBase64Encoded"] 
        
        # =================================================================
        # 🚨 수정: 일반 b64decode 사용 및 Base64 인코딩 오류 해결
        # =================================================================
        # 2. Base64 문자열에서 불필요한 공백, 줄바꿈 문자 제거 (클리닝)
        image_b64_clean = image_b64.strip().replace('\n', '').replace('\r', '')

        # 3. 바이트로 인코딩 (필수: 'string argument should contain only ASCII characters' 오류 해결)
        image_b64_bytes = image_b64_clean.encode('ascii')

        # 4. 일반 Base64 디코딩 시도 (GMS가 일반 Base64를 사용했을 가능성이 높음)
        # 패딩 문제도 이 단계에서 대부분 해결됩니다.
        image_data = base64.b64decode(image_b64_bytes) 
        
        # 5. 파일 이름 생성 및 로컬 저장 (이전 로직 유지)
        unique_filename = f"{uuid.uuid4().hex}.png"
        filename_relative = f"problems/{unique_filename}" 
        file_path_full = os.path.join(LOCAL_UPLOAD_PATH, unique_filename)
        
        # 6. 파일 저장
        os.makedirs(os.path.dirname(file_path_full), exist_ok=True) 
        with open(file_path_full, 'wb') as f:
            f.write(image_data)
        
        # 7. 성공 경로 반환
        print(f"✅ GMS 이미지 파일 저장 성공: {filename_relative}")
        return filename_relative
        
    except Exception as e:
        # 🚨 예외 발생 시 최소 정보 출력
        print(f"❌ GMS 이미지 후처리 오류 발생: {type(e).__name__} (상세 오류 생략)")
        return None