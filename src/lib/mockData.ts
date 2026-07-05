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

// ─── MCP Servers — preview data (Coming Next) ────────────────────────
//
// Rendered by MCPServersSection as a preview catalogue. All entries live on
// the client only — clicking "Connect" surfaces a waitlist toast. The shape
// is intentionally close to what the real MCPServer model will expose so a
// swap-in is cheap when the backend lands.

export interface MCPPreviewServer {
  id: string;
  name: string;
  vendor: string;
  category: 'Dev tools' | 'Productivity' | 'Communication' | 'Data' | 'Design' | 'Filesystem';
  description: string;
  tools: string[];        // sample tool names surfaced on the card
  toolCount: number;
  transport: 'sse' | 'http' | 'stdio';
  status: 'preview' | 'reserve';
  official: boolean;      // whether this will be a Kotwal-curated template
  iconEmoji: string;      // stand-in for a real logo — cheap, obvious, no assets to ship
}

export const MOCK_MCP_PREVIEW_SERVERS: MCPPreviewServer[] = [
  {
    id: 'mcp-github', name: 'GitHub', vendor: 'GitHub', category: 'Dev tools',
    description: 'Repos, PRs, issues, and workflow runs — every tool call gated by Kotwal.',
    tools: ['search_repositories', 'get_pull_request', 'list_issues', 'create_comment'],
    toolCount: 22, transport: 'http', status: 'preview', official: true, iconEmoji: '🐙',
  },
  {
    id: 'mcp-jira', name: 'Jira', vendor: 'Atlassian', category: 'Productivity',
    description: 'Read and write tickets, sprints, and boards without leaking customer data.',
    tools: ['search_tickets', 'update_ticket', 'add_comment', 'list_sprints'],
    toolCount: 18, transport: 'http', status: 'preview', official: true, iconEmoji: '📋',
  },
  {
    id: 'mcp-notion', name: 'Notion', vendor: 'Notion Labs', category: 'Productivity',
    description: 'Query pages, databases, and blocks. PII in results is auto-redacted on return.',
    tools: ['search_pages', 'get_database', 'append_block', 'query_database'],
    toolCount: 14, transport: 'http', status: 'preview', official: true, iconEmoji: '📝',
  },
  {
    id: 'mcp-slack', name: 'Slack', vendor: 'Slack', category: 'Communication',
    description: 'Read messages, post updates, and lookup users — with recipient allowlists.',
    tools: ['post_message', 'search_messages', 'lookup_user', 'list_channels'],
    toolCount: 11, transport: 'http', status: 'preview', official: true, iconEmoji: '💬',
  },
  {
    id: 'mcp-linear', name: 'Linear', vendor: 'Linear', category: 'Productivity',
    description: 'Fetch and update issues, cycles, and projects. Read-only mode supported.',
    tools: ['list_issues', 'update_issue', 'create_issue', 'get_cycle'],
    toolCount: 12, transport: 'http', status: 'preview', official: true, iconEmoji: '📐',
  },
  {
    id: 'mcp-confluence', name: 'Confluence', vendor: 'Atlassian', category: 'Productivity',
    description: 'Search internal docs, retrieve pages, respect space-level ACLs.',
    tools: ['search_pages', 'get_page', 'list_spaces'],
    toolCount: 9, transport: 'http', status: 'preview', official: true, iconEmoji: '📚',
  },
  {
    id: 'mcp-postgres', name: 'Postgres (read-only)', vendor: 'Kotwal', category: 'Data',
    description: 'Query a curated Postgres database. Column-level PII masking enforced.',
    tools: ['query', 'list_tables', 'describe_table'],
    toolCount: 4, transport: 'stdio', status: 'preview', official: true, iconEmoji: '🐘',
  },
  {
    id: 'mcp-fs', name: 'Filesystem sandbox', vendor: 'Kotwal', category: 'Filesystem',
    description: 'Sandbox filesystem for agent scratch space. Ephemeral, tenant-isolated.',
    tools: ['read_file', 'write_file', 'list_dir', 'search'],
    toolCount: 6, transport: 'stdio', status: 'preview', official: true, iconEmoji: '📁',
  },
  {
    id: 'mcp-figma', name: 'Figma', vendor: 'Figma', category: 'Design',
    description: 'Fetch files, comments, and images — for design-review agents.',
    tools: ['get_file', 'list_comments', 'export_image'],
    toolCount: 7, transport: 'http', status: 'reserve', official: false, iconEmoji: '🎨',
  },
  {
    id: 'mcp-gitlab', name: 'GitLab', vendor: 'GitLab', category: 'Dev tools',
    description: 'MRs, pipelines, and issues — analogous to the GitHub server.',
    tools: ['search_projects', 'get_merge_request', 'list_issues'],
    toolCount: 16, transport: 'http', status: 'reserve', official: false, iconEmoji: '🦊',
  },
];

