/**
 * DemoTopBar — a feature-rich, mostly-locked toolbar shown above the chat in the
 * demo. Purpose: give the demo a real product feel by surfacing capabilities of
 * the live app (project scoping, custom agents / automations) without wiring any
 * of them. Everything here is either a harmless UI switch (project) or disabled
 * with a "live app only" affordance.
 */
import { useState } from 'react';
import {
  Bot, Sparkles, Workflow, ListChecks, CalendarClock, Webhook,
  Lock, Info, ChevronDown, FolderKanban, TrendingDown,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AgentOption {
  icon: typeof Workflow;
  title: string;
  description: string;
}

const AGENT_OPTIONS: AgentOption[] = [
  {
    icon: Workflow,
    title: 'Automation Workflow',
    description: 'Chain steps, tools and approvals into a repeatable multi-step workflow.',
  },
  {
    icon: ListChecks,
    title: 'Task Agent',
    description: 'Give the agent a goal and let it plan and execute the sub-tasks.',
  },
  {
    icon: CalendarClock,
    title: 'Scheduled Agent',
    description: 'Run an agent on a schedule — daily digests, reminders, syncs.',
  },
  {
    icon: Webhook,
    title: 'Triggered Agent',
    description: 'Fire an agent from a webhook or an event in a connected system.',
  },
];

function CustomAgentsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            Create a custom agent
          </DialogTitle>
          <DialogDescription>
            Build agents and automations that use your tools, data and policies. Choose a type to start.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {AGENT_OPTIONS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              aria-disabled="true"
              className="relative rounded-xl border border-border bg-muted/30 p-3.5 opacity-70 cursor-not-allowed"
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 rounded-lg bg-muted p-1.5 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    {title}
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <p className="text-xs text-muted-foreground">
            Custom agents &amp; automations are available in the live app. This demo previews the experience.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function DemoTopBar() {
  const [agentsOpen, setAgentsOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 border-b border-white/70 bg-white/70 px-3 py-2 sm:px-6 backdrop-blur">
      {/* Project scope — greyed (live-app feature) */}
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            role="button"
            aria-disabled="true"
            tabIndex={-1}
            className="inline-flex items-center gap-1.5 h-8 rounded-lg border border-chat-input-border bg-chat-input/60 px-2.5 text-xs font-medium text-slate-400 cursor-not-allowed select-none"
          >
            <FolderKanban className="h-3.5 w-3.5" />
            Select project
            <Lock className="h-3 w-3" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Project scoping is available in the live app
        </TooltipContent>
      </Tooltip>

      <div className="ml-auto flex items-center gap-2">
        {/* Constant savings highlight — token-lean prompts cut input cost */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1.5 h-8 rounded-full border border-emerald-300/70 bg-gradient-to-r from-emerald-50 to-teal-50 px-3 text-xs font-semibold text-emerald-700 shadow-sm">
              <TrendingDown className="h-3.5 w-3.5" />
              Save 40–50% on input tokens
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[220px] text-xs">
            Kotwal&apos;s optimized, token-lean prompts convey the same intent using
            40–50% fewer input tokens — lower cost, same quality.
          </TooltipContent>
        </Tooltip>

        {/* Create custom agents — opens the preview popup */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setAgentsOpen(true)}
              className="inline-flex items-center gap-1.5 h-8 rounded-lg border border-chat-input-border bg-chat-input px-2.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Create custom agents
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Preview automations &amp; agents (live-app feature)
          </TooltipContent>
        </Tooltip>
      </div>

      <CustomAgentsDialog open={agentsOpen} onClose={() => setAgentsOpen(false)} />
    </div>
  );
}
