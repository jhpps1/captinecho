#app/src/service/question_service.py

import re
import json
import datetime
import os
from sqlalchemy import text
from app.src.tasks.question import get_latest_curriculum, create_day_problem
from app.src.utils.llm import llm_problem
from app.src.utils.s3 import upload_to_s3  # S3 업로드 (필요 시 사용)
# 🚨 TTS 및 이미지 생성 함수는 내부적으로 S3 업로드를 처리합니다
from app.src.api.tts_api import generate_tts_and_upload
from app.src.api.gemini_api import generate_image_with_gemini_flash
from app.src.core.config import settings
from dotenv import load_dotenv
from app.src.utils.normalization import normalize_blank_position
# Batch scheduler는 Spring Boot에서 관리 (매주 일요일 23:00)


load_dotenv()

# 한글 자모 분리 테이블
CHOSEONG_LIST = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
JUNGSEONG_LIST = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ']
JONGSEONG_LIST = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']

def get_jamo_type(syllable, target_jamo):
    code = ord(syllable) - 0xAC00
    if code < 0 or code > 11171:
        return ''
    cho = CHOSEONG_LIST[code // 588]
    jung = JUNGSEONG_LIST[(code % 588) // 28]
    jong = JONGSEONG_LIST[code % 28]
    if target_jamo == cho:
        return 'INITIAL'
    elif target_jamo == jung:
        return 'MEDIAL'
    elif target_jamo == jong and jong != '':
        return 'FINAL'
    return ''




# === [1] 날짜 자동 계산 함수 ===
def get_weekdays_for_this_week():
    today = datetime.date.today()
    weekday = today.weekday()  # 월=0, ... 일=6
    days_to_sunday = (6 - weekday) if weekday != 6 else 0
    this_sunday = today + datetime.timedelta(days=days_to_sunday) if weekday != 6 else today
    days_kr = ['월요일', '화요일', '수요일', '목요일', '금요일']
    weekdays = []
    for i, day_kr in enumerate(days_kr):
        day_date = this_sunday + datetime.timedelta(days=i+1)
        weekdays.append((day_kr, day_date.strftime('%Y-%m-%d')))
    return weekdays

# === [2] LLM 코드블록 추출 함수 ===
def extract_json_from_llm_response(llm_response):
    llm_response = llm_response.strip()
    # ``````
    match = re.search(r"```json\s*([\w\W]*?)```", llm_response, re.DOTALL)
    if match:
        return match.group(1).strip()
    # 일반 ``````
    match = re.search(r"```\s*([\w\W]*?)```", llm_response, re.DOTALL)
    if match:
        return match.group(1).strip()
    return llm_response.strip()

# === [3] 파싱 전 JS 주석 제거 함수 ===
def clean_json_for_parsing(json_string):
    json_string = re.sub(r'//.*?(\r\n|\n)', r"\1", json_string)
    json_string = re.sub(r'/\*.*?\*/', '', json_string, flags=re.DOTALL)
    return json_string

# === [추가] 안전하게 LLM JSON 파싱 함수 ===
def safe_parse_json(llm_response, day_name):
    json_string = extract_json_from_llm_response(llm_response)
    json_string = clean_json_for_parsing(json_string)
    if not json_string.strip():
        print(f"{day_name} LLM 응답이 비어 있어 건너뜀")
        return []
    try:
        return json.loads(json_string)
    except Exception as e:
        print(f"{day_name} LLM 응답이 올바른 JSON이 아님:", llm_response)
        return []

# 학생 관심사 가져오기 함수 (text() 래핑 필수)
def get_interest_id_for_student(session, student_id):
    result = session.execute(
        text("""
        SELECT interest_id FROM student_interest WHERE student_id = :student_id LIMIT 1
        """),
        {"student_id": student_id}
    )
    row = result.first()
    return row[0] if row else 0

# === [4] DB용 사전 처리 함수 === (blank_phoneme 정제 로직 포함)
def process_day_problem_items(session, student_id, llm_result):
    
    # Base64 디코딩을 건너뛸 것으로 예상되는 문자열 패턴을 확인하는 헬퍼 함수
    def is_likely_placeholder(data):
        if not data:
            return True
        data_str = str(data).strip().lower()
        if not data_str:
            return True
        if len(data_str) < 50 and any(ext in data_str for ext in ['.png', '.jpg', '.mp3', 'base64', 'image', 'sound']):
            return True
        if data_str in ['none', 'null']:
            return True
        return False


    # Gemini API Key 사용
    GEMINI_API_KEY = settings.GEMINI_API_KEY

    for item in llm_result:
        # 1. student_id 설정
        item["student_id"] = student_id if student_id is not None else 0

        # 💡 [수정] UnboundLocalError 해결: TTS 및 이미지 로직 전에 변수들을 먼저 할당합니다.
        correct_answer_text = item.get("correct_answer")
        adventure_type = item.get("adventure_type_id")

        # 🚨 기본 URL 초기화 (제거된 로직 대체)
        item["image_url"] = ""
        item["sound_url"] = "problems/default_tts.mp3"
        
        # 임시 변수에 데이터 가져오기 (None 처리)
        img_data = item.get("image_data")
        snd_data = item.get("sound_data")
        
        # # 2. 이미지 처리
        # if img_data and not is_likely_placeholder(img_data):
        #     try:
        #         item["image_url"] = upload_to_local(img_data, key_prefix='problems/')
        #     except Exception as e:
        #         print(f"⚠️ Image Base64 Upload Failed for item: {e}")
        #         item["image_url"] = "" 
        # else:
        #     item["image_url"] = ""
            
        # # 3. 사운드 처리
        # if snd_data and not is_likely_placeholder(snd_data):
        #     try:
        #         item["sound_url"] = upload_to_local(snd_data, key_prefix='problems/')
        #     except Exception as e:
        #         print(f"⚠️ Sound Base64 Upload Failed for item: {e}")
        #         item["sound_url"] = "problems/default_tts.mp3"
        # else:
        #     item["sound_url"] = "problems/default_tts.mp3"


        generated_sound_path = ""
        adventure_type = item.get("adventure_type_id")  # adventure_type 미리 정의
        blank_position  = None
        if adventure_type in [1, 2]:
            problem_text = item.get("problem_text", "")
            blank_jamo = item.get("blank_phoneme", "").strip()
            for syllable in problem_text:
                jt = get_jamo_type(syllable, blank_jamo)
                if jt:
                    blank_position = jt
                    break
        item["blank_position"] = blank_position if blank_position else ""

        
        if problem_text: # 정답 텍스트가 있는 경우에만 TTS 생성 시도
            try:
                # TTS API 호출: 정답 텍스트를 음성으로 변환하고 업로드 후 URL 반환
                generated_sound_path = generate_tts_and_upload(
                    problem_text, 
                    student_id=student_id, 
                    key_prefix='problems/sound/' # 저장 경로 지정
                )
            except Exception as e:
                print(f"❌ TTS 생성 및 업로드 실패: {e}")
                generated_sound_path = ""
                
            if generated_sound_path:
                item["sound_url"] = generated_sound_path
                print(f"✅ TTS 생성 성공! sound_url: {generated_sound_path}")
            # 실패 시, item["sound_url"]은 'problems/default_tts.mp3' 기본값을 유지함





# 🚨 [새로운 로직] 탐험 4의 correct_answer를 빈 문자열로 강제 처리
        if item.get("adventure_type_id") == 4:
            item["correct_answer"] = ""
            # choices도 필요 없다면 비워줄 수 있습니다. (로그에 따라 필요하면 추가)
            if item.get("choices") is None or len(item.get("choices", [])) > 0:
                 item["choices"] = []
            item["image_url"] = "" # 탐험 4는 이미지 생성 안함

        # 🚨 [이미지 생성] 탐험 2, 3일 경우 GMS 호출
        # adventure_type은 이미 위에서 정의됨 (159번 라인)
        problem_text = item.get("problem_text")

        # 💡 생성 경로 변수를 미리 초기화
        generated_image_path = ""

        if adventure_type in [2, 3] and problem_text:
            # GMS API 호출 시작 로그
            print(f"✨ Gemini API 호출 시작: '{problem_text}'")

            # 1. Base64 데이터 생성 시도 로직 건너뛰기
            if GEMINI_API_KEY:
                # generate_image_with_gemini_flash 함수는 이제 파일 경로를 반환해야 함
                generated_image_path = generate_image_with_gemini_flash(
                    problem_text, 
                    GEMINI_API_KEY 
                )
            else:
                print("❌ Gemini API Key가 없어 이미지 생성을 시도하지 않았습니다.")
                generated_image_path = ""

            # 호출 결과 처리 로직 (하나만 남김)
            if generated_image_path:
                item["image_url"] = generated_image_path
                print(f"✅ GMS 이미지 생성 성공! URL: {generated_image_path}")
            else:
                print(f"❌ Gemini 이미지 생성 실패! 기본 URL 사용.")
                item["image_url"] = "" # 실패 시 image_url을 비워둠


        # 4. 리스트 형식 보장 (choices, problem_phonemes)
        if isinstance(item.get("choices"), str):
            item["choices"] = [x.strip() for x in item["choices"].split(',') if x.strip()]
        elif item.get("choices") is None:
            item["choices"] = []
            
        if isinstance(item.get("problem_phonemes"), str):
            item["problem_phonemes"] = [x.strip() for x in item["problem_phonemes"].split(',') if x.strip()]
        elif not isinstance(item.get("problem_phonemes"), list):
            item["problem_phonemes"] = []
            
        # 5. 숫자/문자열 기본값 및 정제 보장 (blank_phoneme 정제 및 길이 제한)
        # blank_position 정규화 (소문자 → 대문자, 숫자 → 문자열 변환)
        item["blank_position"] = normalize_blank_position(
            item.get("blank_position"),
            adventure_type_id=adventure_type
        )
         
        blank_phoneme_value = item.get("blank_phoneme")
        if blank_phoneme_value is not None:
         # 1단계: 공백 제거
            cleaned_phoneme = str(blank_phoneme_value).strip()
         
           # 2단계: 5글자 초과 시 강제 절단 (DB 스키마 VARCHAR(5) 준수)
            if len(cleaned_phoneme) > 5:
                print(f"⚠️ blank_phoneme '{cleaned_phoneme}'의 길이가 5자를 초과하여 강제 절단됩니다.")
                item["blank_phoneme"] = cleaned_phoneme[:5]
            elif not cleaned_phoneme:
                item["blank_phoneme"] = '' # 빈 문자열
            else:
                item["blank_phoneme"] = cleaned_phoneme
        else:
            item["blank_phoneme"] = ''

        # 6. 불필요 필드 제거
        for key in ["image_data", "sound_data"]:
            item.pop(key, None)
            
        # 7. REQUIRED_KEYS에 대한 최종 점검 및 기본값 보장
        REQUIRED_KEYS = {
            "student_id", "adventure_type_id", "assigned_date", "seq_no", "level",
            "problem_text", "choices", "correct_answer",
            "image_url", "sound_url", "problem_phonemes",
            "blank_position", "blank_phoneme","interest_id"
        }
        for req in REQUIRED_KEYS:
            if req not in item or item[req] is None:
                if req in ["choices", "problem_phonemes"]:
                    item[req] = []
                elif req in ["seq_no", "level", "adventure_type_id", "student_id"]:
                    item[req] = 0
                elif req == "blank_position":
                    item[req] = ""
                else:
                    item[req] = ""
                    
        item = {k: v for k, v in item.items() if k in REQUIRED_KEYS}
        
        print("최종 저장할 item:", item)
        create_day_problem(session, **item)

# 학생 관심사 가져오기 함수(이미 구현되어 있다면 재사용)
def get_interest_id_for_student(session, student_id):
    result = session.execute(
        text("""
        SELECT interest_id FROM student_interest WHERE student_id=:student_id LIMIT 1
        """),
        {"student_id": student_id}
    )
    row = result.first()
    return row[0] if row else 0


        
# === [5] 메인: 한 주 전체 처리 === (LLM 프롬프트 수정)
def generate_problems_for_one_week(session, student_id):
    curriculum = get_latest_curriculum(session, student_id)
    if curriculum is None:
        return None
    curriculum_text = curriculum[0] if isinstance(curriculum, tuple) else curriculum
    DAYS = get_weekdays_for_this_week()


       # 학생 관심사 미리 조회

    def get_small_interest_name_for_student(session, student_id):
        result = session.execute(
            text("""
            SELECT si.small_interest_name
            FROM student_interest sti
            JOIN sub_interest si ON sti.interest_id = si.sub_interest_id
            WHERE sti.student_id = :student_id LIMIT 1
            """),
            {"student_id": student_id}
        )
        row = result.first()
        return row[0] if row else ""

    interest_id = get_interest_id_for_student(session, student_id)
    small_interest_name = get_small_interest_name_for_student(session, student_id)

    for day_name, assigned_date in DAYS:
        print(f"======= {day_name}({assigned_date}) LLM 문제 생성 =======")
        # --------------------------------------------------------------------------
        # 프롬프트를 일일 10문제 요청 형식으로 명확하게 수정

        
        prompt = f"""

        아래 커리큘럼 및 학생의 세부 관심사({small_interest_name}, sub_interest_id={interest_id})에 맞춰 {day_name}({assigned_date})의 10개 문제를 반드시 아래 규칙과 예시에 따라 JSON 리스트(배열)로만 반환하세요. 각 문제는 키-값 딕셔너리로 작성되며, 모든 key를 포함해야 합니다.

        *****************************************
    # [탐험별 구조 및 규칙]

    #### adventure_type_id = 1 (음소 찾기)
    - problem_text: 한글 음절 (예: "가")
    - problem_phonemes: 해당 음절을 구성하는 한글 자모 배열 (예: ["ㄱ", "ㅏ"])
    - blank_phoneme: problem_phonemes 중 1개 (랜덤)
    - correct_answer: blank_phoneme과 동일
    - choices: 여러 한글 자모 (예: ["ㄱ", "ㄴ", "ㄷ"])
    - 나머지 필드: 필요 없으면 "" 또는 []로 빈 값

    예시:
    {{
    "adventure_type_id": 1,
    "seq_no": 1,
    "assigned_date": "{assigned_date}",
    "level": 1,
    "interest_id": {interest_id},
    "problem_text": "가",
    "problem_phonemes": ["ㄱ", "ㅏ"],
    "blank_phoneme": "ㄱ",
    "correct_answer": "ㄱ",
    "choices": ["ㄱ", "ㄴ", "ㄷ"],
    "blank_position": "INITIAL",
    "student_id": {student_id},
    "image_url": "",
    "sound_url": "problems/sound/{assigned_date}_xxxxx.mp3"
    }}

    #### adventure_type_id = 2 (이미지 + 음소)
    - problem_text: 단어명 (예: "가방")
    - problem_phonemes: 단어를 구성하는 자모 배열 (예: ["ㄱ", "ㅏ", "ㅂ", "ㅏ", "ㅇ"])
    - blank_phoneme: problem_phonemes 중 1개
    - correct_answer: blank_phoneme과 동일
    - choices: 한글 자모 여러 개
    - image_url: 단어와 매칭되는 이미지 경로 (비어도 무관)
    - 나머지 필드: 필요 없으면 "" 또는 []로 빈 값

    예시:
    {{
    "adventure_type_id": 2,
    "seq_no": 2,
    "assigned_date": "{assigned_date}",
    "level": 2,
    "interest_id": {interest_id},
    "problem_text": "가방",
    "problem_phonemes": ["ㄱ", "ㅏ", "ㅂ", "ㅏ", "ㅇ"],
    "blank_phoneme": "ㅂ",
    "correct_answer": "ㅂ",
    "choices": ["ㅂ", "ㅇ", "ㅁ"],
    "blank_position": "INITIAL",
    "student_id": {student_id},
    "image_url": "problems/image/가방.jpg",
    "sound_url": "problems/sound/{assigned_date}_yyyyy.mp3"
    }}

    #### adventure_type_id = 3 (이미지 + 단어)
    - problem_text: 단어명 (예: "가방")
    - problem_phonemes, blank_phoneme: 반드시 [] 또는 ""로 빈 값을 입력
    - correct_answer: 문제와 같은 단어명 (예: "가방")
    - choices: 여러 단어(예: ["가방", "빵", "파"])
    - image_url: 해당 단어 이미지 경로

    예시:
   { {
    "adventure_type_id": 3,
    "seq_no": 3,
    "assigned_date": "{assigned_date}",
    "level": 2,
    "interest_id": {interest_id},
    "problem_text": "가방",
    "problem_phonemes": [],
    "blank_phoneme": null,
    "correct_answer": "가방",
    "choices": ["가방", "빵", "파"],
    "blank_position": null,
    "student_id": {student_id},
    "image_url": "problems/image/가방.jpg",
    "sound_url": "problems/sound/{assigned_date}_zzzzzz.mp3"
    }}

    #### adventure_type_id = 4 (음성 판별)
    - problem_text: 단어명 (예: "가방")
    - problem_phonemes, blank_phoneme, choices: 반드시 [] 또는 ""로 빈 값 입력
    - correct_answer: 문제 단어와 동일
    - image_url: ""로 입력
    - sound_url: TTS경로

    예시:
    {{
    "adventure_type_id": 4,
    "seq_no": 4,
    "assigned_date": "{assigned_date}",
    "level": 3,
    "interest_id": {interest_id},
    "problem_text": "가방",
    "problem_phonemes": [],
    "blank_phoneme": "",
    "correct_answer": "가방",
    "choices": [],
    "blank_position": "",
    "student_id": {student_id},
    "image_url": "",
    "sound_url": "problems/sound/{assigned_date}_wwwww.mp3"
    }}

        *****************************************
        - 한글 음소 사용 필수
        - ❌ 금지: 'giyeok', 'naun', 'daun' 같은 영어 음소명
        - ✅ 허용: 'ㄱ', 'ㄴ', 'ㄷ' 같은 한글 자모

        # ====================================================================
        # 🚨 추가된 핵심 지침
        # ====================================================================
        - **탐험 2 & 3 규칙:** 'adventure_type_id'가 2 또는 3인 문제의 **'correct_answer'**와 **'choices'** 필드는 반드시 **그림으로 표현할 수 있는 구체적인 명사**(예: '코끼리', '가방', '티라노', '분무기')만 사용해야 합니다. **절대 '가', '나', '다'와 같은 자모, 모음, 또는 한 음절 글자를 단독으로 사용하지 마세요.**

        - **blank_position 필드 규칙 (중요!):**
            - adventure_type_id가 1 또는 2일 때: 반드시 "INITIAL", "MEDIAL", "FINAL" 중 하나의 **대문자** 값만 사용하세요.
            - adventure_type_id가 3 또는 4일 때: null 또는 빈 문자열("")을 사용하세요.
            - ❌ 절대 금지: "initial", "medial", "final" 같은 소문자 값
            - ✅ 반드시 사용: "INITIAL", "MEDIAL", "FINAL" 대문자 Enum 값만
        # ====================================================================
        - **날짜 배정:** 모든 문제의 "assigned_date" 필드는 **"{assigned_date}"**로 설정해야 합니다.
        - 이 학생의 관심사 interest_id는 {interest_id} 입니다. 모든 문제의 interest_id도 반드시 {interest_id}로 지정하세요.
         
        - **구조 준수:** 각 문제는 아래 필드를 반드시 포함하고, 주석 없이 순수 JSON으로 반환하세요.
            "adventure_type_id":1~4, "seq_no": 1~10, "assigned_date": "YYYY-MM-DD", "level": 1~6,
            "interest_id": (학습자의 세부 관심사 ID와 매칭, 없으면 0), "problem_text", "choices", "correct_answer",
            "image_data", "sound_data", "problem_phonemes", "blank_position", "blank_phoneme"
            "반드시 한국어로 작성하세요."
            "correct_answer"와 "blank_position"는 각각 5자, 20자를 초과하지 않도록 하세요.

        - **seq_no**는 해당 요일 내에서 1부터 10까지 순차적으로 부여하세요.
        - **interest_id**는 학습자의 세부 관심사(sub_interest 테이블)와 매칭되는 유효한 ID를 부여하세요.
        - **curriculum_text:**
        {curriculum_text}
        """
        # --------------------------------------------------------------------------
        llm_response = llm_problem(prompt)
        llm_result = safe_parse_json(llm_response, day_name)
        if not llm_result:
            print(f"==== {day_name} 문제 건너뜀 (빈 응답) ===")
            continue
        process_day_problem_items(session, student_id, llm_result)

# correct_anser 100, blank_phoneme 50자로 