// ─── Agent templates — preview data (Coming Soon) ────────────────────
//
// Six starter templates rendered by AgentsSection. Selecting a template opens
// a preview drawer with a mock recorded run — no LLM is invoked. This mirrors
// the shape of the future Agent model closely enough to make the swap trivial.

export interface AgentTemplate {
  id: string;
  name: string;
  category: 'Legal' | 'Support' | 'Engineering' | 'Sales' | 'Security' | 'Ops';
  description: string;
  modelId: string;             // one of MOCK_CHAT_MODELS ids
  temperature: number;
  maxTurns: number;
  tools: Array<{ source: 'builtin' | 'mcp'; name: string }>;
  systemPromptPreview: string; // trimmed for card view; full text in preview drawer
  status: 'preview' | 'reserve';
  iconEmoji: string;
  featured?: boolean;
}

export const MOCK_AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: 'agent-contract-reviewer',
    name: 'Contract Reviewer',
    category: 'Legal',
    description: 'Reviews inbound contracts against a checklist, flags risky clauses, drafts a redline memo.',
    modelId: 'demo-claude',
    temperature: 0.2,
    maxTurns: 8,
    tools: [
      { source: 'builtin', name: 'web.fetch' },
      { source: 'mcp',     name: 'notion.search_pages' },
      { source: 'mcp',     name: 'notion.append_block' },
    ],
    systemPromptPreview:
      'You are a legal analyst specialising in commercial contracts. Review the attached contract against the checklist in Notion under "Contract Playbook / Standard Terms".',
    status: 'preview',
    iconEmoji: '⚖️',
    featured: true,
  },
  {
    id: 'agent-support-triage',
    name: 'Support Triager',
    category: 'Support',
    description: 'Reads new Jira tickets, classifies severity, applies labels, and drafts a first response.',
    modelId: 'demo-gpt4o',
    temperature: 0.3,
    maxTurns: 6,
    tools: [
      { source: 'mcp', name: 'jira.search_tickets' },
      { source: 'mcp', name: 'jira.update_ticket' },
      { source: 'mcp', name: 'jira.add_comment' },
    ],
    systemPromptPreview:
      'You are a customer support triager. For every new ticket in the "Support" project, determine severity, apply labels, and post a first-response draft as an internal comment.',
    status: 'preview',
    iconEmoji: '🛎️',
    featured: true,
  },
  {
    id: 'agent-code-reviewer',
    name: 'Code Reviewer',
    category: 'Engineering',
    description: 'Reviews GitHub PRs, comments inline, and posts a summary aligned with the engineering handbook.',
    modelId: 'demo-claude',
    temperature: 0.2,
    maxTurns: 10,
    tools: [
      { source: 'mcp',     name: 'github.get_pull_request' },
      { source: 'mcp',     name: 'github.create_comment' },
      { source: 'builtin', name: 'web.fetch' },
    ],
    systemPromptPreview:
      'You are a senior engineer performing code review. Load the PR diff via github.get_pull_request, then post inline comments per the handbook conventions.',
    status: 'preview',
    iconEmoji: '🧪',
    featured: true,
  },
  {
    id: 'agent-security-auditor',
    name: 'Security Auditor',
    category: 'Security',
    description: 'Sweeps repos for secrets, drafts remediation issues, and posts a summary to Slack.',
    modelId: 'demo-gpt4o',
    temperature: 0.1,
    maxTurns: 12,
    tools: [
      { source: 'mcp', name: 'github.search_repositories' },
      { source: 'mcp', name: 'github.create_issue' },
      { source: 'mcp', name: 'slack.post_message' },
    ],
    systemPromptPreview:
      'You are a security auditor. Scan the listed repositories for exposed credentials. For every finding, create a remediation issue and summarise the batch in #sec-alerts.',
    status: 'preview',
    iconEmoji: '🛡️',
  },
  {
    id: 'agent-meeting-summariser',
    name: 'Meeting Summariser',
    category: 'Ops',
    description: 'Transcribes attached notes, extracts decisions and action items, and writes them to Notion.',
    modelId: 'demo-claude',
    temperature: 0.4,
    maxTurns: 5,
    tools: [
      { source: 'mcp', name: 'notion.append_block' },
    ],
    systemPromptPreview:
      'You are an executive assistant. Given raw meeting notes, produce a summary with decisions, action items (assignees + due dates), and open questions. Append to the corresponding Notion page.',
    status: 'preview',
    iconEmoji: '📝',
  },
  {
    id: 'agent-data-sheet-redactor',
    name: 'Data-Sheet Redactor',
    category: 'Sales',
    description: 'Redacts customer-identifying details from an attached spreadsheet before external sharing.',
    modelId: 'demo-gpt4o',
    temperature: 0.1,
    maxTurns: 4,
    tools: [
      { source: 'builtin', name: 'code.execute' },
    ],
    systemPromptPreview:
      'You are a data protection assistant. For every row in the attached CSV, redact customer email, phone, and account numbers using Kotwal token strategy. Preserve column order.',
    status: 'reserve',
    iconEmoji: '🗂️',
  },
];

