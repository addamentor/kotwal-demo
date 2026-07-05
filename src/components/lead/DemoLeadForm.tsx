/**
 * DemoLeadForm — the fields we ask a demo visitor to fill.
 *
 * Deliberately minimal — Email + Name + Company + Role. Auto-defaults name
 * and company from the email as the user types, so the form usually needs
 * a single field of real input before "Continue" is enabled.
 *
 * Emits an onSubmit callback with the payload. The parent modal handles
 * network I/O — that keeps this component reusable in banner, soft, and
 * hard gate variants.
 */
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import {
  deriveNameFromEmail, deriveCompanyFromDomain, isFreeMailDomain,
} from '@/context/DemoSessionContext';
import { cn } from '@/lib/utils';

export interface DemoLeadPayload {
  fullName: string;
  email: string;
  companyName: string;
  role: string;
}

interface Props {
  /** Called after client-side validation passes. Parent handles network I/O. */
  onSubmit: (payload: DemoLeadPayload) => Promise<void> | void;
  /** Optional secondary action — e.g. "Not now" / "Skip". */
  onSecondary?: () => void;
  secondaryLabel?: string;
  /** Text for the primary submit button. */
  primaryLabel?: string;
  /** If true, disables the secondary/skip path entirely (hard-gate mode). */
  hideSecondary?: boolean;
  /** Prefill defaults (e.g. from a prior submission or a role-card click). */
  initial?: Partial<DemoLeadPayload>;
  /** Visual density — 'default' for modals, 'compact' for the banner. */
  size?: 'default' | 'compact';
}

const ROLES = [
  { id: 'engineering', label: 'Engineering' },
  { id: 'security',    label: 'Security'    },
  { id: 'compliance',  label: 'Compliance'  },
  { id: 'legal',       label: 'Legal'       },
  { id: 'executive',   label: 'Executive'   },
  { id: 'other',       label: 'Other'       },
];

const DemoLeadForm = ({
  onSubmit, onSecondary, secondaryLabel = 'Not now',
  primaryLabel = 'Continue', hideSecondary = false,
  initial, size = 'default',
}: Props) => {
  const [email,   setEmail]   = useState(initial?.email   ?? '');
  const [name,    setName]    = useState(initial?.fullName ?? '');
  const [company, setCompany] = useState(initial?.companyName ?? '');
  const [role,    setRole]    = useState(initial?.role ?? 'engineering');

  // Whether the user has manually edited these fields — if so, we stop
  // auto-defaulting from the email so we don't clobber their input.
  const [nameTouched,    setNameTouched]    = useState(!!initial?.fullName);
  const [companyTouched, setCompanyTouched] = useState(!!initial?.companyName);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-default name + company from the email whenever the user types
  // one and hasn't already touched the corresponding field.
  useEffect(() => {
    if (!email.includes('@')) return;
    if (!nameTouched) {
      const guess = deriveNameFromEmail(email);
      if (guess) setName(guess);
    }
    if (!companyTouched) {
      const guess = deriveCompanyFromDomain(email);
      if (guess) setCompany(guess);
    }
  }, [email, nameTouched, companyTouched]);

  const emailIssue = useMemo(() => {
    if (!email) return null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
    if (isFreeMailDomain(email)) return 'Please use your work email — Kotwal is an enterprise product.';
    return null;
  }, [email]);

  const canSubmit = !!email && !!name && !!company && !emailIssue && !submitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        fullName: name.trim(),
        email: email.trim().toLowerCase(),
        companyName: company.trim(),
        role,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const compact = size === 'compact';

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-3', compact && 'space-y-2')}
      aria-label="Demo lead form"
    >
      {/* Email — the anchor field. Everything else defaults from it. */}
      <div>
        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
          Work email
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null); }}
          placeholder="you@yourcompany.com"
          autoFocus
          required
          className="mt-1"
        />
        {emailIssue && email && (
          <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {emailIssue}
          </p>
        )}
      </div>

      <div className={cn('grid gap-3', compact ? 'grid-cols-1' : 'grid-cols-2')}>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
            Full name
          </label>
          <Input
            value={name}
            onChange={(e) => { setName(e.target.value); setNameTouched(true); }}
            placeholder="Jane Doe"
            required
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
            Company
          </label>
          <Input
            value={company}
            onChange={(e) => { setCompany(e.target.value); setCompanyTouched(true); }}
            placeholder="Acme Inc."
            required
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
          Your role
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
      </div>

      {/* Server / network error surface */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Consent line — plain, no legalese */}
      <p className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-1.5">
        <ShieldCheck className="w-3 h-3 mt-0.5 text-emerald-600 shrink-0" />
        <span>
          By continuing you agree that Kotwal may contact you about your evaluation.
          No marketing spam — just the follow-up you requested.
        </span>
      </p>

      {/* Actions */}
      <div className={cn(
        'flex items-center gap-2 pt-1',
        compact ? 'flex-col' : 'justify-end flex-row-reverse',
      )}>
        <Button
          type="submit"
          disabled={!canSubmit}
          className={cn('gap-2', compact && 'w-full')}
        >
          {submitting ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting…</>
          ) : (
            <><CheckCircle2 className="w-3.5 h-3.5" /> {primaryLabel}</>
          )}
        </Button>
        {!hideSecondary && onSecondary && (
          <Button
            type="button"
            variant="ghost"
            className={cn(compact && 'w-full')}
            onClick={onSecondary}
          >
            {secondaryLabel}
          </Button>
        )}
      </div>
    </form>
  );
};

export default DemoLeadForm;
