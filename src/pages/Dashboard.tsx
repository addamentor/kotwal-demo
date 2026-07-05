import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar, { DashboardSection } from '@/components/dashboard/Sidebar';
import OverviewSection from '@/components/dashboard/sections/OverviewSection';
import ManageUsersSection from '@/components/dashboard/sections/ManageUsersSection';
import AddUserSection from '@/components/dashboard/sections/AddUserSection';
import EditUserSection from '@/components/dashboard/sections/EditUserSection';
import ChatModelsSection from '@/components/dashboard/sections/ChatModelsSection';
import BillingSection from '@/components/dashboard/sections/BillingSection';
import SecuritySection from '@/components/dashboard/sections/SecuritySection';
import PolicySection from '@/components/dashboard/sections/PolicySection';
import ProjectsSection from '@/components/dashboard/sections/ProjectsSection';
import UsageSection from '@/components/dashboard/sections/UsageSection';
import DeviceTokensSection from '@/components/dashboard/sections/DeviceTokensSection';
import TopicRestrictionsSection from '@/components/dashboard/sections/TopicRestrictionsSection';
import SettingsSection from '@/components/dashboard/sections/SettingsSection';
import MCPServersSection from '@/components/dashboard/sections/MCPServersSection';
import AgentsSection from '@/components/dashboard/sections/AgentsSection';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useDemoSession } from '@/context/DemoSessionContext';
import { fetchLicenseInfo, LicenseInfo } from '@/services/adminApi';

const sectionMeta: Record<
  DashboardSection,
  {
    title: string;
    description: string;
  }
> = {
  overview: {
    title: 'Dashboard Overview',
    description: 'Stay on top of usage, alerts, and suggested next steps.',
  },
  'manage-users': {
    title: 'Manage Users',
    description: 'Track active operators, their roles, and session health.',
  },
  'add-user': {
    title: 'Add New User',
    description: 'Provision a new analyst or admin for Kotwal.',
  },
  'edit-user': {
    title: 'Edit User',
    description: 'Update access tiers, reset MFA, or deactivate accounts.',
  },
  'chat-models': {
    title: 'Manage Chat Models',
    description: 'Enable, disable, or prioritize the models exposed in chat.',
  },
  billing: {
    title: 'Manage Billing',
    description: 'Monitor usage, invoices, and payment methods.',
  },
  security: {
    title: 'Security Alerts',
    description: 'Respond to anomalous activity detected by Kotwal.',
  },
  policy: {
    title: 'Detection Policy',
    description: 'Tune severity, actions, redaction strategy, and allowlists per category.',
  },
  projects: {
    title: 'Projects',
    description: 'Scope prompts, audit trails, and budgets by initiative.',
  },
  usage: {
    title: 'Usage & Cost',
    description: 'Token consumption and spend across users, models, and projects.',
  },
  'device-tokens': {
    title: 'Device Tokens',
    description: 'Issue long-lived tokens for VS Code, kotwal-cli, and CI runners.',
  },
  'topic-restrictions': {
    title: 'Topic Restrictions',
    description: 'Block or warn on entire categories of prompts, independent of PII detection.',
  },
  settings: {
    title: 'Settings',
    description: 'Organisation identity, feature flags, and notification preferences.',
  },
  'mcp-servers': {
    title: 'MCP Servers',
    description: 'Connect governed tool servers — GitHub, Jira, Notion, Slack, and more. Coming next.',
  },
  agents: {
    title: 'Agents',
    description: 'Build custom agents or run third-party ones — all governed by Kotwal. Coming soon.',
  },
};

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const [editUserEmail, setEditUserEmail] = useState<string | null>(null);
  const header = sectionMeta[activeSection];
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { log } = useDemoSession();
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [loadingLicenseInfo, setLoadingLicenseInfo] = useState(false);
  const [licenseError, setLicenseError] = useState<string | null>(null);

  // Track section navigation for the progressive lead gate. `useLeadGate`
  // reads the count of distinct `section` events to decide when to escalate.
  const changeSection = useCallback((next: DashboardSection) => {
    log('section', { id: next });
    setActiveSection(next);
  }, [log]);

  // Fire an initial section event for the default view so the count starts
  // from 1 when the visitor lands on the dashboard.
  useEffect(() => {
    log('section', { id: activeSection });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadLicenseInfo = useCallback(async () => {
    setLoadingLicenseInfo(true);
    setLicenseError(null);
    try {
      const data = await fetchLicenseInfo();
      setLicenseInfo(data);
    } catch (error) {
      console.error('Failed to fetch license info', error);
      setLicenseError('Unable to load license information.');
    } finally {
      setLoadingLicenseInfo(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === 'add-user') {
      void loadLicenseInfo();
    }
  }, [activeSection, loadLicenseInfo]);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'manage-users':
        return (
          <ManageUsersSection
            onEditUser={(email) => {
              setEditUserEmail(email);
              changeSection('edit-user');
            }}
            onAddUser={() => {
              changeSection('add-user');
            }}
          />
        );
      case 'add-user':
        return (
          <AddUserSection
            licenseInfo={licenseInfo}
            loadingLicenseInfo={loadingLicenseInfo}
            licenseError={licenseError}
            onRetry={loadLicenseInfo}
          />
        );
      case 'edit-user':
        return <EditUserSection initialEmail={editUserEmail ?? undefined} />;
      case 'chat-models':
        return <ChatModelsSection />;
      case 'billing':
        return <BillingSection />;
      case 'security':
        return <SecuritySection />;
      case 'policy':
        return <PolicySection />;
      case 'projects':
        return <ProjectsSection />;
      case 'usage':
        return <UsageSection />;
      case 'device-tokens':
        return <DeviceTokensSection />;
      case 'topic-restrictions':
        return <TopicRestrictionsSection />;
      case 'settings':
        return <SettingsSection />;
      case 'mcp-servers':
        return <MCPServersSection />;
      case 'agents':
        return <AgentsSection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <DashboardSidebar activeSection={activeSection} onSelect={changeSection} />
      <section className="flex-1 overflow-y-auto px-10 py-8">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Kotwal Dashboard</p>
            <h1 className="text-3xl font-semibold mt-2">{header.title}</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">{header.description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <Button variant="outline" className="rounded-2xl border-muted/60" onClick={() => navigate('/')}>
              ← Back to Chat
            </Button>
            <Button
              variant="destructive"
              className="rounded-2xl"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Logout
            </Button>
          </div>
        </header>
        {renderActiveSection()}
      </section>
    </div>
  );
};

export default Dashboard;
