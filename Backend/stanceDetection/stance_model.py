from __future__ import annotations

import logging
import json
import google.generativeai as genai
from typing import Dict, Any, Literal
from config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

class StanceDetectionModel:
    """Stance detection model using Google Gemini API to analyze agreement/disagreement in comments."""
    
    def __init__(self):
        if not GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Define the prompt template for stance detection
        self.prompt_template = """
Analyze the stance of the given comment/reply towards the original review. 
Determine whether the comment/reply AGREES, DISAGREES, or is NEUTRAL towards the review.

Original Review: "{review_text}"

Comment/Reply: "{comment_text}"

Guidelines:
- AGREE: The comment supports, endorses, or expresses similar opinions to the review
- DISAGREE: The comment contradicts, criticizes, or expresses opposing views to the review  
- NEUTRAL: The comment is informational, asks questions, or doesn't take a clear stance

Respond with ONLY a JSON object in this exact format:
{{"stance": "AGREE|DISAGREE|NEUTRAL", "confidence": 0.85, "reasoning": "Brief explanation"}}
"""
    
    def detect_stance(self, review_text: str, comment_text: str) -> Dict[str, Any]:
        """
        Detect stance of a comment/reply towards a review.
        
        Args:
            review_text: The original review text
            comment_text: The comment or reply text
            
        Returns:
            Dictionary with stance, confidence, and reasoning
        """
        if not review_text or not comment_text:
            return {
                "stance": "NEUTRAL",
                "confidence": 0.0,
                "reasoning": "Empty input provided"
            }
        
        try:
            # Format the prompt with the actual texts
            formatted_prompt = self.prompt_template.format(
                review_text=review_text.strip()[:1000],  # Limit length
                comment_text=comment_text.strip()[:500]   # Limit length
            )
            
            # Generate response using Gemini
            response = self.model.generate_content(formatted_prompt)
            
            # Parse the JSON response
            response_text = response.text.strip()
            
            # Clean response text - remove any markdown formatting
            if response_text.startswith('```'):
                response_text = response_text.split('\n', 1)[1]
            if response_text.endswith('```'):
                response_text = response_text.rsplit('\n', 1)[0]
            
            # Parse JSON
            result = json.loads(response_text)
            
            # Validate the response structure
            if not all(key in result for key in ['stance', 'confidence', 'reasoning']):
                raise ValueError("Invalid response structure")
            
            # Normalize stance value
            stance = result['stance'].upper()
            if stance not in ['AGREE', 'DISAGREE', 'NEUTRAL']:
                stance = 'NEUTRAL'
            
            # Ensure confidence is a float between 0 and 1
            confidence = float(result['confidence'])
            confidence = max(0.0, min(1.0, confidence))
            
            return {
                "stance": stance,
                "confidence": confidence,
                "reasoning": str(result['reasoning'])[:200]  # Limit reasoning length
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            return {
                "stance": "NEUTRAL",
                "confidence": 0.0,
                "reasoning": "Failed to parse AI response"
            }
        except Exception as e:
            logger.error(f"Error in stance detection: {e}")
            return {
                "stance": "NEUTRAL", 
                "confidence": 0.0,
                "reasoning": f"Error: {str(e)[:100]}"
            }
    
    def batch_detect_stance(self, review_text: str, comments: list[str]) -> list[Dict[str, Any]]:
        """
        Detect stance for multiple comments against the same review.
        
        Args:
            review_text: The original review text
            comments: List of comment texts
            
        Returns:
            List of dictionaries with stance, confidence, and reasoning for each comment
        """
        results = []
        for comment in comments:
            result = self.detect_stance(review_text, comment)
            results.append(result)
        return results
    
    def get_model_info(self) -> Dict[str, str]:
        """Return information about the model."""
        return {
            "model_name": "Google Gemini 2.5 Flash",
            "version": "1.0.0",
            "description": "Stance detection using Google Gemini API",
            "supported_stances": ["AGREE", "DISAGREE", "NEUTRAL"]
        }