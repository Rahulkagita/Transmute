import io
import os
import fitz  # PyMuPDF
import docx  # python-docx
from fastapi import HTTPException, status, UploadFile

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB

async def process_uploaded_file(file: UploadFile) -> tuple[str, str, int]:
    """
    Extracts text from uploaded PDF, DOCX, or TXT file.
    Returns (filename, extracted_text, char_count).
    """
    filename = file.filename or "uploaded_file.txt"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed types: PDF, DOCX, TXT."
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed size of 20MB."
        )
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    extracted_text = ""

    if ext == ".pdf":
        try:
            doc = fitz.open(stream=content, filetype="pdf")
            text_parts = []
            for page in doc:
                text_parts.append(page.get_text())
            doc.close()
            extracted_text = "\n\n".join(text_parts).strip()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Failed to extract text from PDF: {str(e)}"
            )

    elif ext == ".docx":
        try:
            doc = docx.Document(io.BytesIO(content))
            text_parts = [p.text for p in doc.paragraphs if p.text.strip()]
            extracted_text = "\n\n".join(text_parts).strip()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Failed to extract text from Word document: {str(e)}"
            )

    elif ext == ".txt":
        try:
            extracted_text = content.decode("utf-8").strip()
        except UnicodeDecodeError:
            extracted_text = content.decode("latin-1", errors="ignore").strip()

    if not extracted_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not extract readable text from the uploaded file."
        )

    return filename, extracted_text, len(extracted_text)
