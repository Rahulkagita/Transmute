import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.document import Document
from app.models.transformation import Transformation
from app.models.deliverable import Deliverable
from app.schemas.wire import TransformRequestWire, GenerationResponseWire
from app.services.canonical_engine import extract_canonical_content
from app.services.generator_engine import generate_deliverables

router = APIRouter(prefix="/api", tags=["Transformation"])

@router.post("/transform", response_model=GenerationResponseWire)
def transform_content(
    req: TransformRequestWire,
    db: Session = Depends(get_db)
):
    if not req.outputs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one output type must be selected."
        )

    # 1. Gather source text from document IDs or raw text input
    source_texts = []
    
    # Process document IDs
    doc_ids = req.source_ids or ([req.source_id] if req.source_id else [])
    for doc_id in doc_ids:
        if doc_id:
            doc = db.query(Document).filter(Document.id == doc_id).first()
            if doc:
                source_texts.append(f"--- DOCUMENT: {doc.filename} ---\n{doc.extracted_text}")

    # Process raw text input
    if req.source_text and req.source_text.strip():
        source_texts.append(req.source_text.strip())

    combined_source_text = "\n\n".join(source_texts).strip()

    if not combined_source_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No source text or uploaded documents were provided for transformation."
        )

    settings_dict = {
        "audience": req.audience,
        "custom_audience": req.custom_audience,
        "tone": req.tone,
        "language": req.language,
        "detail_level": req.detail_level,
        "objective": req.objective,
    }

    # 2. Pass 1: Extract Canonical Content (UNDERSTAND ONCE)
    canonical = extract_canonical_content(combined_source_text, req.context or "")
    canonical_dict = canonical.model_dump()

    # 3. Pass 2 & 3: Generate Deliverables from Canonical Content
    outputs_map = generate_deliverables(canonical, req.outputs, settings_dict, req.context or "")

    # 4. Save to Database
    trans_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()

    transformation = Transformation(
        id=trans_id,
        title=canonical.title or "Untitled Transformation",
        status="completed",
        source_text=combined_source_text[:5000],
        context=req.context,
        canonical_content=canonical_dict,
        settings=settings_dict,
    )
    db.add(transformation)

    deliverable_objects = []
    outputs_wire_dict = {}

    for key, output_wire in outputs_map.items():
        d_obj = Deliverable(
            id=str(uuid.uuid4()),
            transformation_id=trans_id,
            output_key=key,
            title=output_wire.title or key,
            content=output_wire.content or "",
            grounding=[g.model_dump() for g in output_wire.grounding],
            generated_statements=[s.model_dump() for s in output_wire.generated_statements],
        )
        db.add(d_obj)
        deliverable_objects.append(d_obj)
        outputs_wire_dict[key] = output_wire

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save transformation to database: {str(e)}"
        )

    return GenerationResponseWire(
        transformation_id=trans_id,
        status="completed",
        created_at=now_iso,
        canonical_content=canonical_dict,
        outputs=outputs_wire_dict,
    )