// Mock recorded runs for the preview drawer. Keyed by agent template id.
export const MOCK_AGENT_SAMPLE_RUNS: Record<string, {
  input: string;
  turns: Array<{ role: 'assistant' | 'tool' | 'tool_result'; text: string; toolName?: string }>;
  policyEvents: Array<{ turn: number; kind: 'REDACT' | 'WARN' | 'ALLOW' | 'BLOCK'; note: string }>;
}> = {
  'agent-contract-reviewer': {
    input: 'Review the attached MSA from Acme Vendors. Flag any deviation from our Contract Playbook.',
    turns: [
      { role: 'assistant', text: 'Loading the standard playbook from Notion…' },
      { role: 'tool',      text: 'notion.search_pages({ query: "Contract Playbook / Standard Terms" })', toolName: 'notion.search_pages' },
      { role: 'tool_result', text: '2 pages returned. Loading the top match.' },
      { role: 'assistant', text: 'Comparing MSA §7 (Limitation of Liability) against the playbook: **deviation found** — cap is set to 6× fees, our standard is 12×. Redlining.' },
      { role: 'tool',      text: 'notion.append_block({ page: "Vendor Review · Acme MSA", block: "…" })', toolName: 'notion.append_block' },
      { role: 'assistant', text: 'Review complete. 3 findings, 1 blocker (§7), 2 advisories (§12, §18). Full redline posted to Notion.' },
    ],
    policyEvents: [
      { turn: 2, kind: 'ALLOW',  note: 'Notion query — no sensitive data in args.' },
      { turn: 5, kind: 'REDACT', note: 'Vendor rep name auto-tokenised before Notion write.' },
    ],
  },
  'agent-support-triage': {
    input: 'Triage new tickets in the Support project from the last 24 hours.',
    turns: [
      { role: 'tool', text: 'jira.search_tickets({ project: "SUP", updated: ">=-24h" })', toolName: 'jira.search_tickets' },
      { role: 'tool_result', text: '12 tickets returned.' },
      { role: 'assistant', text: 'Classified: 2× P1 (production outages), 4× P2 (data issues), 6× P3 (feature requests). Applying labels…' },
      { role: 'tool', text: 'jira.update_ticket({ id: "SUP-4123", severity: "P1", labels: ["prod-outage"] })', toolName: 'jira.update_ticket' },
      { role: 'assistant', text: 'Draft responses posted as internal comments. Escalated 2× P1 to the on-call channel.' },
    ],
    policyEvents: [
      { turn: 3, kind: 'REDACT', note: 'Customer email tokenised in one ticket body before LLM classification.' },
    ],
  },
  'agent-code-reviewer': {
    input: 'Review PR #482 against the engineering handbook.',
    turns: [
      { role: 'tool', text: 'github.get_pull_request({ repo: "app", number: 482 })', toolName: 'github.get_pull_request' },
      { role: 'tool_result', text: 'Diff loaded — 14 files, 320 lines.' },
      { role: 'assistant', text: 'Findings: 1 missing null-guard in `services/billing.ts:88`, 1 test coverage gap in `payments.spec.ts`, no handbook violations otherwise. Posting inline comments…' },
      { role: 'tool', text: 'github.create_comment({ pr: 482, path: "services/billing.ts", line: 88, body: "…" })', toolName: 'github.create_comment' },
      { role: 'assistant', text: 'Review posted. 2 comments, approving with nits addressed.' },
    ],
    policyEvents: [
      { turn: 1, kind: 'ALLOW', note: 'GitHub tool call — no sensitive data in args.' },
    ],
  },
};

