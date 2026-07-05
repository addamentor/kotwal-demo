/**
 * useLeadGate — intent-based trigger machine for the demo lead popup.
 *
 * Six triggers, each with its own dismissal state so once you close the
 * popup from that trigger, it doesn't reopen from the same trigger this
 * session. But the *next* trigger (a stronger intent signal) does re-fire.
 *
 * Triggers, in escalation order:
 *   1. `landing`         — 7s dwell on `/demo`
 *   2. `role`            — clicked one of the role cards
 *   3. `dashboard-entry` — first time landing on `/dashboard`
 *   4. `section`         — every 3rd distinct dashboard section navigated
 *   5. `reserve`         — clicked any Reserve-access button
 *   6. `dwell`           — 4 minutes total across the session
 *
 * All popups are dismissable. `useLeadGate` is passive — it computes the
 * current pending trigger; the mount renders it; callers use `trigger()`
 * for programmatic events (role click, reserve, etc.).
 *
 * Once the visitor submits the form, no triggers fire again.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDemoSession } from '@/context/DemoSessionContext';

export type LeadGateReason =
  | 'landing'
  | 'role'
  | 'dashboard-entry'
  | 'section'
  | 'reserve'
  | 'dwell';

const LANDING_DELAY_MS = 7_000;    // 7s dwell on /demo
const DWELL_TRIGGER_MS = 4 * 60_000; // 4 minutes total
const SECTIONS_PER_TRIGGER = 3;    // fire on the 3rd, 6th, 9th distinct section

const STORAGE_KEY = 'kotwal_demo_gate_dismissals_v2';

// Per-trigger dismissal state persisted in localStorage. Once a trigger is
// dismissed it won't refire in the same session — but the state is stored
// in a single object so we can clear/repair it if needed.
interface GateDismissals {
  landing: boolean;
  role: boolean;
  'dashboard-entry': boolean;
  section: number;   // number of "section" trigger dismissals so we can skip the ones already seen
  reserve: boolean;
  dwell: boolean;
}

function readDismissals(): GateDismissals {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as GateDismissals;
  } catch { /* fall through to defaults */ }
  return {
    landing: false, role: false, 'dashboard-entry': false,
    section: 0, reserve: false, dwell: false,
  };
}

function writeDismissals(d: GateDismissals) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }
  catch { /* localStorage blocked (private mode etc.) — no-op */ }
}

export function useLeadGate() {
  const location = useLocation();
  const { session, hasSubmitted } = useDemoSession();

  const [pending, setPending] = useState<LeadGateReason | null>(null);
  const [dismissals, setDismissals] = useState<GateDismissals>(() => readDismissals());
  const [tick, setTick] = useState(0);

  // Heartbeat so time-based triggers advance
  useEffect(() => {
    if (hasSubmitted) return;
    const id = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [hasSubmitted]);

  // Persist dismissals
  useEffect(() => { writeDismissals(dismissals); }, [dismissals]);

  const elapsedMs = useMemo(() => {
    const start = new Date(session.startedAt).getTime();
    void tick;
    return Date.now() - start;
  }, [session.startedAt, tick]);

  const sectionsOpened = useMemo(() => {
    const ids = new Set<string>();
    for (const ev of session.events) {
      if (ev.kind === 'section' && ev.meta?.id) ids.add(String(ev.meta.id));
    }
    return ids.size;
  }, [session.events]);

  const hasEnteredDashboard = useMemo(() =>
    session.events.some((e) => e.kind === 'route' && e.meta?.path === '/dashboard'),
    [session.events],
  );

  // ── Auto trigger: LANDING after 7s dwell on /demo ─────────────────────
  useEffect(() => {
    if (hasSubmitted || dismissals.landing || pending) return;
    if (location.pathname !== '/demo') return;
    if (elapsedMs < LANDING_DELAY_MS) return;
    setPending('landing');
  }, [hasSubmitted, dismissals.landing, pending, location.pathname, elapsedMs]);

  // ── Auto trigger: DASHBOARD-ENTRY when /dashboard first appears ───────
  const prevPath = useRef(location.pathname);
  useEffect(() => {
    if (hasSubmitted || dismissals['dashboard-entry'] || pending) {
      prevPath.current = location.pathname;
      return;
    }
    if (location.pathname === '/dashboard' && prevPath.current !== '/dashboard') {
      setPending('dashboard-entry');
    }
    prevPath.current = location.pathname;
  }, [hasSubmitted, dismissals, pending, location.pathname]);

  // ── Auto trigger: SECTION every 3rd distinct section navigation ──────
  useEffect(() => {
    if (hasSubmitted || pending) return;
    // Fire when the visitor has opened a multiple of SECTIONS_PER_TRIGGER
    // that we haven't yet acknowledged with a dismissal.
    const target = (dismissals.section + 1) * SECTIONS_PER_TRIGGER;
    if (sectionsOpened >= target) setPending('section');
  }, [hasSubmitted, pending, sectionsOpened, dismissals.section]);

  // ── Auto trigger: DWELL at 4 minutes total ────────────────────────────
  useEffect(() => {
    if (hasSubmitted || dismissals.dwell || pending) return;
    if (elapsedMs >= DWELL_TRIGGER_MS) setPending('dwell');
  }, [hasSubmitted, dismissals.dwell, pending, elapsedMs]);

  // ── Programmatic triggers: role, reserve ─────────────────────────────
  const trigger = useCallback((reason: LeadGateReason) => {
    if (hasSubmitted) return;
    // Per-trigger dismissal check
    if (reason === 'landing'         && dismissals.landing)          return;
    if (reason === 'role'            && dismissals.role)             return;
    if (reason === 'dashboard-entry' && dismissals['dashboard-entry']) return;
    if (reason === 'reserve'         && dismissals.reserve)          return;
    if (reason === 'dwell'           && dismissals.dwell)            return;
    setPending(reason);
  }, [hasSubmitted, dismissals]);

  // ── Dismissal / submission ────────────────────────────────────────────
  const dismiss = useCallback(() => {
    if (!pending) return;
    setDismissals((prev) => {
      if (pending === 'section') return { ...prev, section: prev.section + 1 };
      return { ...prev, [pending]: true } as GateDismissals;
    });
    setPending(null);
  }, [pending]);

  const clear = useCallback(() => setPending(null), []);

  // Once submitted, drop any pending popup and clear localStorage flags
  // (they're moot; the submission itself is remembered elsewhere).
  useEffect(() => {
    if (hasSubmitted) setPending(null);
  }, [hasSubmitted]);

  return {
    pending,           // LeadGateReason | null — current popup to show
    trigger,           // (reason) => void — call this on role click / reserve click
    dismiss,           // () => void — call from the popup's Close/Not-now
    clear,             // () => void — call after successful submission
    hasSubmitted,
    // Exposed for diagnostics / debugging
    _internals: {
      elapsedMs, sectionsOpened, hasEnteredDashboard, dismissals,
    },
  };
}
