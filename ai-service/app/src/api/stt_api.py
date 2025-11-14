"""
STT 발음 평가 API
================
음성 녹음 파일을 받아 발음을 평가하는 FastAPI 라우터
"""

import os
import tempfile
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..core.database import get_db
from ..service.stt_service import stt_service


# FastAPI 라우터 생성
router = APIRouter(prefix="/stt", tags=["STT"])


# ===== Pydantic 모델 =====

class PronunciationEvaluationResponse(BaseModel):
    """발음 평가 결과 응답 모델"""
    student_id: int
    problem_id: int
    correct_text: str
    user_text: str
    accuracy: float
    phoneme_comparison: list
    error_patterns: list
    total_phonemes: int
    correct_phonemes: int
    timestamp: str

    class Config:
        from_attributes = True  # Pydantic V2


# ===== API 엔드포인트 =====

@router.post(
    "/evaluate-pronunciation",
    response_model=PronunciationEvaluationResponse,
    status_code=status.HTTP_200_OK,
    summary="발음 평가",
    description="WebM 오디오 파일을 받아 Whisper API로 STT를 수행하고 음소별 발음 평가 수행"
)
async def evaluate_pronunciation(
    audio_file: UploadFile = File(..., description="녹음된 오디오 파일 (WebM, MP3, WAV 등)"),
    problem_id: int = Form(..., description="문제 ID (DAY_PROBLEM 테이블)"),
    student_id: int = Form(..., description="학생 ID"),
    session_id: Optional[int] = Form(None, description="학습 세션 ID (선택)"),
    db: Session = Depends(get_db)
):
    """
    발음 평가 엔드포인트

    **프로세스:**
    1. WebM 오디오 파일 수신
    2. Whisper API로 음성을 텍스트로 변환
    3. DB에서 정답 조회
    4. 음소별 비교 및 정확도 계산
    5. ERROR_PATTERN 및 JAMO_STAT 업데이트
    6. 결과 반환

    **Parameters:**
    - `audio_file`: 녹음된 오디오 파일 (WebM, MP3, WAV 등)
    - `problem_id`: 문제 ID
    - `student_id`: 학생 ID
    - `session_id`: 학습 세션 ID (선택)

    **Returns:**
    - 발음 평가 결과 (정확도, 음소별 비교, 오류 패턴 등)
    """
    # 임시 파일 경로
    temp_audio_path = None

    try:
        # 1. 파일 확장자 확인
        if not audio_file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="파일 이름이 없습니다."
            )

        file_extension = Path(audio_file.filename).suffix.lower()
        allowed_extensions = [".webm", ".mp3", ".wav", ".m4a", ".ogg"]

        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"지원하지 않는 파일 형식입니다. 허용: {', '.join(allowed_extensions)}"
            )

        # 2. 임시 파일로 저장
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=file_extension,
            dir=tempfile.gettempdir()
        ) as temp_file:
            # 오디오 파일 내용을 임시 파일에 저장
            content = await audio_file.read()
            temp_file.write(content)
            temp_audio_path = temp_file.name

        # 3. STT 서비스 호출하여 발음 평가
        evaluation_result = await stt_service.evaluate_pronunciation(
            db=db,
            audio_file_path=temp_audio_path,
            problem_id=problem_id,
            student_id=student_id,
            session_id=session_id
        )

        # 4. 결과 반환
        return PronunciationEvaluationResponse(**evaluation_result)

    except ValueError as e:
        # 비즈니스 로직 오류 (예: 문제를 찾을 수 없음)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        # 기타 오류
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"발음 평가 중 오류 발생: {str(e)}"
        )
    finally:
        # 5. 임시 파일 삭제
        if temp_audio_path and os.path.exists(temp_audio_path):
            try:
                os.remove(temp_audio_path)
            except Exception as e:
                print(f"임시 파일 삭제 실패: {temp_audio_path}, 오류: {e}")


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="STT 서비스 헬스체크"
)
async def health_check():
    """STT 서비스 상태 확인"""
    return {
        "status": "healthy",
        "service": "STT Pronunciation Evaluation",
        "whisper_model": "whisper-1"
    }
