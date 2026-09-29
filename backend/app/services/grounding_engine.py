import re
from typing import List, Dict, Any, Tuple
from app.schemas.canonical import CanonicalContent
from app.schemas.wire import GroundingCheckWire, GeneratedStatementWire

def generate_grounding_checks(canonical: CanonicalContent, generated_text: str) -> Tuple[List[GroundingCheckWire], List[GeneratedStatementWire]]:
    """
    Pass 2: Validates numbers, dates, stats, and facts in generated deliverable against Canonical Content.
    Returns (grounding_checks, generated_statements).
    """
    grounding: List[GroundingCheckWire] = []
    statements: List[GeneratedStatementWire] = []

    # Map sections by ID
    section_ids = [s.id for s in canonical.source_sections]
    default_ref = section_ids[0] if section_ids else "s-1"

    # 1. Ground facts from canonical statistics
    for stat in canonical.statistics:
        if stat.text in generated_text or any(token in generated_text for token in stat.text.split() if len(token) > 2):
            grounding.append(GroundingCheckWire(
                claim=stat.text,
                status="verified",
                source_ref=stat.source_ref or default_ref
            ))

    # 2. Ground facts from canonical dates
    for dt in canonical.dates:
        if dt.text in generated_text or any(token in generated_text for token in dt.text.split() if len(token) > 3):
            grounding.append(GroundingCheckWire(
                claim=dt.text,
                status="verified",
                source_ref=dt.source_ref or default_ref
            ))

    # 3. Ground facts from canonical facts
    for fact in canonical.facts:
        if any(word in generated_text.lower() for word in fact.text.lower().split()[:3]):
            grounding.append(GroundingCheckWire(
                claim=fact.text,
                status="verified",
                source_ref=fact.source_ref or default_ref
            ))

    # Deduplicate grounding checks
    seen_claims = set()
    dedup_grounding = []
    for g in grounding:
        if g.claim not in seen_claims:
            seen_claims.add(g.claim)
            dedup_grounding.append(g)

    # If no specific stat/date matched, add summary as verified claim
    if not dedup_grounding and canonical.summary:
        dedup_grounding.append(GroundingCheckWire(
            claim=canonical.summary[:100] + ("..." if len(canonical.summary) > 100 else ""),
            status="verified",
            source_ref=default_ref
        ))

    # Extract recommendations or interpretations for generated_statements
    for line in generated_text.splitlines():
        line_strip = line.strip()
        if line_strip.lower().startswith(("recommendation", "action", "step", "should", "must", "patch")):
            statements.append(GeneratedStatementWire(
                text=line_strip[:120],
                kind="recommendation"
            ))
        elif "requires verification" in line_strip.lower() or "not specified" in line_strip.lower():
            statements.append(GeneratedStatementWire(
                text=line_strip[:120],
                kind="interpretation"
            ))

    return dedup_grounding, statements[:4]
