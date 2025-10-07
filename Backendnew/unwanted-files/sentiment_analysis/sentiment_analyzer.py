# import os
# import json
# from datetime import datetime
# from typing import List, Dict, Any, Tuple
# import logging
# import re

# # Set up logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# try:
#     from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
#     import torch
#     HAS_TRANSFORMERS = True
# except ImportError:
#     logger.warning("transformers not installed. Install with: pip install transformers torch")
#     HAS_TRANSFORMERS = False

# try:
#     from textblob import TextBlob
#     HAS_TEXTBLOB = True
# except ImportError:
#     logger.warning("textblob not installed. Install with: pip install textblob")
#     HAS_TEXTBLOB = False

# try:
#     from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
#     HAS_VADER = True
# except ImportError:
#     logger.warning("vaderSentiment not installed. Install with: pip install vaderSentiment")
#     HAS_VADER = False

# class EnhancedSentimentAnalyzer:
#     def __init__(self, model_type="ensemble"):
#         """
#         Initialize enhanced sentiment analyzer
        
#         Args:
#             model_type: "textblob", "vader", "transformers", or "ensemble" (combines multiple)
#         """
#         self.model_type = model_type
#         self.transformer_analyzer = None
#         self.vader_analyzer = None
        
#         # Neutral keywords that indicate neutral sentiment
#         self.neutral_keywords = {
#             'okay', 'ok', 'fine', 'average', 'decent', 'fair', 'mediocre', 'so-so',
#             'normal', 'standard', 'typical', 'usual', 'regular', 'moderate',
#             'acceptable', 'tolerable', 'passable', 'adequate', 'sufficient',
#             'alright', 'reasonable', 'nothing', 'meh', 'expected', 'basic'
#         }
        
#         # Strong neutral phrases that should override other signals
#         self.strong_neutral_phrases = {
#             'nothing special', 'does the job', 'gets the job done', 
#             'fair quality', 'average quality', 'decent enough',
#             'could be better', 'could be worse', 'not bad not good',
#             'it works', 'it\'s fine', 'it\'s okay', 'pretty standard',
#             'meets expectations', 'basic expectations', 'as expected',
#             'fair for the price', 'decent for the price', 'reasonable price'
#         }
        
#         # Initialize models based on type
#         if model_type in ["transformers", "ensemble"] and HAS_TRANSFORMERS:
#             self._init_transformer_model()
        
#         if model_type in ["vader", "ensemble"] and HAS_VADER:
#             self.vader_analyzer = SentimentIntensityAnalyzer()
#             logger.info("VADER analyzer initialized")
        
#         if model_type == "textblob" and not HAS_TEXTBLOB:
#             raise ImportError("Please install textblob: pip install textblob")
    
#     def _init_transformer_model(self):
#         """Initialize transformer model with better neutral detection"""
#         try:
#             logger.info("Loading transformer model...")
#             model_name = "cardiffnlp/twitter-roberta-base-sentiment-latest"
#             tokenizer = AutoTokenizer.from_pretrained(model_name)
#             model = AutoModelForSequenceClassification.from_pretrained(model_name)
#             self.transformer_analyzer = pipeline(
#                 "sentiment-analysis",
#                 model=model,
#                 tokenizer=tokenizer,
#                 return_all_scores=True,
#                 device=0 if torch.cuda.is_available() else -1
#             )
#             logger.info("Transformer model loaded successfully!")
#         except Exception as e:
#             logger.error(f"Failed to load transformer model: {e}")
#             self.transformer_analyzer = None
    
#     def _preprocess_text(self, text: str) -> str:
#         """Clean and preprocess text for better analysis"""
#         if not text:
#             return ""
        
#         # Remove extra whitespace
#         text = re.sub(r'\s+', ' ', text.strip())
        
#         # Handle common abbreviations and slang
#         replacements = {
#             r'\bu\b': 'you',
#             r'\bur\b': 'your',
#             r'\btho\b': 'though',
#             r'\bcuz\b': 'because',
#             r'\btbh\b': 'to be honest',
#             r'\bngl\b': 'not gonna lie',
#             r'\bmeh\b': 'mediocre',  # meh is often neutral
#         }
        
#         for pattern, replacement in replacements.items():
#             text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
        
#         return text
    
#     def _has_neutral_indicators(self, text: str) -> Tuple[bool, float]:
#         """Check if text contains neutral sentiment indicators
        
#         Returns:
#             tuple: (has_neutral_indicators, neutral_strength)
#                   neutral_strength: 0.0 (weak) to 1.0 (strong override)
#         """
#         text_lower = text.lower()
#         neutral_strength = 0.0
        
