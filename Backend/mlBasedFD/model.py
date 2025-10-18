from __future__ import annotations

import threading
from pathlib import Path
from typing import Tuple

import joblib
from sklearn.exceptions import NotFittedError

from config import MODEL_PATH


class FraudModel:
    """Wrapper around the persisted sklearn pipeline used for fraud detection."""

    def __init__(self, model_path: Path | str = MODEL_PATH) -> None:
        self._model_path = Path(model_path)
        self._model = None
        self._lock = threading.Lock()

        try:
            self._load_model()
        except RuntimeError:
            # Defer failure until the first prediction request so the service can start up.
            self._model = None

    def predict(self, review_text: str) -> Tuple[str, float]:
        """Return the predicted label and associated confidence score."""
        if not review_text:
            raise ValueError("review_text must not be empty")

        model = self._ensure_model()
        try:
            probabilities = model.predict_proba([review_text])[0]
        except NotFittedError as error:
            raise RuntimeError("Fraud detection model is not fitted. Retrain the model artifact.") from error
        label_index = probabilities.argmax()
        label = model.classes_[label_index]
        confidence = float(probabilities[label_index])
        return label, confidence

    def reload(self) -> None:
        """Reload the model from disk. Useful when retraining the model."""
        with self._lock:
            self._load_model(force=True)

    def _ensure_model(self):  # type: ignore[no-untyped-def]
        """Return the cached model, reloading if necessary."""
        with self._lock:
            if self._model is None:
                self._load_model()
            return self._model

    def _load_model(self, force: bool = False) -> None:
        if self._model_path.exists():
            self._model = joblib.load(self._model_path)
        elif force or self._model is None:
            raise RuntimeError(
                f"Fraud detection model not found at '{self._model_path}'. Train the model before starting the API.")
