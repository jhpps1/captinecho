#!/usr/bin/env python3
"""
S3 연결 테스트 스크립트
"""

import os
from dotenv import load_dotenv
import boto3
from botocore.exceptions import ClientError

# .env 파일 로드
load_dotenv()

# 환경변수 확인
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "ap-northeast-2")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "captain-echo-files")

print("=" * 70)
print("[TEST] S3 Connection Test")
print("=" * 70)

# 환경변수 확인
if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
    print("[ERROR] AWS credentials not found!")
    print("        Please check .env file")
    exit(1)

print(f"\n[OK] AWS Configuration:")
print(f"     - Access Key ID: {AWS_ACCESS_KEY_ID[:10]}... (masked)")
print(f"     - Region: {AWS_REGION}")
print(f"     - Bucket: {S3_BUCKET_NAME}")

# S3 클라이언트 생성
try:
    s3_client = boto3.client(
        's3',
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )
    print("\n[OK] S3 client created successfully!")
except Exception as e:
    print(f"\n[ERROR] Failed to create S3 client: {e}")
    exit(1)

# 버킷 존재 확인
print(f"\n[CHECK] Verifying bucket '{S3_BUCKET_NAME}'...")
try:
    s3_client.head_bucket(Bucket=S3_BUCKET_NAME)
    print(f"[OK] Bucket '{S3_BUCKET_NAME}' exists!")
except ClientError as e:
    error_code = e.response['Error']['Code']
    if error_code == '404':
        print(f"[ERROR] Bucket '{S3_BUCKET_NAME}' not found!")
        print("\n[INFO] Please create bucket in AWS Console:")
        print(f"       1. AWS Console -> S3")
        print(f"       2. Click 'Create bucket'")
        print(f"       3. Bucket name: {S3_BUCKET_NAME}")
        print(f"       4. Region: {AWS_REGION}")
        print(f"       5. Uncheck 'Block all public access'")
        exit(1)
    elif error_code == '403':
        print(f"[ERROR] Access denied to bucket '{S3_BUCKET_NAME}'!")
        print("\n[INFO] Please check IAM user permissions:")
        print(f"       - AmazonS3FullAccess policy required")
        exit(1)
    else:
        print(f"[ERROR] Unexpected error: [{error_code}] {e.response['Error']['Message']}")
        exit(1)

# 간단한 업로드 테스트
print(f"\n[UPLOAD] Testing file upload...")
test_content = b"Captain Echo S3 Test File"
test_key = "test/connection_test.txt"

try:
    s3_client.put_object(
        Bucket=S3_BUCKET_NAME,
        Key=test_key,
        Body=test_content,
        ContentType='text/plain'
    )

    test_url = f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{test_key}"
    print(f"[OK] Test file uploaded successfully!")
    print(f"     URL: {test_url}")

except ClientError as e:
    error_code = e.response['Error']['Code']
    print(f"[ERROR] Upload failed: [{error_code}] {e.response['Error']['Message']}")
    exit(1)

# 업로드된 파일 삭제
print(f"\n[DELETE] Cleaning up test file...")
try:
    s3_client.delete_object(
        Bucket=S3_BUCKET_NAME,
        Key=test_key
    )
    print(f"[OK] Test file deleted successfully!")
except Exception as e:
    print(f"[WARN] Delete failed (can be ignored): {e}")

print("\n" + "=" * 70)
print("[SUCCESS] S3 Connection Test Passed!")
print("=" * 70)
print("\n[NEXT STEPS]")
print("  1. python migrate_images_to_s3.py - Migrate existing images")
print("  2. docker compose up - Start AI service")
