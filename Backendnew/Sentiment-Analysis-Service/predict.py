# import pickle

# def load_model(model_path, vec_path):
#     with open(model_path, "rb") as f:
#         clf = pickle.load(f)
#     with open(vec_path, "rb") as f:
#         vectorizer = pickle.load(f)
#     return clf, vectorizer

# def predict_review(review_text, model_path, vec_path):
#     clf, vectorizer = load_model(model_path, vec_path)
#     X_vec = vectorizer.transform([review_text])
#     pred = clf.predict(X_vec)[0]
#     return pred
