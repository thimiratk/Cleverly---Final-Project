from __future__ import annotations

import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from stance_model import StanceDetectionModel

logger = logging.getLogger(__name__)

app = FastAPI(title="Stance Detection Service", version="1.0.0")

# Initialize the stance detection model
try:
    stance_model = StanceDetectionModel()
except Exception as e:
    logger.error(f"Failed to initialize stance model: {e}")
    stance_model = None

class StanceRequest(BaseModel):
    review_text: str
    comment_text: str

class BatchStanceRequest(BaseModel):
    review_text: str
    comments: List[str]

class StanceResponse(BaseModel):
    stance: str  # AGREE, DISAGREE, NEUTRAL
    confidence: float
    reasoning: str
    review_text: str
    comment_text: str

class BatchStanceResponse(BaseModel):
    review_text: str
    results: List[dict]

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool

@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        model_loaded=stance_model is not None
    )

@app.post("/detect-stance", response_model=StanceResponse)
async def detect_stance(request: StanceRequest) -> StanceResponse:
    """Detect stance of a comment/reply towards a review."""
    if not stance_model:
        raise HTTPException(status_code=500, detail="Stance detection model not available")
    
    try:
        result = stance_model.detect_stance(request.review_text, request.comment_text)
        
        return StanceResponse(
            stance=result["stance"],
            confidence=result["confidence"],
            reasoning=result["reasoning"],
            review_text=request.review_text,
            comment_text=request.comment_text
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        logger.exception("Stance detection failed")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect-stance-batch", response_model=BatchStanceResponse)
async def detect_stance_batch(request: BatchStanceRequest) -> BatchStanceResponse:
    """Detect stance for multiple comments towards the same review."""
    if not stance_model:
        raise HTTPException(status_code=500, detail="Stance detection model not available")
    
    try:
        results = stance_model.batch_detect_stance(request.review_text, request.comments)
        
        return BatchStanceResponse(
            review_text=request.review_text,
            results=results
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        logger.exception("Batch stance detection failed")
        raise HTTPException(status_code=500, detail=str(e))

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)