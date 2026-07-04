/**
 * Billing API service — DEMO VERSION (no real API calls).
 */
import { MOCK_BILLING_RECORDS, MOCK_BILLING_AGGREGATE } from '@/lib/mockData';

export interface BillingRecord {
  id: string;
  description?: string;
  amount?: number;
  currency?: string;
  tokens?: number;
  createdAt: string;
  periodStart?: string;
  periodEnd?: string;
  totalCost?: number;
  status?: string;
  tenantId?: string;
}

export interface BillingAggregatePayload {
  from: string;
  to: string;
}

export interface BillingAggregate {
  totalAmount?: number;
  totalTokens?: number;
  currency?: string;
  [key: string]: string | number | undefined;
}

export interface BillingStatementAggregatePayload {
  periodStart: string;
  periodEnd: string;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const fetchBillingRecords = async (_authToken?: string): Promise<BillingRecord[]> => {
  void _authToken;
  await delay(250);
  return MOCK_BILLING_RECORDS;
};

export const fetchBillingAggregate = async (
  _payload: BillingAggregatePayload,
  _authToken?: string,
): Promise<BillingAggregate | null> => {
  void _authToken;
  await delay(200);
  return MOCK_BILLING_AGGREGATE;
};

export const fetchBillingStatementAggregate = async (
  _payload: BillingStatementAggregatePayload,
  _authToken?: string,
): Promise<BillingRecord | null> => {
  void _authToken;
  await delay(200);
  return MOCK_BILLING_RECORDS[0];
};

export const fetchBillingAggregateMonthly = async (
  _authToken?: string,
): Promise<BillingAggregate | null> => {
  void _authToken;
  await delay(200);
  return MOCK_BILLING_AGGREGATE;
};
