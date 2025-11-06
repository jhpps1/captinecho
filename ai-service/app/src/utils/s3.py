import os
import base64
import uuid
import datetime

def upload_to_local(image_data, key_prefix='problems/'):
    # 경로 생성
    os.makedirs(key_prefix, exist_ok=True)
    if isinstance(image_data, str):
        file_bytes = base64.b64decode(image_data)
    else:
        file_bytes = image_data
    filename = f"{key_prefix}{datetime.date.today()}_{uuid.uuid4().hex}.png"
    with open(filename, "wb") as f:
        f.write(file_bytes)
    return filename  # 로컬 경로 반환
