import re
import json
import datetime
from sqlalchemy import text
from app.src.tasks.question import get_latest_curriculum, create_day_problem
from app.src.utils.llm import llm_problem
from app.src.api.tts_api import generate_tts_and_upload
from app.src.api.gemini_api import generate_image_with_gemini_flash
from app.src.core.config import settings
from dotenv import load_dotenv
from app.src.utils.normalization import normalize_blank_position

load_dotenv()

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

def get_student_interests(session, student_id):
    result = session.execute(
        text("""
            SELECT si.small_interest_name
            FROM student_interest sti
            JOIN sub_interest si ON sti.interest_id = si.sub_interest_id
            WHERE sti.student_id = :student_id
        """),
        {"student_id": student_id}
    )
    return [row[0] for row in result.fetchall()]

def get_weak_phonemes_for_student(session, student_id, top_n=2):
    result = session.execute(
        text("""
            SELECT jamo
            FROM weekly_jamo_stat
            WHERE student_id = :student_id
            ORDER BY fail_count DESC
            LIMIT :limit
        """),
        {"student_id": student_id, "limit": top_n}
    )
    return [row[0] for row in result.fetchall()]


def get_weekdays_for_this_week():
    today = datetime.date.today()
    weekday = today.weekday()  # 월=0 ... 일=6
    days_to_sunday = (6 - weekday) if weekday != 6 else 0
    this_sunday = today + datetime.timedelta(days=days_to_sunday) if weekday != 6 else today
    days_kr = ['월요일', '화요일', '수요일', '목요일', '금요일']
    weekdays = []
    for i, day_kr in enumerate(days_kr):
        day_date = this_sunday + datetime.timedelta(days=i+1)
        weekdays.append((day_kr, day_date.strftime('%Y-%m-%d')))
    return weekdays

def extract_json_from_llm_response(llm_response):
    llm_response = llm_response.strip()
    
    # 1. ```json ... ``` 형태 추출 시도 (가장 흔함)
    # 그룹 1: JSON 블록 내부의 내용을 캡처
    match = re.search(r"```json\s*(.*?)\s*```", llm_response, re.DOTALL | re.IGNORECASE)
    if match:
        print("✅ JSON 마크다운 블록 추출 성공 (```json)")
        return match.group(1).strip()
    
    # 2. ``` ... ``` 형태 추출 시도
    match = re.search(r"```\s*(.*?)\s*```", llm_response, re.DOTALL)
    if match:
        print("✅ 일반 마크다운 블록 추출 성공 (```)")
        return match.group(1).strip()
    
    # 3. LLM이 바로 JSON 배열을 반환했을 경우 (fallback)
    # 가장 큰 JSON 배열 [...]을 찾아 추출 (추가적인 안정성 확보)
    match = re.search(r"(\[.*\])", llm_response.strip(), re.DOTALL)
    if match:
        print("✅ 원본에서 JSON 배열 추출 성공")
        return match.group(1).strip()

    print("⚠️ JSON 추출 실패, 원본 텍스트 반환")
    return llm_response.strip()

def clean_json_for_parsing(json_string):
    json_string = re.sub(r'//.*?(\r\n|\n)', r"\1", json_string)
    json_string = re.sub(r'/\*.*?\*/', '', json_string, flags=re.DOTALL)
    return json_string

def safe_parse_json(llm_response, day_name):
    json_string = extract_json_from_llm_response(llm_response)
    json_string = clean_json_for_parsing(json_string)
    if not json_string.strip():
        print(f"{day_name} LLM 응답이 비어 있어 건너뜀")
        return []
    try:
        problems = json.loads(json_string)
        # LLM이 파싱 가능한 빈 배열을 반환하는 경우도 실패로 간주
        if not problems:
            print(f"⚠️ {day_name} JSON 파싱은 성공했으나, 빈 배열이 반환됨.")
            return []
        return problems
        
    except Exception as e:
        # 💡 에러 발생 시 원본 응답의 일부만 출력하도록 수정
        print(f"❌ {day_name} LLM 응답이 올바른 JSON이 아님: {type(e).__name__} - {e}")
        print(f"--- 실패한 원본 응답 (앞 500자) ---")
        print(llm_response[:500])
        print("---------------------------------")
        return []

