/**
 * Chat API service — DEMO VERSION (no real API calls).
 * Returns static mock data to simulate the Kotwal gateway experience.
 */
import {
  MOCK_CHAT_MODELS,
  MOCK_CHAT_RESPONSES,
  MOCK_WARN_RESPONSE,
  MOCK_WARN_NETWORK_RESPONSE,
  MOCK_BLOCK_API_KEY_RESPONSE,
  MOCK_BLOCK_SSN_RESPONSE,
  SAMPLE_PROMPTS,
} from '@/lib/mockData';

export interface ChatModel {
  id: string;
  name: string;
  provider: string;
}

export interface ChatHistoryMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string | Date;
}

export interface ChatSession {
  sessionId: string;
  title?: string;
  messages?: ChatHistoryMessage[];
  startedAt?: string | Date;
  lastMessageAt?: string | Date;
  messageCount?: number;
}

export type DetectionAction = 'ALLOW' | 'WARN' | 'REDACT' | 'BLOCK';

export interface DetectionFinding {
  category?: string;
  subtype?: string;
  confidence?: number;
  value?: string;
  start?: number;
  end?: number;
}

export interface DetectionContribution {
  category?: string;
  subtype?: string;
  weight?: number;
}

export interface DetectionSummary {
  action: DetectionAction;
  score?: number;
  decisionReasons?: string[];
  categoriesPresent?: string[];
  findings?: DetectionFinding[];
  contributions?: DetectionContribution[];
  policyVersion?: string;
}

export interface DetectionInterceptBody extends DetectionSummary {
  error?: string;
  canOverride?: boolean;
  requireOverrideReason?: boolean;
}

/**
 * Thrown when a prompt triggers WARN or BLOCK detection.
 */
export class SensitiveDataInterceptError extends Error {
  details: DetectionInterceptBody;
  status: number;

  constructor(message: string, status: number, details: DetectionInterceptBody) {
    super(message);
    this.name = 'SensitiveDataInterceptError';
    this.status = status;
    this.details = details;
  }

  get isBlock(): boolean { return this.details.action === 'BLOCK'; }
  get isWarn(): boolean { return this.details.action === 'WARN'; }
  get canOverride(): boolean { return !!this.details.canOverride; }
  get requireOverrideReason(): boolean { return !!this.details.requireOverrideReason; }
}

// ─── Mock helpers ────────────────────────────────────────────────────

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const matchesSamplePrompt = (message: string, category: 'warn' | 'block'): string | null => {
  const normalised = message.toLowerCase().trim();
  for (const sp of SAMPLE_PROMPTS) {
    if (sp.category === category && normalised.includes(sp.text.toLowerCase().slice(0, 40))) {
      return sp.text;
    }
  }
  return null;
};

// ─── Exported API functions ──────────────────────────────────────────

interface FetchChatResponseArgs {
  modelId: string;
  message: string;
  sessionId: string;
  overridePII?: boolean;
  overrideReason?: string;
}

export const fetchChatResponse = async ({
  message,
  overridePII = false,
}: FetchChatResponseArgs): Promise<{ content: string; detection?: DetectionSummary }> => {
  await delay(800 + Math.random() * 600);

  // If override is set, skip detection
  if (!overridePII) {
    // Check for BLOCK prompts
    if (matchesSamplePrompt(message, 'block') || /sk-[a-z]+-[a-z0-9]{20,}/i.test(message)) {
      const details = message.toLowerCase().includes('ssn') || /\d{3}-\d{2}-\d{4}/.test(message)
        ? MOCK_BLOCK_SSN_RESPONSE
        : MOCK_BLOCK_API_KEY_RESPONSE;
      throw new SensitiveDataInterceptError(details.error, 422, details);
    }

    // Check for WARN prompts
    if (matchesSamplePrompt(message, 'warn') || /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(message)) {
      const details = message.toLowerCase().includes('10.0') || message.toLowerCase().includes('internal')
        ? MOCK_WARN_NETWORK_RESPONSE
        : MOCK_WARN_RESPONSE;
      throw new SensitiveDataInterceptError(details.error, 409, details);
    }
  }

  // Safe prompt — return mock response
  const content = message.toLowerCase().includes('rate limit')
    ? MOCK_CHAT_RESPONSES.general
    : MOCK_CHAT_RESPONSES.safe;

  return { content };
};

export const fetchChatModels = async (): Promise<ChatModel[]> => {
  await delay(300);
  return MOCK_CHAT_MODELS;
};

export const fetchChatSessions = async (): Promise<ChatSession[]> => {
  await delay(200);
  return [];
};

export const fetchChatSession = async (_sessionId: string): Promise<ChatSession | null> => {
  await delay(200);
  return null;
};

// Back-compat aliases
export { SensitiveDataInterceptError as SensitiveDataBlockedError };
export type PiiDetectionDetails = DetectionInterceptBody;
export type PiiDetectionFinding = DetectionFinding;

