import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, UserPlus, Pencil, Bot, CreditCard,
  ShieldCheck, FileText, Plug, Sparkles, FolderKanban, KeyRound,
  BarChart3, Ban, Settings,
} from 'lucide-react';

export type DashboardSection =
  | 'overview'
  | 'manage-users'
  | 'add-user'
  | 'edit-user'
  | 'chat-models'
  | 'billing'
  | 'security'
  | 'policy'
  | 'projects'
  | 'usage'
  | 'device-tokens'
  | 'topic-restrictions'
  | 'settings'
  | 'mcp-servers'
  | 'agents';

interface DashboardSidebarProps {
  activeSection: DashboardSection;
  onSelect: (section: DashboardSection) => void;
}

interface NavItem {
  id: DashboardSection;
  label: string;
  icon: typeof Users;
  isSub?: boolean;
  /** Small pill shown at the end of the label (e.g. "SOON", "NEW"). */
  badge?: 'soon' | 'next' | 'new';
}

const BADGE_STYLES: Record<NonNullable<NavItem['badge']>, string> = {
  soon: 'bg-blue-100 text-blue-700 border-blue-200',
  next: 'bg-amber-100 text-amber-800 border-amber-200',
  new:  'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const BADGE_LABEL: Record<NonNullable<NavItem['badge']>, string> = {
  soon: 'Soon',
  next: 'Next',
  new:  'New',
};

const DashboardSidebar = ({ activeSection, onSelect }: DashboardSidebarProps) => {
  const mainNav: NavItem[] = [
    { id: 'overview',           label: 'Dashboard',           icon: LayoutDashboard },
    { id: 'manage-users',       label: 'Manage Users',        icon: Users },
    { id: 'add-user',           label: 'Add New User',        icon: UserPlus, isSub: true },
    { id: 'edit-user',          label: 'Edit User',           icon: Pencil,   isSub: true },
    { id: 'projects',           label: 'Projects',            icon: FolderKanban },
    { id: 'usage',              label: 'Usage & Cost',        icon: BarChart3 },
    { id: 'chat-models',        label: 'Manage Chat Models',  icon: Bot },
    { id: 'device-tokens',      label: 'Device Tokens',       icon: KeyRound, badge: 'new' },
    { id: 'topic-restrictions', label: 'Topic Restrictions',  icon: Ban },
    { id: 'billing',            label: 'Manage Billing',      icon: CreditCard },
    { id: 'security',           label: 'View Security Alerts', icon: ShieldCheck },
    { id: 'policy',             label: 'Detection Policy',    icon: FileText },
    { id: 'settings',           label: 'Settings',            icon: Settings },
    // ── Roadmap preview items ────────────────────────────────────────
    { id: 'mcp-servers',        label: 'MCP Servers',         icon: Plug,     badge: 'next' },
    { id: 'agents',             label: 'Agents',              icon: Sparkles, badge: 'soon' },
  ];

  return (
    <aside className="w-72 bg-sidebar h-full border-r border-sidebar-border flex flex-col">
      <div className="px-6 py-5 border-b border-sidebar-border flex items-center gap-3">
        <LayoutDashboard className="w-6 h-6 text-primary" />
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Kotwal</p>
          <p className="text-lg font-semibold">Admin Console</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {mainNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                'w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all',
                item.isSub ? 'pl-9 text-muted-foreground' : 'text-sidebar-foreground',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-inner'
                  : 'hover:bg-sidebar-accent/70'
              )}
            >
              <Icon className={cn('w-4 h-4', item.isSub && 'opacity-80')} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-1.5 py-0 text-[9px] font-semibold tracking-wider uppercase',
                    BADGE_STYLES[item.badge]
                  )}
                >
                  {BADGE_LABEL[item.badge]}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Roadmap footer — legend for the chips */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70 font-semibold mb-1.5">
          Legend
        </p>
        <div className="flex flex-wrap gap-1.5 text-[10px]">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" /> Next
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" /> Soon
          </span>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
