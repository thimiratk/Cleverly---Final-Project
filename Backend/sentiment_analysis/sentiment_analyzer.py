import os
import json
from datetime import datetime
from typing import List, Dict, Any
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from transformers import pipeline
    import torch
    HAS_TRANSFORMERS = True
except ImportError:
    logger.warning("transformers not installed. Install with: pip install transformers torch")
    HAS_TRANSFORMERS = False

try:
    from textblob import TextBlob
    HAS_TEXTBLOB = True
except ImportError:
    logger.warning("textblob not installed. Install with: pip install textblob")
    HAS_TEXTBLOB = False

class SentimentAnalyzer:
    def __init__(self, model_type="textblob"):
        """
        Initialize sentiment analyzer
        
        Args:
            model_type: "textblob" (simple, fast) or "transformers" (more accurate)
        """
        self.model_type = model_type
        self.analyzer = None
        
        if model_type == "transformers" and HAS_TRANSFORMERS:
            try:
                logger.info("Loading transformer model...")
                self.analyzer = pipeline(
                    "sentiment-analysis",
                    model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                    return_all_scores=True
                )
                logger.info("Transformer model loaded successfully!")
            except Exception as e:
                logger.error(f"Failed to load transformer model: {e}")
                logger.info("Falling back to TextBlob...")
                self.model_type = "textblob"
        
        if self.model_type == "textblob" and not HAS_TEXTBLOB:
            raise ImportError("Please install textblob: pip install textblob")
    
    def analyze_text(self, text: str) -> Dict[str, Any]:
        """
        Analyze sentiment of a single text
        
        Returns:
            dict with 'label', 'score', and 'confidence'
        """
        if not text or not text.strip():
            return {"label": "neutral", "score": 0.0, "confidence": 0.0}
        
        text = text.strip()
        
        if self.model_type == "transformers" and self.analyzer:
            try:
                results = self.analyzer(text[:512])[0]  # Limit text length
                
                # Find the highest confidence prediction
                best_result = max(results, key=lambda x: x['score'])
                
                # Map labels to consistent format
                label_map = {
                    'LABEL_0': 'negative',
                    'LABEL_1': 'neutral', 
                    'LABEL_2': 'positive',
                    'negative': 'negative',
                    'neutral': 'neutral',
                    'positive': 'positive'
                }
                
                label = label_map.get(best_result['label'], best_result['label'].lower())
                
                # Convert to score (-1 to 1 scale)
                if label == 'positive':
                    score = best_result['score']
                elif label == 'negative':
                    score = -best_result['score']
                else:
                    score = 0.0
                
                return {
                    "label": label,
                    "score": score,
                    "confidence": best_result['score']
                }
            except Exception as e:
                logger.error(f"Transformer analysis failed: {e}")
                # Fallback to TextBlob
        
        # TextBlob analysis
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        
        if polarity > 0.1:
            label = "positive"
        elif polarity < -0.1:
            label = "negative"
        else:
            label = "neutral"
        
        return {
            "label": label,
            "score": polarity,
            "confidence": abs(polarity)
        }
    
    def analyze_review_with_comments(self, review_text: str, comments: List[str], 
                                   review_weight: float = 0.7) -> Dict[str, Any]:
        """
        Analyze sentiment of a review and its comments
        
        Args:
            review_text: Main review text
            comments: List of comment texts
            review_weight: Weight given to main review (0.0 to 1.0)
        
        Returns:
            dict with overall sentiment analysis
        """
        # Analyze main review
        review_sentiment = self.analyze_text(review_text)
        
        # Analyze comments
        comment_sentiments = []
        for comment in comments:
            comment_sentiments.append(self.analyze_text(comment))
        
        # Calculate comment average
        if comment_sentiments:
            avg_comment_score = sum(c['score'] for c in comment_sentiments) / len(comment_sentiments)
            avg_comment_confidence = sum(c['confidence'] for c in comment_sentiments) / len(comment_sentiments)
        else:
            avg_comment_score = 0.0
            avg_comment_confidence = 0.0
        
        # Calculate weighted overall score
        comment_weight = 1.0 - review_weight
        overall_score = (review_weight * review_sentiment['score'] + 
                        comment_weight * avg_comment_score)
        
        # Determine overall label
        if overall_score > 0.1:
            overall_label = "positive"
        elif overall_score < -0.1:
            overall_label = "negative"
        else:
            overall_label = "neutral"
        
        return {
            "overall": {
                "label": overall_label,
                "score": overall_score,
                "confidence": (review_sentiment['confidence'] + avg_comment_confidence) / 2
            },
            "review": review_sentiment,
            "comments": {
                "individual": comment_sentiments,
                "average_score": avg_comment_score,
                "count": len(comment_sentiments)
            },
            "timestamp": datetime.now().isoformat()
        }

