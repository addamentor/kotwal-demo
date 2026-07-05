/**
 * AgentsSection — Coming Soon preview for Agentic Kotwal.
 *
 * Shows a curated set of agent templates (Contract Reviewer, Support Triager,
 * Code Reviewer, …). Clicking a template opens a preview sheet with the
 * agent's config *and* a recorded sample run — so visitors can see exactly
 * what an agent invocation would look like without running one.
 *
 * "Deploy" / "Build custom agent" buttons open the same waitlist modal as the
 * MCP section, stored in localStorage.
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
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bot, Sparkles, ShieldCheck, ArrowRight, Wrench, Play,
  Loader2, CheckCircle2, Search, Info, Zap,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useDemoSession } from '@/context/DemoSessionContext';
import { forceLeadGate } from '@/components/lead/DemoLeadGateMount';
import {
  MOCK_AGENT_TEMPLATES, AgentTemplate, MOCK_AGENT_SAMPLE_RUNS,
  WAITLIST_STORAGE_KEY, WaitlistEntry,
} from '@/lib/mockData';

// ─── Waitlist helpers (duplicated intentionally — this file is self-contained) ─
function readWaitlist(): WaitlistEntry[] {
  try {
    const raw = localStorage.getItem(WAITLIST_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WaitlistEntry[]) : [];
  } catch { return []; }
}
function writeWaitlist(entries: WaitlistEntry[]) {
  localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(entries));
}

// ─── Component ───────────────────────────────────────────────────────
const AgentsSection = () => {
  const [query, setQuery] = useState('');
  const [previewAgent, setPreviewAgent]   = useState<AgentTemplate | null>(null);
  const [reserveAgent, setReserveAgent]   = useState<AgentTemplate | null>(null);
  const [reserveGeneric, setReserveGeneric] = useState(false); // "Build custom agent" flow
  const [reserveEmail, setReserveEmail]   = useState('');
  const [reserving, setReserving]         = useState(false);
  const { log, hasSubmitted } = useDemoSession();

  const filtered = useMemo(() => {
    if (!query.trim()) return MOCK_AGENT_TEMPLATES;
    const q = query.toLowerCase();
    return MOCK_AGENT_TEMPLATES.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tools.some((t) => t.name.toLowerCase().includes(q))
    );
  }, [query]);

  const featured   = filtered.filter((a) => a.featured);
  const additional = filtered.filter((a) => !a.featured);

  const openReserveForAgent = (agent: AgentTemplate) => {
    log('reserve', { feature: 'agents', itemId: agent.id, itemName: agent.name });
    if (!hasSubmitted) {
      forceLeadGate('hard');
      return;
    }
    setReserveAgent(agent);
    setReserveGeneric(false);
    setReserveEmail('');
  };
  const openReserveGeneric = () => {
    log('reserve', { feature: 'agents', generic: true });
    if (!hasSubmitted) {
      forceLeadGate('hard');
      return;
    }
    setReserveGeneric(true);
    setReserveAgent(null);
    setReserveEmail('');
  };
  const closeReserve = () => {
    setReserveAgent(null);
    setReserveGeneric(false);
  };

  const submitReserve = async () => {
    if (!reserveEmail.trim() || !/@/.test(reserveEmail)) {
      toast({ title: 'Enter a work email', description: 'Please add a valid email to reserve access.', variant: 'destructive' });
      return;
    }
    setReserving(true);
    await new Promise((r) => setTimeout(r, 650));

    const entry: WaitlistEntry = {
      feature: 'agents',
      itemId: reserveAgent?.id, // undefined for generic build-custom
      email: reserveEmail.trim(),
      reservedAt: new Date().toISOString(),
    };
    writeWaitlist([...readWaitlist(), entry]);
    setReserving(false);

    toast({
      title: reserveAgent ? `Reserved · ${reserveAgent.name}` : 'Reserved · Agentic Kotwal',
      description: 'We\'ll email you when this goes live.',
    });
    closeReserve();
  };

  const reservations = readWaitlist().filter((e) => e.feature === 'agents');
  const reservedIds = new Set(reservations.map((r) => r.itemId).filter(Boolean));

  const showModal = !!reserveAgent || reserveGeneric;

  return (
    <div className="space-y-6">
      {/* Hero — banner */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-600 hover:bg-blue-600 text-white border-transparent uppercase tracking-widest text-[10px]">
                Coming soon
              </Badge>
              <span className="text-xs text-blue-900 font-medium">Preview · not yet live</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 leading-tight mb-2">
              Agentic Kotwal. Governance for every tool call.
            </h2>
            <p className="text-slate-700 leading-relaxed max-w-2xl">
              Build custom agents, orchestrate tool use across MCP servers, or run
              third-party agents (LangChain, CrewAI, OpenAI Assistants) through the
              Kotwal gateway. Every prompt, every tool call, every response — all
              governed by the same policy engine you already trust for chat.
            </p>
          </div>
          <div className="flex-shrink-0 hidden md:flex items-center justify-center w-32 h-32 rounded-2xl bg-white border border-blue-200 shadow-sm">
            <Bot className="w-14 h-14 text-blue-500" />
          </div>
        </div>

        {/* Feature triplet + primary CTA */}
        <div className="mt-6 grid sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/70 border border-blue-100 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-800">Gated tool calls</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Arguments and results run through Kotwal on every hop.
            </p>
          </div>
          <div className="rounded-xl bg-white/70 border border-blue-100 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-slate-800">Bring your framework</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              LangChain / CrewAI / OpenAI Assistants — proxy or callback.
            </p>
          </div>
          <div className="rounded-xl bg-white/70 border border-blue-100 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Info className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold text-slate-800">Full transcript audit</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every turn, every tool call, every policy event.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={openReserveGeneric} className="gap-2">
            <Zap className="w-3.5 h-3.5" />
            Reserve early access
          </Button>
          <span className="text-xs text-slate-500">
            {reservations.length > 0 ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {reservations.length} reservation{reservations.length !== 1 ? 's' : ''} on your list
              </span>
            ) : (
              'Or explore the template gallery below.'
            )}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search templates or tools (e.g. contract, jira, code)…"
          className="pl-9"
        />
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Featured templates
            </h3>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {featured.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                reserved={reservedIds.has(agent.id)}
                onPreview={setPreviewAgent}
                onReserve={openReserveForAgent}
              />
            ))}
          </div>
        </div>
      )}

      {/* Additional */}
      {additional.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              More templates
            </h3>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {additional.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                reserved={reservedIds.has(agent.id)}
                onPreview={setPreviewAgent}
                onReserve={openReserveForAgent}
              />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            <p>No templates match "{query}". Try a broader search or clear the filter.</p>
          </CardContent>
        </Card>
      )}

      {/* Preview drawer */}
      <Sheet open={!!previewAgent} onOpenChange={(open) => !open && setPreviewAgent(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          {previewAgent && (
            <>
              <SheetHeader className="pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 flex items-center justify-center text-2xl rounded-xl bg-slate-100 border border-slate-200">
                    {previewAgent.iconEmoji}
                  </div>
                  <div className="flex-1 text-left">
                    <SheetTitle className="text-lg">{previewAgent.name}</SheetTitle>
                    <SheetDescription className="text-xs">
                      {previewAgent.category} template · preview
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <ScrollArea className="mt-4 h-[calc(100vh-200px)] pr-3">
                {/* Config summary */}
                <section className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                      Description
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {previewAgent.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <ConfigCell label="Model" value={previewAgent.modelId.replace('demo-', '')} />
                    <ConfigCell label="Temperature" value={previewAgent.temperature.toString()} />
                    <ConfigCell label="Max turns" value={previewAgent.maxTurns.toString()} />
                    <ConfigCell label="Status" value={previewAgent.status === 'preview' ? 'Preview' : 'Reserve'} />
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                      System prompt
                    </h4>
                    <div className="rounded-lg border bg-slate-50 px-3 py-2.5 text-sm text-slate-700 leading-relaxed font-mono">
                      {previewAgent.systemPromptPreview}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                      <Wrench className="w-3.5 h-3.5" />
                      Allowed tools
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {previewAgent.tools.map((t) => (
                        <span
                          key={t.name}
                          className={
                            'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-mono border ' +
                            (t.source === 'mcp'
                              ? 'bg-amber-50 border-amber-200 text-amber-800'
                              : 'bg-blue-50 border-blue-200 text-blue-800')
                          }
                        >
                          <span className="text-[9px] uppercase font-semibold tracking-wider opacity-70">
                            {t.source}
                          </span>
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Sample run */}
                <section className="mt-6 pt-6 border-t">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                    <Play className="w-3.5 h-3.5" />
                    Recorded sample run
                  </h4>
                  <SampleRunView agentId={previewAgent.id} />
                </section>
              </ScrollArea>

              {/* Sticky footer */}
              <div className="mt-4 pt-4 border-t flex gap-2">
                <Button
                  className="flex-1 gap-2"
                  onClick={() => {
                    openReserveForAgent(previewAgent);
                    setPreviewAgent(null);
                  }}
                  disabled={reservedIds.has(previewAgent.id)}
                >
                  {reservedIds.has(previewAgent.id) ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Reserved
                    </>
                  ) : (
                    <>
                      Deploy when live <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Reserve modal */}
      <Dialog open={showModal} onOpenChange={(open) => !open && closeReserve()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {reserveAgent ? (
                <>
                  <span className="text-2xl">{reserveAgent.iconEmoji}</span>
                  Reserve · {reserveAgent.name}
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-blue-600" />
                  Reserve early access · Agentic Kotwal
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              We'll email you when this template (or the agent builder) goes live.
              No spam — one launch notification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="text-xs font-medium text-slate-700 uppercase tracking-wider">
              Work email
            </label>
            <Input
              type="email"
              value={reserveEmail}
              onChange={(e) => setReserveEmail(e.target.value)}
              placeholder="you@yourcompany.com"
              autoFocus
            />
            <p className="text-xs text-slate-500 leading-relaxed">
              Stored locally in your browser for this demo. In production, this hits the
              real waitlist API.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeReserve}>Cancel</Button>
            <Button onClick={submitReserve} disabled={reserving} className="gap-2">
              {reserving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Reserve access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────

const AgentCard = ({
  agent, reserved, onPreview, onReserve,
}: {
  agent: AgentTemplate;
  reserved: boolean;
  onPreview: (a: AgentTemplate) => void;
  onReserve: (a: AgentTemplate) => void;
}) => (
  <Card className="border-slate-200 transition-all hover:border-blue-300 hover:shadow-sm flex flex-col">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 flex items-center justify-center text-2xl rounded-xl bg-slate-100 border border-slate-200">
            {agent.iconEmoji}
          </div>
          <div>
            <CardTitle className="text-base">{agent.name}</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {agent.category} · {agent.tools.length} tool{agent.tools.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
        </div>
        {agent.featured && (
          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-[10px]">
            Featured
          </Badge>
        )}
      </div>
    </CardHeader>
    <CardContent className="flex-1 flex flex-col gap-3">
      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
        {agent.description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {agent.tools.slice(0, 2).map((t) => (
          <span
            key={t.name}
            className={
              'inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-mono border ' +
              (t.source === 'mcp'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-blue-50 border-blue-200 text-blue-800')
            }
          >
            {t.name}
          </span>
        ))}
        {agent.tools.length > 2 && (
          <span className="text-[10px] text-slate-500 self-center">
            +{agent.tools.length - 2}
          </span>
        )}
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        <Button size="sm" variant="ghost" onClick={() => onPreview(agent)} className="gap-1 px-2">
          <Play className="w-3.5 h-3.5" />
          Preview run
        </Button>
        {reserved ? (
          <Button size="sm" variant="outline" disabled className="gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Reserved
          </Button>
        ) : (
          <Button size="sm" onClick={() => onReserve(agent)} className="gap-1">
            Reserve <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

const ConfigCell = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border bg-white px-3 py-2">
    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">{label}</div>
    <div className="text-sm text-slate-800 font-medium truncate">{value}</div>
  </div>
);

const SampleRunView = ({ agentId }: { agentId: string }) => {
  const run = MOCK_AGENT_SAMPLE_RUNS[agentId];
  if (!run) {
    return (
      <p className="text-sm text-slate-500 italic">
        Sample transcript not available for this template.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {/* User input */}
      <div className="rounded-lg border bg-slate-50 px-3 py-2">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mb-1">
          User
        </div>
        <p className="text-sm text-slate-700">{run.input}</p>
      </div>

      {/* Turns */}
      {run.turns.map((turn, i) => {
        const isTool = turn.role === 'tool';
        const isToolResult = turn.role === 'tool_result';
        const isAssistant = turn.role === 'assistant';
        return (
          <div
            key={i}
            className={
              'rounded-lg border px-3 py-2 ' +
              (isAssistant
                ? 'bg-white'
                : isTool
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-emerald-50 border-emerald-200')
            }
          >
            <div className="text-[10px] uppercase tracking-widest font-mono mb-1 flex items-center gap-1.5">
              <span className={
                isAssistant ? 'text-slate-500'
                  : isTool ? 'text-amber-700'
                  : 'text-emerald-700'
              }>
                {isAssistant ? 'Assistant' : isTool ? `→ Tool · ${turn.toolName ?? ''}` : '← Tool result'}
              </span>
            </div>
            <p className={
              'text-sm ' +
              (isAssistant ? 'text-slate-700' : 'text-slate-700 font-mono')
            }>
              {turn.text}
            </p>
          </div>
        );
      })}

      {/* Policy events */}
      {run.policyEvents.length > 0 && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" />
            Policy events
          </div>
          <ul className="space-y-1.5">
            {run.policyEvents.map((e, i) => (
              <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                <span className={
                  'inline-block rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold ' +
                  (e.kind === 'BLOCK'
                    ? 'bg-red-100 text-red-800'
                    : e.kind === 'WARN'
                      ? 'bg-amber-100 text-amber-800'
                      : e.kind === 'REDACT'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800')
                }>
                  {e.kind}
                </span>
                <span className="flex-1">
                  <span className="text-slate-500">turn {e.turn}:</span> {e.note}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AgentsSection;