def get_interest_id_for_student(session, student_id):
    result = session.execute(
        text("""
        SELECT interest_id FROM student_interest WHERE student_id = :student_id LIMIT 1
        """),
        {"student_id": student_id}
    )
    row = result.first()
    return row[0] if row else 0

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


def generate_fallback_problems(adventure_type_id: int, problem_count: int) -> list:
    """
    OpenAI 실패 시 기본 문제 생성
    """
    fallback_data = {
        1: [  # 자모(음소) 맞추기
            {"problem_text": "사과", "blank_position": "MEDIAL", "blank_phoneme": "ㄱ", "choices": ["ㄱ", "ㄴ", "ㄷ"]},
            {"problem_text": "고양이", "blank_position": "INITIAL", "blank_phoneme": "ㄱ", "choices": ["ㄱ", "ㄴ", "ㄷ"]},
            {"problem_text": "토끼", "blank_position": "INITIAL", "blank_phoneme": "ㅌ", "choices": ["ㅌ", "ㄷ", "ㅈ"]},
        ],
        2: [  # 빈칸 맞추기
            {"problem_text": "사과", "image_url": "apple.jpg", "blank_position": "MEDIAL", "blank_phoneme": "ㅘ", "choices": ["ㅘ", "ㅏ", "ㅗ"]},
            {"problem_text": "나무", "image_url": "tree.jpg", "blank_position": "INITIAL", "blank_phoneme": "ㄴ", "choices": ["ㄴ", "ㄷ", "ㅁ"]},
            {"problem_text": "별", "image_url": "star.jpg", "blank_position": "FINAL", "blank_phoneme": "ㄹ", "choices": ["ㄹ", "ㅁ", "ㄴ"]},
        ],
        3: [  # 단어 맞추기
            {"problem_text": "사과", "image_url": "apple.jpg", "choices": ["사과", "수박", "포도"], "correct_answer": "사과"},
            {"problem_text": "바다", "image_url": "sea.jpg", "choices": ["바다", "산", "강"], "correct_answer": "바다"},
            {"problem_text": "하늘", "image_url": "sky.jpg", "choices": ["하늘", "땅", "구름"], "correct_answer": "하늘"},
        ],
        4: [  # 단어 읽기
            {"problem_text": "강아지"},
            {"problem_text": "고양이"},
            {"problem_text": "토끼"},
        ]
    }

    base_problems = fallback_data.get(adventure_type_id, fallback_data[1])
    result = []

    for i in range(problem_count):
        # 💡 .copy()를 사용하여 독립적인 딕셔너리 복사본을 추가
        result.append(base_problems[i % len(base_problems)].copy()) 

    return result


