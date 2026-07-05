/**
 * DemoLeadForm — the fields we ask a demo visitor to fill.
 *
 * Minimal: Email + Name + Company + Role. Auto-defaults name and company
 * from the email as the user types, so the form usually needs a single
 * field of real input before "Continue" is enabled.
 *
 * Emits an onSubmit callback with the payload. The parent component handles
 * network I/O — that keeps this form reusable across every trigger reason
 * (see DemoLeadGate for the copy overlay).
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
  onSubmit: (payload: DemoLeadPayload) => Promise<void> | void;
  onSecondary?: () => void;
  secondaryLabel?: string;
  primaryLabel?: string;
  hideSecondary?: boolean;
  initial?: Partial<DemoLeadPayload>;
}

const ROLES = [
  { id: 'engineering', label: 'Engineering' },
  { id: 'security',    label: 'Security'    },
  { id: 'compliance',  label: 'Compliance'  },
  { id: 'legal',       label: 'Legal'       },
  { id: 'executive',   label: 'Executive'   },
  { id: 'other',       label: 'Other'       },
];

// Shared classes so every field is legible on both light and dark themes.
// The dashboard uses a light theme and the landing (rare popup case) uses a
// dark theme; explicit colours guarantee contrast in either context.
const FIELD_CLS =
  'mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 ' +
  'text-sm text-slate-900 placeholder:text-slate-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400';

const LABEL_CLS =
  'text-[10px] uppercase tracking-widest text-slate-600 font-semibold';

const DemoLeadForm = ({
  onSubmit, onSecondary, secondaryLabel = 'Not now',
  primaryLabel = 'Continue', hideSecondary = false,
  initial,
}: Props) => {
  const [email,   setEmail]   = useState(initial?.email   ?? '');
  const [name,    setName]    = useState(initial?.fullName ?? '');
  const [company, setCompany] = useState(initial?.companyName ?? '');
  const [role,    setRole]    = useState(initial?.role ?? 'engineering');

  // Once the user manually edits a defaulted field we stop overriding it.
  const [nameTouched,    setNameTouched]    = useState(!!initial?.fullName);
  const [companyTouched, setCompanyTouched] = useState(!!initial?.companyName);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <form onSubmit={handleSubmit} className="space-y-3" aria-label="Demo lead form">
      {/* Email — the anchor field. Everything else defaults from it. */}
      <div>
        <label className={LABEL_CLS}>Work email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null); }}
          placeholder="you@yourcompany.com"
          autoFocus
          required
          className={FIELD_CLS}
        />
        {emailIssue && email && (
          <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {emailIssue}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>Full name</label>
          <Input
            value={name}
            onChange={(e) => { setName(e.target.value); setNameTouched(true); }}
            placeholder="Jane Doe"
            required
            className={FIELD_CLS}
          />
        </div>
        <div>
          <label className={LABEL_CLS}>Company</label>
          <Input
            value={company}
            onChange={(e) => { setCompany(e.target.value); setCompanyTouched(true); }}
            placeholder="Acme Inc."
            required
            className={FIELD_CLS}
          />
        </div>
      </div>

      <div>
        <label className={LABEL_CLS}>Your role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={FIELD_CLS}
        >
          {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <p className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-1.5">
        <ShieldCheck className="w-3 h-3 mt-0.5 text-emerald-600 shrink-0" />
        <span>
          By continuing you agree that Kotwal may contact you about your evaluation.
          No marketing spam — just the follow-up you requested.
        </span>
      </p>

      <div className="flex items-center justify-end gap-2 pt-1 flex-row-reverse">
        <Button type="submit" disabled={!canSubmit} className={cn('gap-2')}>
          {submitting ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting…</>
          ) : (
            <><CheckCircle2 className="w-3.5 h-3.5" /> {primaryLabel}</>
          )}
        </Button>
        {!hideSecondary && onSecondary && (
          <Button type="button" variant="ghost" onClick={onSecondary}>
            {secondaryLabel}
          </Button>
        )}
      </div>
    </form>
  );
};

export default DemoLeadForm;
