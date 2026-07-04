/**
 * Demo landing page — pick "User" or "Admin" role to enter the demo.
 */
import { useNavigate } from 'react-router-dom';
import { useAuth, DemoRole } from '@/context/AuthContext';
import { ShieldCheck, User, Settings, Blocks, Bot } from 'lucide-react';

const DemoLanding = () => {
  const { enterDemo } = useAuth();
  const navigate = useNavigate();

  const handleEnter = (role: DemoRole) => {
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
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400">
            <Blocks className="w-3.5 h-3.5" />
            IDE Plugins &amp; Agentic Kotwal — coming soon
          </div>
          <a
            href="https://aikotwal.com"
            target="_blank"
            rel="noopener"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500 transition-colors"
          >
            Request Demo
          </a>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-3xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Experience Kotwal
          </h1>
          <p className="text-lg text-slate-400 mb-12 max-w-xl mx-auto leading-relaxed">
            See how Kotwal detects and blocks sensitive data before it leaves your network.
            Choose your role to explore.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* User card */}
            <button
              onClick={() => handleEnter('user')}
              className="group relative flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-8 text-left transition-all hover:border-blue-500/50 hover:bg-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div className="rounded-xl bg-blue-500/15 p-4">
                <User className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Try as User</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Chat with AI models through Kotwal's secure gateway. See real-time PII
                  detection, warnings, and blocks in action.
                </p>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-2 text-[11px] text-slate-500">
                <span className="rounded-full border border-white/10 px-2 py-0.5">Chat Interface</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5">PII Detection</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5">Block & Warn</span>
              </div>
            </button>

            {/* Admin card */}
            <button
              onClick={() => handleEnter('admin')}
              className="group relative flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-8 text-left transition-all hover:border-purple-500/50 hover:bg-purple-500/5 hover:shadow-xl hover:shadow-purple-500/10"
            >
              <div className="rounded-xl bg-purple-500/15 p-4">
                <Settings className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Try as Admin</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Full access — chat <em>plus</em> the admin dashboard. Manage users,
                  configure policies, view security alerts, and billing.
                </p>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-2 text-[11px] text-slate-500">
                <span className="rounded-full border border-white/10 px-2 py-0.5">Everything in User</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5">Admin Dashboard</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5">Policy Editor</span>
              </div>
            </button>
          </div>

          <p className="mt-10 text-xs text-slate-600">
            This is a fully client-side demo with simulated data. No real API keys or credentials are used.
          </p>
        </div>
      </main>
    </div>
  );
};

export default DemoLanding;
