import logging
from typing import List, Dict, Any
from app.schemas.canonical import CanonicalContent
from app.schemas.wire import OutputWire
from app.prompts.output_prompts import OUTPUT_SYSTEM_INSTRUCTIONS, build_output_prompt
from app.services.gemini_client import generate_text_content
from app.services.grounding_engine import generate_grounding_checks

logger = logging.getLogger("uvicorn.error")

TITLE_MAP = {
    "executive_summary": "Executive Summary",
    "linkedin": "LinkedIn Post",
    "advisory": "Security / Operational Advisory",
    "presentation": "Presentation Package",
    "x_post": "X / Twitter Post",
    "infographic": "Infographic Blueprint",
    "video_package": "Video Production Package",
}

def generate_deliverables(
    canonical: CanonicalContent,
    output_keys: List[str],
    settings_dict: Dict[str, Any],
    context: str = ""
) -> Dict[str, OutputWire]:
    """
    Pass 3: Generates individual deliverable packages from Canonical Content JSON (UNDERSTAND ONCE).
    Returns dict mapping output_key -> OutputWire object.
    """
    canonical_dict = canonical.model_dump()
    results: Dict[str, OutputWire] = {}

    for key in output_keys:
        title = TITLE_MAP.get(key, key.replace("_", " ").title())
        try:
            prompt = build_output_prompt(key, canonical_dict, settings_dict, context)
            content = generate_text_content(
                prompt=prompt,
                system_instruction=OUTPUT_SYSTEM_INSTRUCTIONS
            )
            grounding_checks, generated_statements = generate_grounding_checks(canonical, content)

            results[key] = OutputWire(
                title=title,
                content=content.strip(),
                grounding=grounding_checks,
                generated_statements=generated_statements
            )
        except Exception as e:
            logger.error(f"Failed to generate output for key '{key}': {e}")
            # Fallback output structure if an individual generator fails
            results[key] = OutputWire(
                title=title,
                content=f"## {title}\n\n{canonical.summary}\n\n*Note: Deliverable generated with canonical fallback summary.*",
                grounding=[],
                generated_statements=[]
            )

    return results
