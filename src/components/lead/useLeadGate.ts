/**
 * useLeadGate — the state machine that decides which gate to show.
 *
 * Rules, in priority order:
 *   1. Never show the gate once the visitor has submitted the form.
 *   2. Never show the gate on the chat page (`/`) — chat is the product.
 *   3. If the visitor is on `/dashboard/*`:
 *        - `banner` at t=0 (dismissible)
 *        - `soft`   after 90s OR after opening the 3rd section (dismissible)
 *        - `hard`   after 4 min OR when a "force" trigger fires (Reserve, etc.)
 *   4. If the visitor is on `/demo` (role picker):
 *        - `banner` at t=0
 *   5. `forceMode` from callers (e.g. Reserve-access click) overrides
 *      everything up to `hard`.
 *
 * The hook is passive — it reads session state and route, and returns
 * the currently-appropriate mode. Callers wire the mode into DemoLeadGate.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDemoSession } from '@/context/DemoSessionContext';
import type { LeadGateMode } from './DemoLeadGate';

const SOFT_AFTER_MS = 90_000;       // 1m 30s
const HARD_AFTER_MS = 4 * 60_000;   // 4 minutes
const SOFT_AFTER_SECTIONS = 3;      // dashboard section navigations

export function useLeadGate() {
  const location = useLocation();
  const { session, hasSubmitted } = useDemoSession();

  // Force-open triggered by external UI events (Reserve buttons, gated links).
  const [forceMode, setForceMode] = useState<LeadGateMode | null>(null);
  const [tick, setTick] = useState(0); // heartbeat so time-based gates advance

  // Re-evaluate mode once per second — cheap, avoids stale gates when the
  // user leaves the demo idle in a tab.
  useEffect(() => {
    if (hasSubmitted) return;
    const id = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [hasSubmitted]);

  const elapsedMs = useMemo(() => {
    const start = new Date(session.startedAt).getTime();
    void tick;    // depend on tick so this recomputes each heartbeat
    return Date.now() - start;
  }, [session.startedAt, tick]);

  // How many distinct dashboard sections has this session opened?
  const sectionsOpened = useMemo(() => {
    const ids = new Set<string>();
    for (const ev of session.events) {
      if (ev.kind === 'section' && ev.meta?.id) ids.add(String(ev.meta.id));
    }
    return ids.size;
  }, [session.events]);

  const mode = useMemo<LeadGateMode>(() => {
    if (hasSubmitted) return 'hidden';
    if (forceMode)    return forceMode;

    const path = location.pathname;

    // Chat page — never gate. Chat is the product.
    if (path === '/') return 'hidden';

    // Dashboard rules
    if (path.startsWith('/dashboard')) {
      // Hard checkpoint after 4 minutes anywhere in the admin
      if (elapsedMs >= HARD_AFTER_MS) return 'hard';
      // Soft nudge after 90s or after 3 sections
      if (session.softDismissedAt) {
        // Once soft is dismissed, wait for the hard checkpoint
        return 'hidden';
      }
      if (elapsedMs >= SOFT_AFTER_MS || sectionsOpened >= SOFT_AFTER_SECTIONS) return 'soft';
      // Otherwise, banner if not dismissed
      return session.bannerDismissedAt ? 'hidden' : 'banner';
    }

    // Role-picker page — banner if not dismissed
    if (path === '/demo') {
      return session.bannerDismissedAt ? 'hidden' : 'banner';
    }

    return 'hidden';
  }, [
    hasSubmitted, forceMode, location.pathname, elapsedMs,
    session.bannerDismissedAt, session.softDismissedAt, sectionsOpened,
  ]);

  const force = useCallback((m: 'soft' | 'hard') => setForceMode(m), []);
  const clearForce = useCallback(() => setForceMode(null), []);

  return { mode, force, clearForce, hasSubmitted };
}