#         # Check for strong neutral phrases first (these should override)
#         for phrase in self.strong_neutral_phrases:
#             if phrase in text_lower:
#                 return True, 1.0  # Strong override
        
#         # Check for neutral keywords
#         neutral_word_count = sum(1 for keyword in self.neutral_keywords if keyword in text_lower)
#         if neutral_word_count > 0:
#             neutral_strength = min(neutral_word_count * 0.3, 0.8)
        
#         # Check for neutral patterns
#         neutral_patterns = [
#             r'\bit\'s okay\b', r'\bnot bad\b', r'\bcould be worse\b',
#             r'\bit\'s fine\b', r'\bit works\b', r'\bnothing to complain\b',
#             r'\bmeets basic\b', r'\bpretty standard\b', r'\bas expected\b'
#         ]
        
#         pattern_matches = sum(1 for pattern in neutral_patterns if re.search(pattern, text_lower))
#         if pattern_matches > 0:
#             neutral_strength = max(neutral_strength, min(pattern_matches * 0.4, 0.9))
        
#         # Check for qualifying phrases that reduce sentiment intensity
#         qualifying_phrases = [
#             'but', 'however', 'although', 'though', 'for the price',
#             'considering', 'given that', 'all things considered'
#         ]
        
#         if any(phrase in text_lower for phrase in qualifying_phrases):
#             neutral_strength = max(neutral_strength, 0.4)
        
#         return neutral_strength > 0.2, neutral_strength
    
#     def _analyze_with_textblob(self, text: str) -> Dict[str, Any]:
#         """Analyze sentiment using TextBlob with improved neutral detection"""
#         blob = TextBlob(text)
#         polarity = blob.sentiment.polarity
#         subjectivity = blob.sentiment.subjectivity
        
#         # Check for neutral indicators first
#         has_neutral, neutral_strength = self._has_neutral_indicators(text)
        
#         # If strong neutral indicators are found, override the classification
#         if neutral_strength >= 0.8:
#             return {
#                 "label": "neutral",
#                 "score": 0.0,
#                 "confidence": 0.8,
#                 "subjectivity": subjectivity,
#                 "override_reason": "strong_neutral_phrases"
#             }
        
#         # Adjust thresholds based on subjectivity and neutral indicators
#         base_threshold = 0.1
#         subjectivity_adjustment = 0.1 * (1 - subjectivity)  # Lower subjectivity = higher threshold
#         neutral_adjustment = neutral_strength * 0.3  # Neutral indicators increase threshold
        
#         threshold = base_threshold + subjectivity_adjustment + neutral_adjustment
#         threshold = min(threshold, 0.4)  # Cap at 0.4
        
#         # Apply neutral bias for moderate neutral indicators
#         if has_neutral and neutral_strength >= 0.4:
#             # Dampen the polarity score
#             adjusted_polarity = polarity * (1 - neutral_strength * 0.6)
#         else:
#             adjusted_polarity = polarity
        
#         # Classify based on adjusted thresholds
#         if abs(adjusted_polarity) <= threshold:
#             label = "neutral"
#             score = adjusted_polarity * 0.5  # Reduce score for neutral
#         elif adjusted_polarity > threshold:
#             label = "positive"
#             score = adjusted_polarity
#         else:
#             label = "negative" 
#             score = adjusted_polarity
        
#         confidence = min(abs(polarity) + subjectivity/2 + neutral_strength/2, 1.0)
        
#         return {
#             "label": label,
#             "score": score,
#             "confidence": confidence,
#             "subjectivity": subjectivity,
#             "neutral_strength": neutral_strength,
#             "threshold_used": threshold
#         }
    
#     def _analyze_with_vader(self, text: str) -> Dict[str, Any]:
#         """Analyze sentiment using VADER"""
#         scores = self.vader_analyzer.polarity_scores(text)
#         compound = scores['compound']
        
#         # VADER is better at neutral detection
#         if scores['neu'] > 0.6 or abs(compound) <= 0.1:
#             label = "neutral"
#             score = compound * 0.5
#         elif compound >= 0.05:
#             label = "positive"
#             score = compound
#         else:
#             label = "negative"
#             score = compound
        
#         return {
#             "label": label,
#             "score": score,
#             "confidence": max(scores['pos'], scores['neu'], scores['neg']),
#             "detailed_scores": scores
#         }
    
