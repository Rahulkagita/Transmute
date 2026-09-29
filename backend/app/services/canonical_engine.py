import logging
from app.schemas.canonical import CanonicalContent, SourceSection
from app.prompts.canonical_prompt import CANONICAL_SYSTEM_INSTRUCTION, build_canonical_prompt
from app.services.gemini_client import generate_structured_json

logger = logging.getLogger("uvicorn.error")

def extract_canonical_content(source_text: str, context: str = "") -> CanonicalContent:
    """
    Pass 1: Converts unstructured source text + optional user context into a structured CanonicalContent object.
    Understood ONCE for all subsequent deliverables.
    """
    if not source_text or not source_text.strip():
        # Edge case: empty text fallback
        return CanonicalContent(
            title="Empty Source Document",
            summary="No readable content was provided in the source text.",
            key_points=["No content provided."],
            source_sections=[SourceSection(id="s-1", heading="Full Source", text="No content provided.")]
        )

    prompt = build_canonical_prompt(source_text, context)
    canonical = generate_structured_json(
        prompt=prompt,
        response_schema=CanonicalContent,
        system_instruction=CANONICAL_SYSTEM_INSTRUCTION
    )

    # Ensure source_sections is populated
    if not canonical.source_sections:
        canonical.source_sections = [
            SourceSection(id="s-1", heading="Full Source Document", text=source_text[:1000])
        ]

    return canonical
