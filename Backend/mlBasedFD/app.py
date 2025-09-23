from fastapi import FastAPI
from pydantic import BaseModel
from model import FraudModel

app = FastAPI()
fraud_model = FraudModel()

class Review(BaseModel):
    text: str

@app.post("/detect")
def detect_fraud(review: Review):
    label = fraud_model.predict(review.text)
    return {"review": review.text, "label": label}
