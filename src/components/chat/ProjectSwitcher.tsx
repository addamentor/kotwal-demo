/**
 * ProjectSwitcher — chat-header chip that switches the active project.
 *
 * The demo has no server-side project scoping — this is purely a UI
 * demonstration of the real product's per-project mode. The active project
 * label appears next to the message input to make the current scope obvious.
 */
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProject } from '@/context/ProjectContext';

export default function ProjectSwitcher() {
  const { projects, activeProjectId, setActiveProjectId, activeProject } = useProject();
  if (!projects.length) return null;

  return (
    <Select
      value={activeProjectId ?? 'global'}
      onValueChange={(v) => setActiveProjectId(v === 'global' ? null : v)}
    >
      <SelectTrigger className="h-7 w-48 text-xs rounded-lg border-border gap-1.5">
        {/* Colour dot for the active project, then the label */}
        {activeProject && (
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full shrink-0"
            style={{ background: activeProject.colorHex }}
          />
        )}
        <SelectValue placeholder="Global" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="global">
          <span className="text-muted-foreground">Global</span>
        </SelectItem>
        {projects.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: p.colorHex }}
              />
              {p.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
