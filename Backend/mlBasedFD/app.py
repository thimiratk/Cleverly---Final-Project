from __future__ import annotations

import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from model import FraudModel


logger = logging.getLogger(__name__)


app = FastAPI(title="ML Fraud Detection Service", version="1.1.0")
fraud_model = FraudModel()


class DetectionRequest(BaseModel):
    text: str


class DetectionResponse(BaseModel):
    review: str
    label: str
    confidence: float


class HealthResponse(BaseModel):
    status: str


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.post("/detection", response_model=DetectionResponse)
async def detect_fraud(review: DetectionRequest) -> DetectionResponse:
    try:
        label, confidence = fraud_model.predict(review.text)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except RuntimeError as error:
        logger.exception("Fraud model unavailable")
        raise HTTPException(status_code=500, detail=str(error)) from error

    return DetectionResponse(review=review.text, label=label, confidence=confidence)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # in prod, replace "*" with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)