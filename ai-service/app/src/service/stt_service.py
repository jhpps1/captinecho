"""
STT 발음 평가 서비스
===================
OpenAI Whisper API를 활용한 음성-텍스트 변환 및 발음 평가
"""

from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session

from ..core.models import ErrorPattern, JamoStat, LearningSession, DayProblem
from ..utils.hangul import decompose_word, decompose_char, is_hangul
from .transcription_service import transcription_service


class STTService:
    """STT 기반 발음 평가 서비스"""

    def __init__(self):
        """STT 서비스 초기화 (음성 변환은 TranscriptionService 사용)"""
        self.transcription_service = transcription_service

    def compare_phonemes(
        self,
        correct_text: str,
        user_text: str
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, str]]]:
        """
        정답 텍스트와 사용자 발음을 음소별로 비교

        Args:
            correct_text: 정답 텍스트
            user_text: 사용자가 발음한 텍스트 (Whisper 결과)

        Returns:
            (phoneme_comparison, error_patterns) 튜플
            - phoneme_comparison: 음소별 비교 결과 리스트
            - error_patterns: 오류 패턴 리스트
        """
        # 공백 제거 및 소문자 변환
        correct_text = correct_text.strip()
        user_text = user_text.strip()

        # 음소 분해
        correct_phonemes = decompose_word(correct_text)
        user_phonemes = decompose_word(user_text)

        phoneme_comparison = []
        error_patterns = []

        # 각 글자별로 비교
        max_chars = max(len(correct_phonemes), len(user_phonemes))

        for char_idx in range(max_chars):
            correct_char_phonemes = correct_phonemes[char_idx] if char_idx < len(correct_phonemes) else []
            user_char_phonemes = user_phonemes[char_idx] if char_idx < len(user_phonemes) else []

            # 각 음소 위치별로 비교 (INITIAL, MEDIAL, FINAL)
            phoneme_types = ["INITIAL", "MEDIAL", "FINAL"]
            max_phonemes = max(len(correct_char_phonemes), len(user_char_phonemes))

            for phoneme_idx in range(max_phonemes):
                correct_jamo = correct_char_phonemes[phoneme_idx] if phoneme_idx < len(correct_char_phonemes) else ""
                user_jamo = user_char_phonemes[phoneme_idx] if phoneme_idx < len(user_char_phonemes) else ""
                phoneme_type = phoneme_types[phoneme_idx] if phoneme_idx < len(phoneme_types) else "UNKNOWN"

                is_correct = correct_jamo == user_jamo

                comparison_entry = {
                    "char_position": char_idx,
                    "phoneme_position": phoneme_type,
                    "correct_jamo": correct_jamo,
                    "user_jamo": user_jamo,
                    "is_correct": is_correct
                }
                phoneme_comparison.append(comparison_entry)

                # 오류 패턴 기록 (틀린 경우만)
                if not is_correct and correct_jamo and user_jamo:
                    error_patterns.append({
                        "real_jamo": correct_jamo,
                        "confusion_jamo": user_jamo,
                        "phoneme_position": phoneme_type
                    })

        return phoneme_comparison, error_patterns

    def calculate_accuracy(self, phoneme_comparison: List[Dict[str, Any]]) -> float:
        """
        음소별 비교 결과를 바탕으로 정확도 계산

        Args:
            phoneme_comparison: compare_phonemes()에서 반환된 비교 결과

        Returns:
            정확도 (0.0 ~ 100.0)
        """
        if not phoneme_comparison:
            return 0.0

        correct_count = sum(1 for item in phoneme_comparison if item["is_correct"])
        total_count = len(phoneme_comparison)

        accuracy = (correct_count / total_count) * 100.0
        return round(accuracy, 2)

    async def record_error_patterns(
        self,
        db: Session,
        session_id: int,
        error_patterns: List[Dict[str, str]]
    ) -> None:
        """
        오류 패턴을 ERROR_PATTERN 테이블에 기록

        Args:
            db: 데이터베이스 세션
            session_id: 학습 세션 ID
            error_patterns: 오류 패턴 리스트
        """
        try:
            for pattern in error_patterns:
                error_record = ErrorPattern(
                    session_id=session_id,
                    real_jamo=pattern["real_jamo"],
                    confusion_jamo=pattern["confusion_jamo"],
                    phoneme_position=pattern["phoneme_position"],
                    created_at=datetime.now()
                )
                db.add(error_record)

            db.commit()
        except Exception as e:
            db.rollback()
            raise Exception(f"오류 패턴 기록 실패: {str(e)}")

    async def update_jamo_statistics(
        self,
        db: Session,
        student_id: int,
        phoneme_comparison: List[Dict[str, Any]]
    ) -> None:
        """
        JAMO_STAT 테이블의 음소별 통계 업데이트

        Args:
            db: 데이터베이스 세션
            student_id: 학생 ID
            phoneme_comparison: 음소별 비교 결과
        """
        try:
            # 각 음소별로 통계 집계
            jamo_stats: Dict[str, Dict[str, int]] = {}

            for item in phoneme_comparison:
                jamo = item["correct_jamo"]
                if not jamo:
                    continue

                if jamo not in jamo_stats:
                    jamo_stats[jamo] = {"attempts": 0, "fails": 0}

                jamo_stats[jamo]["attempts"] += 1
                if not item["is_correct"]:
                    jamo_stats[jamo]["fails"] += 1

            # DB 업데이트
            for jamo, stats in jamo_stats.items():
                # 기존 통계 조회
                existing_stat = db.query(JamoStat).filter(
                    JamoStat.student_id == student_id,
                    JamoStat.jamo == jamo
                ).first()

                if existing_stat:
                    # 기존 통계 업데이트
                    existing_stat.total_attempts += stats["attempts"]
                    existing_stat.fail_count += stats["fails"]

                    # 정확도 재계산
                    existing_stat.weekly_accuracy_rate = (
                        (existing_stat.total_attempts - existing_stat.fail_count)
                        / existing_stat.total_attempts * 100.0
                    )
                    existing_stat.weekly_fail_rate = (
                        existing_stat.fail_count / existing_stat.total_attempts * 100.0
                    )
                    existing_stat.updated_at = datetime.now()
                else:
                    # 새 통계 생성
                    accuracy = (stats["attempts"] - stats["fails"]) / stats["attempts"] * 100.0
                    fail_rate = stats["fails"] / stats["attempts"] * 100.0

                    new_stat = JamoStat(
                        student_id=student_id,
                        jamo=jamo,
                        total_attempts=stats["attempts"],
                        fail_count=stats["fails"],
                        weekly_accuracy_rate=accuracy,
                        weekly_fail_rate=fail_rate,
                        created_at=datetime.now(),
                        updated_at=datetime.now()
                    )
                    db.add(new_stat)

            db.commit()
        except Exception as e:
            db.rollback()
            raise Exception(f"자모 통계 업데이트 실패: {str(e)}")

    async def evaluate_pronunciation(
        self,
        db: Session,
        audio_file_path: str,
        problem_id: int,
        student_id: int,
        session_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        발음 평가 전체 프로세스 실행

        Args:
            db: 데이터베이스 세션
            audio_file_path: 녹음된 오디오 파일 경로
            problem_id: 문제 ID (DAY_PROBLEM 테이블)
            student_id: 학생 ID
            session_id: 학습 세션 ID (선택적)

        Returns:
            평가 결과 딕셔너리
        """
        # 1. 정답 조회
        problem = db.query(DayProblem).filter(DayProblem.day_problem_id == problem_id).first()
        if not problem:
            raise ValueError(f"문제를 찾을 수 없습니다: problem_id={problem_id}")

        correct_text = problem.problem_text

        # 2. 음성을 텍스트로 변환 (Whisper API via TranscriptionService)
        user_text = await self.transcription_service.transcribe_audio(audio_file_path, language="ko")

        # 3. 음소 비교
        phoneme_comparison, error_patterns = self.compare_phonemes(correct_text, user_text)

        # 4. 정확도 계산
        accuracy = self.calculate_accuracy(phoneme_comparison)

        # 5. 오류 패턴 기록 (session_id가 있는 경우만)
        if session_id:
            await self.record_error_patterns(db, session_id, error_patterns)

        # 6. 자모 통계 업데이트
        await self.update_jamo_statistics(db, student_id, phoneme_comparison)

        # 7. 결과 반환
        return {
            "student_id": student_id,
            "problem_id": problem_id,
            "correct_text": correct_text,
            "user_text": user_text,
            "accuracy": accuracy,
            "phoneme_comparison": phoneme_comparison,
            "error_patterns": error_patterns,
            "total_phonemes": len(phoneme_comparison),
            "correct_phonemes": sum(1 for p in phoneme_comparison if p["is_correct"]),
            "timestamp": datetime.now().isoformat()
        }


# 싱글톤 인스턴스
stt_service = STTService()