def main():
    """
    Example usage of the sentiment analysis system
    """
    print("=== Social Media Sentiment Analysis System ===\n")
    
    # Initialize analyzer
    print("Initializing sentiment analyzer...")
    
    # Try transformers first, fall back to textblob
    try:
        if HAS_TRANSFORMERS:
            analyzer = SentimentAnalyzer("transformers")
            print("✅ Using transformer model (more accurate)")
        else:
            analyzer = SentimentAnalyzer("textblob")
            print("✅ Using TextBlob model (fast)")
    except Exception as e:
        print(f"❌ Error initializing analyzer: {e}")
        return
    
    # Example data
    sample_reviews = [
        {
            "review": "This product is absolutely amazing! Best purchase I've made this year.",
            "comments": [
                "I agree, totally worth it!",
                "Really? I had a different experience",
                "Same here, love it!"
            ]
        },
        {
            "review": "Terrible quality, broke after one day. Very disappointed.",
            "comments": [
                "Sorry to hear that :(",
                "Maybe contact customer service?",
                "I had the same issue"
            ]
        },
        {
            "review": "It's okay, nothing special but does the job.",
            "comments": [
                "Fair enough",
                "For the price it's decent"
            ]
        }
    ]
    
    print("\n=== Analyzing Sample Reviews ===\n")
    
    for i, review_data in enumerate(sample_reviews, 1):
        print(f"--- Review {i} ---")
        print(f"Review: {review_data['review'][:100]}...")
        print(f"Comments: {len(review_data['comments'])} comments")
        
        # Analyze sentiment
        result = analyzer.analyze_review_with_comments(
            review_data['review'], 
            review_data['comments']
        )
        
        # Display results
        overall = result['overall']
        print(f"Overall Sentiment: {overall['label'].upper()}")
        print(f"Overall Score: {overall['score']:.3f}")
        print(f"Confidence: {overall['confidence']:.3f}")
        
        review_sent = result['review']
        print(f"Review Only: {review_sent['label']} ({review_sent['score']:.3f})")
        
        comments_avg = result['comments']['average_score']
        print(f"Comments Average: {comments_avg:.3f}")
        print()
    
    print("=== Interactive Mode ===")
    print("Enter your own review and comments to analyze:")
    print("(Press Enter twice to finish entering comments, or type 'quit' to exit)")
    
    while True:
        try:
            # Get review text
            review_text = input("\nEnter review text: ").strip()
            if review_text.lower() == 'quit':
                break
            
            if not review_text:
                print("Please enter some review text.")
                continue
            
            # Get comments
            comments = []
            print("Enter comments (press Enter twice when done):")
            while True:
                comment = input("Comment: ").strip()
                if not comment:
                    break
                if comment.lower() == 'quit':
                    return
                comments.append(comment)
            
            # Analyze
            result = analyzer.analyze_review_with_comments(review_text, comments)
            
            # Show results
            print("\n--- Analysis Results ---")
            overall = result['overall']
            print(f"Overall Sentiment: {overall['label'].upper()}")
            print(f"Overall Score: {overall['score']:.3f}")
            print(f"Review Sentiment: {result['review']['label']} ({result['review']['score']:.3f})")
            if comments:
                print(f"Comments Average: {result['comments']['average_score']:.3f}")
            
            # Save results
            filename = f"sentiment_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(filename, 'w') as f:
                json.dump(result, f, indent=2)
            print(f"Results saved to: {filename}")
            
        except KeyboardInterrupt:
            print("\nExiting...")
            break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()