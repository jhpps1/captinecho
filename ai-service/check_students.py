#!/usr/bin/env python3
"""DB에 있는 학생 목록 확인"""
import psycopg2

DB_HOST = "3.35.241.113"
DB_PORT = 5432
DB_NAME = "captain_echo"
DB_USER = "doonki"
DB_PASSWORD = "changeme"

try:
    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT,
        database=DB_NAME, user=DB_USER, password=DB_PASSWORD
    )
    cursor = conn.cursor()

    # 학생 목록 조회
    cursor.execute("""
        SELECT student_id, name, gender, birth, grade, level, protector_id
        FROM student
        ORDER BY student_id
    """)

    students = cursor.fetchall()

    if students:
        print(f"✅ DB에 {len(students)}명의 학생이 있습니다:\n")
        for s in students:
            print(f"  ID: {s[0]}, 이름: {s[1]}, 성별: {s[2]}, 생년월일: {s[3]}, 학년: {s[4]}, 레벨: {s[5]}, 보호자ID: {s[6]}")
    else:
        print("❌ DB에 학생이 없습니다.")

    cursor.close()
    conn.close()

except Exception as e:
    print(f"❌ 에러: {e}")
