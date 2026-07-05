/**
 * UsageSection — token and cost analytics across the tenant.
 *
 * Three surfaces:
 *   1. Summary tiles (30-day totals + trend deltas).
 *   2. Stacked area chart of daily tokens by provider.
 *   3. Two side-by-side leaderboards: top users, top projects.
 */
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { Activity, TrendingUp, TrendingDown, Wallet, Cpu } from 'lucide-react';
import {
  MOCK_USAGE_TIMESERIES, MOCK_USAGE_BY_USER, MOCK_PROJECTS,
} from '@/lib/mockData';
import { cn } from '@/lib/utils';

type RangeKey = '7d' | '14d' | '30d';

// Rough per-1M-token blended cost for the tenant, per provider. Used to
// estimate the demo spend curve. These are deliberately illustrative — the
// real product reads them from ChatModel.config.pricing.
const PROVIDER_COST_PER_M: Record<string, number> = {
  openai:    3.5,
  anthropic: 3.0,
  gemini:    1.25,
  deepseek:  0.4,
};

const PROVIDER_COLOR: Record<string, string> = {
  openai:    '#10b981',
  anthropic: '#f97316',
  gemini:    '#6366f1',
  deepseek:  '#0ea5e9',
};

const formatTokens = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const UsageSection = () => {
  const [range, setRange] = useState<RangeKey>('30d');
  const days = range === '7d' ? 7 : range === '14d' ? 14 : 30;
  const series = useMemo(() => MOCK_USAGE_TIMESERIES.slice(-days), [days]);

  // ── Totals + deltas ───────────────────────────────────────────────────
  const totals = useMemo(() => {
    let openai = 0, anthropic = 0, gemini = 0, deepseek = 0;
    for (const s of series) {
      openai    += s.openai;
      anthropic += s.anthropic;
      gemini    += s.gemini;
      deepseek  += s.deepseek;
    }
    const totalTokens = openai + anthropic + gemini + deepseek;
    const totalSpend  =
      (openai    * PROVIDER_COST_PER_M.openai    +
       anthropic * PROVIDER_COST_PER_M.anthropic +
       gemini    * PROVIDER_COST_PER_M.gemini    +
       deepseek  * PROVIDER_COST_PER_M.deepseek) / 1_000_000;

    // Trend: compare first half of series to second half
    const half = Math.floor(series.length / 2);
    const firstHalf = series.slice(0, half)
      .reduce((s, x) => s + x.openai + x.anthropic + x.gemini + x.deepseek, 0);
    const secondHalf = series.slice(half)
      .reduce((s, x) => s + x.openai + x.anthropic + x.gemini + x.deepseek, 0);
    const trendPct = firstHalf ? Math.round(((secondHalf - firstHalf) / firstHalf) * 100) : 0;

    // Average sessions per active user for the summary card
    const sessions = MOCK_USAGE_BY_USER.reduce((s, u) => s + u.sessions, 0);

    return { openai, anthropic, gemini, deepseek, totalTokens, totalSpend, trendPct, sessions };
  }, [series]);

  const topProjects = useMemo(() => {
    return [...MOCK_PROJECTS]
      .filter((p) => (p.usedTokens ?? 0) > 0)
      .sort((a, b) => (b.usedTokens ?? 0) - (a.usedTokens ?? 0));
  }, []);

  return (
    <div className="space-y-6">
      {/* Range toggle */}
      <div className="flex items-center justify-end">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
          {(['7d', '14d', '30d'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setRange(k)}
              className={cn(
                'px-3 py-1 rounded-md font-medium transition-colors',
                range === k
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900',
              )}
            >
              {k.replace('d', ' days')}
            </button>
          ))}
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryTile
          label="Total tokens"
          value={formatTokens(totals.totalTokens)}
          delta={totals.trendPct}
          icon={Cpu}
          tone="blue"
        />
        <SummaryTile
          label="Estimated spend"
          value={`$${totals.totalSpend.toFixed(2)}`}
          delta={totals.trendPct}
          icon={Wallet}
          tone="amber"
        />
        <SummaryTile
          label="Chat sessions"
          value={totals.sessions.toLocaleString()}
          delta={null}
          icon={Activity}
          tone="emerald"
        />
        <SummaryTile
          label="Top provider"
          value={
            Object.entries({
              openai: totals.openai, anthropic: totals.anthropic,
              gemini: totals.gemini, deepseek: totals.deepseek,
            }).sort(([, a], [, b]) => b - a)[0][0]
          }
          delta={null}
          icon={Cpu}
          tone="slate"
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tokens by provider · last {days} days</CardTitle>
          <CardDescription>Daily token consumption, stacked by upstream AI provider.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  {(['openai', 'anthropic', 'gemini', 'deepseek'] as const).map((p) => (
                    <linearGradient key={p} id={`gr-${p}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={PROVIDER_COLOR[p]} stopOpacity={0.55} />
                      <stop offset="100%" stopColor={PROVIDER_COLOR[p]} stopOpacity={0.05} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(d: string) => d.slice(5)}   // MM-DD
                  interval={Math.floor(series.length / 6)}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => formatTokens(v)} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#e2e8f0' }}
                  formatter={(v: number) => formatTokens(v)}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {(['openai', 'anthropic', 'gemini', 'deepseek'] as const).map((p) => (
                  <Area
                    key={p} type="monotone" dataKey={p} stackId="1"
                    stroke={PROVIDER_COLOR[p]} fill={`url(#gr-${p})`} strokeWidth={1.5}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top users by tokens</CardTitle>
            <CardDescription>Consumption over the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {MOCK_USAGE_BY_USER.map((u, i) => {
                const max = MOCK_USAGE_BY_USER[0].tokens || 1;
                const pct = Math.round((u.tokens / max) * 100);
                return (
                  <li key={u.email} className="grid grid-cols-[24px_1fr_auto] items-center gap-3 text-xs">
                    <span className="text-slate-400 font-mono">#{i + 1}</span>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-slate-800 truncate">{u.name}</span>
                        <span className="font-mono text-slate-600">{formatTokens(u.tokens)}</span>
                      </div>
                      <div className="mt-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${Math.max(4, pct)}%` }} />
                      </div>
                    </div>
                    <span className="text-slate-500 text-[11px]">${u.spendUsd.toFixed(1)}</span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top projects</CardTitle>
            <CardDescription>Projects sorted by tokens used this period.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {topProjects.map((p, i) => {
                const max = topProjects[0].usedTokens ?? 1;
                const pct = Math.round(((p.usedTokens ?? 0) / max) * 100);
                return (
                  <li key={p.id} className="grid grid-cols-[24px_1fr_auto] items-center gap-3 text-xs">
                    <span
                      aria-hidden="true"
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: p.colorHex }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-slate-800 truncate">{p.name}</span>
                        <span className="font-mono text-slate-600">{formatTokens(p.usedTokens ?? 0)}</span>
                      </div>
                      <div className="mt-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full" style={{ background: p.colorHex, width: `${Math.max(4, pct)}%` }} />
                      </div>
                    </div>
                    <span className="text-slate-500 text-[11px]">${(p.spendUsd ?? 0).toFixed(1)}</span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Export button — cosmetic in the demo */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" disabled title="Available in the full product">
          Export CSV (coming soon)
        </Button>
      </div>
    </div>
  );
};

const SummaryTile = ({
  label, value, delta, icon: Icon, tone,
}: {
  label: string; value: string; delta: number | null;
  icon: typeof Cpu; tone: 'blue' | 'amber' | 'emerald' | 'slate';
}) => {
  const tones = {
    blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700'    },
    amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700'   },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    slate:   { bg: 'bg-slate-50',   border: 'border-slate-200',   text: 'text-slate-700'   },
  }[tone];
  const DeltaIcon = delta != null && delta >= 0 ? TrendingUp : TrendingDown;
  return (
    <div className={cn('rounded-xl border px-4 py-3', tones.bg, tones.border)}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold">{label}</p>
        <Icon className={cn('w-4 h-4', tones.text)} />
      </div>
      <p className="text-2xl font-semibold text-slate-900 leading-tight mt-1 capitalize">{value}</p>
      {delta != null && (
        <div className={cn('mt-1 flex items-center gap-1 text-[11px]', delta >= 0 ? 'text-emerald-700' : 'text-red-700')}>
          <DeltaIcon className="w-3 h-3" />
          {Math.abs(delta)}% vs. prior period
        </div>
      )}
    </div>
  );
};

export default UsageSection;
