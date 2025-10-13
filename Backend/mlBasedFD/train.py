from __future__ import annotations

import argparse
from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from config import BASE_DIR, MODEL_PATH


def train_model(data_path: Path, model_path: Path) -> None:
    df = pd.read_csv(data_path)
    df['label'] = df['label'].map({'CG': 'fake', 'OR': 'non-fake'})

    X = df['text_']
    y = df['label']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = Pipeline([
        ('tfidf', TfidfVectorizer()),
        ('classifier', LogisticRegression(solver='liblinear')),
    ])

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print("Model Performance:")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.2f}\n")
    print("Classification Report:")
    print(classification_report(y_test, y_pred))

    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the fraud detection model")
    parser.add_argument(
        '--data',
        dest='data_path',
        type=Path,
        default=BASE_DIR / 'fake_reviews.csv',
        help='Path to the training dataset (CSV)',
    )
    parser.add_argument(
        '--output',
        dest='model_path',
        type=Path,
        default=MODEL_PATH,
        help='Destination path for the trained model',
    )

    args = parser.parse_args()
    train_model(args.data_path, args.model_path)


if __name__ == '__main__':
    main()
