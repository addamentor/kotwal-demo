/**
 * DetectionNoticeBar — panel shown between the chat log and the input when
 * one or more prompts were intercepted by the detection engine. Extracted
 * out of ChatContainer so the chat surface stays scannable.
 *
 * Each notice card includes: action + risk, categories, the intercepted
 * prompt, findings, decision reasons, and (for WARN) an override reason
 * textarea + "Send with override" button.
 */
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { DetectionInterceptBody, DetectionFinding } from '@/services/chatApi';

export interface DetectionNotice {
  id: string;
  userMessage: string;
  details: DetectionInterceptBody;
  timestamp: Date;
}

interface Props {
  notices: DetectionNotice[];
  overrideReasonByNotice: Record<string, string>;
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  onEditPrompt: (msg: string) => void;
  onProceed: (notice: DetectionNotice) => void;
  onReasonChange: (id: string, reason: string) => void;
}

const formatScore = (score?: number) =>
  typeof score === 'number' ? Math.round(score * 100) : null;

const formatFindingLabel = (f: DetectionFinding): string => {
  const subtype = (f.subtype || '').replace(/_/g, ' ').toLowerCase();
  const category = (f.category || '').replace(/_/g, ' ').toLowerCase();
  const label = subtype || category || 'sensitive data';
  return label.replace(/\b\w/g, (c) => c.toUpperCase());
};

const DetectionNoticeBar = ({
  notices, overrideReasonByNotice,
  onDismiss, onDismissAll, onEditPrompt, onProceed, onReasonChange,
}: Props) => {
  if (notices.length === 0) return null;

  return (
    <div className="border-t border-amber-200 bg-amber-50/95 px-4 py-6 shadow-inner">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-white/70 p-2 text-amber-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Sensitive content detected
              </p>
              <p className="text-xs text-amber-800">
                Kotwal stopped your prompt before it left your network. Review the explanation below.
              </p>
            </div>
          </div>
          {notices.length > 1 && (
            <button
              type="button"
              onClick={onDismissAll}
              className="text-xs font-medium text-amber-800 underline-offset-4 hover:underline"
            >
              Dismiss all
            </button>
          )}
        </div>

        <div className="space-y-4">
          {notices.map((notice) => {
            const d = notice.details;
            const action = d.action;
            const isBlock = action === 'BLOCK';
            const isWarn = action === 'WARN';
            const canOverride = !!d.canOverride && isWarn;
            const requireReason = !!d.requireOverrideReason;
            const scorePct = formatScore(d.score);
            const cardCls = isBlock
              ? 'border-red-200 bg-red-50 text-red-900'
              : 'border-amber-200 bg-white/90 text-amber-900';
            const accent = isBlock ? 'text-red-600' : 'text-amber-600';
            const promptBg = isBlock
              ? 'bg-red-100/60 text-red-900'
              : 'bg-amber-100/60 text-amber-900';

            return (
              <div key={notice.id} className={`rounded-2xl border p-4 text-sm shadow ${cardCls}`}>
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-center gap-2">
                    {isBlock
                      ? <ShieldAlert className={`h-4 w-4 ${accent}`} />
                      : <ShieldCheck className={`h-4 w-4 ${accent}`} />}
                    <span className="text-sm font-semibold">{action}</span>
                    {scorePct !== null && (
                      <span className={`text-xs font-semibold ${accent}`}>
                        · risk {scorePct}/100
                      </span>
                    )}
                    {d.policyVersion && (
                      <span className="text-[11px] text-gray-500">policy {d.policyVersion}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onDismiss(notice.id)}
                    className="text-xs font-medium text-gray-500 underline-offset-4 hover:underline"
                  >
                    Dismiss
                  </button>
                </div>

                {d.categoriesPresent && d.categoriesPresent.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {d.categoriesPresent.map((cat) => (
                      <span
                        key={cat}
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                          isBlock ? 'border-red-200 bg-red-100/70' : 'border-amber-200 bg-amber-100/70'
                        }`}
                      >
                        {cat.replace(/_/g, ' ').toLowerCase()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3">
                  <p className={`text-[11px] font-semibold uppercase tracking-wide ${accent}`}>
                    Your prompt
                  </p>
                  <div className={`mt-1 max-h-32 overflow-auto rounded-xl ${promptBg} p-3 font-mono text-xs leading-relaxed`}>
                    {notice.userMessage}
                  </div>
                </div>

                {d.findings && d.findings.length > 0 && (
                  <div className={`mt-3 rounded-xl border p-3 ${
                    isBlock ? 'border-red-100 bg-red-50/60' : 'border-amber-100 bg-amber-50/70'
                  }`}>
                    <p className={`mb-2 text-[11px] font-semibold uppercase tracking-wide ${accent}`}>
                      What we found
                    </p>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {d.findings.map((f, i) => (
                        <li key={`${f.subtype || f.category}-${i}`} className="rounded-lg bg-white/80 p-2 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold">{formatFindingLabel(f)}</span>
                            {typeof f.confidence === 'number' && (
                              <span className="text-[10px] text-gray-500">
                                {Math.round(f.confidence * 100)}% conf
                              </span>
                            )}
                          </div>
                          {f.value && (
                            <div className="mt-1 font-mono text-[11px] text-gray-700">{f.value}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {d.decisionReasons && d.decisionReasons.length > 0 && (
                  <details className="mt-3 text-xs">
                    <summary className="cursor-pointer font-semibold">Why this decision?</summary>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
                      {d.decisionReasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </details>
                )}

                {canOverride && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-white p-3">
                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                      Reason for override {requireReason && <span className="text-red-600">*</span>}
                    </label>
                    <p className="mt-0.5 text-[11px] text-gray-600">
                      This is logged to your tenant's audit trail. Be specific — e.g. "Test data, not real PII".
                    </p>
                    <textarea
                      value={overrideReasonByNotice[notice.id] || ''}
                      onChange={(e) => onReasonChange(notice.id, e.target.value)}
                      placeholder="Explain why this prompt is safe to send"
                      className="mt-2 w-full rounded-lg border border-amber-200 bg-white px-2 py-1.5 text-xs text-gray-900 focus:border-amber-400 focus:outline-none"
                      rows={2}
                      maxLength={500}
                    />
                  </div>
                )}

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={() => onEditPrompt(notice.userMessage)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                      isBlock ? 'border-red-300 text-red-800 hover:bg-red-100'
                              : 'border-amber-300 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    Edit prompt
                  </button>
                  {canOverride && (
                    <button
                      type="button"
                      onClick={() => onProceed(notice)}
                      className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={requireReason && !(overrideReasonByNotice[notice.id] || '').trim()}
                    >
                      Send with override
                    </button>
                  )}
                </div>

                {isBlock && (
                  <p className="mt-3 text-[11px] text-red-700">
                    This prompt cannot be overridden. Edit it to remove the highlighted entities and try again.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DetectionNoticeBar;
