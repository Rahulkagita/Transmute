import os
import logging
from typing import Type, TypeVar, Optional
from pydantic import BaseModel
from fastapi import HTTPException, status
from app.config import settings

logger = logging.getLogger("uvicorn.error")

T = TypeVar("T", bound=BaseModel)

def get_gemini_client():
    api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY is not configured on the backend server. Please set GEMINI_API_KEY in backend/.env."
        )

    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The 'google-genai' package is missing on the server. Run 'pip install google-genai'."
        )

def generate_structured_json(prompt: str, response_schema: Type[T], system_instruction: Optional[str] = None) -> T:
    """
    Calls Google Gemini API with structured JSON output enforced via response_schema.
    """
    client = get_gemini_client()
    from google.genai import types

    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=response_schema,
        temperature=0.2,
    )
    if system_instruction:
        config.system_instruction = system_instruction

    # Preferred default model: gemini-2.5-flash, fallback to gemini-3.8-flash if needed
    models_to_try = ["gemini-2.5-flash", "gemini-3.8-flash"]
    last_error = None

    for model in models_to_try:
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=config,
            )
            if response.parsed:
                return response.parsed
            elif response.text:
                return response_schema.model_validate_json(response.text)
        except Exception as e:
            logger.warning(f"Gemini API model {model} failed: {e}")
            last_error = e

    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=f"Gemini API generation failed: {str(last_error)}"
    )

def generate_text_content(prompt: str, system_instruction: Optional[str] = None) -> str:
    """
    Calls Google Gemini API to generate plain text or markdown content.
    """
    client = get_gemini_client()
    from google.genai import types

    config = types.GenerateContentConfig(
        temperature=0.3,
    )
    if system_instruction:
        config.system_instruction = system_instruction

    models_to_try = ["gemini-2.5-flash", "gemini-3.8-flash"]
    last_error = None

    for model in models_to_try:
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=config,
            )
            if response.text:
                return response.text
        except Exception as e:
            logger.warning(f"Gemini text generation model {model} failed: {e}")
            last_error = e

    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=f"Gemini text generation failed: {str(last_error)}"
    )
