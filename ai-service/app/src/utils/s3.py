import os
import base64
import uuid
import datetime


def upload_to_local(file_data, key_prefix='problems/', file_extension='png'):
    """
    파일 데이터를 로컬에 저장합니다.
    
    Args:
        file_data: base64 문자열 또는 bytes 데이터
        key_prefix: 저장 경로 (기본값: 'problems/')
        file_extension: 파일 확장자 (기본값: 'png')
    
    Returns:
        저장된 파일의 로컬 경로
    """
    # 경로 생성
    os.makedirs(key_prefix, exist_ok=True)
    
    # 데이터 타입 처리
    if isinstance(file_data, str):
        file_bytes = base64.b64decode(file_data)
    else:
        file_bytes = file_data
    
    # ✅ 파일명 생성 (os.path.join 사용으로 크로스 플랫폼 호환성 개선)
    filename = os.path.join(
        key_prefix, 
        f"{datetime.date.today()}_{uuid.uuid4().hex}.{file_extension}"
    )
    
    # 파일 저장
    with open(filename, "wb") as f:
        f.write(file_bytes)
    
    return filename  # 로컬 경로 반환
