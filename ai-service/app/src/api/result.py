# # src/api/result.py

# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session
# from app.src.core.database import get_db
# from app.src.core.models import WeeklyPersonalReport

# router = APIRouter()

# @router.post("/save-result")
# def save_analysis_result(
#     student_id: int,
#     result_json: dict,
#     db: Session = Depends(get_db)
# ):
#     history = WeeklyPersonalReport(
#         student_id=student_id,
#         final_consensus=result_json
#     )
#     db.add(history)
#     db.commit()
#     db.refresh(history)
#     return {"status": "saved", "history_id": history.id}
