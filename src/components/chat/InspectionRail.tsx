/**
 * InspectionRail — right-hand column showing what Kotwal sees.
 *
 * This is the demo-parity port of the real InspectionRail. It reads the most
 * recent DetectionInterceptBody for the active session to surface the last
 * action, risk score, categories, and findings inline. When no notice has
 * fired yet, it shows a live-protection reassurance panel so the rail always
 * feels alive.
 *
 * Collapses to a narrow strip via `onToggleCollapsed`.
 */

import { ReactNode, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  ShieldCheck, ShieldAlert, ShieldOff, ChevronRight, PanelRightClose, PanelRightOpen,
  CheckCircle2, AlertCircle, FileWarning,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DetectionInterceptBody, DetectionFinding } from '@/services/chatApi';

interface DetectionNotice {
  id: string;
  userMessage: string;
  details: DetectionInterceptBody;
  timestamp: Date;
}

interface Props {
  lastNotice: DetectionNotice | null;
  modelLabel?: string | null;
  sessionId?: string | null;
  policyVersion?: number | string | null;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

function formatCategoryLabel(s: string) {
  return s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatFindingLabel(f: DetectionFinding) {
  return formatCategoryLabel(f.subtype || f.category || 'sensitive data');
}

type Severity = 'block' | 'warn' | 'redact' | 'clear';

const InspectionRail = ({
  lastNotice, modelLabel, sessionId, policyVersion, collapsed, onToggleCollapsed,
}: Props) => {
  const d = lastNotice?.details ?? null;
  const action   = d?.action ?? null;
  const score    = d?.score ?? null;
  const cats     = d?.categoriesPresent ?? [];
  const findings = d?.findings ?? [];

  const severity: Severity = useMemo(() => {
    if (action === 'BLOCK')  return 'block';
    if (action === 'WARN')   return 'warn';
    if (action === 'REDACT') return 'redact';
    return 'clear';
  }, [action]);

  // ── Collapsed strip ────────────────────────────────────────────────────
  if (collapsed) {
    const Icon = severity === 'block' ? ShieldOff
               : severity === 'warn'  ? ShieldAlert
               : severity === 'redact'? ShieldAlert
                                      : ShieldCheck;
    const tone = severity === 'block' ? 'text-red-600'
               : severity === 'warn'  ? 'text-amber-600'
               : severity === 'redact'? 'text-blue-600'
                                      : 'text-emerald-600';
    return (
      <aside className="hidden lg:flex w-12 shrink-0 border-l border-border bg-muted/20 flex-col items-center py-3 gap-3">
        <button
          onClick={onToggleCollapsed}
          title="Open inspection panel"
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <PanelRightOpen className="h-4 w-4" />
        </button>
        <div className={cn('rounded-md p-1.5', tone)} title={`Kotwal: ${severity}`}>
          <Icon className="h-4 w-4" />
        </div>
      </aside>
    );
  }

  // ── Full rail ──────────────────────────────────────────────────────────
  const borderTone =
    severity === 'block'  ? 'border-red-200'   :
    severity === 'warn'   ? 'border-amber-200' :
    severity === 'redact' ? 'border-blue-200'  :
                            'border-border';

  return (
    <aside
      className={cn(
        'hidden lg:flex w-[320px] shrink-0 border-l flex-col bg-card/40',
        borderTone,
      )}
      aria-label="Kotwal inspection panel"
    >
      {/* Header */}
      <header className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            Inspection
          </p>
          <p className="text-sm font-semibold text-foreground leading-tight">
            What Kotwal saw
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground"
          onClick={onToggleCollapsed}
          title="Collapse panel"
        >
          <PanelRightClose className="h-4 w-4" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-sm">
        <StatusHero severity={severity} score={score} action={action} />

        {cats.length > 0 && (
          <section>
            <SectionLabel>Categories detected</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {cats.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-foreground/80"
                >
                  {formatCategoryLabel(c)}
                </span>
              ))}
            </div>
          </section>
        )}

        {findings.length > 0 && (
          <section>
            <SectionLabel>Findings ({findings.length})</SectionLabel>
            <ul className="space-y-1.5">
              {findings.slice(0, 8).map((f, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground">
                      {formatFindingLabel(f)}
                    </span>
                    {typeof f.confidence === 'number' && (
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {Math.round(f.confidence * 100)}%
                      </span>
                    )}
                  </div>
                  {f.value && (
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground truncate" title={f.value}>
                      {f.value}
                    </p>
                  )}
                </li>
              ))}
              {findings.length > 8 && (
                <p className="text-[11px] text-muted-foreground italic">
                  + {findings.length - 8} more
                </p>
              )}
            </ul>
          </section>
        )}

        {d?.decisionReasons && d.decisionReasons.length > 0 && (
          <section>
            <SectionLabel>Why this decision?</SectionLabel>
            <ul className="space-y-1">
              {d.decisionReasons.slice(0, 4).map((r, i) => (
                <li key={i} className="text-[11px] text-muted-foreground leading-relaxed flex gap-1.5">
                  <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground/60" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!lastNotice && (
          <section className="space-y-2">
            <SectionLabel>Live protection</SectionLabel>
            <CheckRow label="Sensitive data scanning" />
            <CheckRow label="Credentials & PII redaction" />
            <CheckRow label="Per-prompt audit logging" />
            <p className="text-[11px] text-muted-foreground pt-1 leading-relaxed">
              Send a prompt — Kotwal inspects it before it ever reaches the model.
              Try one of the sample prompts to see the rail react in real time.
            </p>
          </section>
        )}
      </div>

      {/* Footer: session/model info */}
      <footer className="px-4 py-3 border-t border-border bg-muted/20 space-y-1.5">
        {modelLabel && <FooterRow label="Model"   value={modelLabel} />}
        {policyVersion != null && <FooterRow label="Policy" value={`v${policyVersion}`} />}
        {sessionId && (
          <FooterRow
            label="Session"
            value={
              <span className="font-mono text-[10px] text-muted-foreground">
                {sessionId.slice(0, 8)}…
              </span>
            }
          />
        )}
      </footer>
    </aside>
  );
};

// ── helpers ──────────────────────────────────────────────────────────────

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
    {children}
  </p>
);

const CheckRow = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2">
    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
    <span className="text-xs text-foreground/85">{label}</span>
  </div>
);

const FooterRow = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex items-center justify-between gap-2 text-[11px]">
    <span className="text-muted-foreground uppercase tracking-wide text-[10px]">{label}</span>
    <span className="font-medium text-foreground/90 truncate max-w-[180px]">{value}</span>
  </div>
);

