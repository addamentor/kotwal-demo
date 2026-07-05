/**
 * DemoSessionContext — client-side telemetry + lead-gate state.
 *
 * Every visitor gets a UUID session id at first page load, stored in
 * `localStorage`. As they move around the demo we log:
 *   - route visits (path + timestamp)
 *   - notable events (role selected, Reserve clicked, section opened)
 *   - form-gate state (banner dismissed, soft-modal dismissed, submitted)
 *
 * When the visitor eventually fills the trial-request form (or is auto-
 * asked at the 4-minute mark), we ship this envelope up alongside the
 * form data so sales sees who they are AND what they explored.
 *
 * Everything below is client-only; nothing is transmitted before form
 * submission (privacy-by-design — see the consent line in DemoLeadForm).
 */
import {
  createContext, useCallback, useContext, useEffect, useMemo,
  useRef, useState, ReactNode,
} from 'react';

const STORAGE_KEY = 'kotwal_demo_session_v1';

// A single tracked event. `t` = ms since session start (so it stays small).
export interface DemoEvent {
  t: number;
  kind: string;         // e.g. 'route', 'role', 'reserve', 'section', 'gate'
  meta?: Record<string, string | number | boolean | null>;
}

// Gate lifecycle marker — retained for backward compat with any prior data
// in localStorage, though the new intent-trigger gate machine (useLeadGate)
// tracks per-trigger dismissals in its own storage key.
export type GateStage = 'trigger' | 'submitted';

export interface DemoSession {
  id: string;               // random UUID
  startedAt: string;        // ISO
  events: DemoEvent[];
  submittedAt:       string | null;
  submittedEmail:    string | null;
  submittedName:     string | null;
  submittedCompany:  string | null;
  submittedRole:     string | null;
}

interface DemoSessionContextValue {
  session: DemoSession;
  /** Log a tracked event. Cheap — never awaits. */
  log: (kind: string, meta?: DemoEvent['meta']) => void;
  /** Persist a completed submission. */
  markSubmitted: (data: {
    email: string; fullName: string; companyName: string; role?: string;
  }) => void;
  /** True once the user has filled the trial-request form successfully. */
  hasSubmitted: boolean;
  /** Compact human-readable telemetry line — used for the trial-request `useCase`. */
  telemetryUseCase: () => string;
}

const DemoSessionContext = createContext<DemoSessionContextValue | undefined>(undefined);

// ─── Helpers ──────────────────────────────────────────────────────────

function randomId(): string {
  // crypto.randomUUID is present on all modern browsers; fall back defensively.
  const c = typeof crypto !== 'undefined' ? crypto : undefined;
  if (c?.randomUUID) return c.randomUUID();
  return `sess-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function readSession(): DemoSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoSession;
  } catch { return null; }
}

function writeSession(s: DemoSession) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
  catch { /* localStorage may be blocked in private mode — no-op */ }
}

function freshSession(): DemoSession {
  return {
    id: randomId(),
    startedAt: new Date().toISOString(),
    events: [],
    submittedAt: null,
    submittedEmail: null,
    submittedName: null,
    submittedCompany: null,
    submittedRole: null,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────

export const DemoSessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<DemoSession>(() => {
    const prior = readSession();
    return prior ?? freshSession();
  });
  const startMs = useRef<number>(new Date(session.startedAt).getTime());

  // Persist every state change. Cheap — max ~5-10 KB across a demo session.
  useEffect(() => { writeSession(session); }, [session]);

  const log = useCallback((kind: string, meta?: DemoEvent['meta']) => {
    setSession((prev) => {
      // De-dupe repeated route entries within 1s to avoid noise from re-renders
      const last = prev.events[prev.events.length - 1];
      const now  = Date.now() - startMs.current;
      if (
        last && last.kind === kind &&
        JSON.stringify(last.meta || {}) === JSON.stringify(meta || {}) &&
        now - last.t < 1000
      ) return prev;
      const next: DemoEvent = { t: now, kind, meta };
      return { ...prev, events: [...prev.events, next].slice(-200) };
    });
  }, []);

  const markSubmitted = useCallback((data: {
    email: string; fullName: string; companyName: string; role?: string;
  }) => {
    setSession((prev) => ({
      ...prev,
      submittedAt: new Date().toISOString(),
      submittedEmail: data.email.toLowerCase(),
      submittedName: data.fullName,
      submittedCompany: data.companyName,
      submittedRole: data.role ?? null,
    }));
    log('gate', { stage: 'submitted' });
  }, [log]);

  const telemetryUseCase = useCallback(() => {
    // Compact single-line summary sales can eyeball at the top of the useCase
    // field, followed by the raw event log for anyone who cares.
    const durationMin = Math.round((Date.now() - startMs.current) / 60_000);
    const routes    = session.events.filter((e) => e.kind === 'route').length;
    const sections  = new Set(session.events.filter((e) => e.kind === 'section').map((e) => e.meta?.id)).size;
    const reserves  = session.events.filter((e) => e.kind === 'reserve').length;
    const summary = [
      `Session ${session.id.slice(0, 8)} · demo`,
      `~${durationMin}m elapsed`,
      `${routes} route${routes === 1 ? '' : 's'}`,
      `${sections} section${sections === 1 ? '' : 's'} opened`,
      reserves ? `${reserves} reserve click${reserves === 1 ? '' : 's'}` : null,
    ].filter(Boolean).join(' · ');
    const events = session.events.map((e) => {
      const meta = e.meta ? ' ' + JSON.stringify(e.meta) : '';
      return `t+${(e.t / 1000).toFixed(1)}s ${e.kind}${meta}`;
    }).join('\n');
    return `[Demo lead]\n${summary}\n\nEvents:\n${events}`;
  }, [session]);

  const value = useMemo<DemoSessionContextValue>(() => ({
    session,
    log,
    markSubmitted,
    hasSubmitted: !!session.submittedAt,
    telemetryUseCase,
  }), [session, log, markSubmitted, telemetryUseCase]);

  return (
    <DemoSessionContext.Provider value={value}>
      {children}
    </DemoSessionContext.Provider>
  );
};

export const useDemoSession = () => {
  const ctx = useContext(DemoSessionContext);
  if (!ctx) throw new Error('useDemoSession must be used inside DemoSessionProvider');
  return ctx;
};

// ─── Auto-defaulters ──────────────────────────────────────────────────

const FREE_MAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'aol.com', 'icloud.com', 'mail.com', 'protonmail.com', 'yandex.com',
]);

/** Turn `jane.doe@acme.com` into `Jane Doe`. Handles dots, underscores, dashes. */
export function deriveNameFromEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 0) return '';
  const local = email.slice(0, at);
  return local
    .split(/[._\-+]/)
    .filter(Boolean)
    .map((seg) => seg.replace(/\d+/g, '').trim())
    .filter(Boolean)
    .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1).toLowerCase())
    .join(' ');
}

/** Turn `jane@acme.com` → `Acme`. Returns '' for free-mail domains. */
export function deriveCompanyFromDomain(email: string): string {
  const at = email.indexOf('@');
  if (at < 0) return '';
  const domain = email.slice(at + 1).toLowerCase().trim();
  if (!domain || FREE_MAIL_DOMAINS.has(domain)) return '';
  const first = domain.split('.')[0];
  if (!first) return '';
  return first.charAt(0).toUpperCase() + first.slice(1);
}

/** True if the email is on a free-mail domain (gmail etc.). */
export function isFreeMailDomain(email: string): boolean {
  const at = email.indexOf('@');
  if (at < 0) return false;
  return FREE_MAIL_DOMAINS.has(email.slice(at + 1).toLowerCase().trim());
}
