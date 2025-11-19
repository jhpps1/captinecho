"""
음성-텍스트 변환 서비스
======================
OpenAI Whisper API를 활용한 음성-텍스트 변환 전용 모듈
초기진단과 탐험 모두에서 재사용 가능
"""

import os
from openai import AsyncOpenAI

from ..core.config import settings


class TranscriptionService:
    """음성-텍스트 변환 전용 서비스"""

    def __init__(self):
        """OpenAI 비동기 클라이언트 초기화 (Whisper 전용 API Key 사용)"""
        # Whisper API는 실제 OpenAI 엔드포인트를 사용 (GMS 우회)
        api_key = settings.OPENAI_WHISPER_API_KEY
        base_url = "https://api.openai.com/v1"

        # 디버깅: API Key와 Base URL 확인
        print(f"[Transcription Service] Whisper API Key: {api_key[:20]}..." if api_key else "[Transcription Service] API Key is None")
        print(f"[Transcription Service] Base URL: {base_url}")

        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url  # 실제 OpenAI API 엔드포인트 명시
        )

    async def transcribe_audio(self, audio_file_path: str, language: str = "ko") -> str:
        """
        OpenAI Whisper API를 사용하여 음성을 텍스트로 변환

        Args:
            audio_file_path: 오디오 파일 경로 (WebM, MP3, WAV 등 지원)
            language: 언어 코드 (기본값: ko - 한국어)

        Returns:
            변환된 텍스트

        Raises:
            FileNotFoundError: 오디오 파일을 찾을 수 없는 경우
            Exception: API 호출 실패 시
        """
        try:
            # 파일 존재 여부 확인
            if not os.path.exists(audio_file_path):
                raise FileNotFoundError(f"오디오 파일을 찾을 수 없습니다: {audio_file_path}")

            # 파일 크기 확인 (OpenAI API는 25MB 제한)
            file_size = os.path.getsize(audio_file_path)
            max_size = 25 * 1024 * 1024  # 25MB
            if file_size > max_size:
                raise ValueError(f"파일 크기가 너무 큽니다: {file_size / 1024 / 1024:.2f}MB (최대 25MB)")

            # 비동기로 Whisper API 호출
            with open(audio_file_path, "rb") as audio_file:
                transcript = await self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    language=language,
                    response_format="text"
                )

            # response_format="text"일 때는 문자열이 직접 반환됨
            result = transcript.strip() if isinstance(transcript, str) else str(transcript).strip()

            # 🔍 디버깅: Whisper API 응답 로그
            print(f"[Transcription] Whisper 인식 결과: '{result}' (길이: {len(result)})")

            if not result:
                raise ValueError("음성 인식 결과가 비어있습니다. 오디오 파일을 확인해주세요.")

            return result

        except FileNotFoundError as e:
            raise FileNotFoundError(f"파일 오류: {str(e)}")
        except ValueError as e:
            raise ValueError(f"입력 오류: {str(e)}")
        except Exception as e:
            raise Exception(f"Whisper API 호출 실패: {str(e)}")


# 싱글톤 인스턴스
transcription_service = TranscriptionService()
