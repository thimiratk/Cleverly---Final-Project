# # Fake Review Detection System
# # A comprehensive ML-based fraud detection system for identifying fake reviews

# import pandas as pd
# import numpy as np
# import matplotlib.pyplot as plt
# import seaborn as sns
# from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.naive_bayes import MultinomialNB
# from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
# from sklearn.linear_model import LogisticRegression
# from sklearn.svm import SVC
# from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, roc_auc_score, roc_curve
# from sklearn.pipeline import Pipeline
# import nltk
# from nltk.corpus import stopwords
# from nltk.tokenize import word_tokenize
# from nltk.stem import WordNetLemmatizer
# import re
# import warnings
# warnings.filterwarnings('ignore')

# # Download required NLTK data
# try:
#     nltk.data.find('tokenizers/punkt')
#     nltk.data.find('corpora/stopwords')
#     nltk.data.find('corpora/wordnet')
# except LookupError:
#     nltk.download('punkt')
#     nltk.download('stopwords')
#     nltk.download('wordnet')

# class FakeReviewDetector:
#     def __init__(self):
#         self.models = {}
#         self.vectorizer = None
#         self.best_model = None
#         self.lemmatizer = WordNetLemmatizer()
#         self.stop_words = set(stopwords.words('english'))
        
#     def download_dataset(self, url=None):
#         """
#         Download the fake reviews dataset
#         """
#         if url is None:
#             # Default dataset URL
#             url = "https://raw.githubusercontent.com/SayamAlt/Fake-Reviews-Detection/main/fake%20reviews%20dataset.csv"
        
#         try:
#             print("Downloading dataset...")
#             df = pd.read_csv(url)
#             print(f"Dataset downloaded successfully! Shape: {df.shape}")
#             return df
#         except Exception as e:
#             print(f"Error downloading dataset: {e}")
#             print("Please download manually from:")
#             print("https://github.com/SayamAlt/Fake-Reviews-Detection/blob/main/fake%20reviews%20dataset.csv")
#             return None
    
#     def preprocess_text(self, text):
#         """
#         Clean and preprocess text data
#         """
#         if pd.isna(text):
#             return ""
        
#         # Convert to lowercase
#         text = str(text).lower()
        
#         # Remove special characters and digits
#         text = re.sub(r'[^a-zA-Z\s]', '', text)
        
#         # Tokenize
#         tokens = word_tokenize(text)
        
#         # Remove stopwords and lemmatize
#         tokens = [self.lemmatizer.lemmatize(word) for word in tokens 
#                  if word not in self.stop_words and len(word) > 2]
        
#         return ' '.join(tokens)
    
#     def load_and_explore_data(self, file_path=None):
#         """
#         Load and explore the dataset
#         """
#         if file_path is None:
#             # Try to download the dataset
#             df = self.download_dataset()
#             if df is None:
#                 return None
#         else:
#             df = pd.read_csv(file_path)
        
#         print("Dataset Overview:")
#         print(f"Shape: {df.shape}")
#         print(f"Columns: {df.columns.tolist()}")
#         print("\nFirst few rows:")
#         print(df.head())
        
#         print("\nDataset Info:")
#         print(df.info())
        
#         # Check for missing values
#         print("\nMissing values:")
#         print(df.isnull().sum())
        
#         # Check class distribution
#         if 'category' in df.columns:
#             print("\nClass distribution:")
#             print(df['category'].value_counts())
            
#             # Visualize class distribution
#             plt.figure(figsize=(8, 6))
#             df['category'].value_counts().plot(kind='bar')
#             plt.title('Distribution of Real vs Fake Reviews')
#             plt.xlabel('Category')
#             plt.ylabel('Count')
#             plt.xticks(rotation=0)
#             plt.tight_layout()
#             plt.show()
        
#         return df
    
#     def prepare_features(self, df):
#         """
#         Prepare features for machine learning
#         """
#         # Identify text column (common names)
#         text_columns = ['text_', 'review', 'text', 'comment', 'content']
#         text_col = None
        
