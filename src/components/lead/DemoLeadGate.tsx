/**
 * DemoLeadGate — the demo lead capture popup.
 *
 * One visual variant now: a normal centred modal, always closeable via ✕,
 * ESC, or "Not now". No hard-locked modal, no inline banner. The gate's
 * escalation lives in `useLeadGate` — this component just renders whatever
 * trigger fired.
 *
 * The gate exposes a `reason` so the copy can lean into the moment
 * (e.g. "You clicked Try as Admin — quick intro?" vs. the generic prompt).
 */
import { useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { useDemoSession } from '@/context/DemoSessionContext';
import DemoLeadForm, { DemoLeadPayload } from './DemoLeadForm';
import type { LeadGateReason } from './useLeadGate';

interface Props {
  /** Non-null when the gate should be showing. The reason drives the copy. */
  reason: LeadGateReason | null;
  /** Called when the visitor closes the popup (✕ / ESC / "Not now"). */
  onDismiss: () => void;
  /** Called after a successful submission. */
  onSubmitted: () => void;
}

// ─── Copy per reason ──────────────────────────────────────────────────

const HEADLINES: Record<LeadGateReason, { headline: string; subhead: string; primary: string; secondary: string }> = {
  landing: {
    headline: 'Trying Kotwal?',
    subhead:  'Twenty seconds so our team can reach out with a tailored walk-through. No spam — just the follow-up you asked for.',
    primary:  'Send intro',
    secondary:'Continue browsing',
  },
  role: {
    headline: 'Great — one quick intro first?',
    subhead:  "You'll see the full demo either way. Sharing your details means our team can follow up with the parts most relevant to your role.",
    primary:  'Send & enter demo',
    secondary:'Skip for now',
  },
  'dashboard-entry': {
    headline: 'Welcome to the admin console',
    subhead:  "Take a look around. In the meantime — mind sharing who's evaluating? Twenty seconds.",
    primary:  'Send intro',
    secondary:'Not now',
  },
  section: {
    headline: 'Enjoying the demo?',
    subhead:  "You've explored a few sections. Quick intro so our team knows who to follow up with?",
    primary:  'Send intro',
    secondary:'Keep exploring',
  },
  reserve: {
    headline: 'Reserving early access',
    subhead:  "We'll email you when this ships. Add your details so we know who to notify.",
    primary:  'Reserve access',
    secondary:'Cancel',
  },
  dwell: {
    headline: "You've spent a few minutes here",
    subhead:  'Clearly you know what you\'re looking for. Twenty seconds so our team can reach out with the details that matter to your setup.',
    primary:  'Send intro',
    secondary:'Not now',
  },
};

// ─── Submit helper ────────────────────────────────────────────────────

async function submitTrialRequest(
  payload: DemoLeadPayload,
  useCase: string,
): Promise<void> {
  const res = await fetch('/api/trial-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName:    payload.fullName,
      email:       payload.email,
      companyName: payload.companyName,
      role:        payload.role,
      useCase,
      companySize: null,
    }),
  });

  // 201 (created) and 409 (already pending) both count as "we know you now".
  if (res.status === 201 || res.status === 409) return;

  let msg = 'Something went wrong. Please try again.';
  try {
    const data = await res.json();
    if (data?.error) msg = String(data.error);
  } catch { /* not JSON */ }
  throw new Error(msg);
}

// ─── Component ────────────────────────────────────────────────────────

const DemoLeadGate = ({ reason, onDismiss, onSubmitted }: Props) => {
  const { markSubmitted, telemetryUseCase, log } = useDemoSession();

  const handleSubmit = useCallback(async (data: DemoLeadPayload) => {
    const useCase = [
      `${data.role} at ${data.companyName}`,
      '',
      telemetryUseCase(),
    ].join('\n');

    await submitTrialRequest(data, useCase);
    markSubmitted({
      email: data.email, fullName: data.fullName,
      companyName: data.companyName, role: data.role,
    });
    log('gate.submit', { reason });
    toast({
      title: 'Thank you.',
      description: `We'll be in touch at ${data.email} shortly. Enjoy the rest of the demo.`,
    });
    onSubmitted();
  }, [reason, markSubmitted, telemetryUseCase, log, onSubmitted]);

  if (!reason) return null;

  const copy = HEADLINES[reason];

  return (
    <Dialog
      open
      onOpenChange={(open) => { if (!open) onDismiss(); }}
    >
      <DialogContent className="sm:max-w-md text-slate-900 bg-white">
        <div className="flex items-start gap-3 mb-3">
          <div className="rounded-lg p-2 shrink-0 bg-blue-100 text-blue-700">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <h2 className="text-lg font-semibold text-slate-900 leading-tight">
              {copy.headline}
            </h2>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              {copy.subhead}
            </p>
          </div>
        </div>

        <DemoLeadForm
          onSubmit={handleSubmit}
          onSecondary={onDismiss}
          secondaryLabel={copy.secondary}
          primaryLabel={copy.primary}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DemoLeadGate;
