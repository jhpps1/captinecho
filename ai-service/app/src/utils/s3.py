import os
import base64
import uuid
import datetime
import boto3
from botocore.exceptions import ClientError
from app.src.utils.settings import settings


def upload_to_s3(file_data, key_prefix='problems/', file_extension='png'):
    """
    파일 데이터를 AWS S3에 업로드하고 Public URL을 반환합니다.

    Args:
        file_data: base64 문자열 또는 bytes 데이터
        key_prefix: S3 키 접두사 (폴더 경로, 예: 'problems/images/')
        file_extension: 파일 확장자 (기본값: 'png')

    Returns:
        str: S3 Public URL (예: https://bucket-name.s3.region.amazonaws.com/key)

    Raises:
        ClientError: S3 업로드 실패 시
        ValueError: AWS 자격증명 누락 시
    """
    # AWS 자격증명 확인
    if not settings.AWS_ACCESS_KEY_ID or not settings.AWS_SECRET_ACCESS_KEY:
        raise ValueError("AWS 자격증명이 설정되지 않았습니다. .env 파일을 확인하세요.")

    if not settings.S3_BUCKET_NAME:
        raise ValueError("S3_BUCKET_NAME이 설정되지 않았습니다. .env 파일을 확인하세요.")

    # S3 클라이언트 생성
    s3_client = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION
    )

    # 데이터 타입 처리 (base64 → bytes)
    if isinstance(file_data, str):
        file_bytes = base64.b64decode(file_data)
    else:
        file_bytes = file_data

    # S3 키 생성 (파일명)
    # 예: problems/images/20251110143025_a3f9e2.png
    timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    random_id = uuid.uuid4().hex[:6]
    s3_key = f"{key_prefix}{timestamp}_{random_id}.{file_extension}"

    try:
        # Content-Type 결정
        content_type_map = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
        }
        content_type = content_type_map.get(file_extension.lower(), 'application/octet-stream')

        # S3 업로드 (ACL 없이 - 버킷 정책으로 Public 설정)
        s3_client.put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=s3_key,
            Body=file_bytes,
            ContentType=content_type
        )

        # Public URL 생성
        public_url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_key}"

        print(f"[SUCCESS] S3 upload successful: {public_url}")
        return public_url

    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        print(f"[ERROR] S3 upload failed: [{error_code}] {error_message}")
        raise


def upload_to_local(file_data, key_prefix='problems/', file_extension='png'):
    """
    파일 데이터를 로컬에 저장합니다. (레거시 함수 - 호환성 유지)

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

    # 파일명 생성 (os.path.join 사용으로 크로스 플랫폼 호환성 개선)
    filename = os.path.join(
        key_prefix,
        f"{datetime.date.today()}_{uuid.uuid4().hex}.{file_extension}"
    )

    # 파일 저장
    with open(filename, "wb") as f:
        f.write(file_bytes)

    return filename  # 로컬 경로 반환
