/**
 * Demo mock data — static datasets for all API services.
 * No backend needed; everything is client-side.
 */

// ─── Chat Models ─────────────────────────────────────────────────────
export const MOCK_CHAT_MODELS = [
  { id: 'demo-gpt4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'demo-claude', name: 'Claude 3.5', provider: 'Anthropic' },
  { id: 'demo-gemini', name: 'Gemini Pro', provider: 'Google' },
];

// ─── Chat Model Admin List ───────────────────────────────────────────
export const MOCK_ADMIN_CHAT_MODELS = {
  models: [
    { id: 'demo-gpt4o', name: 'GPT-4o', description: 'Latest multimodal model', status: 'active', aiModelId: 'aim-1', AIModelMaster: { name: 'GPT-4o', provider: 'openai', configModel: 'gpt-4o' }, createdAt: '2026-03-01T10:00:00Z' },
    { id: 'demo-claude', name: 'Claude 3.5 Sonnet', description: 'Fast reasoning model', status: 'active', aiModelId: 'aim-2', AIModelMaster: { name: 'Claude 3.5', provider: 'anthropic', configModel: 'claude-3-5-sonnet' }, createdAt: '2026-03-05T10:00:00Z' },
    { id: 'demo-gemini', name: 'Gemini Pro', description: 'Google flagship', status: 'active', aiModelId: 'aim-3', AIModelMaster: { name: 'Gemini Pro', provider: 'google', configModel: 'gemini-pro' }, createdAt: '2026-03-10T10:00:00Z' },
    { id: 'demo-deepseek', name: 'DeepSeek R1', description: 'Code-focused model', status: 'inactive', aiModelId: 'aim-4', AIModelMaster: { name: 'DeepSeek R1', provider: 'deepseek', configModel: 'deepseek-r1' }, createdAt: '2026-04-01T10:00:00Z' },
  ],
  summary: { total: 4, active: 3, inactive: 1, suspended: 0 },
};

// ─── Dashboard Summary ───────────────────────────────────────────────
export const MOCK_DASHBOARD_SUMMARY = {
  activeUsers: 24,
  chatsToday: 187,
  alerts: 12,
  spend: 342.50,
};

// ─── Dashboard Users ─────────────────────────────────────────────────
export const MOCK_DASHBOARD_USERS = [
  { email: 'sarah.chen@acme.com', name: 'Sarah Chen', role: 'admin', status: 'active', lastLogin: '2026-05-08T09:15:00Z', createdAt: '2026-01-15T10:00:00Z' },
  { email: 'james.wilson@acme.com', name: 'James Wilson', role: 'user', status: 'active', lastLogin: '2026-05-08T08:30:00Z', createdAt: '2026-02-01T10:00:00Z' },
  { email: 'priya.sharma@acme.com', name: 'Priya Sharma', role: 'user', status: 'active', lastLogin: '2026-05-07T16:45:00Z', createdAt: '2026-02-10T10:00:00Z' },
  { email: 'alex.martinez@acme.com', name: 'Alex Martinez', role: 'admin', status: 'active', lastLogin: '2026-05-08T07:00:00Z', createdAt: '2026-01-20T10:00:00Z' },
  { email: 'emily.jones@acme.com', name: 'Emily Jones', role: 'user', status: 'inactive', lastLogin: '2026-04-20T14:00:00Z', createdAt: '2026-03-05T10:00:00Z' },
  { email: 'raj.patel@acme.com', name: 'Raj Patel', role: 'user', status: 'active', lastLogin: '2026-05-07T11:20:00Z', createdAt: '2026-03-15T10:00:00Z' },
];

// ─── License Info ────────────────────────────────────────────────────
export const MOCK_LICENSE_INFO = {
  availableLicenses: 50,
  assignedLicenses: 24,
  remainingLicenses: 26,
};

// ─── Security Alerts ─────────────────────────────────────────────────
export const MOCK_ALERTS_RESPONSE = {
  counts: {
    piiFlagCounts: { true: 8, false: 4 },
    overrideCounts: { true: 2, false: 10 },
    highRisk: 3,
    medRisk: 5,
    lowRisk: 4,
    overrideCount: 2,
    piiCount: 8,
  },
  alerts: [
    { id: 'a1', riskCategory: 'high', createdAt: '2026-05-08T09:12:00Z', userName: 'James Wilson', userEmail: 'james.wilson@acme.com', message: 'Debug this: const apiKey = "sk-proj-abc123def456"', piiDetails: { riskScore: 0.95, type: 'API_KEY', found: true }, override: false, piiFlag: true, error: null },
    { id: 'a2', riskCategory: 'high', createdAt: '2026-05-08T08:45:00Z', userName: 'Priya Sharma', userEmail: 'priya.sharma@acme.com', message: 'My SSN is 234-56-7890, help me fill this form', piiDetails: { riskScore: 0.92, type: 'SSN', found: true }, override: false, piiFlag: true, error: null },
    { id: 'a3', riskCategory: 'medium', createdAt: '2026-05-08T07:30:00Z', userName: 'Raj Patel', userEmail: 'raj.patel@acme.com', message: 'Customer credit card 4532-1234-5678-9012 needs refund', piiDetails: { riskScore: 0.78, type: 'CREDIT_CARD', found: true }, override: true, piiFlag: true, error: null },
    { id: 'a4', riskCategory: 'medium', createdAt: '2026-05-07T16:20:00Z', userName: 'Emily Jones', userEmail: 'emily.jones@acme.com', message: 'Send invoice to john.doe@partner.com, phone +1-555-123-4567', piiDetails: { riskScore: 0.65, type: 'CONTACT_INFO', found: true }, override: false, piiFlag: true, error: null },
    { id: 'a5', riskCategory: 'low', createdAt: '2026-05-07T14:10:00Z', userName: 'Alex Martinez', userEmail: 'alex.martinez@acme.com', message: 'Summarize the Q3 revenue report', piiDetails: { riskScore: 0.15, type: 'NONE', found: false }, override: false, piiFlag: false, error: null },
  ],
  pagination: { limit: 20, offset: 0, total: 12 },
};

// ─── Billing ─────────────────────────────────────────────────────────
export const MOCK_BILLING_RECORDS = [
  { id: 'b1', description: 'GPT-4o usage', amount: 125.40, currency: 'USD', tokens: 834000, createdAt: '2026-05-01T00:00:00Z', status: 'paid' },
  { id: 'b2', description: 'Claude 3.5 usage', amount: 89.20, currency: 'USD', tokens: 594000, createdAt: '2026-05-01T00:00:00Z', status: 'paid' },
  { id: 'b3', description: 'Gemini Pro usage', amount: 45.60, currency: 'USD', tokens: 912000, createdAt: '2026-05-01T00:00:00Z', status: 'paid' },
  { id: 'b4', description: 'Platform fee', amount: 82.30, currency: 'USD', tokens: 0, createdAt: '2026-05-01T00:00:00Z', status: 'paid' },
];

export const MOCK_BILLING_AGGREGATE = {
  totalAmount: 342.50,
  totalTokens: 2340000,
  currency: 'USD',
};

// ─── Policy ──────────────────────────────────────────────────────────
export const MOCK_POLICY = {
  policyConfig: {
    preset: 'ENTERPRISE',
    enabledCategories: ['CREDENTIAL', 'FINANCIAL', 'IDENTITY_PII', 'CONTACT', 'GOV_ID', 'NETWORK'],
    categoryAction: {
      CREDENTIAL: 'BLOCK',
      FINANCIAL: 'REDACT',
      IDENTITY_PII: 'WARN',
      CONTACT: 'WARN',
      GOV_ID: 'BLOCK',
      NETWORK: 'WARN',
    },
    thresholds: { warn: 0.4, block: 0.8 },
    allowOverride: true,
    requireOverrideReason: true,
    allowlist: ['test@example.com', '192.168.1.1'],
    redactionStrategy: { FINANCIAL: 'MASK', IDENTITY_PII: 'TOKEN' },
  },
  effective: {
    version: 3,
    jurisdiction: 'US',
    preset: 'ENTERPRISE',
    enabledCategories: ['CREDENTIAL', 'FINANCIAL', 'IDENTITY_PII', 'CONTACT', 'GOV_ID', 'NETWORK'],
    categoryAction: {
      CREDENTIAL: 'BLOCK',
      FINANCIAL: 'REDACT',
      IDENTITY_PII: 'WARN',
      CONTACT: 'WARN',
      GOV_ID: 'BLOCK',
      NETWORK: 'WARN',
    },
    thresholds: { warn: 0.4, block: 0.8 },
    criticalConfidenceFloor: 0.5,
    quasiIdBonus: 0.1,
    allowOverride: true,
    requireOverrideReason: true,
    overrideMinRole: 'user',
    allowlist: ['test@example.com', '192.168.1.1'],
    redactionStrategy: { FINANCIAL: 'MASK', IDENTITY_PII: 'TOKEN' },
    maxPromptChars: 10000,
  },
};

export const MOCK_POLICY_DEFAULTS = {
  default: MOCK_POLICY.effective,
  presets: ['STRICT', 'ENTERPRISE', 'GDPR', 'HIPAA', 'PERMISSIVE'],
};

// ─── Sample Prompts ──────────────────────────────────────────────────
export interface SamplePrompt {
  label: string;
  text: string;
  category: 'safe' | 'warn' | 'block';
  description: string;
}

export const SAMPLE_PROMPTS: SamplePrompt[] = [
  {
    label: '✅ Safe — Code review',
    text: 'Review this React component for performance issues:\n\nfunction UserList({ users }) {\n  return users.map(u => <div key={u.id}>{u.name}</div>);\n}',
    category: 'safe',
    description: 'No sensitive data — passes through normally',
  },
  {
    label: '✅ Safe — General question',
    text: 'What are the best practices for implementing rate limiting in a Node.js Express API?',
    category: 'safe',
    description: 'Technical question with no PII',
  },
  {
    label: '⚠️ Warning — Email & phone',
    text: 'Draft a follow-up email to john.smith@partner.com (phone: +1-555-987-6543) about the Q3 contract renewal.',
    category: 'warn',
    description: 'Contact info detected — warning with override option',
  },
  {
    label: '⚠️ Warning — Internal IP',
    text: 'Our staging server at 10.0.4.52:8080 is returning 502 errors. The database at db-staging.internal.acme.com seems overloaded. Help debug.',
    category: 'warn',
    description: 'Internal network info — flagged for review',
  },
  {
    label: '🚫 Blocked — API key',
    text: 'Debug this code:\nconst client = new OpenAI({ apiKey: "sk-proj-abc123def456ghi789jkl012mno345" });\nclient.chat.completions.create({ model: "gpt-4" });',
    category: 'block',
    description: 'API key detected — submission blocked by policy',
  },
  {
    label: '🚫 Blocked — SSN',
    text: 'I need to update the employee record for John Smith. His SSN is 234-56-7890 and his new address is 456 Oak Avenue, Springfield, IL 62704.',
    category: 'block',
    description: 'Government ID (SSN) detected — hard block, no override',
  },
];

// ─── Mock Chat Responses ─────────────────────────────────────────────
export const MOCK_CHAT_RESPONSES: Record<string, string> = {
  safe: `Great question! Here's my analysis:

**Performance Issues Found:**

1. **Missing \`key\` optimization** — The key is correctly set, but consider \`React.memo\` for the child component if re-renders are frequent.

2. **No virtualization** — For large lists (>100 items), consider using \`react-window\` or \`react-virtualized\`.

3. **Inline arrow function** — The \`.map()\` callback creates a new function on each render. Extract it for better performance.

\`\`\`jsx
const UserItem = React.memo(({ user }) => (
  <div>{user.name}</div>
));

function UserList({ users }) {
  return users.map(u => <UserItem key={u.id} user={u} />);
}
\`\`\`

These are minor optimizations — your component is fundamentally sound.`,

  general: `Here are the **best practices for rate limiting** in Express:

1. **Use \`express-rate-limit\`** — the standard middleware
2. **Store limits in Redis** for multi-instance deployments
3. **Apply per-endpoint limits** — auth endpoints get stricter limits
4. **Return \`Retry-After\` headers** so clients back off gracefully
5. **Differentiate by auth tier** — premium users get higher limits

\`\`\`js
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
\`\`\``,
};

// ─── Mock Detection Responses ────────────────────────────────────────
export const MOCK_WARN_RESPONSE = {
  error: 'Sensitive content detected in prompt',
  action: 'WARN' as const,
  score: 0.62,
  decisionReasons: [
    'Contact information (email address) found with 95% confidence',
    'Contact information (phone number) found with 90% confidence',
    'Combined risk score 0.62 exceeds warn threshold 0.40',
    'Override is permitted — review and proceed if this is intentional',
  ],
  categoriesPresent: ['CONTACT'],
  findings: [
    { category: 'CONTACT', subtype: 'EMAIL_ADDRESS', confidence: 0.95, value: 'j***.s****@partner.com' },
    { category: 'CONTACT', subtype: 'PHONE_NUMBER', confidence: 0.90, value: '+1-555-***-6543' },
  ],
  contributions: [
    { category: 'CONTACT', subtype: 'EMAIL_ADDRESS', weight: 0.35 },
    { category: 'CONTACT', subtype: 'PHONE_NUMBER', weight: 0.27 },
  ],
  canOverride: true,
  requireOverrideReason: true,
  policyVersion: '3',
};

export const MOCK_WARN_NETWORK_RESPONSE = {
  error: 'Internal network information detected',
  action: 'WARN' as const,
  score: 0.55,
  decisionReasons: [
    'Internal IP address found with 88% confidence',
    'Internal hostname found with 92% confidence',
    'Combined risk score 0.55 exceeds warn threshold 0.40',
  ],
  categoriesPresent: ['NETWORK'],
  findings: [
    { category: 'NETWORK', subtype: 'INTERNAL_IP', confidence: 0.88, value: '10.0.*.*' },
    { category: 'NETWORK', subtype: 'INTERNAL_HOSTNAME', confidence: 0.92, value: 'db-staging.internal.****' },
  ],
  contributions: [
    { category: 'NETWORK', subtype: 'INTERNAL_IP', weight: 0.25 },
    { category: 'NETWORK', subtype: 'INTERNAL_HOSTNAME', weight: 0.30 },
  ],
  canOverride: true,
  requireOverrideReason: true,
  policyVersion: '3',
};

export const MOCK_BLOCK_API_KEY_RESPONSE = {
  error: 'Critical credential detected — submission blocked',
  action: 'BLOCK' as const,
  score: 0.95,
  decisionReasons: [
    'API key / secret token found with 99% confidence',
    'Category CREDENTIAL is set to BLOCK — no override permitted',
    'Risk score 0.95 exceeds block threshold 0.80',
  ],
  categoriesPresent: ['CREDENTIAL'],
  findings: [
    { category: 'CREDENTIAL', subtype: 'API_KEY', confidence: 0.99, value: 'sk-proj-***...***345' },
  ],
  contributions: [
    { category: 'CREDENTIAL', subtype: 'API_KEY', weight: 0.95 },
  ],
  canOverride: false,
  requireOverrideReason: false,
  policyVersion: '3',
};

export const MOCK_BLOCK_SSN_RESPONSE = {
  error: 'Government ID detected — submission blocked',
  action: 'BLOCK' as const,
  score: 0.92,
  decisionReasons: [
    'Social Security Number found with 97% confidence',
    'Category GOV_ID is set to BLOCK — no override permitted',
    'Personal address found — combined risk exceeds block threshold',
  ],
  categoriesPresent: ['GOV_ID', 'IDENTITY_PII'],
  findings: [
    { category: 'GOV_ID', subtype: 'SSN', confidence: 0.97, value: '***-**-7890' },
    { category: 'IDENTITY_PII', subtype: 'PERSON_NAME', confidence: 0.85, value: 'J*** S****' },
    { category: 'IDENTITY_PII', subtype: 'ADDRESS', confidence: 0.80, value: '456 Oak Avenue, Springfield...' },
  ],
  contributions: [
    { category: 'GOV_ID', subtype: 'SSN', weight: 0.70 },
    { category: 'IDENTITY_PII', subtype: 'ADDRESS', weight: 0.22 },
  ],
  canOverride: false,
  requireOverrideReason: false,
  policyVersion: '3',
};
