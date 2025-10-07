# app.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, Dict, Any
from rule_fraud_detection import FraudDetectionEngine  # import your class
from datetime import datetime

app = FastAPI(title="Fraud Detection API")
detector = FraudDetectionEngine()

# Define input schema
class Review(BaseModel):
    text: str
    user_id: str
    rating: int
    timestamp: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    account_created: Optional[str] = None
    device_info: Optional[Dict[str, Any]] = None

@app.post("/detect")
def detect_fraud(review: Review):
    result = detector.calculate_risk_score(review.dict())
    return result

@app.post("/detect-coordinated")
def detect_coordinated(reviews: list[Review]):
    review_dicts = [r.dict() for r in reviews]
    result = detector.detect_coordinated_attack(review_dicts)
    return result
