#!/usr/bin/env python3
"""테스트 데이터 삽입 스크립트"""
import psycopg2
from datetime import datetime

DB_HOST = "3.35.241.113"
DB_PORT = 5432
DB_NAME = "captain_echo"
DB_USER = "doonki"
DB_PASSWORD = "changeme"

def insert_test_data():
    try:
        conn = psycopg2.connect(
            host=DB_HOST, port=DB_PORT,
            database=DB_NAME, user=DB_USER, password=DB_PASSWORD
        )
        cursor = conn.cursor()

        print("📝 테스트 데이터 삽입 시작...")

        # 1. 보호자 생성
        cursor.execute("""
            INSERT INTO protector (protector_pin, provider, social_id, email, max_student_count, terms_agreed, created_at, is_deleted)
            VALUES ('1234', 'GOOGLE', 'google_test_123', 'test@example.com', 2, TRUE, %s, FALSE)
            ON CONFLICT DO NOTHING
            RETURNING protector_id
        """, (datetime.now(),))

        result = cursor.fetchone()
        if result:
            protector_id = result[0]
            print(f"✅ 보호자 생성 완료 (ID: {protector_id})")
        else:
            cursor.execute("SELECT protector_id FROM protector WHERE social_id = 'google_test_123'")
            protector_id = cursor.fetchone()[0]
            print(f"ℹ️  기존 보호자 사용 (ID: {protector_id})")

        # 2. 학생 생성
        cursor.execute("""
            INSERT INTO student (protector_id, name, gender, birth, grade, level)
            VALUES (%s, '박준형', 'MALE', '2018-03-15', 'GRADE_1', 1)
            ON CONFLICT DO NOTHING
            RETURNING student_id
        """, (protector_id,))

        result = cursor.fetchone()
        if result:
            student_id = result[0]
            print(f"✅ 학생 생성 완료 (ID: {student_id})")
        else:
            cursor.execute("SELECT student_id FROM student WHERE protector_id = %s LIMIT 1", (protector_id,))
            student_id = cursor.fetchone()[0]
            print(f"ℹ️  기존 학생 사용 (ID: {student_id})")

        # 3. 관심사 추가
        cursor.execute("""
            INSERT INTO sub_interest (sub_interest_id, small_interest_name)
            VALUES (1, '동물')
            ON CONFLICT (sub_interest_id) DO NOTHING
        """)
        print("✅ 관심사 (동물) 준비 완료")

        # 4. 학생 관심사 연결
        cursor.execute("""
            INSERT INTO student_interest (student_id, interest_id)
            VALUES (%s, 1)
            ON CONFLICT DO NOTHING
        """, (student_id,))
        print("✅ 학생 관심사 연결 완료")

        # 5. 자모 통계 추가
        cursor.execute("""
            INSERT INTO jamo_stat (student_id, jamo, total_attempts, fail_count, weekly_fail_rate, weekly_accuracy_rate, created_at, updated_at)
            VALUES
                (%s, 'ㄱ', 10, 4, 0.4, 0.6, %s, %s),
                (%s, 'ㄴ', 10, 5, 0.5, 0.5, %s, %s),
                (%s, 'ㄷ', 10, 2, 0.2, 0.8, %s, %s)
            ON CONFLICT DO NOTHING
        """, (
            student_id, datetime.now(), datetime.now(),
            student_id, datetime.now(), datetime.now(),
            student_id, datetime.now(), datetime.now()
        ))
        print("✅ 자모 통계 추가 완료 (ㄱ, ㄴ, ㄷ)")

        # 6. 주간 리포트 생성
        cursor.execute("""
            INSERT INTO weekly_personal_report (student_id, total_time, curriculum, discussion_log, curriculum_structure, protector_goal, created_at)
            VALUES (%s, 0, NULL, NULL, NULL, 'FOCUS_ON_WEAKNESS', %s)
            RETURNING report_id
        """, (student_id, datetime.now()))

        report_id = cursor.fetchone()[0]
        print(f"✅ 주간 리포트 생성 완료 (ID: {report_id})")

        conn.commit()
        cursor.close()
        conn.close()

        print(f"\n🎉 테스트 데이터 삽입 완료!")
        print(f"   - Protector ID: {protector_id}")
        print(f"   - Student ID: {student_id}")
        print(f"   - Report ID: {report_id}")
        print(f"\n테스트 실행: python test_refactored_system.py")

    except Exception as e:
        print(f"❌ 에러 발생: {e}")
        raise

if __name__ == "__main__":
    insert_test_data()
