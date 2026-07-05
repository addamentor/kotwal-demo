/**
 * MCPServersSection — Coming Next preview for MCP-server governance.
 *
 * This is deliberately a *preview* section: no real MCP client, no live
 * connections. It exists to (a) tell customers what's coming, (b) let them
 * reserve early access, and (c) look convincing enough that they can imagine
 * the workflow.
 *
 * Every "Connect" button opens a reservation modal — the browser stores the
 * email in localStorage so a return visit remembers the request. When the
 * real MCPServer model lands, the section is a drop-in replacement.
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
  Plug, Sparkles, ShieldCheck, ArrowRight, Search, Loader2, CheckCircle2, Info,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useDemoSession } from '@/context/DemoSessionContext';
import { forceLeadGate } from '@/components/lead/DemoLeadGateMount';
import {
  MOCK_MCP_PREVIEW_SERVERS, MCPPreviewServer,
  WAITLIST_STORAGE_KEY, WaitlistEntry,
} from '@/lib/mockData';

// ─── Waitlist helpers ────────────────────────────────────────────────
// Stored in localStorage. Not a real API — this is a client-only demo.
function readWaitlist(): WaitlistEntry[] {
  try {
    const raw = localStorage.getItem(WAITLIST_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WaitlistEntry[]) : [];
  } catch {
    return [];
  }
}

function writeWaitlist(entries: WaitlistEntry[]) {
  localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(entries));
}

// ─── Component ───────────────────────────────────────────────────────
const MCPServersSection = () => {
  const [query, setQuery] = useState('');
  const { log, hasSubmitted } = useDemoSession();
  const [selectedServer, setSelectedServer] = useState<MCPPreviewServer | null>(null);
  const [reserveEmail, setReserveEmail] = useState('');
  const [reserving, setReserving] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return MOCK_MCP_PREVIEW_SERVERS;
    const q = query.toLowerCase();
    return MOCK_MCP_PREVIEW_SERVERS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.vendor.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.tools.some((t) => t.toLowerCase().includes(q))
    );
  }, [query]);

  // Group by category for the catalogue layout — mirrors how the real
  // marketplace will surface entries.
  const grouped = useMemo(() => {
    const groups = new Map<string, MCPPreviewServer[]>();
    for (const s of filtered) {
      if (!groups.has(s.category)) groups.set(s.category, []);
      groups.get(s.category)!.push(s);
    }
    return Array.from(groups.entries());
  }, [filtered]);

  const openReserve = (server: MCPPreviewServer) => {
    log('reserve', { feature: 'mcp', itemId: server.id, itemName: server.name });
    // If the visitor hasn't yet identified themselves, escalate to the hard
    // lead gate — Reserve is the strongest signal of intent we get in the demo.
    if (!hasSubmitted) {
      forceLeadGate('hard');
      return;
    }
    setSelectedServer(server);
    setReserveEmail('');
  };

  const submitReserve = async () => {
    if (!selectedServer) return;
    if (!reserveEmail.trim() || !/@/.test(reserveEmail)) {
      toast({ title: 'Enter a work email', description: 'Please add a valid email to reserve access.', variant: 'destructive' });
      return;
    }
    setReserving(true);
    // Fake network delay so the "Reserving…" state is visible
    await new Promise((r) => setTimeout(r, 650));

    const entry: WaitlistEntry = {
      feature: 'mcp',
      itemId: selectedServer.id,
      email: reserveEmail.trim(),
      reservedAt: new Date().toISOString(),
    };
    writeWaitlist([...readWaitlist(), entry]);
    setReserving(false);

    toast({
      title: `Reserved · ${selectedServer.name}`,
      description: 'We\'ll email you when this MCP server goes live.',
    });
    setSelectedServer(null);
  };

  const reservations = readWaitlist().filter((e) => e.feature === 'mcp');
  const reservationsById = new Set(reservations.map((r) => r.itemId));

  return (
    <div className="space-y-6">
      {/* Hero — banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-white p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-amber-500 hover:bg-amber-500 text-white border-transparent uppercase tracking-widest text-[10px]">
                Coming next
              </Badge>
              <span className="text-xs text-amber-900 font-medium">Preview · not yet live</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 leading-tight mb-2">
              Connect any MCP server. Every tool call, governed.
            </h2>
            <p className="text-slate-700 leading-relaxed max-w-2xl">
              Plug in GitHub, Jira, Notion, Slack, or any MCP-compatible server. Every
              tool call — inbound arguments and outbound results — passes through the
              same Kotwal detection engine that governs chat today. Reserve early access
              to the servers your team needs.
            </p>
          </div>
          <div className="flex-shrink-0 hidden md:flex items-center justify-center w-32 h-32 rounded-2xl bg-white border border-amber-200 shadow-sm">
            <Plug className="w-14 h-14 text-amber-500" />
          </div>
        </div>

        {/* Feature triplet */}
        <div className="mt-6 grid sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/70 border border-amber-100 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-800">Same governance</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tool arguments run through the redaction engine before leaving.
            </p>
          </div>
          <div className="rounded-xl bg-white/70 border border-amber-100 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-semibold text-slate-800">One-click connect</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Curated catalogue with pre-approved auth flows.
            </p>
          </div>
          <div className="rounded-xl bg-white/70 border border-amber-100 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-slate-800">Full audit trail</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every tool invocation logged next to chat interactions.
            </p>
          </div>
        </div>
      </div>

      {/* Search / filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search servers or tools (e.g. jira, notion, search_pages)…"
            className="pl-9"
          />
        </div>
        <div className="text-sm text-slate-500">
          {reservations.length > 0 && (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {reservations.length} reservation{reservations.length !== 1 ? 's' : ''} on your list
            </span>
          )}
        </div>
      </div>

      {/* Catalogue, grouped by category */}
      {grouped.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            <p>No servers match "{query}". Try a broader search or clear the filter.</p>
          </CardContent>
        </Card>
      ) : (
        grouped.map(([category, servers]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {category}
              </h3>
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">{servers.length}</span>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {servers.map((server) => {
                const isReserved = reservationsById.has(server.id);
                return (
                  <Card
                    key={server.id}
                    className="border-slate-200 transition-all hover:border-amber-300 hover:shadow-sm flex flex-col"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 flex items-center justify-center text-2xl rounded-xl bg-slate-100 border border-slate-200">
                            {server.iconEmoji}
                          </div>
                          <div>
                            <CardTitle className="text-base">{server.name}</CardTitle>
                            <CardDescription className="text-xs mt-0.5">
                              {server.vendor} · {server.toolCount} tools
                            </CardDescription>
                          </div>
                        </div>
                        {server.official && (
                          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px]">
                            Official
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {server.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {server.tools.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-mono text-slate-700"
                          >
                            {t}
                          </span>
                        ))}
                        {server.tools.length > 3 && (
                          <span className="text-[10px] text-slate-500 self-center">
                            +{server.tools.length - 3} more
                          </span>
                        )}
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
                          {server.transport} · preview
                        </span>
                        {isReserved ? (
                          <Button size="sm" variant="outline" disabled className="gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Reserved
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => openReserve(server)} className="gap-1">
                            Reserve <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Reserve modal */}
      <Dialog open={!!selectedServer} onOpenChange={(open) => !open && setSelectedServer(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedServer?.iconEmoji}</span>
              Reserve · {selectedServer?.name}
            </DialogTitle>
            <DialogDescription>
              We'll email you the moment this MCP server goes live. No spam — one launch
              notification, that's it.
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
            <Button variant="outline" onClick={() => setSelectedServer(null)}>
              Cancel
            </Button>
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

export default MCPServersSection;
