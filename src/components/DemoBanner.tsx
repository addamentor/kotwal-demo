/**
 * Persistent demo banner — shown on every page (chat + dashboard).
 */
import { ShieldCheck, Blocks, ExternalLink } from 'lucide-react';

const DemoBanner = () => {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-amber-500/30 bg-amber-950/90 px-4 py-2 text-xs text-amber-200 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-amber-400" />
        <span className="font-semibold">DEMO VERSION</span>
        <span className="hidden sm:inline text-amber-300/70">— All data is simulated. No real APIs or credentials.</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden md:flex items-center gap-1.5 rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-amber-300/60">
          <Blocks className="w-3 h-3" />
          IDE Plugins &amp; Agentic Kotwal — available soon
        </span>
        <a
          href="https://aikotwal.com"
          target="_blank"
          rel="noopener"
          className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
        >
          Request Demo
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default DemoBanner;
