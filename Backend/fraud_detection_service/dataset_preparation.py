import pandas as pd
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
import joblib

# 1. Load CSV file
# Make sure your CSV has columns: "text" and "label"
df = pd.read_csv("fake_reviews.csv")  

# Optional: if your CSV has no train/test split, we’ll create one
from sklearn.model_selection import train_test_split
df_train, df_test = train_test_split(df, test_size=0.2, random_state=42)

# 2. Preprocess text
def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", "", text)
    return text.strip()

df_train["clean_text"] = df_train["text"].apply(clean_text)
df_test["clean_text"] = df_test["text"].apply(clean_text)

# 3. Vectorize text
vectorizer = TfidfVectorizer(max_features=5000)
X_train = vectorizer.fit_transform(df_train["clean_text"])
X_test = vectorizer.transform(df_test["clean_text"])

# 4. Train model
model = LogisticRegression(max_iter=200)
model.fit(X_train, df_train["label"])

# 5. Evaluate
y_pred = model.predict(X_test)
print(classification_report(df_test["label"], y_pred))

# 6. Save model + vectorizer
joblib.dump(model, "fraud_detection_model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")

print("Model and vectorizer saved successfully.")









