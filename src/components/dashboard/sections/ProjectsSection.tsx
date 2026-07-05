/**
 * ProjectsSection — grid of projects with budgets, usage sparklines, and
 * membership counts. Purely a display in the demo; "New project" opens a
 * modal that fabricates a client-side entry.
 */
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { FolderKanban, PlusCircle, Users, Wallet, Activity, Search } from 'lucide-react';
import { MOCK_PROJECTS, DemoProject } from '@/lib/mockData';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<NonNullable<DemoProject['status']>, string> = {
  active:   'border-emerald-200 bg-emerald-50 text-emerald-700',
  paused:   'border-amber-200 bg-amber-50 text-amber-700',
  archived: 'border-slate-200 bg-slate-50 text-slate-500',
};

const PALETTE = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#0ea5e9', '#a855f7'];

const formatTokens = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};

const formatRelative = (iso?: string) => {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const now  = new Date('2026-07-05T00:00:00Z').getTime();
  const hours = Math.round((now - then) / (1000 * 60 * 60));
  if (hours < 1)  return 'just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

/**
 * Tiny inline SVG sparkline. Deliberately dependency-free — the demo only
 * imports recharts once (in UsageSection) so we avoid dragging it here.
 */
const Spark = ({ data, color }: { data: number[]; color: string }) => {
  if (!data.length) return null;
  const w = 88, h = 24, pad = 2;
  const max = Math.max(...data, 1);
  const step = (w - pad * 2) / (data.length - 1 || 1);
  const points = data.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - (v / max) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-90">
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const ProjectsSection = () => {
  const [projects, setProjects] = useState<DemoProject[]>(MOCK_PROJECTS);
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newBudget, setNewBudget] = useState<number>(1_000_000);

  const filtered = useMemo(() => {
    if (!query.trim()) return projects;
    const q = query.toLowerCase();
    return projects.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.description ?? '').toLowerCase().includes(q) ||
      (p.ownerName ?? '').toLowerCase().includes(q),
    );
  }, [projects, query]);

  const summary = useMemo(() => ({
    total:  projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    totalTokensUsed: projects.reduce((sum, p) => sum + (p.usedTokens ?? 0), 0),
    totalSpend:      projects.reduce((sum, p) => sum + (p.spendUsd ?? 0),   0),
  }), [projects]);

  const submitCreate = () => {
    if (!newName.trim()) {
      toast({ title: 'Name required', variant: 'destructive', description: 'Give the project a name.' });
      return;
    }
    const nextColor = PALETTE[projects.length % PALETTE.length];
    setProjects((prev) => [
      {
        id: `proj-${Date.now()}`,
        name: newName.trim(),
        description: newDescription.trim() || undefined,
        colorHex: nextColor,
        status: 'active',
        members: 1,
        budgetTokens: newBudget,
        usedTokens: 0,
        spendUsd: 0,
        ownerName: 'You',
        updatedAt: new Date().toISOString(),
        usageSpark: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      ...prev,
    ]);
    setCreating(false);
    setNewName(''); setNewDescription(''); setNewBudget(1_000_000);
    toast({ title: 'Project created', description: 'Your new project appears at the top of the grid.' });
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Projects"     value={summary.total.toString()}                icon={FolderKanban} tone="slate" />
        <SummaryCard label="Active"       value={summary.active.toString()}               icon={Activity}     tone="emerald" />
        <SummaryCard label="Tokens used"  value={formatTokens(summary.totalTokensUsed)}   icon={Wallet}       tone="blue" />
        <SummaryCard label="Spend"        value={`$${summary.totalSpend.toFixed(2)}`}     icon={Wallet}       tone="amber" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, descriptions, or owners…"
            className="pl-9"
          />
        </div>
        <Button className="gap-2" onClick={() => setCreating(true)}>
          <PlusCircle className="w-4 h-4" />
          New project
        </Button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            <p>No projects match "{query}". Try a broader search.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const budget = p.budgetTokens ?? 0;
            const used   = p.usedTokens ?? 0;
            const pct    = budget > 0 ? Math.min(100, Math.round((used / budget) * 100)) : 0;
            return (
              <Card key={p.id} className="flex flex-col hover:border-slate-300 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span
                        aria-hidden="true"
                        className="mt-1 h-9 w-1.5 rounded-full shrink-0"
                        style={{ background: p.colorHex }}
                      />
                      <div className="min-w-0">
                        <CardTitle className="text-base leading-tight truncate">{p.name}</CardTitle>
                        <CardDescription className="text-xs mt-0.5 line-clamp-2">
                          {p.description ?? '—'}
                        </CardDescription>
                      </div>
                    </div>
                    {p.status && (
                      <Badge variant="outline" className={cn('text-[10px] uppercase tracking-wider', STATUS_STYLES[p.status])}>
                        {p.status}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-3">
                  {/* Budget bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="uppercase tracking-widest font-semibold">Budget</span>
                      <span className="font-mono">{formatTokens(used)} / {formatTokens(budget)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={cn(
                          'h-full',
                          pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        )}
                        style={{ width: `${Math.max(2, pct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Sparkline + members + updated */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">
                        14-day usage
                      </p>
                      <Spark data={p.usageSpark ?? []} color={p.colorHex} />
                    </div>
                    <div className="text-right text-[11px] text-slate-600 leading-tight">
                      <div className="flex items-center gap-1 justify-end">
                        <Users className="w-3 h-3" /> {p.members ?? 0}
                      </div>
                      {p.ownerName && <div className="mt-1">Owner · {p.ownerName}</div>}
                      {p.updatedAt && <div className="text-slate-400">Updated {formatRelative(p.updatedAt)}</div>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
            <DialogDescription>
              Projects let you scope prompts, audits, and budgets per initiative.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-slate-700 uppercase tracking-wider">Name</label>
              <Input
                value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus
                placeholder="e.g. Vendor Reviews — Q4" className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 uppercase tracking-wider">Description</label>
              <Input
                value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
                placeholder="One-line purpose (optional)" className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 uppercase tracking-wider">Token budget</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[500_000, 1_000_000, 2_500_000].map((v) => (
                  <button
                    key={v} type="button" onClick={() => setNewBudget(v)}
                    className={cn(
                      'rounded-lg border py-2 text-xs',
                      newBudget === v
                        ? 'border-blue-400 bg-blue-50 text-blue-800'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    {formatTokens(v)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={submitCreate}>Create project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SummaryCard = ({
  label, value, icon: Icon, tone,
}: { label: string; value: string; icon: typeof Wallet; tone: 'slate' | 'emerald' | 'blue' | 'amber' }) => {
  const tones = {
    slate:   { bg: 'bg-slate-50',   border: 'border-slate-200',   text: 'text-slate-700'   },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700'    },
    amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700'   },
  }[tone];
  return (
    <div className={cn('rounded-xl border px-4 py-3 flex items-center gap-3', tones.bg, tones.border)}>
      <div className={cn('rounded-lg bg-white p-2 border', tones.border)}>
        <Icon className={cn('w-4 h-4', tones.text)} />
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold">{label}</p>
        <p className="text-xl font-semibold text-slate-900 leading-none">{value}</p>
      </div>
    </div>
  );
};

export default ProjectsSection;