def split_korean_phonemes(text):
    phonemes_list = []
    for syllable in text:
        if not ('가' <= syllable <= '힣'):
            continue
        # 유니코드 계산
        code = ord(syllable) - 0xAC00
        cho = CHOSEONG_LIST[code // 588]
        jung = JUNGSEONG_LIST[(code % 588) // 28]
        jong = JONGSEONG_LIST[code % 28]
        phonemes_list.extend([cho, jung])
        if jong:
            phonemes_list.append(jong)
    return phonemes_list


def process_day_problem_items(session, student_id, llm_result):
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

    GEMINI_API_KEY = settings.GEMINI_API_KEY

    for item in llm_result:
        item["student_id"] = student_id if student_id is not None else 0
        correct_answer_text = item.get("correct_answer")
        adventure_type = item.get("adventure_type_id")

        item["image_url"] = ""
        item["sound_url"] = "problems/default_tts.mp3"

        img_data = item.get("image_data")
        snd_data = item.get("sound_data")

        generated_sound_path = ""
        blank_position = None
        problem_text = item.get("problem_text")
        item["problem_phonemes"] = split_korean_phonemes(problem_text)



        if adventure_type in [1, 2]:
            problem_text = item.get("problem_text", "")
            blank_jamo = item.get("blank_phoneme", "").strip()
            for syllable in problem_text:
                jt = get_jamo_type(syllable, blank_jamo)
                if jt:
                    blank_position = jt
                    break
        item["blank_position"] = blank_position  # Adventure 3, 4는 None으로 유지

        # if problem_text:
        #     try:
        #         generated_sound_path = generate_tts_and_upload(
        #             problem_text,
        #             student_id=student_id,
        #             key_prefix='problems/sound/'
        #         )
        #     except Exception as e:
        #         print(f"❌ TTS 생성 및 업로드 실패: {e}")
        #         generated_sound_path = ""
        #     if generated_sound_path:
        #         item["sound_url"] = generated_sound_path
        #         print(f"✅ TTS 생성 성공! sound_url: {generated_sound_path}")

        item["sound_url"] = "problems/default_tts.mp3"  # 또는 그냥 빈 문자열 "" 임시!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        if item.get("adventure_type_id") == 4:
            item["correct_answer"] = item.get("problem_text", "")
            if item.get("choices") is None or len(item.get("choices", [])) > 0:
                item["choices"] = []
            item["image_url"] = ""

        generated_image_path = ""

        # if adventure_type in [2, 3] and problem_text:
        #     print(f"✨ Gemini API 호출 시작: '{problem_text}'")
        #     if GEMINI_API_KEY:
        #         try:
        #             generated_image_path = generate_image_with_gemini_flash(problem_text, GEMINI_API_KEY)
        #         except Exception as e:
        #             error_msg = str(e).encode('ascii', errors='replace').decode('ascii')
        #             print(f"[IMAGE] Error occurred: {error_msg}")
        #             generated_image_path = ""
        #     else:
        #         print("❌ Gemini API Key가 없어 이미지 생성을 시도하지 않았습니다.")
        #         generated_image_path = ""

        #     if generated_image_path:
        #         item["image_url"] = generated_image_path
        #         print(f"✅ GMS 이미지 생성 성공! URL: {generated_image_path}")
        #     else:
        #         print(f"❌ Gemini 이미지 생성 실패! 기본 URL 사용.")
        #         item["image_url"] = ""

        item["image_url"] = ""  # 임시!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!








        if isinstance(item.get("choices"), str):
            item["choices"] = [x.strip() for x in item["choices"].split(',') if x.strip()]
        elif item.get("choices") is None:
            item["choices"] = []

        if isinstance(item.get("problem_phonemes"), str):
            item["problem_phonemes"] = [x.strip() for x in item["problem_phonemes"].split(',') if x.strip()]
        elif not isinstance(item.get("problem_phonemes"), list):
            item["problem_phonemes"] = []

        item["blank_position"] = normalize_blank_position(
            item.get("blank_position"),
            adventure_type_id=adventure_type
        )

        blank_phoneme_value = item.get("blank_phoneme")
        if blank_phoneme_value is not None:
            cleaned_phoneme = str(blank_phoneme_value).strip()
            if len(cleaned_phoneme) > 5:
                print(f"⚠️ blank_phoneme '{cleaned_phoneme}'의 길이가 5자를 초과하여 강제 절단됩니다.")
                item["blank_phoneme"] = cleaned_phoneme[:5]
            elif not cleaned_phoneme:
                item["blank_phoneme"] = ''
            else:
                item["blank_phoneme"] = cleaned_phoneme
        else:
            item["blank_phoneme"] = ''

        for key in ["image_data", "sound_data"]:
            item.pop(key, None)

        REQUIRED_KEYS = {
            "student_id", "adventure_type_id", "assigned_date", "seq_no", "level",
            "problem_text", "choices", "correct_answer",
            "image_url", "sound_url", "problem_phonemes",
            "blank_position", "blank_phoneme","interest_id",
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
        




def make_prompt(curriculum_for_day, small_interest_name, interest_id, day_name, assigned_date, student_id, student_level, curriculum_text, student_interests, student_weak_phonemes):
    type_count_lines = '\n'.join([
        f"- adventure_type_id={item['type_id']}: {item['count']}개 (순서대로)" for item in curriculum_for_day
    ])
    total_count = sum(item['count'] for item in curriculum_for_day)
    cnt_str = ', '.join([str(item['count']) for item in curriculum_for_day])

    interest_word_str = ', '.join(student_interests)
    weak_phoneme_str  = ', '.join(student_weak_phonemes)


    prompt = f"""
아래 커리큘럼과 학생 세부 관심사({small_interest_name}, sub_interest_id={interest_id})를 반영해
{day_name}({assigned_date})에 정확히 {total_count}개의 문제를 반드시 아래 순서와 규칙에 맞게 JSON 배열로만 반환합니다.


- 문제 텍스트(명사)는 반드시 학생 관심사({interest_word_str})와 관련된 명사만 사용
- 모든 문제 중 최소 70% 이상에서 약점 자모({weak_phoneme_str}) 반드시 포함!
- 나머지 문제도 해당 관심사 내에서 단어 선정, 제작 시 약점 자모 포함 우선
- choices에는 blank_phoneme(약점 자모)와 유사한 자모를 포함
- 관심사 명사 중 {weak_phoneme_str}가 포함된 단어 우선
- 10개 문제 중 동일 관심사 단어가 3번 이상 연속하지 않도록 만드시오.


== [생성 개수/순서] ==
{type_count_lines}
- 반환하는 배열은 adventure_type_id가 위 순서대로 각 {cnt_str}개 연속 배치되고
  seq_no는 1부터 {total_count}까지 순차 부여해야 합니다.seq_no는 중복이 안되게 1, 2, 3, 4, 5, 6, 7, 8, 9, 10으로 나타내야합니다. (ex: adventure_type_id=3이 5개면, 배열에서 3이 5개 연속 등장)


== [문제 구조 및 adventure_type별 규칙] ==
반드시 아래 key만 포함:
"adventure_type_id", "seq_no", "assigned_date", "level", "interest_id", "problem_text", "choices", "correct_answer", "image_url", "sound_url", "problem_phonemes", "blank_position", "blank_phoneme", "student_id"


각 key는 아래 규칙/값/예시에 정확히 맞추세요.


[1] adventure_type_id=1 (음소 찾기)
- problem_text: 한글 자음+모음 1음절 (ex: [translate:가], [translate:똥], [translate:퀴])
- problem_phonemes: ["[translate:ㄱ]", "[translate:ㅏ]"]
- blank_phoneme: problem_phonemes 중 하나
- correct_answer: blank_phoneme와 같음
- choices: blank_position에 해당되는 자모 중 하나를 선택해 그와 유사한, 실제 한글 자모 2가지를 함께 배치(순서 랜덤)
- blank_position: 반드시 "INITIAL", "MEDIAL", "FINAL" (대문자만)
- 기타 필드는 "" 또는 []


[2] adventure_type_id=2 (이미지+음소)
- problem_text: 학생 관심사 기반 그림 그릴 수 있는 구체 명사 (2글자 이상!) 예:[translate:코끼리]
- problem_phonemes: 해당 자모 배열
- blank_phoneme: problem_phonemes 중 하나
- correct_answer: blank_phoneme와 같음
- choices:  blank_position에 해당되는 자모 중 하나를 선택해 그와 유사한, 실제 한글 자모 2가지를 함께 배치(순서 랜덤)
- image_url: 연관 그림 경로 또는 ""
- blank_position: "INITIAL", "MEDIAL", "FINAL" (대문자만)


[3] adventure_type_id=3 (이미지+단어)
- problem_text: 구체 명사 (예: [translate:가방]) (명확한 이미지로 생성될 수 있는 명사)
- problem_phonemes: 해당 자모 배열
- blank_phoneme: null
- correct_answer: problem_text와 반드시 동일
- choices: ["[translate:가방]", "[translate:카방]", "[translate:카빵]"] 등 correct_answer 포함 단어 2가지만! (1글자/자모 절대 금지)(순서 랜덤)(problem_tet와 비슷한  무의미 단어 출제)
- blank_position: 필드 자체를 null로 (다른 값, 대소문자, 숫자 금지)
- image_url: 경로 또는 ""


[4] adventure_type_id=4 (음성판별)
- problem_text: 구체명사(두글자 이상 예: [translate:가방], [translate:코끼리])
- problem_phonemes: 해당 자모 배열
- blank_phoneme: null
- correct_answer: problem_text와 동일(반드시 포함)
- choices: [] (항상 빈 배열)
- blank_position: 필드 자체를 null로 (다른 값, 대소문자, 숫자 금지)
- image_url: ""
- sound_url: 경로/빈 문자열


[공통 필수]
- 모든 문제에 아래 항목 필수 포함: adventure_type_id, seq_no, assigned_date, level, interest_id, problem_text, choices, correct_answer, image_url, sound_url, problem_phonemes, blank_position, blank_phoneme, student_id (key 빠짐, 오타, 누락, 타입불일치, 자연어 주석 있으면 실패)
- assigned_date는 반드시 "{assigned_date}"  
- interest_id는 "{interest_id}", student_id는 "{student_id}", level은 학생 난이도 사용  
- seq_no는 1~{total_count}까지 순차 부여, 배열 내 위치와 일치
- 모든 타입의 adventure에서 correct_answer 반드시 포함


[예시]
[
  {{
    "adventure_type_id": 1,
    "seq_no": 1,
    "assigned_date": "{assigned_date}",
    "level": {student_level},
    "interest_id": {interest_id},
    "problem_text": "가",
    "problem_phonemes": ["ㄱ", "ㅏ"],
    "blank_phoneme": "ㄱ",
    "correct_answer": "ㄱ",
    "choices": ["ㄴ", "ㄱ", "ㄷ"],
    "blank_position": "INITIAL",
    "student_id": {student_id},
    "image_url": "",
    "sound_url": "problems/sound/{assigned_date}_xxxxxx.mp3"
  }},
{{
    "adventure_type_id": 2,
    "seq_no": 2,
    "assigned_date": "{assigned_date}",
    "level": 2,
    "interest_id": {interest_id},
    "problem_text": "축구공",
    "problem_phonemes": ["ㅊ", "ㅜ", "ㄱ", "ㄱ", "ㅜ", "ㄱ", "ㅗ", "ㅇ"],
    "blank_phoneme": "ㄱ",
    "correct_answer": "ㄱ",
    "choices": ["ㅇ", "ㅁ", "ㄱ"], (반드시 자모만 포함)
    "blank_position": "INITIAL",
    "student_id": {student_id},
    "image_url": "problems/image/축구공.jpg",
    "sound_url": "problems/sound/{assigned_date}_yyyyy.mp3"
    }}

  {{
    "adventure_type_id": 3,
    "seq_no": 6,
    "assigned_date": "{assigned_date}",
    "level": {student_level},
    "interest_id": {interest_id},
    "problem_text": "코끼리",
    "problem_phonemes": ["ㅋ", "ㅗ", "ㄲ", "ㅣ", "ㄹ", "ㅣ"],
    "blank_phoneme": null,
    "correct_answer": "코끼리",
    "choices": ["고끼리", "코끼리", "포기리"], (correct_answer 반드시 포함,나머지 두 단어는 무의미단어로)
    "blank_position": null, (반드시 null 값)
    "student_id": {student_id},
    "image_url": "problems/image/코끼리.jpg",
    "sound_url": ""
  }},
    {{
    "adventure_type_id": 4,
    "seq_no": 4,
    "assigned_date": "{assigned_date}",
    "level": 3,
    "interest_id": {interest_id},
    "problem_text": "드래곤",(adventure_type_id=4 의 경우, 반드시 2자 이상 구체명사)
    "problem_phonemes": ["ㄷ", "ㅡ", "ㄹ", "ㅐ", "ㄱ", "ㅗ", "ㄴ"],
    "blank_phoneme": "",
    "correct_answer": "드래곤", (반드시 포함)
    "choices": [],
    "blank_position": null, (반드시 null 값)
    "student_id": {student_id},
    "image_url": "",
    "sound_url": "problems/sound/{assigned_date}_wwwww.mp3"
    }}

]
(…실제 출제에선 타입/개수/seq_no 순서/값이 가변적으로 연속 정렬되어야 함)


== [마지막] ==
- 반드시 위 구조와 규칙만 지켜, key 누락/오타/불필요 필드 없이 오로지 이 포맷의 문제 배열만 반환!
- 실제 사용하는 한글 자모 ㄱ,ㄴ,ㄷ,ㄹ,ㅁ,ㅂ,ㅅ,ㅇ,ㅈ,ㅊ,ㅋ,ㅌ,ㅍ,ㅎ,ㄲ,ㄸ,ㅃ,ㅆ,ㅉ,ㄳ,ㄵ,ㄶ,ㄺ,ㄻ,ㄼ,ㄽ,ㄾ,ㄿ,ㅀ,ㅄ,ㅏ,ㅐ,ㅑ,ㅓ,ㅔ,ㅕ,ㅖ,ㅗ,ㅘ,ㅙ,ㅚ,ㅛ,ㅜ,ㅝ,ㅞ,ㅟ,ㅠ,ㅡ,ㅢ,ㅣ,ㅒ

"""
    return prompt

def generate_problems_for_one_week(session, student_id):
    report = session.execute(
        text("""
             SELECT curriculum, curriculum_structure
             FROM weekly_personal_report
             WHERE student_id=:student_id
             ORDER BY created_at DESC LIMIT 1
         """), {"student_id": student_id}
    ).fetchone()

    # 1. 초기 조건 실패 시 딕셔너리 반환
    if not report or not report[1]:
        print("커리큘럼 구조 없음")
        # main_api.py에서 처리 가능한 형태로 반환
        return {"error": "학생의 최신 커리큘럼 구조를 찾을 수 없습니다."} 

    curriculum_text = report[0]
    curriculum_structure = report[1]

    interest_id = get_interest_id_for_student(session, student_id)
    small_interest_name = get_small_interest_name_for_student(session, student_id)
    student_interests = get_student_interests(session, student_id)
    student_weak_phonemes = get_weak_phonemes_for_student(session, student_id)
    DAYS = get_weekdays_for_this_week()
    day_map = {"월요일": "monday", "화요일": "tuesday", "수요일": "wednesday", "목요일": "thursday", "금요일": "friday"}



    all_generated_problems_metadata = [] # 💡 최종 반환할 문제를 담을 리스트


    for day_name, assigned_date in DAYS:
        day_key = day_map.get(day_name, day_name.lower())
        curriculum_for_day = curriculum_structure.get(day_key, [])
        if not curriculum_for_day:
            print(f"{day_name} 계획 없음, 건너뜀!")
            continue



        prompt = make_prompt(
            curriculum_for_day=curriculum_for_day,
            small_interest_name=small_interest_name,
            interest_id=interest_id,
            day_name=day_name,
            assigned_date=assigned_date,
            student_id=student_id,
            student_level=1,  # 실제 레벨 조회 시 적용
            curriculum_text=curriculum_text,
            student_interests=student_interests,
            student_weak_phonemes=student_weak_phonemes

        )
        llm_response = llm_problem(prompt)
        problems_to_process = safe_parse_json(llm_response, day_name) # LLM 결과
        
        # 2. LLM 실패 시 폴백으로 대체
        if not problems_to_process:
            total_count = sum(item['count'] for item in curriculum_for_day)
            first_type = curriculum_for_day[0]['type_id'] if curriculum_for_day else 1
            
            # 폴백 문제를 생성
            problems_to_process = generate_fallback_problems(first_type, total_count)
            
            if not problems_to_process:
                print(f"==== {day_name} 폴백 생성도 실패 (건너뜀) ===")
                continue
            
            print(f"==== {day_name} LLM 실패, 폴백 문제 {len(problems_to_process)}개 생성 ====")

        # 3. DB 저장 및 메타데이터 집계
        # process_day_problem_items가 DB 저장까지 완료
        process_day_problem_items(session, student_id, problems_to_process)
        
        # 생성된 문제 메타데이터를 최종 반환 리스트에 추가 (seq_no를 1부터 다시 계산)
        for idx, item in enumerate(problems_to_process):
             all_generated_problems_metadata.append({
                "date": assigned_date,
                "seq_no": idx + 1,
                "adventure_type": item.get('adventure_type_id'),
                "problem": item.get('problem_text')
            })

    # 4. 최종 집계 결과 반환
    return {
        "generated_count": len(all_generated_problems_metadata),
        "week_dates": [day[1] for day in DAYS], 
        "problems": all_generated_problems_metadata
    }


def generate_problems_from_signup(session, student_id, signup_date=None):
    """
    신규 가입 학생: 가입 요일부터 해당 주 금요일까지(평일만) 문제 생성
    """
    import datetime

    if signup_date is None:
        signup_date = datetime.date.today()
    elif isinstance(signup_date, datetime.datetime):
        signup_date = signup_date.date()

    weekday = signup_date.weekday()  # 0=월 ... 6=일

    # 주말 가입 시: 다음주 월요일부터
    if weekday >= 5:  # 토/일
        days_until_monday = 7 - weekday
        start_date = signup_date + datetime.timedelta(days=days_until_monday)
    else:
        start_date = signup_date

    # 해당 주 금요일 계산
    days_until_friday = 4 - start_date.weekday()
    end_date = start_date + datetime.timedelta(days=days_until_friday)
    # end_date가 이미 다음주면 이번주 금요일까지만
    if (end_date - start_date).days < 0:
        end_date = start_date

    all_generated_problems_metadata = []

    student_interests = get_student_interests(session, student_id)
    student_weak_phonemes = get_weak_phonemes_for_student(session, student_id)

    # 요일별 루프: start_date ~ end_date
    current = start_date
    while current <= end_date:
        if current.weekday() < 5:  # 평일만
            assigned_date = current.strftime('%Y-%m-%d')
            # 문제 생성 원리: 기존과 거의 동일, 단 DAYS 대신 단일 날짜 할당
            # curriculum_structure, interest_id 등 로딩 방식은 기존 함수와 같게!
            # ...
            # 1. 커리큘럼 등 준비
            report = session.execute(
                text("""
                    SELECT curriculum, curriculum_structure
                    FROM weekly_personal_report
                    WHERE student_id=:student_id
                    ORDER BY created_at DESC LIMIT 1
                """), {"student_id": student_id}
            ).fetchone()
            if not report or not report[1]:
                continue
            curriculum_text = report[0]
            curriculum_structure = report[1]
            interest_id = get_interest_id_for_student(session, student_id)
            small_interest_name = get_small_interest_name_for_student(session, student_id)
            # 날짜별 요일 키 생성
            day_map = {0: "monday", 1: "tuesday", 2: "wednesday", 3: "thursday", 4: "friday"}
            day_key = day_map.get(current.weekday(), "monday")
            curriculum_for_day = curriculum_structure.get(day_key, [])
            if not curriculum_for_day:
                continue
            prompt = make_prompt(
                curriculum_for_day=curriculum_for_day,
                small_interest_name=small_interest_name,
                interest_id=interest_id,
                day_name="",  # 필요 시: ['월요일','화요일',...][current.weekday()]
                assigned_date=assigned_date,
                student_id=student_id,
                student_level=1,  # 실제 레벨 적용
                curriculum_text=curriculum_text,
                student_interests=student_interests,         # ← 추가!
                student_weak_phonemes=student_weak_phonemes  # ← 추가!

            )
            llm_response = llm_problem(prompt)
            problems_to_process = safe_parse_json(llm_response, assigned_date)
            if not problems_to_process:
                total_count = sum(item['count'] for item in curriculum_for_day)
                first_type = curriculum_for_day[0]['type_id'] if curriculum_for_day else 1
                problems_to_process = generate_fallback_problems(first_type, total_count)
                if not problems_to_process:
                    continue
            process_day_problem_items(session, student_id, problems_to_process)
            # 메타데이터 집계
            for idx, item in enumerate(problems_to_process):
                all_generated_problems_metadata.append({
                    "date": assigned_date,
                    "seq_no": idx + 1,
                    "adventure_type": item.get('adventure_type_id'),
                    "problem": item.get('problem_text')
                })
        current += datetime.timedelta(days=1)

    return {
        "generated_count": len(all_generated_problems_metadata),
        "week_dates": [start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')],
        "problems": all_generated_problems_metadata
    }
