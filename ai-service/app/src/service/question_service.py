#app/src/service/question_service.py

import re
import json
import datetime
import os
from app.src.tasks.question import get_latest_curriculum, create_day_problem
from app.src.utils.llm import llm_problem
from app.src.utils.s3 import upload_to_local  # 로컬 개발용
from app.src.api.gms_api import generate_image_with_gemini_flash
from dotenv import load_dotenv

load_dotenv()



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


    # 🚨 GMS API 키를 여기서 한 번 읽어옵니다. (OPENAI_API_KEY 사용)
    GMS_API_KEY_FROM_ENV = os.getenv("OPENAI_API_KEY")

    for item in llm_result:
        # 1. student_id 설정
        item["student_id"] = student_id if student_id is not None else 0

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

# 🚨 [새로운 로직] 탐험 4의 correct_answer를 빈 문자열로 강제 처리
        if item.get("adventure_type_id") == 4:
            item["correct_answer"] = ""
            # choices도 필요 없다면 비워줄 수 있습니다. (로그에 따라 필요하면 추가)
            if item.get("choices") is None or len(item.get("choices", [])) > 0:
                 item["choices"] = []
            item["image_url"] = "" # 탐험 4는 이미지 생성 안함

        # 🚨 [이미지 생성] 탐험 2, 3일 경우 GMS 호출
        adventure_type = item.get("adventure_type_id")
        correct_answer_text = item.get("correct_answer")

        # 💡 생성 경로 변수를 미리 초기화
        generated_image_path = ""

        if adventure_type in [2, 3] and correct_answer_text:
            # GMS API 호출 시작 로그
            print(f"✨ GMS API 호출 시작: '{correct_answer_text}'")

            # 1. Base64 데이터 생성 시도 로직 건너뛰기
            if GMS_API_KEY_FROM_ENV:
                # generate_image_with_gemini_flash 함수는 이제 파일 경로를 반환해야 함
                generated_image_path = generate_image_with_gemini_flash(
                    correct_answer_text, 
                    GMS_API_KEY_FROM_ENV 
                )
            else:
                print("❌ GMS API Key가 없어 이미지 생성을 시도하지 않았습니다.")
                generated_image_path = ""

            # 호출 결과 처리 로직 (하나만 남김)
            if generated_image_path:
                item["image_url"] = generated_image_path
                print(f"✅ GMS 이미지 생성 성공! URL: {generated_image_path}")
            else:
                print(f"❌ GMS 이미지 생성 실패! 기본 URL 사용.")
                item["image_url"] = "" # 실패 시 image_url을 비워둠


        # 4. 리스트 형식 보장 (choices, question_phonemes)
        if isinstance(item.get("choices"), str):
            item["choices"] = [x.strip() for x in item["choices"].split(',') if x.strip()]
        elif item.get("choices") is None:
            item["choices"] = []
            
        if isinstance(item.get("question_phonemes"), str):
            item["question_phonemes"] = [x.strip() for x in item["question_phonemes"].split(',') if x.strip()]
        elif not isinstance(item.get("question_phonemes"), list):
            item["question_phonemes"] = []
            
        # 5. 숫자/문자열 기본값 및 정제 보장 (blank_phoneme 정제 및 길이 제한)
        if item.get("blank_position") is None:
            item["blank_position"] = 0
         
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
            "question_text", "choices", "correct_answer",
            "image_url", "sound_url", "question_phonemes",
            "blank_position", "blank_phoneme"
        }
        for req in REQUIRED_KEYS:
            if req not in item or item[req] is None:
                if req in ["choices", "question_phonemes"]:
                    item[req] = []
                elif req in ["blank_position", "seq_no", "level", "adventure_type_id", "student_id"]:
                    item[req] = 0
                else:
                    item[req] = ""
                    
        item = {k: v for k, v in item.items() if k in REQUIRED_KEYS}
        
        print("최종 저장할 item:", item)
        create_day_problem(session, **item)
        
# === [5] 메인: 한 주 전체 처리 === (LLM 프롬프트 수정)
def generate_problems_for_one_week(session, student_id):
    curriculum = get_latest_curriculum(session, student_id)
    if curriculum is None:
        return None
    curriculum_text = curriculum[0] if isinstance(curriculum, tuple) else curriculum
    DAYS = get_weekdays_for_this_week()
    for day_name, assigned_date in DAYS:
        print(f"======= {day_name}({assigned_date}) LLM 문제 생성 =======")
        # --------------------------------------------------------------------------
        # 프롬프트를 일일 10문제 요청 형식으로 명확하게 수정
        prompt = f"""
        아래 커리큘럼에 따라 **{day_name}({assigned_date})의 탐험 10개 문제**만 JSON 리스트로 반환하세요.

        - **필수:** 오직 10개의 문제만 포함된 JSON 리스트로 응답하세요.
        - 한글 음소 사용 필수
        - ❌ 금지: 'giyeok', 'naun', 'daun' 같은 영어 음소명
        - ✅ 허용: 'ㄱ', 'ㄴ', 'ㄷ' 같은 한글 자모
        # ====================================================================
        # 🚨 추가된 핵심 지침
        # ====================================================================
        - **탐험 2 & 3 규칙:** 'adventure_type_id'가 2 또는 3인 문제의 **'correct_answer'**와 **'choices'** 필드는 반드시 **그림으로 표현할 수 있는 구체적인 명사**(예: '코끼리', '가방', '티라노', '분무기')만 사용해야 합니다. **절대 '가', '나', '다'와 같은 자모, 모음, 또는 한 음절 글자를 단독으로 사용하지 마세요.**
        # ====================================================================
        - **날짜 배정:** 모든 문제의 "assigned_date" 필드는 **"{assigned_date}"**로 설정해야 합니다.
        - **구조 준수:** 각 문제는 아래 필드를 반드시 포함하고, 주석 없이 순수 JSON으로 반환하세요.
            "adventure_type_id":1~4, "seq_no": 1~10, "assigned_date": "YYYY-MM-DD", "level": 1~6,
            "interest_id": (학습자의 세부 관심사 ID와 매칭, 없으면 0), "question_text", "choices", "correct_answer",
            "image_data", "sound_data", "question_phonemes", "blank_position", "blank_phoneme"
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

# correct_anser 100, blank_phoneme 50자로 제한