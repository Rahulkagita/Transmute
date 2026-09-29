from app.api.health import router as health_router
from app.api.upload import router as upload_router
from app.api.transform import router as transform_router
from app.api.generate import router as generate_router
from app.api.history import router as history_router
from app.api.transformation import router as detail_router

__all__ = [
    "health_router",
    "upload_router",
    "transform_router",
    "generate_router",
    "history_router",
    "detail_router",
]
