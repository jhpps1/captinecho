# app/src/utils/hangul.py
"""
한글 자모 분리/조합 유틸리티
"""

# 한글 유니코드 범위: AC00(가) ~ D7A3(힣)
HANGUL_START = 0xAC00
HANGUL_END = 0xD7A3

# 초성, 중성, 종성 리스트
CHOSUNG_LIST = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
JUNGSUNG_LIST = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ']
JONGSUNG_LIST = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']


def is_hangul(char: str) -> bool:
    """한글 음절인지 확인"""
    if len(char) != 1:
        return False
    code = ord(char)
    return HANGUL_START <= code <= HANGUL_END


def decompose_char(char: str) -> list[str]:
    """
    한 글자를 자모로 분리

    Args:
        char: 한글 음절 (예: '가', '강')

    Returns:
        자모 리스트 (예: ['ㄱ', 'ㅏ'], ['ㄱ', 'ㅏ', 'ㅇ'])
    """
    if not is_hangul(char):
        # 한글이 아니면 그대로 반환
        return [char]

    code = ord(char) - HANGUL_START

    chosung_idx = code // (21 * 28)
    jungsung_idx = (code % (21 * 28)) // 28
    jongsung_idx = code % 28

    result = [
        CHOSUNG_LIST[chosung_idx],
        JUNGSUNG_LIST[jungsung_idx]
    ]

    # 종성이 있으면 추가
    if jongsung_idx > 0:
        result.append(JONGSUNG_LIST[jongsung_idx])

    return result


def decompose_word(word: str) -> list[list[str]]:
    """
    단어를 음절별 자모로 분리

    Args:
        word: 한글 단어 (예: '장미', '강아지')

    Returns:
        음절별 자모 배열 (예: [['ㅈ','ㅏ','ㅇ'], ['ㅁ','ㅣ']])
    """
    result = []
    for char in word:
        if char.strip():  # 공백 제외
            phonemes = decompose_char(char)
            result.append(phonemes)
    return result


def compose_char(chosung: str, jungsung: str, jongsung: str = '') -> str:
    """
    자모를 조합하여 한 글자 생성

    Args:
        chosung: 초성
        jungsung: 중성
        jongsung: 종성 (선택)

    Returns:
        조합된 한글 음절
    """
    try:
        chosung_idx = CHOSUNG_LIST.index(chosung)
        jungsung_idx = JUNGSUNG_LIST.index(jungsung)
        jongsung_idx = JONGSUNG_LIST.index(jongsung) if jongsung else 0

        code = HANGUL_START + (chosung_idx * 21 * 28) + (jungsung_idx * 28) + jongsung_idx
        return chr(code)
    except ValueError:
        return ''


if __name__ == "__main__":
    # 테스트
    print("=== 한글 자모 분리 테스트 ===")

    test_words = ['장미', '강아지', '꽃', '바다', '고구마']

    for word in test_words:
        phonemes = decompose_word(word)
        print(f"{word} → {phonemes}")

    print("\n=== 한글 자모 조합 테스트 ===")
    print(f"ㄱ + ㅏ = {compose_char('ㄱ', 'ㅏ')}")
    print(f"ㄱ + ㅏ + ㅇ = {compose_char('ㄱ', 'ㅏ', 'ㅇ')}")
