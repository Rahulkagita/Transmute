# Transmute

<div align="center">

### One Source. Understand Once. Generate Many.

A Generative AI platform that transforms a single source into multiple audience-specific content formats.

[Demo](#) · [API Documentation](#) · [Getting Started](#)

</div>

---

## Overview

Transmute lets you provide one source and generate multiple forms of communication from it.

Instead of rewriting the same information for every audience or platform, Transmute processes the source once, creates a structured representation, validates the information, and generates tailored outputs.

### Core Idea

```text
                 ONE SOURCE
                     │
                     ▼
            Content Understanding
                     │
                     ▼
          Canonical Content Model
                     │
                     ▼
           Grounding & Validation
                     │
                     ▼
             Content Generation
              ┌──────┼──────┐
              ▼      ▼      ▼
           Summary  Social  Advisory
              │      │      │
              └──────┼──────┘
                     ▼
                MANY OUTPUTS
```

---

## Features

|    | Feature                 | Description                                        |
| -- | ----------------------- | -------------------------------------------------- |
| 📄 | Multi-format Input      | Process PDF, DOCX, TXT and plain text              |
| 🧠 | AI Understanding        | Extract and structure important source information |
| 🎯 | Audience Adaptation     | Customize content for different audiences          |
| ✨  | Multi-format Generation | Generate different content formats from one source |
| 🔍 | Grounding & Validation  | Keep generated content aligned with the source     |
| 📝 | Review & Edit           | Preview and refine generated content               |

---

## Supported Outputs

* Executive Summary
* LinkedIn Post
* X / Twitter Post or Thread
* Advisory
* Infographic Content
* Presentation Content
* Video Content Package

---

## Tech Stack

### Frontend

`React` `TypeScript` `Tailwind CSS` `Vite` `TanStack Router` `TanStack Query`

### Backend

`Python` `FastAPI` `Uvicorn` `Pydantic`

### AI

`Google Gemini API` `Gemini Flash` `Google GenAI SDK`

### Document Processing

`PyMuPDF` `python-docx`

### Database

`PostgreSQL` `SQLAlchemy` `psycopg`

---

## Architecture

```text
┌─────────────────────┐
│      FRONTEND       │
│ React + TypeScript  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│       FASTAPI       │
│      REST APIs      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ DOCUMENT PROCESSING │
│   PDF / DOCX / TXT  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     GEMINI AI       │
│ Content Understanding│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ CANONICAL CONTENT   │
│ + GROUNDING         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ CONTENT GENERATION  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    POSTGRESQL       │
└─────────────────────┘
```

---

## Quick Start

### Requirements

* Python 3.10+
* Node.js
* npm
* PostgreSQL
* Google Gemini API key

### 1. Clone

```bash
git clone <repository-url>
cd Transmute
```

### 2. Backend

Create the virtual environment:

```powershell
python -m venv backend\venv
```

Activate it:

```powershell
.\backend\venv\Scripts\activate
```

Install dependencies:

```powershell
cd backend
pip install -r requirements.txt
```

### 3. Environment Configuration

Create:

```text
backend/.env
```

Add:

```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/transmute
HOST=0.0.0.0
PORT=8000
```

Make sure PostgreSQL is running and the `transmute` database exists.

### 4. Start Backend

```powershell
python -m uvicorn app.main:app --reload --port 8000
```

Backend:

`http://localhost:8000`

API documentation:

`http://localhost:8000/docs`

### 5. Start Frontend

Open a new terminal in the project root:

```powershell
npm install
```

Create:

```text
.env
```

Add:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Run:

```powershell
npm run dev
```

Open the URL provided by Vite, usually:

`http://localhost:5173`

---

## Project Structure

```text
Transmute/
├── backend/
│   └── app/
│       ├── api/
│       ├── models/
│       ├── prompts/
│       ├── schemas/
│       └── services/
│
├── src/
│   ├── components/
│   ├── routes/
│   └── lib/
│
├── public/
├── package.json
└── README.md
```

---

## API

The backend provides REST APIs for:

* Document upload
* Content transformation
* Content generation
* Transformation history
* Health checks

Interactive API documentation:

`http://localhost:8000/docs`

---

## Environment Variables

### Backend

```env
GEMINI_API_KEY=
DATABASE_URL=
HOST=
PORT=
```

### Frontend

```env
VITE_API_BASE_URL=
```

Never commit API keys, passwords, or `.env` files.

---

## Project Workflow

```text
SOURCE
  │
  ▼
UNDERSTAND
  │
  ▼
STRUCTURE
  │
  ▼
VALIDATE
  │
  ▼
GENERATE
  │
  ▼
REVIEW
```

---

## License

Add the project's chosen license before publishing.
