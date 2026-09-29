import json
from typing import Dict, Any

OUTPUT_SYSTEM_INSTRUCTIONS = """You are a senior professional content writer and communication strategist.
Your task is to generate publication-ready deliverables based STRICTLY on the provided Canonical Content JSON representation.

STRICT GROUNDING RULES:
1. Use ONLY the facts, numbers, dates, entities, risks, and recommendations present in the Canonical Content JSON.
2. DO NOT invent, extrapolate, or hallucinate stats, dates, names, or claims.
3. If specific details (e.g., severity level or deadline) are missing from the canonical data, explicitly state "Not specified in source".
4. Adhere strictly to the requested audience, tone, detail level, and objective.
5. Format output in clean Markdown.
"""

def build_output_prompt(
    output_key: str,
    canonical_dict: Dict[str, Any],
    settings_dict: Dict[str, Any],
    context: str = ""
) -> str:
    canonical_json_str = json.dumps(canonical_dict, indent=2)
    
    audience = settings_dict.get("audience", "Executives")
    if audience.lower() == "custom" and settings_dict.get("custom_audience"):
        audience = settings_dict.get("custom_audience")
        
    tone = settings_dict.get("tone", "Professional")
    detail = settings_dict.get("detail_level", "Balanced")
    objective = settings_dict.get("objective", "Inform")
    language = settings_dict.get("language", "English")

    header = f"""CANONICAL CONTENT JSON (SINGLE SOURCE OF TRUTH):
```json
{canonical_json_str}
```

GENERATION SETTINGS:
- Audience: {audience}
- Tone: {tone}
- Detail Level: {detail}
- Objective: {objective}
- Language: {language}
"""
    if context:
        header += f"- Special Instructions: {context}\n"

    header += "\n"

    if output_key == "executive_summary":
        return header + """OUTPUT FORMAT REQUIREMENT: Executive Summary
Structure in clean Markdown with the following exact sections:
## Bottom Line
(1-2 sentences summarizing the most critical decision or takeaway)

## Key Facts & Numbers
(Bullet points of key findings, statistics, dates, and entities)

## Risks & Impact
(Bullet points of identified risks and consequences)

## Decisions Required / Recommendations
(Bullet points of actionable recommendations)
"""

    elif output_key == "linkedin":
        return header + """OUTPUT FORMAT REQUIREMENT: LinkedIn Post
Write a highly engaging, professional LinkedIn post:
- Strong hook line at the start
- Clear spacing and bullet points for readability
- Highlight key facts, numbers, and deadlines accurately from the canonical data
- Concise closing takeaway or call to action
- 3-5 relevant hashtags at the end
- No invented claims or numbers
"""

    elif output_key == "advisory":
        return header + """OUTPUT FORMAT REQUIREMENT: Technical/Government Advisory
Structure as an official formal advisory in Markdown:
**Title:** [Title]
**Severity:** [Specify high/medium/low if stated in canonical content; if not specified, write "Not specified in source"]
**Issued / Effective:** [Dates from canonical content or "Not specified in source"]

### Summary
[Executive summary of the advisory]

### Affected Systems / Scope
[Affected entities, firmware, or departments from canonical content]

### Detailed Impact
[Impact, risks, and observed incidents]

### Recommended Actions
1. [Recommendation 1]
2. [Recommendation 2]

### Verified Reference Facts
- [List grounded facts with numbers and dates]
"""

    elif output_key == "presentation":
        return header + """OUTPUT FORMAT REQUIREMENT: Presentation Package
Generate a slide-by-slide presentation in Markdown:
Format each slide clearly as:

---
### Slide 1: [Slide Title]
**Visual / Layout:** [Description of slide layout, e.g. 2-column comparison, key stat callout]
**Bullet Points:**
- [Point 1]
- [Point 2]
- [Point 3]

**Speaker Notes:**
[Detailed speaker notes speaking directly to the audience]
---

Include at least 4-5 slides: Title slide, Overview, Key Data/Findings, Risks & Impact, and Actionable Steps.
"""

    elif output_key == "x_post":
        return header + """OUTPUT FORMAT REQUIREMENT: X / Twitter Post / Thread
Generate a post or thread optimized for X/Twitter:
If brief, provide a single impactful tweet under 280 characters.
If detailed, provide a numbered 1/N thread where each tweet is concise, impactful, and grounded in canonical numbers/dates.
Include 2-3 hashtag keywords at the end.
"""

    elif output_key == "infographic":
        return header + """OUTPUT FORMAT REQUIREMENT: Infographic Blueprint & Layout Strategy
Generate a visual layout blueprint (content strategy + visual design guide) in Markdown:
### Headline & Header Banner
[Main title and subtitle]

### Central Stat / Key Metric Callouts
[Big numerical callouts extracted from canonical statistics]

### Structural Data Panels
- **Panel 1: Overview** - [Summary points]
- **Panel 2: Key Risks** - [Visual icons/points]
- **Panel 3: Recommendations** - [Step 1, Step 2, Step 3]

### Visual & Color Scheme Strategy
[Recommended color coding, iconography, and layout structure]
"""

    elif output_key == "video_package":
        return header + """OUTPUT FORMAT REQUIREMENT: Video Production Package
Generate a video production script & storyboard package in Markdown:
### Video Title & Concept
[Title and video target duration]

### Script & Storyboard
| Timecode | Scene / Visual Description | On-Screen Text (Subtitles) | Voiceover Narration Script |
|---|---|---|---|
| 0:00 - 0:10 | [Visual setup] | [Text overlay] | [Voiceover text] |
| 0:10 - 0:30 | [Key finding visual] | [Text overlay] | [Voiceover text] |
| 0:30 - 0:50 | [Risk / Impact visual] | [Text overlay] | [Voiceover text] |
| 0:50 - 1:00 | [Closing CTA visual] | [Text overlay] | [Voiceover text] |

### Production Notes
- **Tone & Audio:** [Music/tone guidance]
- **Key Callouts:** [Critical numbers/dates to emphasize visually]
"""

    else:
        return header + f"Generate a structured Markdown deliverable for '{output_key}' based on the canonical content."
