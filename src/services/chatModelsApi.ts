/**
 * Chat-models admin API — DEMO VERSION (no real API calls).
 */
import { MOCK_ADMIN_CHAT_MODELS, MOCK_CHAT_MODELS } from '@/lib/mockData';

export interface ChatModelEntry {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'suspended' | string;
  aiModelId?: string;
  tenantId?: string | null;
  AIModelMaster?: {
    id?: string;
    name?: string;
    provider?: string;
    configModel?: string;
    status?: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatModelsAdminResponse {
  models: ChatModelEntry[];
  summary: { total: number; active: number; inactive: number; suspended: number };
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const fetchAdminChatModels = async (): Promise<ChatModelsAdminResponse> => {
  await delay(250);
  return MOCK_ADMIN_CHAT_MODELS as ChatModelsAdminResponse;
};

export const updateChatModelStatus = async (
  _aiModelId: string,
  status: 'active' | 'inactive' | 'suspended',
): Promise<{ message: string; model: ChatModelEntry }> => {
  await delay(300);
  const model = MOCK_ADMIN_CHAT_MODELS.models[0] as ChatModelEntry;
  return { message: `Status updated to ${status} (demo).`, model };
};

export const fetchChatModelsList = async (): Promise<ChatModelEntry[]> => {
  await delay(200);
  return MOCK_CHAT_MODELS.map((m) => ({
    ...m,
    status: 'active' as const,
  }));
};
