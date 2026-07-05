/**
 * DemoLeadGate — the progressive gate.
 *
 * Three visual variants, driven by a single state machine (see `useLeadGate`):
 *   - `banner`  → small non-modal strip at the top of the viewport. Non-blocking.
 *   - `soft`    → dismissible modal. Suggests but doesn't require. Includes "Not now".
 *   - `hard`    → blocking modal. No dismiss. Sales checkpoint.
 *
 * The gate wraps DemoLeadForm and adds:
 *   1. The chrome (banner strip / dialog wrapper).
 *   2. The submit handler that POSTs to /api/trial-requests, packages the
 *      session telemetry into the `useCase` field, and marks the session
 *      submitted so the gate never fires again.
 *
 * The gate never fires on `/dashboard/*` chat routes so as not to interrupt
 * the actual product experience — see useLeadGate for the routing rules.
 */
import { useCallback } from 'react';
import { X, Sparkles, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useDemoSession } from '@/context/DemoSessionContext';
import DemoLeadForm, { DemoLeadPayload } from './DemoLeadForm';

// ─── Types ────────────────────────────────────────────────────────────

export type LeadGateMode = 'banner' | 'soft' | 'hard' | 'hidden';

interface Props {
  mode: LeadGateMode;
  /** Optional prefill (e.g. from a role-card click). */
  initial?: Partial<DemoLeadPayload>;
  /** Called when the visitor dismisses the current mode (banner/soft only). */
  onDismiss: () => void;
  /** Called after a successful submission. */
  onSubmitted: () => void;
  /** Optional header override (used for role-card / reserve-triggered opens). */
  headline?: string;
  subhead?: string;
}

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
      useCase,             // packed with session telemetry
      companySize: null,   // deliberately omitted from the demo lead form
    }),
  });

  // Both 201 (created) and 409 (already pending) are "we know who you are" states.
  if (res.status === 201 || res.status === 409) return;

  // Attempt to surface the server's error message
  let msg = 'Something went wrong. Please try again.';
  try {
    const data = await res.json();
    if (data?.error) msg = String(data.error);
  } catch { /* not JSON */ }
  throw new Error(msg);
}

// ─── The gate component ───────────────────────────────────────────────

const DemoLeadGate = ({
  mode, initial, onDismiss, onSubmitted, headline, subhead,
}: Props) => {
  const { markSubmitted, telemetryUseCase, log } = useDemoSession();

  const handleSubmit = useCallback(async (data: DemoLeadPayload) => {
    // Package the session telemetry with the form fields. The backend stores
    // the whole thing verbatim in the `useCase` column — sales can eyeball
    // the summary at the top and pull the events if needed.
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
    log('gate.submit', { mode });
    toast({
      title: 'Thank you.',
      description: `We'll be in touch at ${data.email} shortly. Enjoy the rest of the demo.`,
    });
    onSubmitted();
  }, [mode, markSubmitted, telemetryUseCase, log, onSubmitted]);

  if (mode === 'hidden') return null;

  // ── Banner variant ─────────────────────────────────────────────────
  if (mode === 'banner') {
    return (
      <div className="sticky top-0 z-40 border-b border-blue-900/40 bg-gradient-to-r from-blue-950/95 via-blue-900/95 to-slate-900/95 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center gap-3 px-4 py-2.5">
          <Sparkles className="w-4 h-4 text-blue-300 shrink-0" />
          <p className="flex-1 text-xs sm:text-sm text-blue-100">
            <span className="font-semibold">Trying Kotwal?</span>
            {' '}We'd love to know who's evaluating — takes 20 seconds.
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="hidden sm:inline-flex bg-white/95 text-slate-900 hover:bg-white h-7 text-xs"
            onClick={() => log('gate.banner.cta')}
            asChild
          >
            <a href="#demo-lead-banner-form">Quick intro</a>
          </Button>
          <button
            type="button"
            onClick={onDismiss}
            className="text-blue-200/70 hover:text-white p-1"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Inline expanded form when the visitor scrolls to the anchor. Keeps
            the banner non-modal — clicking "Quick intro" just jumps here. */}
        <div id="demo-lead-banner-form" className="max-w-lg mx-auto px-4 pb-4">
          <div className="rounded-lg border border-blue-800/50 bg-slate-950/60 p-4 backdrop-blur">
            <p className="text-[11px] uppercase tracking-widest text-blue-300 font-semibold mb-2">
              20-second intro
            </p>
            <DemoLeadForm
              initial={initial}
              onSubmit={handleSubmit}
              hideSecondary
              primaryLabel="Send"
              size="compact"
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Modal variants (soft + hard) ───────────────────────────────────
  const dismissible = mode === 'soft';
  const defaultHeadline = mode === 'soft'
    ? 'Enjoying the demo?'
    : 'Quick intro before you continue';
  const defaultSubhead = mode === 'soft'
    ? 'Twenty seconds — our team can follow up with a tailored walk-through.'
    : 'To keep exploring, share a work email so our team can send you the follow-up materials.';

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        // Only allow dismiss via the ✕ / "Not now" path in soft mode.
        // Hard mode ignores overlay clicks and ESC.
        if (!open && dismissible) onDismiss();
      }}
    >
      <DialogContent
        className={cn(
          'sm:max-w-md',
          !dismissible && 'sm:max-w-lg',
          // In hard mode the built-in ✕ inside shadcn's DialogContent
          // (a Radix DialogClose with .absolute.right-4.top-4) would defeat
          // the checkpoint. Hide it via a targeted descendant selector.
          !dismissible && '[&_[data-radix-collection-item]]:hidden [&>button.absolute]:hidden',
        )}
        // Prevent overlay / ESC dismiss in hard mode
        onEscapeKeyDown={dismissible ? undefined : (e) => e.preventDefault()}
        onInteractOutside={dismissible ? undefined : (e) => e.preventDefault()}
        onPointerDownOutside={dismissible ? undefined : (e) => e.preventDefault()}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className={cn(
            'rounded-lg p-2 shrink-0',
            mode === 'soft' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700',
          )}>
            {mode === 'soft'
              ? <Sparkles className="w-5 h-5" />
              : <ShieldCheck className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 leading-tight">
              {headline ?? defaultHeadline}
            </h2>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              {subhead ?? defaultSubhead}
            </p>
          </div>
        </div>

        <DemoLeadForm
          initial={initial}
          onSubmit={handleSubmit}
          onSecondary={dismissible ? onDismiss : undefined}
          secondaryLabel={mode === 'soft' ? 'Not now' : undefined}
          hideSecondary={!dismissible}
          primaryLabel={mode === 'soft' ? 'Send intro' : 'Continue demo'}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DemoLeadGate;
