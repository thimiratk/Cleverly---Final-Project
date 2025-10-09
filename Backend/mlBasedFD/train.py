import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report

# Load the data
df = pd.read_csv('fake_reviews.csv')

# Map labels: CG → fake, OR → non-fake
df['label'] = df['label'].map({'CG': 'fake', 'OR': 'non-fake'})

X = df['text_']
y = df['label']

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Pipeline: TF-IDF + Logistic Regression
model = Pipeline([
    ('tfidf', TfidfVectorizer()),
    ('classifier', LogisticRegression(solver='liblinear'))
])

# Train
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print("Model Performance:")
print(f"Accuracy: {accuracy_score(y_test, y_pred):.2f}\n")
print("Classification Report:")
print(classification_report(y_test, y_pred))

# Save model
joblib.dump(model, "models/fraud_model.pkl")
print(" Model saved to models/fraud_model.pkl")

# --- Sample Prediction ---
sample_review = "This product is amazing, I highly recommend it!"
prediction = model.predict([sample_review])[0]
print(f"\nSample Review: {sample_review}")
print(f"Predicted Label: {prediction}")