#     def _analyze_with_transformers(self, text: str) -> Dict[str, Any]:
#         """Analyze sentiment using transformer model"""
#         if not self.transformer_analyzer:
#             return None
        
#         try:
#             results = self.transformer_analyzer(text[:512])[0]
            
#             # Convert to standardized format
#             label_confidence = {}
#             for result in results:

#                 mapped_label = result['label'].lower()
#                 label_confidence[mapped_label] = result['score']
            
#             # Get the highest confidence prediction
#             best_label = max(label_confidence.keys(), key=lambda x: label_confidence[x])
#             best_score = label_confidence[best_label]
            
#             # Convert to score (-1 to 1 scale)
#             if best_label == 'positive':
#                 score = best_score
#             elif best_label == 'negative':
#                 score = -best_score
#             else:
#                 score = 0.0
            
#             return {
#                 "label": best_label,
#                 "score": score,
#                 "confidence": best_score,
#                 "all_scores": label_confidence
#             }
#         except Exception as e:
#             logger.error(f"Transformer analysis failed: {e}")
#             return None
    
#     def analyze_text(self, text: str) -> Dict[str, Any]:
#         """
#         Analyze sentiment of a single text with improved neutral detection
#         """
#         if not text or not text.strip():
#             return {"label": "neutral", "score": 0.0, "confidence": 0.0}
        
#         text = self._preprocess_text(text)
#         results = {}
        
#         if self.model_type == "ensemble":
#             # Use multiple models and combine results
#             models_used = []
            
#             # TextBlob analysis
#             if HAS_TEXTBLOB:
#                 results['textblob'] = self._analyze_with_textblob(text)
#                 models_used.append('textblob')
            
#             # VADER analysis
#             if self.vader_analyzer:
#                 results['vader'] = self._analyze_with_vader(text)
#                 models_used.append('vader')
            
#             # Transformer analysis
#             transformer_result = self._analyze_with_transformers(text)
#             if transformer_result:
#                 results['transformer'] = transformer_result
#                 models_used.append('transformer')
            
#             # Combine results using weighted voting
#             return self._combine_results(results, models_used)
        
#         elif self.model_type == "transformers":
#             result = self._analyze_with_transformers(text)
#             return result if result else self._analyze_with_textblob(text)
        
#         elif self.model_type == "vader":
#             return self._analyze_with_vader(text)
        
#         else:  # textblob
#             return self._analyze_with_textblob(text)
    
#     def _combine_results(self, results: Dict, models_used: List[str]) -> Dict[str, Any]:
#         """Combine results from multiple models with weighted voting and neutral bias"""
#         if not results:
#             return {"label": "neutral", "score": 0.0, "confidence": 0.0}
        
#         # Check if any model detected strong neutral indicators
#         for model_name, result in results.items():
#             if result.get('override_reason') == 'strong_neutral_phrases':
#                 return {
#                     "label": "neutral",
#                     "score": 0.0,
#                     "confidence": 0.9,
#                     "model_results": results,
#                     "override_reason": "strong_neutral_detected"
#                 }
        
#         # Weights for different models
#         model_weights = {
#             'transformer': 0.4,  # Reduced weight
#             'vader': 0.4,       # Increased weight (better for neutral)
#             'textblob': 0.2
#         }
        
#         # Collect votes and scores
#         label_votes = {'positive': 0, 'negative': 0, 'neutral': 0}
#         weighted_score = 0
#         total_weight = 0
#         total_confidence = 0
#         neutral_strength_sum = 0
        
#         for model_name, result in results.items():
#             if model_name in model_weights:
#                 weight = model_weights[model_name]
#                 label_votes[result['label']] += weight
#                 weighted_score += result['score'] * weight
#                 total_confidence += result['confidence'] * weight
#                 total_weight += weight
                
#                 # Accumulate neutral strength if available
#                 if 'neutral_strength' in result:
#                     neutral_strength_sum += result['neutral_strength']
        
#         avg_neutral_strength = neutral_strength_sum / len(results) if results else 0
        
#         # Apply strong neutral bias
#         neutral_support = label_votes['neutral'] / total_weight if total_weight > 0 else 0
#         avg_score = weighted_score / total_weight if total_weight > 0 else 0
        
#         # Enhanced neutral detection logic
#         if (neutral_support >= 0.25 or  # At least 25% neutral votes
#             (avg_neutral_strength >= 0.4 and abs(avg_score) < 0.3) or  # Strong neutral indicators
#             (neutral_support >= 0.15 and abs(avg_score) < 0.15)):  # Moderate neutral + low score
            
