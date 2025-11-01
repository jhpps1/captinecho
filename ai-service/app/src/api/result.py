# app/api/result.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.models import ConversationHistory

router = APIRouter()

@router.post("/save-result")
def save_analysis_result(
    student_id: int,
    result_json: dict,
    db: Session = Depends(get_db)
):
    history = ConversationHistory(
        student_id=student_id,
        final_consensus=result_json
    )
    db.add(history)
    db.commit()
    db.refresh(history)
    return {"status": "saved", "history_id": history.id}
