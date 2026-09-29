from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.transformation import Transformation
from app.schemas.wire import GenerationResponseWire, OutputWire, GroundingCheckWire, GeneratedStatementWire

router = APIRouter(prefix="/api", tags=["Transformation Detail"])

@router.get("/transformation/{id}", response_model=GenerationResponseWire)
def get_transformation_by_id(id: str, db: Session = Depends(get_db)):
    transformation = db.query(Transformation).filter(Transformation.id == id).first()
    if not transformation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transformation with ID '{id}' was not found."
        )

    outputs_dict = {}
    for d in transformation.deliverables:
        grounding_checks = [GroundingCheckWire(**g) if isinstance(g, dict) else g for g in (d.grounding or [])]
        gen_statements = [GeneratedStatementWire(**s) if isinstance(s, dict) else s for s in (d.generated_statements or [])]

        outputs_dict[d.output_key] = OutputWire(
            title=d.title,
            content=d.content,
            grounding=grounding_checks,
            generated_statements=gen_statements
        )

    return GenerationResponseWire(
        transformation_id=transformation.id,
        status=transformation.status,
        created_at=transformation.created_at.isoformat() if transformation.created_at else "",
        canonical_content=transformation.canonical_content,
        outputs=outputs_dict
    )
