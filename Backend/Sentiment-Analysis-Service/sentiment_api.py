# Wrapping Sentiment Analysis model into a FastAPI Endpoint
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import os

# Load HuggingFace model
model_name = "cardiffnlp/twitter-roberta-base-sentiment"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)
classifier = pipeline('sentiment-analysis', model=model, tokenizer=tokenizer) # type: ignore

# FastAPI app
app = FastAPI(title="Sentiment Analysis API")

class SentimentRequest(BaseModel):
    text: str

@app.post("/sentiment")
async def analyze_sentiment(req: SentimentRequest):
    result = classifier(req.text)
    return {"text": req.text, "sentiment": result}
