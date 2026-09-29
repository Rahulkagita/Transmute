import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.transformation import Transformation
from app.models.deliverable import Deliverable
from app.schemas.canonical import CanonicalContent
from app.schemas.wire import GenerateRequestWire, GenerationResponseWire, OutputWire
from app.services.generator_engine import generate_deliverables

router = APIRouter(prefix="/api", tags=["Generation"])

@router.post("/generate", response_model=GenerationResponseWire)
def regenerate_outputs(
    req: GenerateRequestWire,
    db: Session = Depends(get_db)
):
    transformation = db.query(Transformation).filter(Transformation.id == req.transformation_id).first()
    if not transformation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transformation with ID '{req.transformation_id}' was not found."
        )

    if not req.outputs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Select at least one output type to generate."
        )

    # Reconstruct CanonicalContent from stored JSON
    canonical = CanonicalContent.model_validate(transformation.canonical_content)

    new_settings = {
        "audience": req.audience,
        "custom_audience": req.custom_audience,
        "tone": req.tone,
        "language": req.language,
        "detail_level": req.detail_level,
        "objective": req.objective,
    }

    # Generate fresh outputs for requested keys using ORIGINAL stored canonical content
    fresh_outputs = generate_deliverables(
        canonical=canonical,
        output_keys=req.outputs,
        settings_dict=new_settings,
        context=transformation.context or ""
    )

    # Update or insert into DB deliverables table
    outputs_wire_dict = {}
    for key, output_wire in fresh_outputs.items():
        existing_deliv = db.query(Deliverable).filter(
            Deliverable.transformation_id == req.transformation_id,
            Deliverable.output_key == key
        ).first()

        if existing_deliv:
            existing_deliv.title = output_wire.title or key
            existing_deliv.content = output_wire.content or ""
            existing_deliv.grounding = [g.model_dump() for g in output_wire.grounding]
            existing_deliv.generated_statements = [s.model_dump() for s in output_wire.generated_statements]
        else:
            new_deliv = Deliverable(
                id=str(uuid.uuid4()),
                transformation_id=req.transformation_id,
                output_key=key,
                title=output_wire.title or key,
                content=output_wire.content or "",
                grounding=[g.model_dump() for g in output_wire.grounding],
                generated_statements=[s.model_dump() for s in output_wire.generated_statements],
            )
            db.add(new_deliv)

        outputs_wire_dict[key] = output_wire

    # Update transformation settings
    transformation.settings = new_settings

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save regenerated deliverable to database: {str(e)}"
        )

    return GenerationResponseWire(
        transformation_id=transformation.id,
        status="completed",
        created_at=transformation.created_at.isoformat() if transformation.created_at else datetime.now(timezone.utc).isoformat(),
        canonical_content=transformation.canonical_content,
        outputs=outputs_wire_dict,
    )