#         for col in text_columns:
#             if col in df.columns:
#                 text_col = col
#                 break
        
#         if text_col is None:
#             # Use the first column that seems to contain text
#             for col in df.columns:
#                 if col != 'category' and df[col].dtype == 'object':
#                     text_col = col
#                     break
        
#         if text_col is None:
#             raise ValueError("No text column found in the dataset")
        
#         print(f"Using '{text_col}' as text column")
        
#         # Preprocess text
#         print("Preprocessing text data...")
#         df['cleaned_text'] = df[text_col].apply(self.preprocess_text)
        
#         # Create additional features
#         df['text_length'] = df[text_col].str.len()
#         df['word_count'] = df[text_col].str.split().str.len()
#         df['exclamation_count'] = df[text_col].str.count('!')
#         df['question_count'] = df[text_col].str.count('\?') # type: ignore
#         df['caps_ratio'] = df[text_col].apply(lambda x: sum(1 for c in str(x) if c.isupper()) / len(str(x)) if len(str(x)) > 0 else 0)
        
#         return df, text_col
    
#     def train_models(self, X_text, X_features, y):
#         """
#         Train multiple ML models
#         """
#         # Create TF-IDF vectorizer
#         self.vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
#         X_tfidf = self.vectorizer.fit_transform(X_text)
        
#         # Combine TF-IDF features with additional features
#         X_combined = np.hstack([X_tfidf.toarray(), X_features]) # type: ignore
        
#         # Split data
#         X_train, X_test, y_train, y_test = train_test_split(
#             X_combined, y, test_size=0.2, random_state=42, stratify=y
#         )
        
#         # Define models
#         models = {
#             'Naive Bayes': MultinomialNB(),
#             'Logistic Regression': LogisticRegression(random_state=42),
#             'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
#             'Gradient Boosting': GradientBoostingClassifier(random_state=42),
#             'SVM': SVC(probability=True, random_state=42)
#         }
        
#         print("Training models...")
#         results = {}
        
#         for name, model in models.items():
#             print(f"\nTraining {name}...")
            
#             # Train model
#             model.fit(X_train, y_train)
            
#             # Make predictions
#             y_pred = model.predict(X_test)
#             y_pred_proba = model.predict_proba(X_test)[:, 1] if hasattr(model, 'predict_proba') else None
            
#             # Calculate metrics
#             accuracy = accuracy_score(y_test, y_pred)
#             auc = roc_auc_score(y_test, y_pred_proba) if y_pred_proba is not None else 0
            
#             # Cross-validation
#             cv_scores = cross_val_score(model, X_train, y_train, cv=5)
            
#             results[name] = {
#                 'model': model,
#                 'accuracy': accuracy,
#                 'auc': auc,
#                 'cv_mean': cv_scores.mean(),
#                 'cv_std': cv_scores.std(),
#                 'y_test': y_test,
#                 'y_pred': y_pred,
#                 'y_pred_proba': y_pred_proba
#             }
            
#             print(f"Accuracy: {accuracy:.4f}")
#             print(f"AUC: {auc:.4f}")
#             print(f"CV Score: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
        
#         self.models = results
        
#         # Select best model based on AUC score
#         best_model_name = max(results.keys(), key=lambda x: results[x]['auc'])
#         self.best_model = results[best_model_name]['model']
        
#         print(f"\nBest model: {best_model_name}")
        
#         return X_test, y_test, results
    
#     def evaluate_models(self, results):
#         """
#         Evaluate and visualize model performance
#         """
#         # Model comparison
#         model_comparison = pd.DataFrame({
#             'Model': list(results.keys()),
#             'Accuracy': [results[model]['accuracy'] for model in results.keys()],
#             'AUC': [results[model]['auc'] for model in results.keys()],
#             'CV Mean': [results[model]['cv_mean'] for model in results.keys()],
#             'CV Std': [results[model]['cv_std'] for model in results.keys()]
#         })
        
