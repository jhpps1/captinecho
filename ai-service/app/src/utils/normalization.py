"""
정규화 유틸리티 함수
LLM 출력 데이터의 일관성을 보장하기 위한 변환 함수들
"""

from typing import Optional, Union


def normalize_blank_position(value: Union[str, int, None], adventure_type_id: Optional[int] = None) -> Optional[str]:
    """
    blank_position 값을 정규화합니다.

    LLM이 가끔 소문자("initial", "medial", "final")나 숫자(1, 2, 3)로 생성하는 문제를 해결합니다.
    백엔드 DB Enum은 대문자 문자열("INITIAL", "MEDIAL", "FINAL")만 허용합니다.

    Args:
        value: LLM이 생성한 blank_position 값 (str, int, None)
        adventure_type_id: 탐험 타입 ID (1, 2일 때만 blank_position 필요)

    Returns:
        - "INITIAL", "MEDIAL", "FINAL" (탐험1, 2)
        - None (탐험3, 4 또는 유효하지 않은 값)

    Examples:
        >>> normalize_blank_position("initial")
        "INITIAL"
        >>> normalize_blank_position("MEDIAL")
        "MEDIAL"
        >>> normalize_blank_position(1)
        "INITIAL"
        >>> normalize_blank_position(0)
        None
        >>> normalize_blank_position("invalid")
        None
        >>> normalize_blank_position("MEDIAL", adventure_type_id=3)
        None
    """

    # 탐험3, 4는 blank_position이 불필요
    if adventure_type_id in [3, 4]:
        return None

    # None이면 그대로 반환
    if value is None:
        return None

    # 문자열인 경우
    if isinstance(value, str):
        value_upper = value.strip().upper()

        # 유효한 값만 반환 (INITIAL, MEDIAL, FINAL)
        if value_upper in ["INITIAL", "MEDIAL", "FINAL"]:
            return value_upper
        else:
            # 유효하지 않은 문자열은 None
            return None

    # 숫자인 경우 (일부 LLM이 숫자로 생성하는 경우)
    if isinstance(value, int):
        mapping = {
            0: None,
            1: "INITIAL",
            2: "MEDIAL",
            3: "FINAL"
        }
        return mapping.get(value, None)

    # 그 외 타입은 None
    return None


def normalize_problem_data(problem: dict, adventure_type_id: int) -> dict:
    """
    문제 데이터 전체를 정규화합니다.

    Args:
        problem: LLM이 생성한 문제 데이터
        adventure_type_id: 탐험 타입 ID (1, 2, 3, 4)

    Returns:
        정규화된 문제 데이터

    Example:
        >>> problem = {
        ...     "problem_text": "사과",
        ...     "blank_position": "initial",
        ...     "blank_phoneme": "ㄱ",
        ...     "choices": ["ㄱ", "ㄴ", "ㄷ"]
        ... }
        >>> normalize_problem_data(problem, 1)
        {
            "problem_text": "사과",
            "blank_position": "INITIAL",
            "blank_phoneme": "ㄱ",
            "choices": ["ㄱ", "ㄴ", "ㄷ"]
        }
    """

    # blank_position 정규화
    if "blank_position" in problem:
        problem["blank_position"] = normalize_blank_position(
            problem["blank_position"],
            adventure_type_id
        )

    # 탐험3, 4는 blank_position, blank_phoneme, choices가 불필요
    if adventure_type_id in [3, 4]:
        problem["blank_position"] = None
        problem["blank_phoneme"] = None
        problem["choices"] = None

    return problem


def normalize_problems_batch(problems: list, adventure_type_id: int) -> list:
    """
    여러 문제를 일괄 정규화합니다.

    Args:
        problems: 문제 목록
        adventure_type_id: 탐험 타입 ID

    Returns:
        정규화된 문제 목록
    """
    return [normalize_problem_data(p, adventure_type_id) for p in problems]
