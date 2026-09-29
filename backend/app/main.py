from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.api import (
    health_router,
    upload_router,
    transform_router,
    generate_router,
    history_router,
    detail_router,
)

app = FastAPI(
    title="Transmute Content Transformation API",
    description="Backend service for automated content transformation powered by Google Gemini and PostgreSQL",
    version="1.0.0",
)

# CORS setup for Vite frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# Include routers
app.include_router(health_router)
app.include_router(upload_router)
app.include_router(transform_router)
app.include_router(generate_router)
app.include_router(history_router)
app.include_router(detail_router)