#         print("\nModel Comparison:")
#         print(model_comparison.round(4))
        
#         # Visualize results
#         fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        
#         # Accuracy comparison
#         axes[0, 0].bar(model_comparison['Model'], model_comparison['Accuracy'])
#         axes[0, 0].set_title('Model Accuracy Comparison')
#         axes[0, 0].set_ylabel('Accuracy')
#         axes[0, 0].tick_params(axis='x', rotation=45)
        
#         # AUC comparison
#         axes[0, 1].bar(model_comparison['Model'], model_comparison['AUC'])
#         axes[0, 1].set_title('Model AUC Comparison')
#         axes[0, 1].set_ylabel('AUC Score')
#         axes[0, 1].tick_params(axis='x', rotation=45)
        
#         # ROC curves
#         axes[1, 0].set_title('ROC Curves')
#         for model_name in results.keys():
#             if results[model_name]['y_pred_proba'] is not None:
#                 fpr, tpr, _ = roc_curve(results[model_name]['y_test'], results[model_name]['y_pred_proba'])
#                 axes[1, 0].plot(fpr, tpr, label=f"{model_name} (AUC: {results[model_name]['auc']:.3f})")
#         axes[1, 0].plot([0, 1], [0, 1], 'k--')
#         axes[1, 0].set_xlabel('False Positive Rate')
#         axes[1, 0].set_ylabel('True Positive Rate')
#         axes[1, 0].legend()
        
#         # Confusion matrix for best model
#         best_model_name = max(results.keys(), key=lambda x: results[x]['auc'])
#         cm = confusion_matrix(results[best_model_name]['y_test'], results[best_model_name]['y_pred'])
#         sns.heatmap(cm, annot=True, fmt='d', ax=axes[1, 1], cmap='Blues')
#         axes[1, 1].set_title(f'Confusion Matrix - {best_model_name}')
#         axes[1, 1].set_xlabel('Predicted')
#         axes[1, 1].set_ylabel('Actual')
        
#         plt.tight_layout()
#         plt.show()
        
#         # Detailed classification report for best model
#         print(f"\nDetailed Classification Report - {best_model_name}:")
#         print(classification_report(results[best_model_name]['y_test'], 
#                                   results[best_model_name]['y_pred']))
    
#     def predict_review(self, review_text):
#         """
#         Predict if a single review is fake or real
#         """
#         if self.best_model is None or self.vectorizer is None:
#             raise ValueError("Model not trained yet. Please train the model first.")
        
#         # Preprocess the review
#         cleaned_review = self.preprocess_text(review_text)
        
#         # Extract features
#         text_length = len(review_text)
#         word_count = len(review_text.split())
#         exclamation_count = review_text.count('!')
#         question_count = review_text.count('?')
#         caps_ratio = sum(1 for c in review_text if c.isupper()) / len(review_text) if len(review_text) > 0 else 0
        
#         additional_features = np.array([[text_length, word_count, exclamation_count, question_count, caps_ratio]])
        
#         # Vectorize text
#         text_features = self.vectorizer.transform([cleaned_review])
        
#         # Combine features
#         combined_features = np.hstack([text_features.toarray(), additional_features]) # type: ignore
        
#         # Make prediction
#         prediction = self.best_model.predict(combined_features)[0]
#         probability = self.best_model.predict_proba(combined_features)[0] if hasattr(self.best_model, 'predict_proba') else None
        
#         return {
#             'prediction': 'Fake' if prediction == 1 else 'Real',
#             'confidence': probability[prediction] if probability is not None else None,
#             'probabilities': {
#                 'Real': probability[0] if probability is not None else None,
#                 'Fake': probability[1] if probability is not None else None
#             }
#         }
    
