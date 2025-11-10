#!/usr/bin/env python3
"""
DB 마이그레이션 실행 스크립트
"""
import psycopg2

# DB 연결 정보
DB_HOST = "3.35.241.113"
DB_PORT = 5432
DB_NAME = "captain_echo"
DB_USER = "doonki"
DB_PASSWORD = "changeme"

# 마이그레이션 SQL
MIGRATION_SQL = """
-- ==============================================
-- Migration 001: Add curriculum_structure column
-- ==============================================

BEGIN;

ALTER TABLE weekly_personal_report
ADD COLUMN IF NOT EXISTS curriculum_structure JSONB;

COMMENT ON COLUMN weekly_personal_report.curriculum_structure IS '파싱 없이 읽을 구조화된 커리큘럼: {"monday": [{"type_id": 1, "count": 2}, ...]}';

COMMIT;
"""

def run_migration():
    try:
        # DB 연결
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        conn.autocommit = True
        cursor = conn.cursor()

        print("==============================================")
        print("Migration 001 실행 중...")
        print("==============================================")

        # 마이그레이션 실행
        cursor.execute(MIGRATION_SQL)

        print("✅ Migration 001 완료!")
        print("- weekly_personal_report.curriculum_structure 추가 (JSONB)")
        print("==============================================")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"❌ 마이그레이션 실패: {e}")
        raise

if __name__ == "__main__":
    run_migration()
