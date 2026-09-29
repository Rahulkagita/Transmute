# Transmute FastAPI Backend

FastAPI backend for automated content transformation powered by Google Gemini API and PostgreSQL.

## Core Pipeline Architecture

```
SOURCE DOCUMENT / TEXT
        ↓
INPUT PROCESSING (PyMuPDF / python-docx / TXT)
        ↓
CONTENT UNDERSTANDING (Gemini API — Structured JSON Output)
        ↓
CANONICAL CONTENT JSON (Understood ONCE)
        ↓
GROUNDING & VALIDATION (Section reference verification)
        ↓
OUTPUT-SPECIFIC GENERATION (Executive Summary, LinkedIn, Advisory, Presentation, etc.)
        ↓
POSTGRESQL STORAGE & FRONTEND DELIVERY
```

## Setup & Running

1. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   venv\Scripts\activate   # Windows
   pip install -r requirements.txt
   ```

2. Configure environment variables in `.env`:
   ```bash
   copy .env.example .env
   # Edit .env and set GEMINI_API_KEY and DATABASE_URL
   ```

3. Run the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
