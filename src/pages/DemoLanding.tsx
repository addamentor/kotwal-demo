/**
 * Demo landing page — pick a role to enter the demo.
 *
 * Three roles are offered:
 *   - User     → chat interface only
 *   - Admin    → chat + full admin dashboard
 *   - Developer → chat + Device Tokens section (VS Code plugin flow)
 *
 * We also surface a "What's live now" band highlighting shipped features
 * (VS Code plugin) and previewing what's coming next (MCP servers, Agentic
 * Kotwal). The old inline "coming soon" chip in the header is removed —
 * that lived on a stale roadmap.
 */
import { useNavigate } from 'react-router-dom';
import { useAuth, DemoRole } from '@/context/AuthContext';
import { useDemoSession } from '@/context/DemoSessionContext';
import {
  ShieldCheck, User, Settings, Terminal, Sparkles, ArrowRight,
  Plug, Bot, CheckCircle2,
} from 'lucide-react';

const DemoLanding = () => {
  const { enterDemo } = useAuth();
  const navigate = useNavigate();
  const { log } = useDemoSession();

  const handleEnter = (role: DemoRole, cardLabel: string) => {
    log('role', { role, cardLabel });
    enterDemo(role);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-blue-400" />
          <span className="text-xl font-bold tracking-tight">Kotwal</span>
          <span className="ml-2 rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
            INTERACTIVE DEMO
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://aikotwal.com"
            target="_blank"
            rel="noopener"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500 transition-colors"
          >
            Request a demo
          </a>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-14">
        <div className="w-full max-w-5xl">

          {/* Headline */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Experience Kotwal
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              A live, click-through tour of Kotwal — chat with governed AI models, watch
              real-time redaction, and explore the admin console. Nothing is sent to a real
              provider.
            </p>
          </div>

          {/* Role cards — three variants */}
          <div className="grid sm:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {/* User */}
            <button
              onClick={() => handleEnter('user', 'user')}
              className="group relative flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-7 text-left transition-all hover:border-blue-500/50 hover:bg-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div className="rounded-xl bg-blue-500/15 p-3.5">
                <User className="w-7 h-7 text-blue-400" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-1.5">Try as User</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Chat with AI models through the Kotwal gateway. See PII detection,
                  redaction, and blocks in action.
                </p>
              </div>
              <div className="mt-1 flex flex-wrap justify-center gap-1.5 text-[11px] text-slate-500">
                <span className="rounded-full border border-white/10 px-2 py-0.5">Chat</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5">Projects</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5">Inspection rail</span>
              </div>
              <div className="mt-auto text-xs text-blue-400/80 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Enter as User <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            {/* Admin */}
            <button
              onClick={() => handleEnter('admin', 'admin')}
              className="group relative flex flex-col items-center gap-4 rounded-2xl border border-purple-500/40 bg-purple-500/5 p-7 text-left transition-all hover:border-purple-500/70 hover:bg-purple-500/10 hover:shadow-xl hover:shadow-purple-500/10"
            >
              <span className="absolute top-3 right-3 rounded-full bg-purple-500/25 border border-purple-500/40 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-purple-200">
                RECOMMENDED
              </span>
              <div className="rounded-xl bg-purple-500/15 p-3.5">
                <Settings className="w-7 h-7 text-purple-400" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-1.5">Try as Admin</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Full access — chat <em>plus</em> the admin dashboard: users,
                  policies, projects, audit logs, and billing.
                </p>
              </div>
              <div className="mt-1 flex flex-wrap justify-center gap-1.5 text-[11px] text-slate-500">
                <span className="rounded-full border border-white/10 px-2 py-0.5">Everything in User</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5">Policy editor</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5">Audit trail</span>
              </div>
              <div className="mt-auto text-xs text-purple-300/80 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Enter as Admin <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            {/* Developer / VS Code */}
            <button
              onClick={() => handleEnter('admin', 'developer')}
              className="group relative flex flex-col items-center gap-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-7 text-left transition-all hover:border-emerald-500/70 hover:bg-emerald-500/10 hover:shadow-xl hover:shadow-emerald-500/10"
            >
              <span className="absolute top-3 right-3 rounded-full bg-emerald-500/25 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-200">
                NEW
              </span>
              <div className="rounded-xl bg-emerald-500/15 p-3.5">
                <Terminal className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-1.5">Try as Developer</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Enter as an Admin and jump to the <em>Device Tokens</em> panel — mint a
                  token, install the VS Code plugin, and code with governed AI.
                </p>
              </div>
              <div className="mt-1 flex flex-wrap justify-center gap-1.5 text-[11px] text-slate-500">
                <span className="rounded-full border border-white/10 px-2 py-0.5">VS Code plugin</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5">Device tokens</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5">CLI-ready</span>
              </div>
              <div className="mt-auto text-xs text-emerald-300/80 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Enter as Developer <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          </div>

          {/* What's live now — status band */}
          <div className="mt-14 grid sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {/* Live */}
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-emerald-300">
                  Live now
                </span>
              </div>
              <p className="text-sm font-semibold text-white mb-1">VS Code extension</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ship code with Kotwal governance built in. Mint a device token from the
                admin console and paste it into the extension.
              </p>
            </div>

            {/* Coming next */}
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <Plug className="w-4 h-4 text-amber-300" />
                <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-amber-300">
                  Coming next
                </span>
              </div>
              <p className="text-sm font-semibold text-white mb-1">MCP servers</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect GitHub, Jira, Notion, Slack, and any MCP-compatible server —
                every tool call is gated by the same policy engine.
              </p>
            </div>

            {/* Later */}
            <div className="rounded-xl border border-blue-500/25 bg-blue-500/5 px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-blue-300" />
                <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-blue-300">
                  Coming soon
                </span>
              </div>
              <p className="text-sm font-semibold text-white mb-1">Agentic Kotwal</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Build custom agents, orchestrate tool use, and run third-party agents
                through the gateway — all with the same audit trail.
              </p>
            </div>
          </div>

          {/* Fine print */}
          <div className="mt-12 flex items-center justify-center gap-3 text-xs text-slate-600">
            <Sparkles className="w-3.5 h-3.5" />
            Fully client-side demo · No real API keys · No data leaves your browser
          </div>
        </div>
      </main>
    </div>
  );
};

export default DemoLanding;
