import { fetch, Response } from 'undici';

const defaultStanceEndpoint = 'http://localhost:8004/detect-stance';
const defaultBatchStanceEndpoint = 'http://localhost:8004/detect-stance-batch';
const timeoutMs = Number(process.env.STANCE_ANALYSIS_TIMEOUT_MS ?? 10000);

const stanceEndpoint = normalizeEndpoint(
  process.env.STANCE_ENDPOINT ?? process.env.STANCE_SERVICE_URL ?? defaultStanceEndpoint,
);
const batchStanceEndpoint = normalizeEndpoint(
  process.env.BATCH_STANCE_ENDPOINT ?? process.env.STANCE_SERVICE_URL 
    ? `${process.env.STANCE_SERVICE_URL}/detect-stance-batch` 
    : defaultBatchStanceEndpoint,
);

export interface StanceAnalysisInput {
  reviewText: string;
  commentText: string;
}

export interface BatchStanceAnalysisInput {
  reviewText: string;
  comments: string[];
}

export interface StanceAnalysisResult {
  stance: 'AGREE' | 'DISAGREE' | 'NEUTRAL';
  confidence: number;
  reasoning: string;
}

export interface StanceAnalysisOutput {
  result?: StanceAnalysisResult;
  error?: string;
}

export interface BatchStanceAnalysisOutput {
  results: Array<StanceAnalysisResult | { error: string }>;
  error?: string;
}

export async function analyzeStance(input: StanceAnalysisInput): Promise<StanceAnalysisOutput> {
  console.log('analyzeStance called with:', { reviewText: input.reviewText.substring(0, 50), commentText: input.commentText.substring(0, 50) });
  console.log('Stance endpoint:', stanceEndpoint);
  
  if (!stanceEndpoint) {
    console.error('Stance detection service not configured');
    return { error: 'Stance detection service not configured' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    console.log('Making request to stance service...');
    const response = await fetch(stanceEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        review_text: input.reviewText,
        comment_text: input.commentText,
      }),
      signal: controller.signal,
    });

    console.log('Response status:', response.status);
    const responseBody = await readBody(response);
    console.log('Response body:', responseBody);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}${responseBody ? ` - ${truncate(String(responseBody))}` : ''}`);
    }

    if (typeof responseBody === 'object' && responseBody !== null) {
      const result = responseBody as any;
      console.log('Parsed stance result:', result);
      return {
        result: {
          stance: result.stance,
          confidence: result.confidence,
          reasoning: result.reasoning,
        },
      };
    }

    throw new Error('Invalid response format from stance detection service');
  } catch (error) {
    return { error: `Stance analysis failed: ${getErrorMessage(error)}` };
  } finally {
    clearTimeout(timer);
  }
}

export async function analyzeBatchStance(input: BatchStanceAnalysisInput): Promise<BatchStanceAnalysisOutput> {
  if (!batchStanceEndpoint) {
    return { 
      results: input.comments.map(() => ({ error: 'Stance detection service not configured' })),
      error: 'Stance detection service not configured' 
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs * 2); // Longer timeout for batch

  try {
    const response = await fetch(batchStanceEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        review_text: input.reviewText,
        comments: input.comments,
      }),
      signal: controller.signal,
    });

    const responseBody = await readBody(response);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}${responseBody ? ` - ${truncate(String(responseBody))}` : ''}`);
    }

    if (typeof responseBody === 'object' && responseBody !== null) {
      const result = responseBody as any;
      return {
        results: result.results || [],
      };
    }

    throw new Error('Invalid response format from stance detection service');
  } catch (error) {
    const errorMsg = `Batch stance analysis failed: ${getErrorMessage(error)}`;
    return { 
      results: input.comments.map(() => ({ error: errorMsg })),
      error: errorMsg 
    };
  } finally {
    clearTimeout(timer);
  }
}

async function readBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  try {
    if (isJson) {
      return await response.json();
    }
    const text = await response.text();
    return text.length ? text : undefined;
  } catch (error) {
    throw new Error(`Failed to read response: ${getErrorMessage(error)}`);
  }
}

function normalizeEndpoint(value: string | undefined | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return truncate(error.message);
  }
  return truncate(String(error));
}

function truncate(text: string, maxLength = 200): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}