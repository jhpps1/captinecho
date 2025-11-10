#!/usr/bin/env python3
"""
기존 로컬 이미지를 S3로 마이그레이션하는 스크립트

사용법:
    python migrate_images_to_s3.py

환경변수 (.env 파일에 설정 필요):
    - AWS_ACCESS_KEY_ID
    - AWS_SECRET_ACCESS_KEY
    - AWS_REGION
    - S3_BUCKET_NAME
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import boto3
from botocore.exceptions import ClientError

# 프로젝트 루트에서 .env 로드
load_dotenv()

# 설정
LOCAL_IMAGE_DIR = "static/problems/images"
S3_KEY_PREFIX = "problems/images/"

# AWS 설정
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "ap-northeast-2")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "captain-echo-files")


def validate_env_variables():
    """환경변수 검증"""
    missing = []

    if not AWS_ACCESS_KEY_ID:
        missing.append("AWS_ACCESS_KEY_ID")
    if not AWS_SECRET_ACCESS_KEY:
        missing.append("AWS_SECRET_ACCESS_KEY")
    if not S3_BUCKET_NAME:
        missing.append("S3_BUCKET_NAME")

    if missing:
        print("[ERROR] 다음 환경변수가 설정되지 않았습니다:")
        for var in missing:
            print(f"   - {var}")
        print("\n.env 파일을 확인하거나 환경변수를 설정해주세요.")
        return False

    return True


def upload_file_to_s3(file_path: Path, s3_client, bucket_name: str, s3_key: str) -> bool:
    """파일을 S3에 업로드"""
    try:
        with open(file_path, 'rb') as f:
            s3_client.put_object(
                Bucket=bucket_name,
                Key=s3_key,
                Body=f,
                ContentType='image/png'
            )

        s3_url = f"https://{bucket_name}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"
        return s3_url

    except ClientError as e:
        print(f"[ERROR] S3 업로드 실패: {e}")
        return None
    except Exception as e:
        print(f"[ERROR] 파일 읽기 실패: {e}")
        return None


def migrate_images():
    """메인 마이그레이션 함수"""
    print("=" * 70)
    print("[MIGRATION] S3 이미지 마이그레이션 시작")
    print("=" * 70)

    # 1. 환경변수 검증
    if not validate_env_variables():
        sys.exit(1)

    print(f"\n[OK] AWS 설정:")
    print(f"   - Region: {AWS_REGION}")
    print(f"   - Bucket: {S3_BUCKET_NAME}")
    print(f"   - Access Key: {AWS_ACCESS_KEY_ID[:10]}... (마스킹)")

    # 2. 로컬 이미지 디렉토리 확인
    image_dir = Path(LOCAL_IMAGE_DIR)
    if not image_dir.exists():
        print(f"\n[ERROR] 이미지 디렉토리가 존재하지 않습니다: {LOCAL_IMAGE_DIR}")
        sys.exit(1)

    # 3. 이미지 파일 목록 가져오기
    image_files = list(image_dir.glob("*.png")) + \
                  list(image_dir.glob("*.jpg")) + \
                  list(image_dir.glob("*.jpeg"))

    total_files = len(image_files)

    if total_files == 0:
        print(f"\n[WARN] 마이그레이션할 이미지가 없습니다 ({LOCAL_IMAGE_DIR})")
        return

    print(f"\n[FILES] 발견된 이미지: {total_files}개")

    # 파일 크기 계산
    total_size = sum(f.stat().st_size for f in image_files)
    total_size_mb = total_size / (1024 * 1024)
    print(f"   총 크기: {total_size_mb:.2f} MB")

    # 4. S3 클라이언트 생성
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_REGION
        )
        print("\n[OK] S3 클라이언트 생성 성공")
    except Exception as e:
        print(f"\n[ERROR] S3 클라이언트 생성 실패: {e}")
        sys.exit(1)

    # 5. 마이그레이션 실행
    print(f"\n{'='*70}")
    print("[UPLOAD] 업로드 시작...")
    print(f"{'='*70}\n")

    success_count = 0
    fail_count = 0

    for idx, file_path in enumerate(image_files, 1):
        filename = file_path.name
        s3_key = f"{S3_KEY_PREFIX}{filename}"

        print(f"[{idx}/{total_files}] {filename}...", end=" ")

        s3_url = upload_file_to_s3(file_path, s3_client, S3_BUCKET_NAME, s3_key)

        if s3_url:
            print(f"[OK]")
            success_count += 1
        else:
            print(f"[FAIL]")
            fail_count += 1

    # 6. 결과 요약
    print(f"\n{'='*70}")
    print("[RESULT] 마이그레이션 결과")
    print(f"{'='*70}")
    print(f"[OK] 성공: {success_count}개")
    print(f"[FAIL] 실패: {fail_count}개")
    print(f"[FILES] 총 파일: {total_files}개")

    if success_count > 0:
        print(f"\n[SAMPLE] S3 URL 예시:")
        sample_file = image_files[0].name
        print(f"   https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{S3_KEY_PREFIX}{sample_file}")

    print(f"\n{'='*70}")
    print("[SUCCESS] 마이그레이션 완료!")
    print(f"{'='*70}")


if __name__ == "__main__":
    try:
        migrate_images()
    except KeyboardInterrupt:
        print("\n\n[WARN] 사용자에 의해 중단되었습니다.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n[ERROR] 예상치 못한 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