#             final_label = 'neutral'
#             final_score = avg_score * 0.3  # Heavily dampen score
#         else:
#             # Determine final label normally
#             final_label = max(label_votes.keys(), key=lambda x: label_votes[x])
#             final_score = avg_score
        
#         return {
#             "label": final_label,
#             "score": final_score,
#             "confidence": total_confidence / total_weight if total_weight > 0 else 0,
#             "model_results": results,
#             "label_votes": label_votes,
#             "neutral_strength": avg_neutral_strength
#         }
    
#     def analyze_review_with_comments(self, review_text: str, comments: List[str], 
#                                    review_weight: float = 0.7) -> Dict[str, Any]:
#         """
#         Analyze sentiment of a review and its comments with improved neutral detection
#         """
#         # Analyze main review
#         review_sentiment = self.analyze_text(review_text)
        
#         # Analyze comments
#         comment_sentiments = []
#         for comment in comments:
#             if comment.strip():  # Only analyze non-empty comments
#                 comment_sentiments.append(self.analyze_text(comment))
        
#         # Calculate comment statistics
#         if comment_sentiments:
#             # Count labels
#             label_counts = {'positive': 0, 'negative': 0, 'neutral': 0}
#             total_score = 0
#             total_confidence = 0
            
#             for sentiment in comment_sentiments:
#                 label_counts[sentiment['label']] += 1
#                 total_score += sentiment['score']
#                 total_confidence += sentiment['confidence']
            
#             avg_comment_score = total_score / len(comment_sentiments)
#             avg_comment_confidence = total_confidence / len(comment_sentiments)
            
#             # Determine dominant comment sentiment
#             dominant_comment_label = max(label_counts.keys(), key=lambda x: label_counts[x])
#         else:
#             avg_comment_score = 0.0
#             avg_comment_confidence = 0.0
#             label_counts = {'positive': 0, 'negative': 0, 'neutral': 0}
#             dominant_comment_label = 'neutral'
        
#         # Calculate weighted overall score
#         comment_weight = 1.0 - review_weight
#         overall_score = (review_weight * review_sentiment['score'] + 
#                         comment_weight * avg_comment_score)
        
#         # Determine overall label with neutral bias
#         if abs(overall_score) <= 0.15:
#             overall_label = "neutral"
#         elif overall_score > 0.15:
#             overall_label = "positive"
#         else:
#             overall_label = "negative"
        
#         # If review and comments disagree significantly, lean towards neutral
#         if (review_sentiment['label'] != dominant_comment_label and 
#             review_sentiment['label'] != 'neutral' and 
#             dominant_comment_label != 'neutral'):
#             overall_label = "neutral"
#             overall_score *= 0.5
        
#         return {
#             "overall": {
#                 "label": overall_label,
#                 "score": overall_score,
#                 "confidence": (review_sentiment['confidence'] + avg_comment_confidence) / 2
#             },
#             "review": review_sentiment,
#             "comments": {
#                 "individual": comment_sentiments,
#                 "average_score": avg_comment_score,
#                 "label_distribution": label_counts,
#                 "dominant_label": dominant_comment_label,
#                 "count": len(comment_sentiments)
#             },
#             "analysis_metadata": {
#                 "model_type": self.model_type,
#                 "timestamp": datetime.now().isoformat(),
#                 "review_weight": review_weight
#             }
#         }

# def debug_specific_case():
#     """Debug the specific problematic neutral case"""
#     print("=== Debugging Specific Neutral Case ===\n")
    
#     # The problematic review
#     problem_text = "It's okay, nothing special but does the job. Fair quality for the price."
    
#     analyzer = EnhancedSentimentAnalyzer("ensemble")
#     result = analyzer.analyze_text(problem_text)
    
#     print(f"Text: \"{problem_text}\"")
#     print(f"Final Result: {result['label'].upper()} (score: {result['score']:.3f})")
    
#     if 'model_results' in result:
#         print("\nIndividual Model Results:")
#         for model, res in result['model_results'].items():
#             print(f"  {model}: {res['label']} (score: {res['score']:.3f})")
#             if 'neutral_strength' in res:
#                 print(f"    Neutral strength: {res['neutral_strength']:.3f}")
#             if 'threshold_used' in res:
#                 print(f"    Threshold used: {res['threshold_used']:.3f}")
    
#     if 'label_votes' in result:
#         print(f"\nLabel votes: {result['label_votes']}")
    
#     # Test individual components
#     print(f"\nNeutral strength: {result.get('neutral_strength', 'N/A')}")
    
