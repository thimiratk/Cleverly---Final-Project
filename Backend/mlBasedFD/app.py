from fastapi import FastAPI
from pydantic import BaseModel
from model import FraudModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, Form # to handle review creation

app = FastAPI()
fraud_model = FraudModel()

class Review(BaseModel):
    text: str

@app.post("/detection")
def detect_fraud(review: Review):
    label = fraud_model.predict(review.text)
    return {"review": review.text, "label": label}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # in prod, replace "*" with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)