// ─── Waitlist state (client-only) ────────────────────────────────────
// Backing for the "Reserve access" buttons. Just stores in localStorage so
// the demo can show a happy path without a backend.
export const WAITLIST_STORAGE_KEY = 'kotwal_demo_waitlist_v1';
export type WaitlistEntry = {
  feature: 'mcp' | 'agents';
  itemId?: string;      // MCP server id or agent template id
  email: string;
  reservedAt: string;
};

// ─── Projects (client-only) ──────────────────────────────────────────
// Powers the ProjectSwitcher chip in the chat header *and* the ProjectsSection
// grid. The extra fields are only used by the dashboard section.

export interface DemoProject {
  id: string;
  name: string;
  description?: string;
  colorHex: string;
  // ── Dashboard-only fields ─────────────────────────────────────────
  status?: 'active' | 'paused' | 'archived';
  members?: number;
  budgetTokens?: number;         // total token budget for the current period
  usedTokens?: number;           // tokens consumed so far this period
  spendUsd?: number;             // running spend in USD
  ownerName?: string;
  updatedAt?: string;            // ISO timestamp for "last active"
  usageSpark?: number[];         // ~14 samples powering the sparkline
}

export const MOCK_PROJECTS: DemoProject[] = [
  {
    id: 'proj-eu-ai-act', name: 'EU AI Act Prep', colorHex: '#6366f1',
    description: 'Compliance mapping and evidence collection',
    status: 'active', members: 6,
    budgetTokens: 2_500_000, usedTokens: 1_620_400, spendUsd: 240.6,
    ownerName: 'Sarah Chen', updatedAt: '2026-06-30T15:12:00Z',
    usageSpark: [4, 8, 12, 9, 18, 22, 14, 26, 34, 28, 40, 38, 46, 52],
  },
  {
    id: 'proj-q4-board', name: 'Q4 Board Deck', colorHex: '#f59e0b',
    description: 'Board narrative + supporting materials',
    status: 'active', members: 4,
    budgetTokens: 1_200_000, usedTokens: 486_200, spendUsd: 71.4,
    ownerName: 'Alex Martinez', updatedAt: '2026-07-01T09:20:00Z',
    usageSpark: [3, 5, 6, 4, 8, 6, 9, 12, 8, 11, 14, 12, 18, 20],
  },
  {
    id: 'proj-support', name: 'Support Copilot', colorHex: '#10b981',
    description: 'Draft replies and triage tickets',
    status: 'active', members: 12,
    budgetTokens: 5_000_000, usedTokens: 3_842_100, spendUsd: 512.9,
    ownerName: 'Priya Sharma', updatedAt: '2026-07-03T18:04:00Z',
    usageSpark: [30, 42, 38, 48, 55, 62, 58, 70, 68, 75, 82, 78, 88, 92],
  },
  {
    id: 'proj-security', name: 'Security Reviews', colorHex: '#ef4444',
    description: 'Vendor + design review notes',
    status: 'paused', members: 3,
    budgetTokens: 800_000, usedTokens: 220_000, spendUsd: 34.8,
    ownerName: 'James Wilson', updatedAt: '2026-06-15T11:33:00Z',
    usageSpark: [10, 12, 8, 14, 11, 6, 4, 5, 3, 4, 2, 1, 1, 0],
  },
];

