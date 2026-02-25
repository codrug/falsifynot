"""Analyze API routes."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core import get_logger
from app.models.schemas import AnalyzeRequest, AnalyzeResponse
from app.pipeline.pipeline_service import VerificationPipeline

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1", tags=["analysis"])


def get_pipeline(request: Request) -> VerificationPipeline:
    """Get verification pipeline from app state."""
    pipeline = getattr(request.app.state, "verification_pipeline", None)
    if pipeline is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Verification pipeline is not initialized",
        )
    return pipeline


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(payload: AnalyzeRequest, pipeline: VerificationPipeline = Depends(get_pipeline)) -> AnalyzeResponse:
    """Analyze incoming text and return extracted claims."""
    logger.info("Received dynamic analyze request")
    return pipeline.run(payload.text)


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
    }
