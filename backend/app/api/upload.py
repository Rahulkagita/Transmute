import uuid
import os
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.document import Document
from app.schemas.wire import UploadResponseWire
from app.services.document_processor import process_uploaded_file

router = APIRouter(prefix="/api", tags=["Upload"])

@router.post("/upload", response_model=UploadResponseWire)
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    filename, text, char_count = await process_uploaded_file(file)
    ext = os.path.splitext(filename)[1].lower().replace(".", "")

    doc = Document(
        id=str(uuid.uuid4()),
        filename=filename,
        file_type=ext,
        extracted_text=text,
        char_count=char_count
    )

    try:
        db.add(doc)
        db.commit()
        db.refresh(doc)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error while saving document: {str(e)}"
        )

    return UploadResponseWire(
        document_id=doc.id,
        filename=doc.filename,
        file_type=doc.file_type,
        extracted_text=doc.extracted_text,
        status="processed"
    )