// ─── Usage timeseries ────────────────────────────────────────────────
// A 30-day series for the UsageSection. Values are token counts per day, per
// model. Sums-per-day and cost projections are derived at render time.

export interface UsageSample {
  date: string;        // 'YYYY-MM-DD'
  openai: number;
  anthropic: number;
  gemini: number;
  deepseek: number;
}

// Small deterministic PRNG so the demo dataset is stable across reloads
function seededSeries(seed: number, base: number, spread: number, days: number): number[] {
  const out: number[] = [];
  let x = seed;
  for (let i = 0; i < days; i += 1) {
    x = (x * 9301 + 49297) % 233280;
    const noise = (x / 233280) * 2 - 1; // -1..1
    out.push(Math.max(0, Math.round(base + noise * spread + i * (base * 0.015))));
  }
  return out;
}

function buildUsageSeries(days = 30): UsageSample[] {
  const today = new Date('2026-07-04T00:00:00Z').getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  const openai    = seededSeries(101, 42_000, 12_000, days);
  const anthropic = seededSeries(202, 38_000, 10_000, days);
  const gemini    = seededSeries(303, 21_000,  8_000, days);
  const deepseek  = seededSeries(404,  9_000,  4_000, days);
  const out: UsageSample[] = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(today - (days - 1 - i) * oneDay);
    const iso = d.toISOString().slice(0, 10);
    out.push({
      date: iso,
      openai: openai[i], anthropic: anthropic[i],
      gemini: gemini[i], deepseek: deepseek[i],
    });
  }
  return out;
}

export const MOCK_USAGE_TIMESERIES: UsageSample[] = buildUsageSeries(30);

// Aggregate summaries used by cards + tables in UsageSection
export const MOCK_USAGE_BY_USER = [
  { email: 'sarah.chen@acme.com',    name: 'Sarah Chen',    tokens: 892_400, spendUsd: 132.1, sessions: 214 },
  { email: 'alex.martinez@acme.com', name: 'Alex Martinez', tokens: 764_200, spendUsd: 113.5, sessions: 187 },
  { email: 'priya.sharma@acme.com',  name: 'Priya Sharma',  tokens: 618_700, spendUsd:  92.3, sessions: 156 },
  { email: 'raj.patel@acme.com',     name: 'Raj Patel',     tokens: 512_050, spendUsd:  76.2, sessions: 128 },
  { email: 'james.wilson@acme.com',  name: 'James Wilson',  tokens: 421_800, spendUsd:  62.4, sessions: 104 },
  { email: 'emily.jones@acme.com',   name: 'Emily Jones',   tokens: 278_400, spendUsd:  41.7, sessions:  68 },
];

// ─── Device tokens (VS Code / CLI / CI) ──────────────────────────────
// Backs the DeviceTokensSection.

export interface DemoDeviceToken {
  id: string;
  label: string;
  clientType: 'vscode' | 'cli' | 'ci';
  createdAt: string;         // ISO
  lastUsedAt: string | null; // ISO or null (never used)
  status: 'active' | 'revoked';
  tokenPreview: string;      // shown in table, e.g. 'kw_dt_87F2…D3A1'
  scopes: string[];
  createdByName?: string;
}

export const MOCK_DEVICE_TOKENS: DemoDeviceToken[] = [
  {
    id: 'tok-1', label: 'Sarah · VS Code (MacBook Pro)', clientType: 'vscode',
    createdAt: '2026-06-01T09:14:00Z', lastUsedAt: '2026-07-04T13:22:00Z',
    status: 'active', tokenPreview: 'kw_dt_87F2••••••D3A1',
    scopes: ['chat.send', 'chat.history.read'], createdByName: 'Sarah Chen',
  },
  {
    id: 'tok-2', label: 'Alex · VS Code (workstation)', clientType: 'vscode',
    createdAt: '2026-05-22T11:00:00Z', lastUsedAt: '2026-07-03T08:41:00Z',
    status: 'active', tokenPreview: 'kw_dt_5A19••••••B4C7',
    scopes: ['chat.send', 'chat.history.read'], createdByName: 'Alex Martinez',
  },
  {
    id: 'tok-3', label: 'CI runner · production',       clientType: 'ci',
    createdAt: '2026-04-15T00:00:00Z', lastUsedAt: '2026-07-04T00:05:00Z',
    status: 'active', tokenPreview: 'kw_dt_9BBE••••••2A17',
    scopes: ['chat.send'], createdByName: 'Alex Martinez',
  },
  {
    id: 'tok-4', label: 'Priya · kotwal-cli',            clientType: 'cli',
    createdAt: '2026-03-08T12:30:00Z', lastUsedAt: '2026-06-19T17:02:00Z',
    status: 'revoked', tokenPreview: 'kw_dt_310A••••••EF12',
    scopes: ['chat.send', 'chat.history.read'], createdByName: 'Priya Sharma',
  },
];

