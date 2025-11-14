#app/src/app.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.src.api.main_api import router as main_router
from app.src.api.stt_api import router as stt_router
from app.src.core.config import settings
# 다른 router가 더 있다면 계속 import 추가!

app = FastAPI(
    title="Captain Echo AI Service",
    description="STT 발음 평가 및 AI 학습 지원 서비스",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록
app.include_router(main_router)
app.include_router(stt_router, prefix="/api")
# 다른 router 추가시: app.include_router(another_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        timeout_keep_alive=300  # 300초 타임아웃
    )
