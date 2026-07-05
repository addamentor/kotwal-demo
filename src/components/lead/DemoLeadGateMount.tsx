/**
 * DemoLeadGateMount — the single top-level mount that renders the gate.
 *
 * Owns two responsibilities:
 *   1. Tracks route changes and section clicks into the DemoSession log
 *      (so the "sections opened" and "routes visited" telemetry stays fresh).
 *   2. Renders the correct gate variant based on `useLeadGate`.
 *
 * Exposed as `<DemoLeadGateMount />` in App.tsx.
 *
 * External components that want to force a hard gate (e.g. Reserve buttons
 * on MCP / Agents cards) can dispatch a `kotwal-demo:force-gate` custom
 * event with `{ mode: 'soft' | 'hard' }` in the detail; this mount listens
 * and reacts.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDemoSession } from '@/context/DemoSessionContext';
import { useLeadGate } from './useLeadGate';
import DemoLeadGate from './DemoLeadGate';
import { LeadGateMode } from './DemoLeadGate';

const DemoLeadGateMount = () => {
  const location = useLocation();
  const { log, dismissBanner, dismissSoft } = useDemoSession();
  const { mode, force, clearForce, hasSubmitted } = useLeadGate();

  // Route logging — one `route` event per pathname change
  useEffect(() => {
    log('route', { path: location.pathname });
  }, [location.pathname, log]);

  // Listen for external "force this gate open" events (Reserve clicks, etc.)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { mode?: 'soft' | 'hard' } | undefined;
      if (detail?.mode) force(detail.mode);
    };
    window.addEventListener('kotwal-demo:force-gate', handler as EventListener);
    return () => window.removeEventListener('kotwal-demo:force-gate', handler as EventListener);
  }, [force]);

  const handleDismiss = () => {
    // The mode we're currently rendering decides which dismiss to record
    if (mode === 'banner') dismissBanner();
    else if (mode === 'soft') dismissSoft();
    // Hard mode is not dismissible; the caller never gets here for it.
    clearForce();
  };

  const handleSubmitted = () => {
    // The session context has marked us submitted; drop any force override.
    clearForce();
  };

  // Nothing to render — either the visitor submitted, or we're on a page
  // that never gates (chat).
  if (hasSubmitted) return null;
  if (mode === 'hidden') return null;

  return (
    <DemoLeadGate
      mode={mode as Exclude<LeadGateMode, 'hidden'>}
      onDismiss={handleDismiss}
      onSubmitted={handleSubmitted}
    />
  );
};

export default DemoLeadGateMount;

/**
 * Helper — dispatch a global "force this gate" event. Callers use this
 * instead of importing the hook, so any component in the tree can trigger
 * the gate without threading refs through.
 */
export function forceLeadGate(mode: 'soft' | 'hard') {
  window.dispatchEvent(new CustomEvent('kotwal-demo:force-gate', { detail: { mode } }));
}