#     def save_model(self, filepath):
#         """
#         Save the trained model
#         """
#         import joblib
#         model_data = {
#             'best_model': self.best_model,
#             'vectorizer': self.vectorizer,
#             'lemmatizer': self.lemmatizer,
#             'stop_words': self.stop_words
#         }
#         joblib.dump(model_data, filepath)
#         print(f"Model saved to {filepath}")
    
#     def load_model(self, filepath):
#         """
#         Load a trained model
#         """
#         import joblib
#         model_data = joblib.load(filepath)
#         self.best_model = model_data['best_model']
#         self.vectorizer = model_data['vectorizer']
#         self.lemmatizer = model_data['lemmatizer']
#         self.stop_words = model_data['stop_words']
#         print(f"Model loaded from {filepath}")


# # Example usage
# if __name__ == "__main__":
#     # Initialize detector
#     detector = FakeReviewDetector()
    
#     # Load and explore data
#     print("Step 1: Loading and exploring data...")
#     df = detector.load_and_explore_data()  # This will auto-download the dataset
    
#     if df is not None:
#         # Prepare features
#         print("\nStep 2: Preparing features...")
#         df, text_col = detector.prepare_features(df)
        
#         # Prepare target variable
#         if 'category' in df.columns:
#             # Map category to binary (assuming 'CG' is fake and 'OR' is real)
#             df['label'] = df['category'].map({'CG': 1, 'OR': 0})  # 1 for fake, 0 for real
#         else:
#             print("Please ensure your dataset has a 'category' column with labels")
#             exit()
        
#         # Prepare features
#         X_text = df['cleaned_text']
#         X_features = df[['text_length', 'word_count', 'exclamation_count', 'question_count', 'caps_ratio']].values
#         y = df['label']
        
#         # Train models
#         print("\nStep 3: Training models...")
#         X_test, y_test, results = detector.train_models(X_text, X_features, y)
        
#         # Evaluate models
#         print("\nStep 4: Evaluating models...")
#         detector.evaluate_models(results)
        
#         # Test with sample reviews
#         print("\nStep 5: Testing with sample reviews...")
        
#         sample_reviews = [
#             "This product is absolutely amazing! Best purchase ever! 5 stars! Highly recommend!",  # Likely fake
#             "The product works as described. Delivery was on time and packaging was good. Overall satisfied with the purchase.",  # Likely real
#             "AMAZING PRODUCT!!! BUY NOW!!! BEST DEAL EVER!!! 100% RECOMMENDED!!!"  # Likely fake
#         ]
        
#         for i, review in enumerate(sample_reviews, 1):
#             print(f"\nSample Review {i}: {review}")
#             result = detector.predict_review(review)
#             print(f"Prediction: {result['prediction']}")
#             if result['confidence']:
#                 print(f"Confidence: {result['confidence']:.4f}")
#                 print(f"Probabilities - Real: {result['probabilities']['Real']:.4f}, Fake: {result['probabilities']['Fake']:.4f}")
        
#         # Save model
#         print("\nStep 6: Saving model...")
#         detector.save_model('fake_review_detector.joblib')
        
#         print("\nFake Review Detection System completed successfully!")
#     else:
#         print("Could not load dataset. Please check the file path or download manually.")

# # Additional utility functions for batch processing
# def batch_predict_reviews(detector, reviews_list):
#     """
#     Predict multiple reviews at once
#     """
#     results = []
#     for review in reviews_list:
#         result = detector.predict_review(review)
#         results.append(result)
#     return results

# def analyze_review_file(detector, file_path, text_column='review', output_file=None):
#     """
#     Analyze reviews from a CSV file
#     """
#     df = pd.read_csv(file_path)
#     predictions = []
#     confidences = []
    
#     for review in df[text_column]:
#         result = detector.predict_review(str(review))
#         predictions.append(result['prediction'])
#         confidences.append(result['confidence'] if result['confidence'] else 0)
    
#     df['prediction'] = predictions
#     df['confidence'] = confidences
    
#     if output_file:
#         df.to_csv(output_file, index=False)
#         print(f"Results saved to {output_file}")
    
#     return df