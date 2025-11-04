from fastapi import FastAPI
from app.src.api.main_api import router as main_router
# 다른 router가 더 있다면 계속 import 추가!

app = FastAPI()

app.include_router(main_router)
# 다른 router 추가시: app.include_router(another_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", reload=True)
