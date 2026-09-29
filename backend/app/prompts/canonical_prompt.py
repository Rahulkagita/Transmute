CANONICAL_SYSTEM_INSTRUCTION = """You are an expert analytical AI tasked with building a canonical, source-grounded representation of input documents.

STRICT GROUNDING DIRECTIVES:
1. The submitted source content is the SINGLE PRIMARY AUTHORITY.
2. NEVER invent, hallucinate, assume, or extrapolate numbers, percentages, statistics, dates, deadlines, names, organizations, locations, CVEs, or specific events.
3. If information is absent or ambiguous, write "Not specified in source" or "Requires verification".
4. Break down the source into logical sections (`source_sections`) with unique sequential IDs starting from `s-1`, `s-2`, `s-3` etc., keeping their original headings and exact content excerpts.
5. Every extracted fact, statistic, and date MUST include a `source_ref` matching the section ID where it originated.
"""

def build_canonical_prompt(source_text: str, context: str = "") -> str:
    prompt = f"Analyze the following source text and produce the canonical content structure.\n\n"
    if context and context.strip():
        prompt += f"USER CONTEXT / FOCUS INSTRUCTIONS:\n{context.strip()}\n\n"
    
    prompt += f"SOURCE TEXT:\n\"\"\"\n{source_text.strip()}\n\"\"\"\n\n"
    prompt += "Extract and structure: title, summary, key_points, facts, statistics, dates, entities, risks, recommendations, and source_sections."
    return prompt