// Colour presets per severity — used by StatusHero for both the container tone
// and the score-bar fill. Keeping this out of the component keeps rendering
// side-effect-free (no dynamic Tailwind class construction).
const STATUS_PRESETS: Record<Severity, {
  bg: string; border: string; text: string; bar: string;
  icon: typeof ShieldOff; label: string; sub: string;
}> = {
  block: {
    bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', bar: 'bg-red-500',
    icon: ShieldOff, label: 'Blocked', sub: 'Sensitive content prevented from leaving',
  },
  warn: {
    bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', bar: 'bg-amber-500',
    icon: AlertCircle, label: 'Flagged', sub: 'Review needed before sending',
  },
  redact: {
    bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', bar: 'bg-blue-500',
    icon: FileWarning, label: 'Redacted', sub: 'Sensitive values masked before sending',
  },
  clear: {
    bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', bar: 'bg-emerald-500',
    icon: ShieldCheck, label: 'All clear', sub: 'No sensitive content detected',
  },
};

const StatusHero = ({
  severity, score, action,
}: { severity: Severity; score: number | null; action: string | null }) => {
  const cfg = STATUS_PRESETS[severity];
  const Icon = cfg.icon;
  return (
    <div className={cn('rounded-xl border p-3.5', cfg.bg, cfg.border)}>
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', cfg.text)} />
        <div className="min-w-0 flex-1">
          <p className={cn('text-sm font-semibold', cfg.text)}>{cfg.label}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
            {cfg.sub}
          </p>
          {score != null && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Risk</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/70 overflow-hidden">
                <div
                  className={cn('h-full', cfg.bar)}
                  style={{ width: `${Math.min(100, Math.max(4, Math.round(score * 100)))}%` }}
                />
              </div>
              <span className="text-[11px] font-mono font-semibold text-foreground">
                {Math.round(score * 100)}%
              </span>
            </div>
          )}
          {action && action !== 'ALLOW' && (
            <p className="mt-2 text-[10px] font-mono text-muted-foreground">
              action: {action}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectionRail;
