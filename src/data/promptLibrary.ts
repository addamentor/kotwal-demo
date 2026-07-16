/**
 * Prompt Library — canonical static data source.
 *
 * IMPORTANT: this file is intentionally duplicated byte-for-byte in both
 * `kotwaluiapp` and `kotwal-demo` (two separate Vite apps, no cross-app imports).
 * When you edit one, copy it to the other. A drift check exists in the plan's
 * verification (`diff` the two files → no output).
 *
 * Structure is 3 levels: Category → Subcategory → Prompt.
 *
 * Prompt bodies are written in a deliberately TOKEN-LEAN "telegraphic imperative"
 * style — articles, politeness and filler are dropped, imperative verbs and all
 * meaningful instructions are kept. This conveys full intent to the model at
 * ~40-50% fewer tokens. Bodies contain {{key}} tokens that map 1:1 to `fields`;
 * the user fills a small form and the assembled prompt is sent to the model.
 *
 * No React / lucide imports here — icons are referenced by string key and mapped
 * to components inside PromptLibrarySheet.tsx so this stays pure data.
 */

export interface PromptField {
  /** token used in the body as {{key}} */
  key: string;
  /** field label shown above the input */
  label: string;
  /** input placeholder / hint */
  placeholder?: string;
  /** render a textarea instead of a single-line input */
  multiline?: boolean;
  /** default true; when false the field may be left blank */
  required?: boolean;
}

export interface LibraryPrompt {
  id: string;
  title: string;
  description: string;
  /** telegraphic template; {{key}} tokens map to `fields` */
  body: string;
  /** absent/empty ⇒ no-field prompt (confirm step, then send as-is) */
  fields?: PromptField[];
  tags?: string[];
}

export interface PromptSubcategory {
  id: string;
  label: string;
  prompts: LibraryPrompt[];
}

export interface PromptCategory {
  id: string;
  label: string;
  /** icon key, mapped to a lucide component in the sheet */
  icon: string;
  subcategories: PromptSubcategory[];
}

/**
 * Assemble a prompt body by substituting {{key}} tokens with user-supplied
 * values. Missing/blank values collapse to '' and any orphan tokens are
 * stripped; the result is trimmed. Pure — safe to unit test.
 */
export function assemblePrompt(
  prompt: LibraryPrompt,
  values: Record<string, string>,
): string {
  let out = prompt.body;
  for (const field of prompt.fields ?? []) {
    const v = (values[field.key] ?? '').trim();
    out = out.split(`{{${field.key}}}`).join(v);
  }
  // Strip any orphan tokens left behind (defensive), then collapse the blank
  // lines that removed optional fields may have created.
  out = out.replace(/\{\{[^}]+\}\}/g, '');
  out = out.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  return out.trim();
}

/**
 * True when every REQUIRED field has a non-blank value. Drives the Send button.
 */
export function isPromptReady(
  prompt: LibraryPrompt,
  values: Record<string, string>,
): boolean {
  for (const field of prompt.fields ?? []) {
    const required = field.required !== false;
    if (required && !(values[field.key] ?? '').trim()) return false;
  }
  return true;
}

// Shorthand field builders keep the data below compact.
const f = (
  key: string,
  label: string,
  placeholder?: string,
  opts: { multiline?: boolean; required?: boolean } = {},
): PromptField => ({ key, label, placeholder, ...opts });