// ─── Topic restrictions ──────────────────────────────────────────────
// Backs the TopicRestrictionsSection (subset of the real policy's
// `topicRestrictions.blockedTopics` map, kept in a form that renders nicely).

export interface DemoTopicRestriction {
  id: string;              // canonical id used by the backend policy
  label: string;           // display name
  description: string;
  enabled: boolean;
  action: 'WARN' | 'BLOCK';
  severity: number;        // 0..1
  confidence: number;      // 0..1
  category: 'safety' | 'compliance' | 'business';
}

export const MOCK_TOPIC_RESTRICTIONS: DemoTopicRestriction[] = [
  {
    id: 'WEAPONS',           label: 'Weapons & explosives',
    description: 'Prevent generation or discussion of instructions for weapons or explosives.',
    enabled: true,  action: 'BLOCK', severity: 1.0,  confidence: 0.9, category: 'safety',
  },
  {
    id: 'HARMFUL_CONTENT',   label: 'Harmful content',
    description: 'Self-harm, violence, or otherwise dangerous content.',
    enabled: true,  action: 'BLOCK', severity: 1.0,  confidence: 0.9, category: 'safety',
  },
  {
    id: 'COMPETITIVE_INTEL', label: 'Competitive intelligence',
    description: 'Discussion of proprietary competitor data or scraping strategies.',
    enabled: true,  action: 'BLOCK', severity: 0.9,  confidence: 0.85, category: 'business',
  },
  {
    id: 'LEGAL_ADVICE',      label: 'Formal legal advice',
    description: 'Prevent the model from posing as a lawyer or issuing binding legal advice.',
    enabled: false, action: 'WARN',  severity: 0.7,  confidence: 0.8, category: 'compliance',
  },
  {
    id: 'MEDICAL_DIAGNOSIS', label: 'Medical diagnosis',
    description: 'Prevent the model from posing as a clinician or diagnosing conditions.',
    enabled: false, action: 'WARN',  severity: 0.7,  confidence: 0.8, category: 'compliance',
  },
  {
    id: 'HR_DECISIONS',      label: 'HR / hiring decisions',
    description: 'Prevent the model from making binding HR or hiring decisions.',
    enabled: false, action: 'WARN',  severity: 0.6,  confidence: 0.75, category: 'compliance',
  },
];

// ─── Tenant settings ─────────────────────────────────────────────────
// Backs the SettingsSection. Purely cosmetic in the demo.

export interface DemoTenantSettings {
  orgName: string;
  domain: string;
  timezone: string;
  region: string;
  contactEmail: string;
  featureFlags: {
    fileUploadEnabled: boolean;
    projectsEnabled: boolean;
    vsCodeExtensionEnabled: boolean;
    piiRedactionMasking: 'TOKEN' | 'MASK' | 'FAKE';
    dailyBudgetAlerts: boolean;
    weeklyExecReport: boolean;
  };
  ownerNotificationEmails: string[];
}

export const MOCK_TENANT_SETTINGS: DemoTenantSettings = {
  orgName: 'Acme Financial Services',
  domain: 'acme.com',
  timezone: 'Europe/London',
  region: 'EU (Frankfurt)',
  contactEmail: 'security@acme.com',
  featureFlags: {
    fileUploadEnabled: true,
    projectsEnabled: true,
    vsCodeExtensionEnabled: true,
    piiRedactionMasking: 'TOKEN',
    dailyBudgetAlerts: true,
    weeklyExecReport: false,
  },
  ownerNotificationEmails: ['security@acme.com', 'compliance@acme.com'],
};
