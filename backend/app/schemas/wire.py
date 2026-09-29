from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel
from app.schemas.canonical import CanonicalContent

class UploadResponseWire(BaseModel):
    document_id: str
    filename: str
    file_type: str
    extracted_text: str
    status: str = "processed"
    detail: Optional[str] = None

class TransformRequestWire(BaseModel):
    source_id: Optional[str] = None
    source_ids: Optional[List[str]] = None
    source_text: Optional[str] = None
    context: Optional[str] = None
    outputs: List[str]
    audience: str
    custom_audience: Optional[str] = None
    tone: str
    language: str
    detail_level: str
    objective: str

class GenerateRequestWire(BaseModel):
    transformation_id: str
    outputs: List[str]
    audience: str
    custom_audience: Optional[str] = None
    tone: str
    language: str
    detail_level: str
    objective: str

class GroundingCheckWire(BaseModel):
    claim: str
    status: str  # "verified" | "requires_verification" | "not_in_source"
    source_ref: Optional[str] = None

class GeneratedStatementWire(BaseModel):
    text: str
    kind: Optional[str] = "interpretation"  # "interpretation" | "recommendation"

class OutputWire(BaseModel):
    title: Optional[str] = ""
    content: Optional[str] = ""
    grounding: List[GroundingCheckWire] = []
    generated_statements: List[GeneratedStatementWire] = []

class GenerationResponseWire(BaseModel):
    transformation_id: str
    status: str = "completed"
    created_at: Optional[str] = None
    detail: Optional[str] = None
    canonical_content: Optional[Dict[str, Any]] = None
    outputs: Optional[Dict[str, OutputWire]] = None
    grounding: Optional[Dict[str, List[GroundingCheckWire]]] = None

class HistoryItemWire(BaseModel):
    transformation_id: str
    title: Optional[str] = "Untitled transformation"
    created_at: str
    outputs: List[str] = []
