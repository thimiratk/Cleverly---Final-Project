import pickle
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from .preprocess import load_and_clean_data

def train_model(data_path, model_path, vec_path):
    df, text_col, label_col = load_and_clean_data(data_path)

    X = df[text_col].astype(str).values
    y = df[label_col].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    vectorizer = TfidfVectorizer(max_features=10000, ngram_range=(1,2), min_df=2)
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    clf = LogisticRegression(max_iter=1000, class_weight='balanced', solver='liblinear', random_state=42)
    clf.fit(X_train_tfidf, y_train)

    y_pred = clf.predict(X_test_tfidf)
    print(classification_report(y_test, y_pred))

    with open(model_path, "wb") as f:
        pickle.dump(clf, f)
    with open(vec_path, "wb") as f:
        pickle.dump(vectorizer, f)

    print(f"Model saved to {model_path}")
    print(f"Vectorizer saved to {vec_path}")