export const PROMPT_LIBRARY: PromptCategory[] = [
  // ── Coding ──────────────────────────────────────────────────────────────
  {
    id: 'coding',
    label: 'Coding',
    icon: 'code',
    subcategories: [
      {
        id: 'coding-debugging',
        label: 'Debugging',
        prompts: [
          {
            id: 'debug-root-cause',
            title: 'Find root cause',
            description: 'Diagnose a bug from code + error',
            body:
              'Role: senior engineer debugging production issue.\n' +
              'Task: find root cause of bug below. Do not guess — reason step by step.\n' +
              'Output: (1) most likely root cause, (2) why, (3) minimal fix, (4) how to verify.\n\n' +
              'Language/stack: {{stack}}\n' +
              'Observed behavior: {{observed}}\n' +
              'Expected behavior: {{expected}}\n' +
              'Error/logs:\n{{error}}\n\n' +
              'Code:\n{{code}}',
            fields: [
              f('stack', 'Language / stack', 'e.g. Node.js + Postgres'),
              f('observed', 'What happens', 'the wrong behavior'),
              f('expected', 'What should happen', 'the correct behavior'),
              f('error', 'Error / logs', 'paste stack trace or logs', { multiline: true, required: false }),
              f('code', 'Relevant code', 'paste the code', { multiline: true }),
            ],
            tags: ['bug', 'error', 'diagnose'],
          },
          {
            id: 'debug-explain-error',
            title: 'Explain this error',
            description: 'Plain explanation + fix for an error message',
            body:
              'Explain error below in plain terms: what it means, common causes, how to fix.\n' +
              'Give concrete fix steps, most-likely cause first.\n\n' +
              'Stack: {{stack}}\n' +
              'Error:\n{{error}}',
            fields: [
              f('stack', 'Language / stack', 'e.g. Python 3.11'),
              f('error', 'Error message', 'paste the full error', { multiline: true }),
            ],
            tags: ['error', 'explain'],
          },
          {
            id: 'debug-repro',
            title: 'Build a repro',
            description: 'Minimal reproduction for an intermittent bug',
            body:
              'Task: design minimal reproduction for intermittent bug below.\n' +
              'Output: smallest code/steps to trigger it reliably, plus what to log to confirm.\n\n' +
              'Symptom: {{symptom}}\n' +
              'Context (when/how often): {{context}}\n' +
              'Relevant code:\n{{code}}',
            fields: [
              f('symptom', 'Symptom', 'what goes wrong'),
              f('context', 'When it happens', 'frequency, conditions', { required: false }),
              f('code', 'Relevant code', 'paste code', { multiline: true }),
            ],
            tags: ['repro', 'flaky'],
          },
        ],
      },
      {
        id: 'coding-testing',
        label: 'Testing',
        prompts: [
          {
            id: 'test-unit',
            title: 'Write unit tests',
            description: 'Thorough unit tests incl. edge cases',
            body:
              'Write unit tests for code below.\n' +
              'Cover: happy path, edge cases, error/invalid input, boundaries.\n' +
              'Framework: {{framework}}. Style: clear names, one assertion focus each.\n\n' +
              'Code:\n{{code}}',
            fields: [
              f('framework', 'Test framework', 'e.g. Jest / pytest / JUnit'),
              f('code', 'Code under test', 'paste the function/module', { multiline: true }),
            ],
            tags: ['tests', 'unit'],
          },
          {
            id: 'test-cases',
            title: 'List test cases',
            description: 'Enumerate cases before writing tests',
            body:
              'List test cases for the feature below before any code.\n' +
              'Group: happy path, edge cases, failure modes, security/perf concerns.\n' +
              'For each: input → expected result, one line.\n\n' +
              'Feature: {{feature}}\n' +
              'Constraints/rules: {{rules}}',
            fields: [
              f('feature', 'Feature / function', 'what it does'),
              f('rules', 'Rules / constraints', 'validation, limits', { multiline: true, required: false }),
            ],
            tags: ['tests', 'planning'],
          },
          {
            id: 'test-coverage-gaps',
            title: 'Find coverage gaps',
            description: 'What existing tests miss',
            body:
              'Review code + its tests below. Identify untested paths, missing edge cases, weak assertions.\n' +
              'Output: prioritized list of gaps + one suggested test each.\n\n' +
              'Code:\n{{code}}\n\n' +
              'Existing tests:\n{{tests}}',
            fields: [
              f('code', 'Code', 'paste code', { multiline: true }),
              f('tests', 'Existing tests', 'paste tests', { multiline: true }),
            ],
            tags: ['tests', 'coverage'],
          },
        ],
      },
      {
        id: 'coding-refactoring',
        label: 'Refactoring & Review',
        prompts: [
          {
            id: 'review-code',
            title: 'Code review',
            description: 'Deep review: bugs, edge cases, perf',
            body:
              'Role: senior engineer. Review code below.\n' +
              'Cover: correctness, edge cases, performance, readability, security.\n' +
              'Output: numbered issues by severity + concrete fix each (short example if useful).\n\n' +
              'Language/framework: {{stack}}. Audience: {{audience}}.\n\n' +
              'Code:\n{{code}}',
            fields: [
              f('stack', 'Language / framework', 'e.g. TypeScript / React'),
              f('audience', 'Audience', 'e.g. the author, junior devs', { required: false }),
              f('code', 'Code', 'paste the code', { multiline: true }),
            ],
            tags: ['review', 'quality'],
          },
          {
            id: 'refactor-readability',
            title: 'Refactor for clarity',
            description: 'Improve readability, keep behavior',
            body:
              'Refactor code below for readability + maintainability. Keep behavior identical.\n' +
              'Explain each change briefly. Flag any risky change.\n\n' +
              'Language: {{lang}}\n' +
              'Code:\n{{code}}',
            fields: [
              f('lang', 'Language', 'e.g. Go'),
              f('code', 'Code', 'paste the code', { multiline: true }),
            ],
            tags: ['refactor', 'cleanup'],
          },
          {
            id: 'explain-code',
            title: 'Explain this code',
            description: 'Line-level walkthrough + intent',
            body:
              'Explain code below: overall intent first, then key parts.\n' +
              'Call out non-obvious logic, side effects, assumptions.\n' +
              'Level: {{level}}.\n\n' +
              'Code:\n{{code}}',
            fields: [
              f('level', 'Explain for', 'e.g. beginner, experienced dev', { required: false }),
              f('code', 'Code', 'paste the code', { multiline: true }),
            ],
            tags: ['explain', 'onboarding'],
          },
        ],
      },
      {
        id: 'coding-architecture',
        label: 'Architecture',
        prompts: [
          {
            id: 'arch-design',
            title: 'Design a solution',
            description: 'Approach + trade-offs for a problem',
            body:
              'Role: staff engineer. Propose design for problem below.\n' +
              'Output: (1) recommended approach, (2) 2-3 alternatives w/ trade-offs, (3) risks, (4) rough steps.\n' +
              'Bias: simplicity + operability.\n\n' +
              'Problem: {{problem}}\n' +
              'Constraints (scale, stack, deadline): {{constraints}}',
            fields: [
              f('problem', 'Problem', 'what to design'),
              f('constraints', 'Constraints', 'scale, stack, limits', { multiline: true, required: false }),
            ],
            tags: ['design', 'architecture'],
          },
          {
            id: 'arch-review',
            title: 'Review a design',
            description: 'Critique an architecture proposal',
            body:
              'Critique architecture below. Find weak points: scaling, failure modes, cost, complexity, security.\n' +
              'Output: strengths, top risks, concrete improvements.\n\n' +
              'Design:\n{{design}}',
            fields: [
              f('design', 'Design / proposal', 'describe the architecture', { multiline: true }),
            ],
            tags: ['design', 'review'],
          },
        ],
      },
    ],
  },

  // ── Documents ───────────────────────────────────────────────────────────
  {
    id: 'documents',
    label: 'Documents',
    icon: 'file',
    subcategories: [
      {
        id: 'documents-summarize',
        label: 'Summarize',
        prompts: [
          {
            id: 'summarize-bullets',
            title: 'Summarize to bullets',
            description: '3-5 crisp bullet points',
            body:
              'Summarize text below in {{count}} crisp bullets. Each bullet: one idea, no filler.\n' +
              'Keep facts/numbers accurate. Neutral tone.\n\n' +
              'Text:\n{{text}}',
            fields: [
              f('count', 'How many bullets', 'e.g. 3-5', { required: false }),
              f('text', 'Text', 'paste content', { multiline: true }),
            ],
            tags: ['summary', 'tldr'],
          },
          {
            id: 'summarize-exec',
            title: 'Executive summary',
            description: 'One-paragraph summary for leaders',
            body:
              'Write executive summary of content below: 1 tight paragraph.\n' +
              'Lead with the outcome/decision. Include only what a leader needs to act.\n\n' +
              'Content:\n{{text}}',
            fields: [f('text', 'Content', 'paste content', { multiline: true })],
            tags: ['summary', 'executive'],
          },
          {
            id: 'summarize-actions',
            title: 'Extract action items',
            description: 'Tasks, owners, dates from text',
            body:
              'Extract all action items from text below.\n' +
              'Format: table — Action | Owner | Due | Notes. If owner/due missing, mark "TBD".\n\n' +
              'Text:\n{{text}}',
            fields: [f('text', 'Text', 'notes, thread, transcript', { multiline: true })],
            tags: ['actions', 'tasks'],
          },
        ],
      },
      {
        id: 'documents-draft',
        label: 'Draft',
        prompts: [
          {
            id: 'draft-doc',
            title: 'Draft a document',
            description: 'Structured first draft from notes',
            body:
              'Draft a {{doctype}} from notes below.\n' +
              'Structure with clear headings. Fill gaps with sensible placeholders in [brackets].\n' +
              'Tone: {{tone}}. Length: {{length}}.\n\n' +
              'Notes:\n{{notes}}',
            fields: [
              f('doctype', 'Document type', 'e.g. proposal, spec, report'),
              f('tone', 'Tone', 'e.g. formal, friendly', { required: false }),
              f('length', 'Length', 'e.g. 1 page', { required: false }),
              f('notes', 'Your notes', 'raw notes / bullets', { multiline: true }),
            ],
            tags: ['draft', 'writing'],
          },
          {
            id: 'draft-outline',
            title: 'Create an outline',
            description: 'Logical structure before writing',
            body:
              'Create detailed outline for {{doctype}} on topic below.\n' +
              'Nested headings + one line per section on what it covers.\n\n' +
              'Topic: {{topic}}\n' +
              'Audience: {{audience}}',
            fields: [
              f('doctype', 'Document type', 'e.g. whitepaper, blog'),
              f('topic', 'Topic', 'what it is about'),
              f('audience', 'Audience', 'who reads it', { required: false }),
            ],
            tags: ['outline', 'structure'],
          },
        ],
      },
      {
        id: 'documents-rewrite',
        label: 'Rewrite',
        prompts: [
          {
            id: 'rewrite-plain',
            title: 'Rewrite in plain language',
            description: 'Clear, jargon-free version',
            body:
              'Rewrite text below in plain language for a general audience.\n' +
              'Remove jargon, shorten sentences, keep all facts. Same meaning, easier read.\n\n' +
              'Text:\n{{text}}',
            fields: [f('text', 'Text', 'paste content', { multiline: true })],
            tags: ['rewrite', 'clarity'],
          },
          {
            id: 'rewrite-tone',
            title: 'Change the tone',
            description: 'Adjust tone, keep content',
            body:
              'Rewrite text below in a {{tone}} tone. Keep meaning + key facts.\n' +
              'Do not add new claims.\n\n' +
              'Text:\n{{text}}',
            fields: [
              f('tone', 'Target tone', 'e.g. formal, warm, concise'),
              f('text', 'Text', 'paste content', { multiline: true }),
            ],
            tags: ['rewrite', 'tone'],
          },
          {
            id: 'rewrite-shorten',
            title: 'Shorten this',
            description: 'Tighten without losing meaning',
            body:
              'Shorten text below by ~{{pct}} without losing key meaning.\n' +
              'Cut filler + repetition. Keep facts, numbers, caveats.\n\n' +
              'Text:\n{{text}}',
            fields: [
              f('pct', 'Reduce by', 'e.g. 50%', { required: false }),
              f('text', 'Text', 'paste content', { multiline: true }),
            ],
            tags: ['rewrite', 'concise'],
          },
        ],
      },
    ],
  },

  // ── Data & Analysis ───────────────────────────────────────────────────────
  {
    id: 'data',
    label: 'Data & Analysis',
    icon: 'chart',
    subcategories: [
      {
        id: 'data-explore',
        label: 'Explore',
        prompts: [
          {
            id: 'data-trends',
            title: 'Find key trends',
            description: 'Surface patterns + what they mean',
            body:
              'Analyze data below. Identify top trends, patterns, anomalies.\n' +
              'For each: what it is, likely why, why it matters. Note data caveats.\n\n' +
              'Data / context:\n{{data}}',
            fields: [f('data', 'Data / description', 'paste data or describe it', { multiline: true })],
            tags: ['analysis', 'trends'],
          },
          {
            id: 'data-questions',
            title: 'Questions to ask the data',
            description: 'What to investigate next',
            body:
              'Given dataset below, list high-value questions worth investigating + why each matters.\n' +
              'Group by theme. Flag which need more data.\n\n' +
              'Dataset: {{data}}\n' +
              'Goal: {{goal}}',
            fields: [
              f('data', 'Dataset', 'columns / description', { multiline: true }),
              f('goal', 'Goal', 'what you want to learn', { required: false }),
            ],
            tags: ['analysis', 'exploration'],
          },
        ],
      },
      {
        id: 'data-report',
        label: 'Report',
        prompts: [
          {
            id: 'data-structured-report',
            title: 'Structured report',
            description: 'Turn raw info into a report',
            body:
              'Turn info below into structured report.\n' +
              'Sections: Summary, Key findings, Details, Recommendations, Next steps.\n' +
              'Data-driven, concise, no speculation beyond evidence.\n\n' +
              'Info:\n{{info}}',
            fields: [f('info', 'Information', 'paste raw info / findings', { multiline: true })],
            tags: ['report', 'writing'],
          },
          {
            id: 'data-insights',
            title: 'Top insights to act on',
            description: 'Prioritized, actionable takeaways',
            body:
              'From data below, give top {{count}} insights I should act on.\n' +
              'Each: insight, evidence, recommended action, expected impact.\n' +
              'Rank by impact.\n\n' +
              'Data:\n{{data}}',
            fields: [
              f('count', 'How many', 'e.g. 5', { required: false }),
              f('data', 'Data', 'paste data', { multiline: true }),
            ],
            tags: ['insights', 'action'],
          },
        ],
      },
      {
        id: 'data-decision',
        label: 'Decision',
        prompts: [
          {
            id: 'data-compare',
            title: 'Compare & recommend',
            description: 'Weigh options, pick one',
            body:
              'Compare options below. Build criteria table (score each), then recommend one w/ reasoning.\n' +
              'State assumptions + what would change the answer.\n\n' +
              'Options: {{options}}\n' +
              'Priorities: {{priorities}}',
            fields: [
              f('options', 'Options', 'e.g. A vs B vs C'),
              f('priorities', 'What matters most', 'e.g. cost, speed', { required: false }),
            ],
            tags: ['decision', 'compare'],
          },
          {
            id: 'data-tradeoffs',
            title: 'Pros & cons',
            description: 'Balanced trade-off analysis',
            body:
              'List pros + cons of approach below. Be specific + balanced.\n' +
              'End with: when this is the right choice, when it is not.\n\n' +
              'Approach: {{approach}}\n' +
              'Context: {{context}}',
            fields: [
              f('approach', 'Approach / option', 'what you are weighing'),
              f('context', 'Context', 'your situation', { required: false }),
            ],
            tags: ['decision', 'tradeoffs'],
          },
        ],
      },
    ],
  },

  // ── Communication ───────────────────────────────────────────────────────
  {
    id: 'communication',
    label: 'Communication',
    icon: 'mail',
    subcategories: [
      {
        id: 'comm-email',
        label: 'Email',
        prompts: [
          {
            id: 'email-draft',
            title: 'Draft an email',
            description: 'Professional email from a situation',
            body:
              'Draft a professional email.\n' +
              'Goal: {{goal}}. Recipient: {{recipient}}. Tone: {{tone}}.\n' +
              'Clear subject, concise body, explicit ask/next step.\n\n' +
              'Context: {{context}}',
            fields: [
              f('goal', 'Goal of email', 'what you want to achieve'),
              f('recipient', 'Recipient', 'who / their role', { required: false }),
              f('tone', 'Tone', 'e.g. formal, friendly', { required: false }),
              f('context', 'Context', 'background / details', { multiline: true }),
            ],
            tags: ['email', 'writing'],
          },
          {
            id: 'email-reply',
            title: 'Draft a reply',
            description: 'Reply to a thread, right tone',
            body:
              'Draft concise reply to email below.\n' +
              'Intent: {{intent}}. Tone: {{tone}}. Address each open point.\n\n' +
              'Email to reply to:\n{{email}}',
            fields: [
              f('intent', 'What to convey', 'e.g. agree, decline, ask'),
              f('tone', 'Tone', 'e.g. polite, firm', { required: false }),
              f('email', 'Email thread', 'paste the message', { multiline: true }),
            ],
            tags: ['email', 'reply'],
          },
        ],
      },
      {
        id: 'comm-meetings',
        label: 'Meetings',
        prompts: [
          {
            id: 'meeting-minutes',
            title: 'Meeting minutes',
            description: 'Structured minutes from notes',
            body:
              'Write meeting minutes from notes below.\n' +
              'Sections: Attendees, Decisions, Discussion, Action items (Owner + Due).\n' +
              'Concise, factual.\n\n' +
              'Notes:\n{{notes}}',
            fields: [f('notes', 'Raw notes', 'paste your notes', { multiline: true })],
            tags: ['meeting', 'minutes'],
          },
          {
            id: 'meeting-agenda',
            title: 'Meeting agenda',
            description: 'Focused agenda with timeboxes',
            body:
              'Create agenda for meeting below.\n' +
              'Items w/ timeboxes, desired outcome each, owner. Keep to {{duration}}.\n\n' +
              'Purpose: {{purpose}}\n' +
              'Topics: {{topics}}',
            fields: [
              f('purpose', 'Meeting purpose', 'why meet'),
              f('duration', 'Duration', 'e.g. 30 min', { required: false }),
              f('topics', 'Topics', 'what to cover', { multiline: true, required: false }),
            ],
            tags: ['meeting', 'agenda'],
          },
        ],
      },
      {
        id: 'comm-announce',
        label: 'Announcements',
        prompts: [
          {
            id: 'announce-message',
            title: 'Write an announcement',
            description: 'Clear internal/external announcement',
            body:
              'Write {{scope}} announcement.\n' +
              'Lead with the news + why it matters. Then details, then what to do.\n' +
              'Tone: {{tone}}. Keep it short.\n\n' +
              'What to announce: {{news}}',
            fields: [
              f('scope', 'Audience', 'e.g. internal team, customers'),
              f('tone', 'Tone', 'e.g. upbeat, formal', { required: false }),
              f('news', 'The news', 'what is happening', { multiline: true }),
            ],
            tags: ['announcement', 'comms'],
          },
        ],
      },
    ],
  },

  // ── HR & Policy ─────────────────────────────────────────────────────────
  {
    id: 'hr',
    label: 'HR & Policy',
    icon: 'users',
    subcategories: [
      {
        id: 'hr-hiring',
        label: 'Hiring',
        prompts: [
          {
            id: 'hr-jd',
            title: 'Draft a job description',
            description: 'Structured JD for a role',
            body:
              'Draft job description for role below.\n' +
              'Sections: Summary, Responsibilities, Must-have skills, Nice-to-have, About team.\n' +
              'Inclusive language, no jargon.\n\n' +
              'Role: {{role}}\n' +
              'Level/seniority: {{level}}\n' +
              'Key needs: {{needs}}',
            fields: [
              f('role', 'Role title', 'e.g. Backend Engineer'),
              f('level', 'Level', 'e.g. senior', { required: false }),
              f('needs', 'Key requirements', 'skills, must-haves', { multiline: true, required: false }),
            ],
            tags: ['hiring', 'jd'],
          },
          {
            id: 'hr-onboarding',
            title: 'Onboarding checklist',
            description: '30-day plan for a new hire',
            body:
              'Create onboarding checklist for new {{role}}.\n' +
              'Group: Day 1, Week 1, Month 1. Concrete tasks, owners, goals.\n\n' +
              'Team/context: {{context}}',
            fields: [
              f('role', 'Role', 'e.g. sales rep'),
              f('context', 'Team / context', 'tools, team norms', { multiline: true, required: false }),
            ],
            tags: ['onboarding', 'hr'],
          },
        ],
      },
      {
        id: 'hr-policy',
        label: 'Policy',
        prompts: [
          {
            id: 'hr-explain-policy',
            title: 'Explain a policy',
            description: 'Plain-language policy explainer',
            body:
              'Explain policy below in simple, plain language.\n' +
              'What it means, who it applies to, what to do/not do, key exceptions.\n\n' +
              'Policy:\n{{policy}}',
            fields: [f('policy', 'Policy text', 'paste the policy', { multiline: true })],
            tags: ['policy', 'explain'],
          },
          {
            id: 'hr-feedback',
            title: 'Improve feedback',
            description: 'Make feedback clear + constructive',
            body:
              'Rewrite feedback below to be specific, constructive, actionable.\n' +
              'Use behavior → impact → suggestion. Keep it respectful + direct.\n\n' +
              'Draft feedback:\n{{feedback}}',
            fields: [f('feedback', 'Your draft', 'paste rough feedback', { multiline: true })],
            tags: ['feedback', 'management'],
          },
        ],
      },
    ],
  },

  // ── Research ──────────────────────────────────────────────────────────────
  {
    id: 'research',
    label: 'Research',
    icon: 'search',
    subcategories: [
      {
        id: 'research-learn',
        label: 'Learn',
        prompts: [
          {
            id: 'research-overview',
            title: 'Concise overview',
            description: 'Get up to speed on a topic',
            body:
              'Give concise overview of topic below.\n' +
              'Cover: what it is, why it matters, key concepts, common pitfalls.\n' +
              'Level: {{level}}. Keep tight.\n\n' +
              'Topic: {{topic}}',
            fields: [
              f('topic', 'Topic', 'what to learn'),
              f('level', 'Your level', 'e.g. beginner', { required: false }),
            ],
            tags: ['learn', 'overview'],
          },
          {
            id: 'research-best-practices',
            title: 'Best practices',
            description: 'Enterprise best practices for a topic',
            body:
              'List best practices for topic below in an enterprise context.\n' +
              'Each: practice, why, common mistake to avoid. Prioritize high-impact.\n\n' +
              'Topic: {{topic}}',
            fields: [f('topic', 'Topic', 'e.g. API versioning')],
            tags: ['best-practices'],
          },
        ],
      },
      {
        id: 'research-compare',
        label: 'Compare',
        prompts: [
          {
            id: 'research-tech-compare',
            title: 'Compare technologies',
            description: 'Choose between tools/tech',
            body:
              'Compare {{a}} vs {{b}} for use case below.\n' +
              'Table: criteria × option. Then recommendation + when each wins.\n\n' +
              'Use case: {{usecase}}',
            fields: [
              f('a', 'Option A', 'e.g. Postgres'),
              f('b', 'Option B', 'e.g. MongoDB'),
              f('usecase', 'Use case', 'your scenario', { multiline: true, required: false }),
            ],
            tags: ['compare', 'tech'],
          },
        ],
      },
    ],
  },

  // ── Legal & Compliance ──────────────────────────────────────────────────
  {
    id: 'legal',
    label: 'Legal & Compliance',
    icon: 'scale',
    subcategories: [
      {
        id: 'legal-contracts',
        label: 'Contracts',
        prompts: [
          {
            id: 'legal-obligations',
            title: 'Key obligations',
            description: 'Extract duties + deadlines',
            body:
              'Summarize key obligations in contract below.\n' +
              'Table: Party | Obligation | Deadline | Consequence if missed.\n' +
              'Note: informational, not legal advice.\n\n' +
              'Contract:\n{{contract}}',
            fields: [f('contract', 'Contract text', 'paste the clauses', { multiline: true })],
            tags: ['contract', 'legal'],
          },
          {
            id: 'legal-risks',
            title: 'Spot red flags',
            description: 'Risks in an agreement',
            body:
              'Review agreement below. Identify risks, unusual/one-sided terms, red flags.\n' +
              'For each: clause, why risky, suggested question or change.\n' +
              'Note: informational, not legal advice.\n\n' +
              'Agreement:\n{{agreement}}',
            fields: [f('agreement', 'Agreement text', 'paste the agreement', { multiline: true })],
            tags: ['contract', 'risk'],
          },
        ],
      },
      {
        id: 'legal-compliance',
        label: 'Compliance',
        prompts: [
          {
            id: 'legal-explain-reg',
            title: 'Explain a regulation',
            description: 'Plain-language regulation summary',
            body:
              'Explain regulation below in plain language.\n' +
              'What it requires, who it applies to, key obligations, penalties.\n' +
              'Note: informational, not legal advice.\n\n' +
              'Regulation: {{reg}}',
            fields: [f('reg', 'Regulation', 'e.g. GDPR Art. 17, or paste text', { multiline: true })],
            tags: ['compliance', 'explain'],
          },
          {
            id: 'legal-gdpr-check',
            title: 'Compliance check',
            description: 'Does a process meet a requirement?',
            body:
              'Assess whether process below aligns with {{standard}}.\n' +
              'Output: likely-compliant points, gaps, concrete steps to close gaps.\n' +
              'Note: informational, not legal advice.\n\n' +
              'Process:\n{{process}}',
            fields: [
              f('standard', 'Standard / requirement', 'e.g. GDPR data minimization'),
              f('process', 'Your process', 'describe how it works', { multiline: true }),
            ],
            tags: ['compliance', 'gdpr'],
          },
        ],
      },
    ],
  },

  // ── Product & Project ─────────────────────────────────────────────────────
  {
    id: 'product',
    label: 'Product & Project',
    icon: 'target',
    subcategories: [
      {
        id: 'product-specs',
        label: 'Specs',
        prompts: [
          {
            id: 'product-prd',
            title: 'Draft a PRD',
            description: 'Product requirements doc',
            body:
              'Draft PRD for feature below.\n' +
              'Sections: Problem, Goals, Non-goals, Users, Requirements, Success metrics, Risks, Open questions.\n' +
              'Crisp + testable requirements.\n\n' +
              'Feature: {{feature}}\n' +
              'Target users: {{users}}',
            fields: [
              f('feature', 'Feature', 'what to build'),
              f('users', 'Target users', 'who is it for', { required: false }),
            ],
            tags: ['prd', 'product'],
          },
          {
            id: 'product-user-stories',
            title: 'Write user stories',
            description: 'Stories + acceptance criteria',
            body:
              'Write user stories for feature below.\n' +
              'Format: As a [user], I want [x], so that [y]. Add acceptance criteria (Given/When/Then) each.\n\n' +
              'Feature: {{feature}}',
            fields: [f('feature', 'Feature', 'describe the feature', { multiline: true })],
            tags: ['stories', 'agile'],
          },
        ],
      },
      {
        id: 'product-planning',
        label: 'Planning',
        prompts: [
          {
            id: 'product-breakdown',
            title: 'Break down the work',
            description: 'Tasks + sequence + estimates',
            body:
              'Break goal below into tasks.\n' +
              'For each: task, rough size (S/M/L), dependencies. Suggest a sensible order.\n\n' +
              'Goal: {{goal}}\n' +
              'Constraints: {{constraints}}',
            fields: [
              f('goal', 'Goal', 'what to deliver'),
              f('constraints', 'Constraints', 'deadline, team size', { required: false }),
            ],
            tags: ['planning', 'tasks'],
          },
          {
            id: 'product-risks',
            title: 'Identify project risks',
            description: 'Risks + mitigations',
            body:
              'List risks for project below.\n' +
              'Table: Risk | Likelihood | Impact | Mitigation | Owner. Rank by exposure.\n\n' +
              'Project: {{project}}',
            fields: [f('project', 'Project', 'describe scope + plan', { multiline: true })],
            tags: ['risk', 'planning'],
          },
        ],
      },
    ],
  },

  // ── Marketing & Content ─────────────────────────────────────────────────
  {
    id: 'marketing',
    label: 'Marketing & Content',
    icon: 'megaphone',
    subcategories: [
      {
        id: 'marketing-copy',
        label: 'Copy',
        prompts: [
          {
            id: 'marketing-headlines',
            title: 'Write headlines',
            description: 'Punchy options to choose from',
            body:
              'Write {{count}} headline options for the item below.\n' +
              'Vary angle (benefit, curiosity, bold). Each < 12 words.\n\n' +
              'Product/topic: {{topic}}\n' +
              'Audience: {{audience}}',
            fields: [
              f('count', 'How many', 'e.g. 10', { required: false }),
              f('topic', 'Product / topic', 'what you are promoting'),
              f('audience', 'Audience', 'who you target', { required: false }),
            ],
            tags: ['copy', 'headlines'],
          },
          {
            id: 'marketing-product-desc',
            title: 'Product description',
            description: 'Benefit-led product copy',
            body:
              'Write product description for item below.\n' +
              'Lead with benefit, then features, then proof. Tone: {{tone}}. Length: {{length}}.\n\n' +
              'Product: {{product}}\n' +
              'Key features: {{features}}',
            fields: [
              f('product', 'Product', 'name + what it is'),
              f('features', 'Key features', 'bullets', { multiline: true }),
              f('tone', 'Tone', 'e.g. premium, playful', { required: false }),
              f('length', 'Length', 'e.g. 80 words', { required: false }),
            ],
            tags: ['copy', 'product'],
          },
        ],
      },
      {
        id: 'marketing-social',
        label: 'Social',
        prompts: [
          {
            id: 'marketing-social-post',
            title: 'Social post',
            description: 'Platform-ready post + hashtags',
            body:
              'Write {{platform}} post about topic below.\n' +
              'Hook first line, value in middle, clear CTA. Add fitting hashtags. Respect platform norms.\n\n' +
              'Topic: {{topic}}\n' +
              'Goal: {{goal}}',
            fields: [
              f('platform', 'Platform', 'e.g. LinkedIn, X'),
              f('topic', 'Topic', 'what to post about'),
              f('goal', 'Goal', 'e.g. sign-ups, awareness', { required: false }),
            ],
            tags: ['social', 'content'],
          },
        ],
      },
    ],
  },

  // ── Learning & Explainers ─────────────────────────────────────────────────
  {
    id: 'learning',
    label: 'Learning',
    icon: 'book',
    subcategories: [
      {
        id: 'learning-explain',
        label: 'Explain',
        prompts: [
          {
            id: 'learning-eli',
            title: 'Explain simply',
            description: 'Plain explanation of a concept',
            body:
              'Explain concept below simply, for {{level}}.\n' +
              'Use a short analogy, then the real definition, then one concrete example.\n\n' +
              'Concept: {{concept}}',
            fields: [
              f('concept', 'Concept', 'what to explain'),
              f('level', 'Explain for', 'e.g. a 12-year-old, a beginner', { required: false }),
            ],
            tags: ['explain', 'learn'],
          },
          {
            id: 'learning-analogy',
            title: 'Give an analogy',
            description: 'Make an idea intuitive',
            body:
              'Give 2-3 analogies that make concept below intuitive.\n' +
              'For each: the analogy + where it breaks down.\n\n' +
              'Concept: {{concept}}',
            fields: [f('concept', 'Concept', 'the idea')],
            tags: ['analogy', 'learn'],
          },
        ],
      },
      {
        id: 'learning-plan',
        label: 'Study plan',
        prompts: [
          {
            id: 'learning-roadmap',
            title: 'Learning roadmap',
            description: 'Step-by-step path to a skill',
            body:
              'Build learning roadmap to reach goal below.\n' +
              'Phases w/ topics, order, rough time, one practice project per phase.\n' +
              'Time available: {{time}}. Current level: {{level}}.\n\n' +
              'Goal: {{goal}}',
            fields: [
              f('goal', 'Learning goal', 'e.g. become job-ready in React'),
              f('level', 'Current level', 'e.g. know basics', { required: false }),
              f('time', 'Time available', 'e.g. 5 hrs/week', { required: false }),
            ],
            tags: ['roadmap', 'learn'],
          },
        ],
      },
    ],
  },
];
