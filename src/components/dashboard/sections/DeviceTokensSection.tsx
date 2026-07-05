/**
 * DeviceTokensSection — issue and manage tokens used by the VS Code
 * extension, kotwal-cli, and CI runners.
 *
 * Two states:
 *   1. Table of existing tokens with copy / revoke actions.
 *   2. "Create token" modal — collects a label + scopes + client type,
 *      returns a one-time-visible token string. In the demo this is a
 *      fabricated value; in production it's returned by the server exactly
 *      once and never re-shown.
 *
 * All state is client-only. Revoked tokens flip status to 'revoked' and are
 * displayed with a muted row; they cannot be un-revoked from the UI.
 */
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Terminal, KeyRound, Copy, Check, Trash2, Code2, Server,
  PlusCircle, CheckCircle2, AlertCircle, ExternalLink,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { MOCK_DEVICE_TOKENS, DemoDeviceToken } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const CLIENT_LABEL: Record<DemoDeviceToken['clientType'], { label: string; icon: typeof Code2 }> = {
  vscode: { label: 'VS Code',  icon: Code2 },
  cli:    { label: 'CLI',      icon: Terminal },
  ci:     { label: 'CI runner', icon: Server },
};

const AVAILABLE_SCOPES = [
  { id: 'chat.send',          label: 'Send chat prompts',    description: 'Required — permits authenticated chat requests.', required: true  },
  { id: 'chat.history.read',  label: 'Read chat history',    description: 'Allow the client to pull prior sessions.',      required: false },
  { id: 'projects.read',      label: 'Read projects',        description: 'List projects and switch project scope.',        required: false },
];

