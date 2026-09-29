from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.transformation import Transformation
from app.schemas.wire import HistoryItemWire

router = APIRouter(prefix="/api", tags=["History"])

@router.get("/history", response_model=List[HistoryItemWire])
def get_transformation_history(db: Session = Depends(get_db)):
    transformations = db.query(Transformation).order_by(Transformation.created_at.desc()).limit(50).all()

    result = []
    for t in transformations:
        output_keys = [d.output_key for d in t.deliverables]
        created_at_str = t.created_at.isoformat() if t.created_at else ""

        result.append(HistoryItemWire(
            transformation_id=t.id,
            title=t.title or "Untitled transformation",
            created_at=created_at_str,
            outputs=output_keys
        ))

    return result
