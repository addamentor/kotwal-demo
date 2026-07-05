/**
 * SettingsSection — tenant-level settings (org info, feature flags, notifications).
 *
 * Cosmetic in the demo: state lives in component memory, the Save button
 * fires a toast. The layout mirrors the real product's grouped-card style.
 */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Building2, Bell, Sliders, Save, RotateCcw, Mail, ShieldCheck } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { MOCK_TENANT_SETTINGS, DemoTenantSettings } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const TIMEZONES = [
  'UTC', 'Europe/London', 'Europe/Berlin', 'Europe/Paris',
  'America/New_York', 'America/Los_Angeles', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo',
];

const REGIONS = [
  'EU (Frankfurt)', 'EU (Ireland)', 'US East (Virginia)', 'US West (Oregon)',
  'India (Mumbai)', 'APAC (Singapore)',
];

const MASKING_STRATEGIES: Array<{
  id: DemoTenantSettings['featureFlags']['piiRedactionMasking'];
  label: string;
  description: string;
}> = [
  { id: 'TOKEN', label: 'Token (reversible)', description: 'Original values swap for placeholder tokens; response is rehydrated.' },
  { id: 'MASK',  label: 'Mask (irreversible)', description: 'Sensitive spans are replaced with an opaque marker.' },
  { id: 'FAKE',  label: 'Fake (synthetic)',    description: 'Real-looking substitutes preserve shape for downstream models.' },
];

const SettingsSection = () => {
  const [settings, setSettings] = useState<DemoTenantSettings>(MOCK_TENANT_SETTINGS);
  const [dirty, setDirty] = useState(false);

  const patch = (changes: Partial<DemoTenantSettings>) => {
    setSettings((prev) => ({ ...prev, ...changes }));
    setDirty(true);
  };
  const patchFlags = (changes: Partial<DemoTenantSettings['featureFlags']>) => {
    setSettings((prev) => ({ ...prev, featureFlags: { ...prev.featureFlags, ...changes } }));
    setDirty(true);
  };

  const handleSave = () => {
    setDirty(false);
    toast({ title: 'Settings saved', description: 'Tenant configuration updated. Feature flags apply immediately.' });
  };

  const handleReset = () => {
    setSettings(MOCK_TENANT_SETTINGS);
    setDirty(false);
    toast({ title: 'Reset', description: 'Settings restored to demo defaults.' });
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-slate-200 text-slate-600">
            <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
            Tenant · {settings.orgName}
          </Badge>
          {dirty && (
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
              Unsaved changes
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleReset} disabled={!dirty}>
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
          <Button size="sm" className="gap-2" onClick={handleSave} disabled={!dirty}>
            <Save className="w-3.5 h-3.5" /> Save
          </Button>
        </div>
      </div>

      {/* Organisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-600" />
            Organisation
          </CardTitle>
          <CardDescription>Basic identity, region, and default contact.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Field label="Organisation name">
            <Input value={settings.orgName} onChange={(e) => patch({ orgName: e.target.value })} />
          </Field>
          <Field label="Primary domain">
            <Input value={settings.domain} onChange={(e) => patch({ domain: e.target.value })} />
          </Field>
          <Field label="Timezone">
            <select
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm"
              value={settings.timezone}
              onChange={(e) => patch({ timezone: e.target.value })}
            >
              {TIMEZONES.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </Field>
          <Field label="Data residency region">
            <select
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm"
              value={settings.region}
              onChange={(e) => patch({ region: e.target.value })}
            >
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Contact email" className="md:col-span-2">
            <Input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => patch({ contactEmail: e.target.value })}
            />
          </Field>
        </CardContent>
      </Card>

      {/* Feature flags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-600" />
            Feature flags
          </CardTitle>
          <CardDescription>Enable capabilities across the tenant.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <FlagRow
            label="File uploads in chat"
            description="Users can attach PDFs, images, and text files. Files are scanned before forwarding."
            checked={settings.featureFlags.fileUploadEnabled}
            onChange={(v) => patchFlags({ fileUploadEnabled: v })}
          />
          <Separator />
          <FlagRow
            label="Projects"
            description="Scope prompts, audits, and budgets by project."
            checked={settings.featureFlags.projectsEnabled}
            onChange={(v) => patchFlags({ projectsEnabled: v })}
          />
          <Separator />
          <FlagRow
            label="VS Code extension access"
            description="Permit developers to mint device tokens for the Kotwal VS Code plugin."
            checked={settings.featureFlags.vsCodeExtensionEnabled}
            onChange={(v) => patchFlags({ vsCodeExtensionEnabled: v })}
          />
        </CardContent>
      </Card>

      {/* PII masking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            PII masking strategy
          </CardTitle>
          <CardDescription>
            How Kotwal transforms sensitive values before they reach the AI model.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            {MASKING_STRATEGIES.map((s) => {
              const selected = settings.featureFlags.piiRedactionMasking === s.id;
              return (
                <button
                  key={s.id} type="button" onClick={() => patchFlags({ piiRedactionMasking: s.id })}
                  className={cn(
                    'rounded-xl border p-3 text-left transition-colors',
                    selected
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">{s.label}</span>
                    <span className="text-[10px] font-mono text-slate-500">{s.id}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{s.description}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-600" />
            Notifications
          </CardTitle>
          <CardDescription>
            Alert channels for policy events and periodic reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <FlagRow
            label="Daily budget alerts"
            description="Notify the contact email when prepaid tokens fall below 20%."
            checked={settings.featureFlags.dailyBudgetAlerts}
            onChange={(v) => patchFlags({ dailyBudgetAlerts: v })}
          />
          <Separator />
          <FlagRow
            label="Weekly executive report"
            description="Summary of usage, blocks, and top risks — every Monday, 09:00 tenant time."
            checked={settings.featureFlags.weeklyExecReport}
            onChange={(v) => patchFlags({ weeklyExecReport: v })}
          />
          <Separator />
          <div className="pt-3">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold flex items-center gap-1.5">
              <Mail className="w-3 h-3" />
              Owner notification recipients
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {settings.ownerNotificationEmails.map((e) => (
                <Badge key={e} variant="outline" className="text-xs bg-slate-50">
                  {e}
                </Badge>
              ))}
              <Button size="sm" variant="ghost" className="h-6 text-xs text-blue-600 hover:text-blue-700"
                onClick={() => toast({ title: 'Adding recipients', description: 'Coming soon: invite additional owner emails.' })}
              >
                + Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Field = ({
  label, className, children,
}: { label: string; className?: string; children: React.ReactNode }) => (
  <div className={cn('flex flex-col', className)}>
    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">
      {label}
    </label>
    {children}
  </div>
);

const FlagRow = ({
  label, description, checked, onChange,
}: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-start justify-between gap-4 py-3">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-900">{label}</p>
      <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
  </div>
);

export default SettingsSection;
