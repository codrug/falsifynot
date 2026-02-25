"""Main FastAPI application entry point."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core import settings, setup_logging, get_logger
from app.api import router
from app.ml.claim_model import ClaimModel
from app.services.claim_service import ClaimExtractionService
from app.services.retrieval_service import RetrievalService
from app.pipeline.pipeline_service import VerificationPipeline


# Setup logging
setup_logging()
logger = get_logger(__name__)


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="FalsifyNot - AI-powered fact-checking and claim verification API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include API routes
app.include_router(router)


@app.on_event("startup")
async def startup_event():
    """Event handler for application startup."""
    logger.info(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"   Debug: {settings.DEBUG} | CORS: {len(settings.CORS_ORIGINS)} origins")
    logger.info("")
    
    # ===== LOAD CLAIM EXTRACTOR =====
    logger.info("📝 Loading Claim Extractor...")
    model_path = Path(settings.CLAIM_MODEL_PATH)
    if not model_path.is_absolute():
        model_path = (Path(__file__).resolve().parents[1] / model_path).resolve()

    required_files = [
        "config.json",
        "model.safetensors",
        "tokenizer.json",
        "tokenizer_config.json",
    ]
    missing_files = [name for name in required_files if not (model_path / name).exists()]
    if missing_files:
        raise RuntimeError(
            f"Claim model artifacts missing in {model_path}. Missing: {missing_files}"
        )

    claim_model = ClaimModel(model_path=model_path)
    app.state.claim_model = claim_model
    
    claim_service = ClaimExtractionService(
        claim_model=claim_model,
        confidence_threshold=settings.CLAIM_CONFIDENCE_THRESHOLD,
    )
    app.state.claim_service = claim_service
    logger.info("   ✓ Claim Extractor ready")
    logger.info("")
    
    # ===== LOAD RETRIEVAL SERVICE =====
    logger.info("🔍 Loading Retrieval Service...")
    try:
        retrieval_device = None
        if settings.RETRIEVAL_DEVICE != "auto":
            retrieval_device = settings.RETRIEVAL_DEVICE
        
        retrieval_service = RetrievalService(
            embeddings_path=settings.RETRIEVAL_EMBEDDINGS_PATH,
            corpus_path=settings.RETRIEVAL_CORPUS_PATH,
            model_name=settings.RETRIEVAL_MODEL_NAME,
            top_k=settings.RETRIEVAL_TOP_K,
            device=retrieval_device
        )
        app.state.retrieval_service = retrieval_service
        logger.info("   ✓ Retrieval Service ready")
    except Exception as e:
        logger.warning(f"   ⚠ Retrieval Service unavailable: {e}")
        logger.warning("   Pipeline will run without retrieval")
        app.state.retrieval_service = None
    
    logger.info("")
    
    # ===== BUILD UNIFIED PIPELINE =====
    logger.info("⚙️  Building Verification Pipeline...")
    app.state.verification_pipeline = VerificationPipeline(
        claim_service=claim_service,
        retrieval_service=getattr(app.state, "retrieval_service", None)
    )
    logger.info("   ✓ Pipeline ready")
    logger.info("")
    logger.info(f"✅ {settings.APP_NAME} ready - http://127.0.0.1:{settings.PORT}")
    logger.info("")


@app.on_event("shutdown")
async def shutdown_event():
    """Event handler for application shutdown."""
    logger.info(f"Shutting down {settings.APP_NAME}")


@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint with API information."""
    return JSONResponse({
        "message": "Welcome to FalsifyNot API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/api/v1/health"
    })


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred",
            "type": "internal_server_error"
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
