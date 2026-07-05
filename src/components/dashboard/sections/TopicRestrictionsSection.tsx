/**
 * TopicRestrictionsSection — enable/disable topic-level content restrictions
 * with per-topic action, severity, and confidence sliders.
 *
 * State is client-only. In the real product, saves POST to the tenant
 * policyConfig endpoint and update the aggregate policy version.
 */
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  ShieldAlert, Save, RotateCcw, Sparkles, Ban, AlertTriangle,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { MOCK_TOPIC_RESTRICTIONS, DemoTopicRestriction } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const CATEGORY_TONE: Record<DemoTopicRestriction['category'], { label: string; className: string }> = {
  safety:     { label: 'Safety',     className: 'border-red-200 bg-red-50 text-red-700' },
  compliance: { label: 'Compliance', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  business:   { label: 'Business',   className: 'border-amber-200 bg-amber-50 text-amber-700' },
};

const ACTION_STYLES: Record<DemoTopicRestriction['action'], string> = {
  BLOCK: 'bg-red-600 text-white',
  WARN:  'bg-amber-500 text-white',
};

const TopicRestrictionsSection = () => {
  const [topics, setTopics] = useState<DemoTopicRestriction[]>(MOCK_TOPIC_RESTRICTIONS);
  const [dirty, setDirty] = useState(false);

  const enabledCount = useMemo(() => topics.filter((t) => t.enabled).length, [topics]);
  const blockCount   = useMemo(() => topics.filter((t) => t.enabled && t.action === 'BLOCK').length, [topics]);
  const warnCount    = useMemo(() => topics.filter((t) => t.enabled && t.action === 'WARN').length, [topics]);

  const patch = (id: string, changes: Partial<DemoTopicRestriction>) => {
    setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)));
    setDirty(true);
  };

  const handleSave = () => {
    // Purely cosmetic in the demo — no persistence beyond in-memory state.
    setDirty(false);
    toast({
      title: 'Policy updated',
      description: `${enabledCount} topic${enabledCount === 1 ? '' : 's'} active. Policy version bumped.`,
    });
  };

  const handleReset = () => {
    setTopics(MOCK_TOPIC_RESTRICTIONS);
    setDirty(false);
    toast({ title: 'Reset', description: 'Topic policy restored to demo defaults.' });
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 via-rose-50 to-white p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-red-600 hover:bg-red-600 text-white border-transparent uppercase tracking-widest text-[10px]">
                Content policy
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 leading-tight mb-2">
              Topic restrictions
            </h2>
            <p className="text-slate-700 leading-relaxed max-w-2xl">
              Kotwal blocks or warns on entire categories of prompts, regardless of
              whether they contain PII. Toggle categories, tune severity, and pick the
              enforcement action per topic.
            </p>
          </div>
          <div className="flex-shrink-0 hidden md:flex items-center justify-center w-32 h-32 rounded-2xl bg-white border border-red-200 shadow-sm">
            <ShieldAlert className="w-14 h-14 text-red-500" />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryTile label="Enabled"  value={enabledCount} icon={Sparkles}       tone="slate" />
        <SummaryTile label="Blocking" value={blockCount}   icon={Ban}            tone="red" />
        <SummaryTile label="Warning"  value={warnCount}    icon={AlertTriangle}  tone="amber" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" className="gap-2" onClick={handleReset} disabled={!dirty}>
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </Button>
        <Button size="sm" className="gap-2" onClick={handleSave} disabled={!dirty}>
          <Save className="w-3.5 h-3.5" />
          Save policy
        </Button>
      </div>

      {/* Topic cards */}
      <div className="space-y-3">
        {topics.map((t) => {
          const cat = CATEGORY_TONE[t.category];
          return (
            <Card key={t.id} className={cn(!t.enabled && 'opacity-70')}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <CardTitle className="text-base">{t.label}</CardTitle>
                      <Badge variant="outline" className={cn('text-[10px] uppercase tracking-wider', cat.className)}>
                        {cat.label}
                      </Badge>
                      {t.enabled && (
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-widest',
                          ACTION_STYLES[t.action],
                        )}>
                          {t.action}
                        </span>
                      )}
                    </div>
                    <CardDescription className="text-xs leading-relaxed">
                      {t.description}
                    </CardDescription>
                  </div>
                  <Switch
                    checked={t.enabled}
                    onCheckedChange={(v) => patch(t.id, { enabled: v })}
                    aria-label={`Enable ${t.label}`}
                  />
                </div>
              </CardHeader>

              {t.enabled && (
                <>
                  <Separator />
                  <CardContent className="pt-4 grid md:grid-cols-3 gap-6">
                    {/* Action toggle */}
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                        Action on match
                      </label>
                      <div className="mt-2 inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
                        {(['WARN', 'BLOCK'] as const).map((a) => (
                          <button
                            key={a}
                            onClick={() => patch(t.id, { action: a })}
                            className={cn(
                              'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                              t.action === a
                                ? a === 'BLOCK'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-amber-500 text-white'
                                : 'text-slate-600 hover:text-slate-900',
                            )}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Severity slider */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                          Severity
                        </label>
                        <span className="text-xs font-mono text-slate-700">{t.severity.toFixed(2)}</span>
                      </div>
                      <Slider
                        value={[t.severity * 100]}
                        onValueChange={([v]) => patch(t.id, { severity: Math.round(v) / 100 })}
                        max={100} step={5}
                      />
                    </div>

                    {/* Confidence slider */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                          Confidence floor
                        </label>
                        <span className="text-xs font-mono text-slate-700">{t.confidence.toFixed(2)}</span>
                      </div>
                      <Slider
                        value={[t.confidence * 100]}
                        onValueChange={([v]) => patch(t.id, { confidence: Math.round(v) / 100 })}
                        max={100} step={5}
                      />
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const SummaryTile = ({
  label, value, icon: Icon, tone,
}: {
  label: string; value: number; icon: typeof Sparkles;
  tone: 'slate' | 'red' | 'amber';
}) => {
  const tones = {
    slate: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' },
    red:   { bg: 'bg-red-50',   border: 'border-red-200',   text: 'text-red-700'   },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
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

export default TopicRestrictionsSection;
