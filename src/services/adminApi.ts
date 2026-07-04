/**
 * Admin / dashboard API service — DEMO VERSION (no real API calls).
 */
import {
  MOCK_DASHBOARD_SUMMARY,
  MOCK_DASHBOARD_USERS,
  MOCK_LICENSE_INFO,
  MOCK_ALERTS_RESPONSE,
} from '@/lib/mockData';

export interface LicenseInfo {
  availableLicenses: number;
  assignedLicenses: number;
  remainingLicenses: number;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export interface CreateUserResponse {
  message: string;
}

export interface AdminUserDetails {
  name: string;
  email: string;
  role: string;
  status?: string;
  permissions?: string[];
}

export interface DashboardUser {
  email: string;
  name: string;
  role: string;
  status?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface DashboardSummary {
  activeUsers: number;
  chatsToday: number;
  alerts: number;
  spend: number;
}

export interface DashboardAlertPiiDetails {
  riskScore: number;
  type: string;
  found: boolean;
}

export interface DashboardAlert {
  id: string;
  riskCategory: string;
  createdAt: string;
  userName: string;
  userEmail: string;
  message: string;
  piiDetails: DashboardAlertPiiDetails | null;
  override: boolean;
  piiFlag: boolean;
  error: string | null;
}

export interface DashboardAlertCounts {
  piiFlagCounts: Record<string, number>;
  overrideCounts: Record<string, number>;
  highRisk: number;
  medRisk: number;
  lowRisk: number;
  overrideCount: number;
  piiCount: number;
}

export interface DashboardAlertsPagination {
  limit: number;
  offset: number;
  total: number;
}

export interface DashboardAlertsResponse {
  counts: DashboardAlertCounts;
  alerts: DashboardAlert[];
  pagination: DashboardAlertsPagination;
}

export interface DashboardAlertsQuery {
  piiFlag?: boolean;
  override?: boolean;
  riskScoreMin?: number;
  riskScoreMax?: number;
  date?: string;
  dateStart?: string;
  dateEnd?: string;
  offset?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface UpdateAdminUserPayload {
  email: string;
  name?: string;
  role?: 'admin' | 'user';
  status?: string;
  permissions?: string[];
}

export interface UpdateAdminUserResponse { message: string; }
export interface DeleteAdminUserResponse { message: string; }

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const fetchLicenseInfo = async (_authToken?: string): Promise<LicenseInfo | null> => {
  void _authToken;
  await delay(200);
  return MOCK_LICENSE_INFO;
};

export const fetchDashboardUsers = async (_authToken?: string): Promise<DashboardUser[]> => {
  void _authToken;
  await delay(300);
  return MOCK_DASHBOARD_USERS;
};

export const fetchDashboardSummary = async (_authToken?: string): Promise<DashboardSummary | null> => {
  void _authToken;
  await delay(250);
  return MOCK_DASHBOARD_SUMMARY;
};

export const fetchDashboardAlerts = async (
  _query?: DashboardAlertsQuery,
  _authToken?: string,
): Promise<DashboardAlertsResponse | null> => {
  void _authToken;
  await delay(350);
  return MOCK_ALERTS_RESPONSE;
};

export const createAdminUser = async (
  _payload: CreateUserPayload,
  _authToken?: string,
): Promise<CreateUserResponse> => {
  void _authToken;
  await delay(400);
  return { message: 'User created successfully (demo).' };
};

export const fetchAdminUserByEmail = async (
  email: string,
  _authToken?: string,
): Promise<AdminUserDetails> => {
  void _authToken;
  await delay(200);
  const found = MOCK_DASHBOARD_USERS.find((u) => u.email === email);
  return {
    name: found?.name ?? 'Demo User',
    email,
    role: found?.role ?? 'user',
    status: found?.status ?? 'active',
  };
};

export const updateAdminUser = async (
  _payload: UpdateAdminUserPayload,
  _authToken?: string,
): Promise<UpdateAdminUserResponse> => {
  void _authToken;
  await delay(300);
  return { message: 'User updated successfully (demo).' };
};

export const deleteAdminUser = async (
  _email: string,
  _authToken?: string,
): Promise<DeleteAdminUserResponse> => {
  void _authToken;
  await delay(300);
  return { message: 'User deleted successfully (demo).' };
};
