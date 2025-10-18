/**
 * Gemini AI Service for Stance Detection
 * Uses Google Gemini 2.5 Flash API free tier to analyze comment/reply stance towards reviews
 */


const GEMINI_API_KEY = "AIzaSyDptyJ6mqroMjWgXPFeEplR3DVWE_36Snc";
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

// Debug: Log API key status (only first/last 4 chars for security)
console.log('[Gemini Service] API Key loaded:', GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 4)}...${GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 4)}` : 'NOT FOUND');

/**
 * Detect stance of a comment towards a review
 * @param {string} reviewText - The original review text
 * @param {string} commentText - The comment text
 * @param {string} reviewAuthorId - The ID of the review author (optional)
 * @param {string} commentAuthorId - The ID of the comment author (optional)
 * @returns {Promise<{stance: string, confidence: number, reasoning: string}>}
 */
export async function detectCommentStance(reviewText, commentText, reviewAuthorId = null, commentAuthorId = null) {
  // If user is commenting on their own review, always return NEUTRAL
  if (reviewAuthorId && commentAuthorId && reviewAuthorId === commentAuthorId) {
    console.log('[Gemini Service] Comment author is review author - returning NEUTRAL stance');
    return {
      stance: 'NEUTRAL',
      confidence: 1.0,
      reasoning: 'User commenting on their own review'
    };
  }

  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not configured');
    return {
      stance: 'NEUTRAL',
      confidence: 0.0,
      reasoning: 'API key not configured'
    };
  }

  const prompt = `
Analyze the stance of the given comment towards the original review. 
Determine whether the comment AGREES, DISAGREES, or is NEUTRAL towards the review.

Original Review: "${reviewText}"

Comment: "${commentText}"

Guidelines:
- AGREE: The comment supports, endorses, or expresses similar opinions to the review
- DISAGREE: The comment contradicts, criticizes, or expresses opposing views to the review  
- NEUTRAL: The comment is informational, asks questions, or doesn't take a clear stance

Respond with ONLY a JSON object in this exact format:
{"stance": "AGREE|DISAGREE|NEUTRAL", "confidence": 0.85, "reasoning": "Brief explanation"}
`;

  try {
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 1,
          topP: 1,
          maxOutputTokens: 256,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error('No response from Gemini API');
    }

    // Clean response text - remove any markdown formatting
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }

    // Parse JSON
    const result = JSON.parse(cleanedText);

    // Validate and normalize
    let stance = (result.stance || 'NEUTRAL').toUpperCase();
    if (!['AGREE', 'DISAGREE', 'NEUTRAL'].includes(stance)) {
      stance = 'NEUTRAL';
    }

    let confidence = parseFloat(result.confidence) || 0.0;
    confidence = Math.max(0.0, Math.min(1.0, confidence));

    return {
      stance,
      confidence,
      reasoning: (result.reasoning || '').substring(0, 200)
    };

  } catch (error) {
    console.error('Error detecting stance:', error);
    return {
      stance: 'NEUTRAL',
      confidence: 0.0,
      reasoning: `Error: ${error.message}`
    };
  }
}

/**
 * Detect stance of a reply towards a review (considering parent comment)
 * @param {string} reviewText - The original review text
 * @param {string} parentCommentText - The parent comment text
 * @param {string} replyText - The reply text
 * @param {string} reviewAuthorId - The ID of the review author (optional)
 * @param {string} replyAuthorId - The ID of the reply author (optional)
 * @returns {Promise<{stance: string, confidence: number, reasoning: string}>}
 */
export async function detectReplyStance(reviewText, parentCommentText, replyText, reviewAuthorId = null, replyAuthorId = null) {
  // If user is replying on their own review, always return NEUTRAL
  if (reviewAuthorId && replyAuthorId && reviewAuthorId === replyAuthorId) {
    console.log('[Gemini Service] Reply author is review author - returning NEUTRAL stance');
    return {
      stance: 'NEUTRAL',
      confidence: 1.0,
      reasoning: 'User replying on their own review'
    };
  }

  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not configured');
    return {
      stance: 'NEUTRAL',
      confidence: 0.0,
      reasoning: 'API key not configured'
    };
  }

  const prompt = `
Analyze the stance of the given reply towards the original review. 
The reply is responding to a comment, but we need to determine its stance towards the original review.

Original Review: "${reviewText}"

Parent Comment: "${parentCommentText}"

Reply: "${replyText}"

Guidelines:
- AGREE: The reply ultimately supports or endorses the review's opinion (even if agreeing with a disagreeing comment, consider the final stance towards the review)
- DISAGREE: The reply ultimately contradicts or opposes the review's opinion
- NEUTRAL: The reply is informational, asks questions, or doesn't take a clear stance towards the review

Context: Consider both the parent comment's stance and the reply's relationship to it when determining the final stance towards the review.

Respond with ONLY a JSON object in this exact format:
{"stance": "AGREE|DISAGREE|NEUTRAL", "confidence": 0.85, "reasoning": "Brief explanation"}
`;

  try {
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 1,
          topP: 1,
          maxOutputTokens: 256,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error('No response from Gemini API');
    }

    // Clean response text - remove any markdown formatting
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }

    // Parse JSON
    const result = JSON.parse(cleanedText);

    // Validate and normalize
    let stance = (result.stance || 'NEUTRAL').toUpperCase();
    if (!['AGREE', 'DISAGREE', 'NEUTRAL'].includes(stance)) {
      stance = 'NEUTRAL';
    }

    let confidence = parseFloat(result.confidence) || 0.0;
    confidence = Math.max(0.0, Math.min(1.0, confidence));

    return {
      stance,
      confidence,
      reasoning: (result.reasoning || '').substring(0, 200)
    };

  } catch (error) {
    console.error('Error detecting reply stance:', error);
    return {
      stance: 'NEUTRAL',
      confidence: 0.0,
      reasoning: `Error: ${error.message}`
    };
  }
}

/**
 * Batch detect stance for multiple comments
 * @param {string} reviewText - The original review text
 * @param {string[]} comments - Array of comment texts
 * @returns {Promise<Array<{stance: string, confidence: number, reasoning: string}>>}
 */
export async function detectBatchStance(reviewText, comments) {
  const results = [];
  
  for (const commentText of comments) {
    const result = await detectCommentStance(reviewText, commentText);
    results.push(result);
  }
  
  return results;
}
