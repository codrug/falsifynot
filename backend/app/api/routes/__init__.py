"""API route modules."""

from fastapi import APIRouter

from .analyze import router as analyze_router

router = APIRouter()
router.include_router(analyze_router)

__all__ = ["router"]
