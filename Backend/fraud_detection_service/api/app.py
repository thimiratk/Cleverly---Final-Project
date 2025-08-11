from fastapi import FastAPI
from pydantic import BaseModel
from src.predict import predict_review

# Paths to model/vectorizer
MODEL_PATH = "models/fraud_model.pkl"
VEC_PATH = "models/vectorizer.pkl"

app = FastAPI(title="Fraud Detection API")

class ReviewInput(BaseModel):
    text: str

@app.post("/predict")
def predict(input_data: ReviewInput):
    label = predict_review(input_data.text, MODEL_PATH, VEC_PATH)
    return {"label": label}
