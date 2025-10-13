import { fetch, Response } from 'undici';

const defaultRuleEndpoint = 'http://localhost:8001/detect';
const defaultMlEndpoint = 'http://localhost:8002/detection';
const defaultSentimentEndpoint = 'http://localhost:8003/sentiment';
const timeoutMs = Number(process.env.REVIEW_ANALYSIS_TIMEOUT_MS ?? 8000);

const ruleEndpoint = normalizeEndpoint(
  process.env.RULE_FRAUD_ENDPOINT ?? process.env.RULE_FRAUD_SERVICE_URL ?? defaultRuleEndpoint,
);
const mlEndpoint = normalizeEndpoint(
  process.env.ML_FRAUD_ENDPOINT ?? process.env.ML_FRAUD_SERVICE_URL ?? defaultMlEndpoint,
);
const sentimentEndpoint = normalizeEndpoint(
  process.env.SENTIMENT_ENDPOINT ?? process.env.SENTIMENT_SERVICE_URL ?? defaultSentimentEndpoint,
);

type UnknownRecord = Record<string, unknown>;

export interface ReviewAnalysisInput {
  reviewText: string;
  rating: number;
  userId: string;
  timestamp?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  accountCreated?: string | null;
}

export interface ReviewAnalysisOutput {
  ruleFraudResult?: unknown;
  mlFraudResult?: unknown;
  sentimentResult?: unknown;
  errors: string[];
  completedAt?: Date;
}

export async function runReviewAnalysis(input: ReviewAnalysisInput): Promise<ReviewAnalysisOutput> {
  const errors: string[] = [];
  const timestamp = input.timestamp ?? new Date().toISOString();

  const [ruleFraudResult, mlFraudResult, sentimentResult] = await Promise.all([
    ruleEndpoint
      ? callService(ruleEndpoint, buildRulePayload(input, timestamp), 'Rule fraud detection', errors)
      : Promise.resolve(undefined),
    mlEndpoint
      ? callService(mlEndpoint, { text: input.reviewText }, 'ML fraud detection', errors)
      : Promise.resolve(undefined),
    sentimentEndpoint
      ? callService(sentimentEndpoint, { text: input.reviewText }, 'Sentiment analysis', errors)
      : Promise.resolve(undefined),
  ]);

  const hasAnyResult =
    ruleFraudResult !== undefined || mlFraudResult !== undefined || sentimentResult !== undefined;

  return {
    ruleFraudResult,
    mlFraudResult,
    sentimentResult,
    errors,
    completedAt: hasAnyResult || errors.length > 0 ? new Date() : undefined,
  };
}

async function callService(
  url: string,
  payload: UnknownRecord,
  actionLabel: string,
  errors: string[],
): Promise<unknown | undefined> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const rawBody = await readBody(response);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}${rawBody ? ` - ${truncate(String(rawBody))}` : ''}`);
    }

    return rawBody;
  } catch (error) {
    errors.push(`${actionLabel} failed: ${getErrorMessage(error)}`);
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

function buildRulePayload(input: ReviewAnalysisInput, timestamp: string): UnknownRecord {
  return {
    text: input.reviewText,
    user_id: input.userId,
    rating: input.rating,
    timestamp,
    ip_address: input.ipAddress ?? undefined,
    user_agent: input.userAgent ?? undefined,
    account_created: input.accountCreated ?? undefined,
  };
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
