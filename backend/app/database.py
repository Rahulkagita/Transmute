import logging
from typing import Generator
from fastapi import HTTPException, status
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config import settings

logger = logging.getLogger("uvicorn.error")

Base = declarative_base()

db_available = False
engine = None
SessionLocal = None

def init_db():
    global engine, SessionLocal, db_available
    db_url = settings.DATABASE_URL
    if not db_url:
        logger.warning("DATABASE_URL is not set. Database functions will be disabled.")
        db_available = False
        return

    try:
        # SQLite fallback handling for local testing without local PostgreSQL
        connect_args = {}
        if db_url.startswith("sqlite"):
            connect_args["check_same_thread"] = False
        
        engine = create_engine(db_url, connect_args=connect_args, pool_pre_ping=True)
        # Test connection
        with engine.connect() as conn:
            pass
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Import models to ensure registered
        from app.models import document, transformation, deliverable  # noqa
        Base.metadata.create_all(bind=engine)
        db_available = True
        logger.info(f"Database connected successfully using {db_url.split('@')[-1] if '@' in db_url else db_url}")
    except Exception as e:
        logger.warning(f"Database connection failed: {e}. FastAPI server will start, but DB endpoints will return 503 until DB is available.")
        db_available = False

def get_db() -> Generator[Session, None, None]:
    if not db_available or SessionLocal is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable. Ensure PostgreSQL is running and DATABASE_URL is properly configured."
        )
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
