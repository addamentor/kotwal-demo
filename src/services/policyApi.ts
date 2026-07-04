/**
 * Policy admin API service — DEMO VERSION (no real API calls).
 */
import { MOCK_POLICY, MOCK_POLICY_DEFAULTS } from '@/lib/mockData';

export type DetectionAction = 'ALLOW' | 'WARN' | 'REDACT' | 'BLOCK';
export type RedactionStrategy = 'TOKEN' | 'MASK' | 'HASH' | 'FAKE';

export interface PolicyDocument {
  version?: number;
  jurisdiction?: string;
  preset?: string | null;
  enabledCategories?: string[];
  severity?: Record<string, number>;
  thresholds?: { warn?: number; block?: number };
  criticalConfidenceFloor?: number;
  quasiIdBonus?: number;
  categoryAction?: Record<string, DetectionAction>;
  redactionStrategy?: Record<string, RedactionStrategy>;
  allowOverride?: boolean;
  requireOverrideReason?: boolean;
  overrideMinRole?: string;
  customRecognizers?: unknown[];
  allowlist?: string[];
  subtypeOverrides?: Record<string, { confidence?: number; severity?: number; action?: DetectionAction }>;
  maxPromptChars?: number;
}

export interface PolicyResponse {
  policyConfig: PolicyDocument | null;
  effective: PolicyDocument;
}

export interface PolicyDefaultsResponse {
  default: PolicyDocument;
  presets: string[];
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const fetchPolicy = async (): Promise<PolicyResponse> => {
  await delay(200);
  return MOCK_POLICY as PolicyResponse;
};

export const fetchPolicyDefaults = async (): Promise<PolicyDefaultsResponse> => {
  await delay(150);
  return MOCK_POLICY_DEFAULTS as PolicyDefaultsResponse;
};

export const replacePolicy = async (_config: PolicyDocument): Promise<{ success: boolean; effective: PolicyDocument }> => {
  await delay(400);
  return { success: true, effective: MOCK_POLICY.effective as PolicyDocument };
};

export const patchPolicy = async (_partial: Partial<PolicyDocument>): Promise<{ success: boolean; effective: PolicyDocument }> => {
  await delay(300);
  return { success: true, effective: MOCK_POLICY.effective as PolicyDocument };
};
