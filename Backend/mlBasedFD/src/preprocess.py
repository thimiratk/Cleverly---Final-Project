import pandas as pd

def load_and_clean_data(csv_path):
    df = pd.read_csv(csv_path)

    # detect columns
    text_col = None
    for c in ["text", "text_", "review", "review_text"]:
        if c in df.columns:
            text_col = c
            break
    if text_col is None:
        potential = [c for c in df.columns if df[c].dtype == "object" and c.lower() not in ("label","category")]
        text_col = potential[0] if potential else df.columns[0]

    label_col = None
    for c in ["label", "Label", "labels"]:
        if c in df.columns:
            label_col = c
            break
    if label_col is None:
        raise ValueError("No label column found.")

    # normalize labels
    df[label_col] = df[label_col].astype(str).str.strip().str.upper()
    def map_label(x):
        if x in ("CG","COMPUTER-GENERATED","COMPUTER GENERATED","SYNTHETIC","FAKE"):
            return "CG"
        if x in ("REAL","OR","ORIGINAL","HUMAN"):
            return "REAL"
        return x
    df["label_clean"] = df[label_col].apply(map_label)

    # filter valid labels
    df = df[df["label_clean"].isin(["CG","REAL"])]
    df = df[~df[text_col].isnull()].copy()

    return df, text_col, "label_clean"