#     # Test just TextBlob
#     print("\n--- TextBlob Only Test ---")
#     textblob_analyzer = EnhancedSentimentAnalyzer("textblob")
#     textblob_result = textblob_analyzer.analyze_text(problem_text)
#     print(f"TextBlob: {textblob_result['label']} (score: {textblob_result['score']:.3f})")

# def run_test_examples():
#     """Test the analyzer with various neutral examples"""
#     test_cases = [
#         "It's okay, nothing special but does the job.",
#         "It's okay, nothing special but does the job. Fair quality for the price.",  # The problematic one
#         "The product is fine, average quality for the price.",
#         "Meh, it works but could be better.",
#         "Not bad, not great either. Pretty standard.",
#         "It's decent enough, gets the job done.",
#         "Average experience, nothing to complain about.",
#         "Fair product, meets basic expectations.",
#         "This is absolutely terrible! Worst purchase ever!",
#         "Amazing product! Love it so much, highly recommend!",
#         "The weather is sunny today.",  # Factual/neutral
#         "I received the package on time.",  # Neutral fact
#         "Does the job fine, nothing more nothing less.",
#         "It works as expected, pretty standard quality."
#     ]
    
#     print("=== Testing Enhanced Sentiment Analyzer ===\n")
    
#     # Test with ensemble method
#     analyzer = EnhancedSentimentAnalyzer("ensemble")
    
#     for i, text in enumerate(test_cases, 1):
#         result = analyzer.analyze_text(text)
#         print(f"{i}. \"{text}\"")
#         print(f"   Prediction: {result['label'].upper()} (score: {result['score']:.3f}, confidence: {result['confidence']:.3f})")
#         if 'neutral_strength' in result:
#             print(f"   Neutral strength: {result['neutral_strength']:.3f}")
#         if 'model_results' in result:
#             model_labels = [r['label'] for r in result['model_results'].values()]
#             print(f"   Model agreement: {len(set(model_labels)) == 1} ({model_labels})")
#         print()

# def main():
#     """
#     Enhanced main function with better testing and examples
#     """
#     print("=== Enhanced Social Media Sentiment Analysis System ===\n")
    
#     # Initialize analyzer
#     print("Initializing enhanced sentiment analyzer...")
    
#     try:
#         analyzer = EnhancedSentimentAnalyzer("ensemble")
#         print("✅ Using ensemble method (most accurate)")
#     except Exception as e:
#         print(f"❌ Error initializing analyzer: {e}")
#         return
    
#     # Run test examples first
#     run_test_examples()
    
#     # Continue with original examples...
#     print("\n=== Debugging Specific Case First ===")
#     debug_specific_case()
    
#     print("\n=== Original Sample Reviews Analysis ===\n")
    
#     sample_reviews = [
#         {
#             "review": "The product works as described and performs its basic functions adequately. It has a straightforward design and is relatively easy to use, though it lacks some advanced features that could enhance the experience. The price seems fair for what it offers, but there are similar options available in the market. Overall, it gets the job done without standing out in any particular way.",
#             "comments": [
#                 "I agree, totally worth it!",
#                 "Really? I had a different experience",
#                 "Same here, love it!"
#             ]
#         },
#         {
#             "review": "Terrible quality, broke after one day. Very disappointed.",
#             "comments": [
#                 "Sorry to hear that :(",
#                 "Maybe contact customer service?",
#                 "I had the same issue"
#             ]
#         },
#         {
#             "review": "It's okay, nothing special but does the job. Fair quality for the price.",
#             "comments": [
#                 "Fair enough, that's reasonable",
#                 "For the price it's decent",
#                 "Yeah, pretty average overall"
#             ]
#         }
#     ]
    
#     for i, review_data in enumerate(sample_reviews, 1):
#         print(f"--- Review {i} ---")
#         print(f"Review: {review_data['review']}")
#         print(f"Comments: {review_data['comments']}")
        
#         result = analyzer.analyze_review_with_comments(
#             review_data['review'], 
#             review_data['comments']
#         )
        
#         overall = result['overall']
#         print(f"Overall Sentiment: {overall['label'].upper()} (score: {overall['score']:.3f})")
        
#         review_sent = result['review']
#         print(f"Review Only: {review_sent['label']} ({review_sent['score']:.3f})")
        
#         comments_data = result['comments']
#         print(f"Comments: {comments_data['dominant_label']} dominant, avg: {comments_data['average_score']:.3f}")
#         print(f"Comment distribution: {comments_data['label_distribution']}")
#         print()

# if __name__ == "__main__":
#     main()