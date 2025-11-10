#!/usr/bin/env python3
"""
DB 재생성 스크립트 (init.sql 실행)
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# DB 연결 정보
DB_HOST = "3.35.241.113"
DB_PORT = 5432
DB_NAME = "captain_echo"
DB_USER = "doonki"
DB_PASSWORD = "changeme"

def recreate_database():
    try:
        # postgres DB에 연결 (captain_echo를 DROP하기 위해)
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database="postgres",
            user=DB_USER,
            password=DB_PASSWORD
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        print("==============================================")
        print("DB 재생성 시작...")
        print("==============================================")

        # 기존 captain_echo DB 삭제
        print("1. 기존 captain_echo DB 삭제 중...")

        # 다른 세션 강제 종료
        print("   - 다른 세션 종료 중...")
        cursor.execute(f"""
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = '{DB_NAME}'
              AND pid <> pg_backend_pid();
        """)
        print("   ✅ 세션 종료 완료")

        cursor.execute(f"DROP DATABASE IF EXISTS {DB_NAME};")
        print("   ✅ 기존 DB 삭제 완료")

        # 새로운 captain_echo DB 생성
        print("2. 새로운 captain_echo DB 생성 중...")
        cursor.execute(f"CREATE DATABASE {DB_NAME} WITH OWNER {DB_USER} ENCODING 'UTF8';")
        print("   ✅ 새 DB 생성 완료")

        cursor.close()
        conn.close()

        # captain_echo DB에 연결하여 init.sql 실행
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = conn.cursor()

        print("3. init.sql 실행 중...")

        # init.sql 읽기
        with open("/home/ubuntu/projects/S13P31D101/infrastructure/postgres/init.sql", "r", encoding="utf-8") as f:
            init_sql = f.read()

        # SQL 실행
        cursor.execute(init_sql)
        conn.commit()

        print("   ✅ init.sql 실행 완료")
        print("==============================================")
        print("✅ DB 재생성 성공!")
        print("   - curriculum_structure JSONB 컬럼 포함")
        print("   - 모든 테이블 재생성 완료")
        print("==============================================")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"❌ DB 재생성 실패: {e}")
        raise

if __name__ == "__main__":
    recreate_database()
