import joblib
from config import MODEL_PATH

class FraudModel:
    def __init__(self):
        # Load trained model (TFIDF + LogisticRegression pipeline)
        self.model = joblib.load(MODEL_PATH)

    def predict(self, review_text: str):
        """
        Predict if a review is fake or non-fake.
        """
        prediction = self.model.predict([review_text])
        return prediction[0]
