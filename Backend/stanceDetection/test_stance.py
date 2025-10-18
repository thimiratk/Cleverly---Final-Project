#!/usr/bin/env python3
"""
Test script for the stance detection service
"""

import requests
import json

def test_stance_detection():
    """Test the stance detection endpoints"""
    base_url = "http://localhost:8004"
    
    # Test data
    review_text = "This product is amazing! The battery life is excellent and the camera quality is outstanding. Highly recommended!"
    
    test_comments = [
        "I totally agree! I bought this and love it too.",  # Should be AGREE
        "I disagree completely. The battery died after 2 hours.",  # Should be DISAGREE
        "What's the price of this product?",  # Should be NEUTRAL
        "Absolutely! Best purchase I've made this year.",  # Should be AGREE
        "The camera is terrible, I returned mine.",  # Should be DISAGREE
    ]
    
    print("Testing Stance Detection Service")
    print("=" * 50)
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health")
        print(f"Health check: {response.status_code}")
        if response.status_code == 200:
            print(f"Health response: {response.json()}")
        print()
    except requests.exceptions.ConnectionError:
        print("❌ Service is not running. Please start the stance detection service first.")
        return
    
    # Test single stance detection
    print("Testing single stance detection:")
    print("-" * 30)
    
    for i, comment in enumerate(test_comments):
        try:
            payload = {
                "review_text": review_text,
                "comment_text": comment
            }
            
            response = requests.post(f"{base_url}/detect-stance", json=payload)
            
            if response.status_code == 200:
                result = response.json()
                print(f"Comment {i+1}: '{comment[:50]}...'")
                print(f"  Stance: {result['stance']}")
                print(f"  Confidence: {result['confidence']:.2f}")
                print(f"  Reasoning: {result['reasoning']}")
                print()
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"❌ Error testing comment {i+1}: {e}")
    
    # Test batch stance detection
    print("Testing batch stance detection:")
    print("-" * 30)
    
    try:
        payload = {
            "review_text": review_text,
            "comments": test_comments
        }
        
        response = requests.post(f"{base_url}/detect-stance-batch", json=payload)
        
        if response.status_code == 200:
            result = response.json()
            print(f"Batch analysis of {len(test_comments)} comments:")
            
            for i, stance_result in enumerate(result['results']):
                print(f"Comment {i+1}: {stance_result.get('stance', 'ERROR')}")
                if 'error' in stance_result:
                    print(f"  Error: {stance_result['error']}")
                else:
                    print(f"  Confidence: {stance_result.get('confidence', 0):.2f}")
            print()
        else:
            print(f"❌ Batch test failed with status {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Error in batch test: {e}")

if __name__ == "__main__":
    test_stance_detection()