const formatRelative = (iso: string | null): string => {
  if (!iso) return 'Never';
  const then = new Date(iso).getTime();
  const now  = new Date('2026-07-04T20:00:00Z').getTime();
  const diff = now - then;
  const hours = Math.round(diff / (1000 * 60 * 60));
  if (hours < 1)  return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

const fakeToken = () => {
  // Fabricate a plausible-looking token string: kw_dt_XXXX…XXXX
  const hex = () => Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0');
  return `kw_dt_${hex()}${hex()}_${hex()}${hex()}${hex()}${hex()}`;
};

const DeviceTokensSection = () => {
  const [tokens, setTokens] = useState<DemoDeviceToken[]>(MOCK_DEVICE_TOKENS);
  const [creating, setCreating] = useState(false);

  // Create modal state
  const [newLabel, setNewLabel] = useState('');
  const [newClient, setNewClient] = useState<DemoDeviceToken['clientType']>('vscode');
  const [newScopes, setNewScopes] = useState<string[]>(['chat.send', 'chat.history.read']);

  // Success modal state (shows the one-time-visible token)
  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeCount = useMemo(() => tokens.filter((t) => t.status === 'active').length, [tokens]);
  const vsCodeCount = useMemo(
    () => tokens.filter((t) => t.status === 'active' && t.clientType === 'vscode').length,
    [tokens],
  );

  const toggleScope = (id: string) => {
    setNewScopes((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const openCreate = () => {
    setNewLabel('');
    setNewClient('vscode');
    setNewScopes(['chat.send', 'chat.history.read']);
    setCreating(true);
  };

  const submitCreate = () => {
    if (!newLabel.trim()) {
      toast({ title: 'Label required', description: 'Give this token a descriptive label.', variant: 'destructive' });
      return;
    }
    const token = fakeToken();
    const now = new Date().toISOString();
    setTokens((prev) => [
      {
        id: `tok-${Date.now()}`,
        label: newLabel.trim(),
        clientType: newClient,
        createdAt: now,
        lastUsedAt: null,
        status: 'active',
        // Show first 4 + last 4 as the preview
        tokenPreview: `${token.slice(0, 10)}••••••${token.slice(-4)}`,
        scopes: newScopes,
        createdByName: 'You',
      },
      ...prev,
    ]);
    setIssuedToken(token);
    setCreating(false);
  };

  const revokeToken = (id: string) => {
    setTokens((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'revoked' } : t)));
    toast({ title: 'Token revoked', description: 'This token can no longer authenticate requests.' });
  };

  const copyToken = async (val: string) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard may be blocked without user gesture */ }
  };

  return (
    <div className="space-y-6">
      {/* Hero — VS Code plugin */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-white p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white border-transparent uppercase tracking-widest text-[10px]">
                Live now
              </Badge>
              <span className="text-xs text-emerald-900 font-medium">Ships in the VS Code Marketplace</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 leading-tight mb-2">
              Code with governed AI. Right inside VS Code.
            </h2>
            <p className="text-slate-700 leading-relaxed max-w-2xl">
              Install the Kotwal extension, mint a device token below, paste it in the
              extension settings, and every prompt from Copilot-style completions to
              side-panel chat runs through the same governance engine as the web app.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" className="gap-2" onClick={openCreate}>
                <PlusCircle className="w-3.5 h-3.5" />
                Mint a VS Code token
              </Button>
              <Button size="sm" variant="outline" className="gap-2" asChild>
                <a href="https://marketplace.visualstudio.com/" target="_blank" rel="noreferrer">
                  Install extension <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Button>
            </div>
          </div>
          <div className="flex-shrink-0 hidden md:flex items-center justify-center w-32 h-32 rounded-2xl bg-white border border-emerald-200 shadow-sm">
            <Code2 className="w-14 h-14 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <SummaryCard label="Active tokens" value={activeCount} icon={KeyRound} tone="blue" />
        <SummaryCard label="VS Code tokens" value={vsCodeCount} icon={Code2} tone="emerald" />
        <SummaryCard label="Total issued"   value={tokens.length} icon={Server} tone="slate" />
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Device tokens</CardTitle>
            <CardDescription>
              Long-lived credentials for the VS Code extension, kotwal-cli, and CI runners.
              Rotate periodically. Revoke immediately on device loss.
            </CardDescription>
          </div>
          <Button size="sm" onClick={openCreate} className="gap-2">
            <PlusCircle className="w-3.5 h-3.5" />
            New token
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[36%]">Label</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Last used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((tok) => {
                const meta = CLIENT_LABEL[tok.clientType];
                const Icon = meta.icon;
                const revoked = tok.status === 'revoked';
                return (
                  <TableRow key={tok.id} className={revoked ? 'opacity-60' : ''}>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-slate-900">{tok.label}</span>
                        <span className="text-[11px] text-slate-500">
                          Created {new Date(tok.createdAt).toLocaleDateString()}
                          {tok.createdByName ? ` · by ${tok.createdByName}` : ''}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-1.5 text-xs text-slate-700">
                        <Icon className="w-3.5 h-3.5" />
                        {meta.label}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded">
                        {tok.tokenPreview}
                      </code>
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">
                      {formatRelative(tok.lastUsedAt)}
                    </TableCell>
                    <TableCell>
                      {revoked ? (
                        <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-500">
                          Revoked
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!revoked && (
                        <Button
                          size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5"
                          onClick={() => revokeToken(tok.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create modal */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New device token</DialogTitle>
            <DialogDescription>
              Tokens are shown once, immediately after creation. Copy and store it in
              your extension or CI secret manager — you cannot retrieve it again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-slate-700 uppercase tracking-wider">Label</label>
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Sarah · VS Code (MacBook Pro)"
                autoFocus
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 uppercase tracking-wider">Client</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(['vscode', 'cli', 'ci'] as const).map((c) => {
                  const meta = CLIENT_LABEL[c];
                  const Icon = meta.icon;
                  const selected = newClient === c;
                  return (
                    <button
                      key={c} type="button" onClick={() => setNewClient(c)}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-lg border py-3 text-xs transition-colors',
                        selected
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 uppercase tracking-wider">Scopes</label>
              <div className="mt-2 space-y-2">
                {AVAILABLE_SCOPES.map((s) => {
                  const checked = s.required || newScopes.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className={cn(
                        'flex items-start gap-2 rounded-lg border px-3 py-2 cursor-pointer',
                        checked ? 'border-emerald-300 bg-emerald-50/60' : 'border-slate-200 bg-white'
                      )}
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 accent-emerald-600"
                        checked={checked}
                        disabled={s.required}
                        onChange={() => !s.required && toggleScope(s.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900">{s.label}</span>
                          <code className="text-[10px] font-mono text-slate-500">{s.id}</code>
                          {s.required && (
                            <Badge variant="outline" className="text-[9px] border-slate-300">Required</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{s.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={submitCreate} className="gap-2">
              <KeyRound className="w-3.5 h-3.5" />
              Create token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* One-time-visible token modal */}
      <Dialog open={!!issuedToken} onOpenChange={(open) => !open && setIssuedToken(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Token created
            </DialogTitle>
            <DialogDescription>
              Copy this token now. Once you close this dialog it cannot be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-900 leading-relaxed">
                Treat this token as a password. Anyone with it can send chat requests
                on your behalf. Revoke immediately if leaked.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-950 text-emerald-200 font-mono text-xs p-3 break-all">
              {issuedToken}
            </div>
            <Button size="sm" className="w-full gap-2" onClick={() => issuedToken && copyToken(issuedToken)}>
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy token</>}
            </Button>
            <div className="rounded-lg border bg-slate-50 px-3 py-2 text-xs text-slate-700 leading-relaxed">
              <p className="font-semibold text-slate-800 mb-1">Next steps</p>
              <ol className="list-decimal pl-4 space-y-0.5">
                <li>Open VS Code → Extensions → search "Kotwal".</li>
                <li>Open settings → paste the token into <code className="font-mono">Kotwal: Device Token</code>.</li>
                <li>Start a chat from the Kotwal side panel. Every prompt is now governed.</li>
              </ol>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIssuedToken(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────

const SummaryCard = ({
  label, value, icon: Icon, tone,
}: {
  label: string; value: number; icon: typeof KeyRound; tone: 'blue' | 'emerald' | 'slate';
}) => {
  const tones = {
    blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700'    },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    slate:   { bg: 'bg-slate-50',   border: 'border-slate-200',   text: 'text-slate-700'   },
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

export default DeviceTokensSection;
