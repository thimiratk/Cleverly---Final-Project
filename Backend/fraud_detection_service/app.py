from fastapi import FastAPI
from pydantic import BaseModel
import joblib

#Load saved model and vectorizer
model = joblib.load("fraud_detection_model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

#Initialize FastAPI
app = FastAPI(title="Fraud Detection API")

#Request body structure
class ReviewRequest(BaseModel):
    review: str

#API endpoint
@app.post("/predict")
def predict_fraud(data: ReviewRequest):
    # Vectorize input
    vect_review = vectorizer.transform([data.review])
    
    # Get prediction and probability
    prediction = model.predict(vect_review)[0]
    probability = model.predict_proba(vect_review)[0][prediction]
    
    return {
        "label": "fake" if prediction == 1 else "genuine",
        "confidence": round(float(probability), 4)
    }
