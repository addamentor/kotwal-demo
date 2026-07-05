/**
 * DemoLeadGateMount — top-level mount that renders the demo lead popup.
 *
 * Owns two responsibilities:
 *   1. Tracks route changes into the DemoSession log (so "sections opened",
 *      "dashboard entered", "routes visited" telemetry stays fresh).
 *   2. Renders the popup when `useLeadGate` reports a pending trigger.
 *
 * External components fire triggers via the exported `triggerLeadGate()`
 * helper, which dispatches a `kotwal-demo:trigger-gate` window event with
 * the reason in `detail.reason`. This mount listens and forwards to the
 * `useLeadGate` hook. Callers use this instead of importing the hook so
 * any component in the tree can trigger without threading refs through.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDemoSession } from '@/context/DemoSessionContext';
import { useLeadGate } from './useLeadGate';
import type { LeadGateReason } from './useLeadGate';
import DemoLeadGate from './DemoLeadGate';

const EVENT_NAME = 'kotwal-demo:trigger-gate';

const DemoLeadGateMount = () => {
  const location = useLocation();
  const { log } = useDemoSession();
  const { pending, trigger, dismiss, clear, hasSubmitted } = useLeadGate();

  // Route logging — one `route` event per pathname change
  useEffect(() => {
    log('route', { path: location.pathname });
  }, [location.pathname, log]);

  // Listen for external "fire this trigger" events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { reason?: LeadGateReason } | undefined;
      if (detail?.reason) trigger(detail.reason);
    };
    window.addEventListener(EVENT_NAME, handler as EventListener);
    return () => window.removeEventListener(EVENT_NAME, handler as EventListener);
  }, [trigger]);

  if (hasSubmitted) return null;

  return (
    <DemoLeadGate
      reason={pending}
      onDismiss={dismiss}
      onSubmitted={clear}
    />
  );
};

export default DemoLeadGateMount;

/**
 * Dispatch a "fire this trigger" event from anywhere in the tree.
 * Callers use this instead of importing `useLeadGate` directly.
 */
export function triggerLeadGate(reason: LeadGateReason) {
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { reason } }));
}
