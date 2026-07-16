import { useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Code2, FileText, BarChart2, Mail, Users, Search, Scale, Target,
  Megaphone, BookOpen, ArrowRight, ArrowLeft, Send, Sparkles, LucideIcon,
} from 'lucide-react';
import {
  PROMPT_LIBRARY, LibraryPrompt, assemblePrompt, isPromptReady,
} from '@/data/promptLibrary';

// Icon key → component. Data references icons by string so the data module stays
// free of React/lucide imports (and identical across apps).
const PROMPT_ICONS: Record<string, LucideIcon> = {
  code: Code2,
  file: FileText,
  chart: BarChart2,
  mail: Mail,
  users: Users,
  search: Search,
  scale: Scale,
  target: Target,
  megaphone: Megaphone,
  book: BookOpen,
};

interface PromptLibrarySheetProps {
  open: boolean;
  onClose: () => void;
  /** Receives the fully assembled prompt, ready to send. */
  onSelect: (prompt: string) => void;
}

const PromptLibrarySheet = ({ open, onClose, onSelect }: PromptLibrarySheetProps) => {
  const [activeCategoryId, setActiveCategoryId] = useState(PROMPT_LIBRARY[0].id);
  const [query, setQuery] = useState('');
  // When a prompt is selected we enter the "fill" (or "confirm") step.
  const [selected, setSelected] = useState<LibraryPrompt | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  const activeCategory =
    PROMPT_LIBRARY.find((c) => c.id === activeCategoryId) ?? PROMPT_LIBRARY[0];

  // Filter prompts within the active category by title/description/tags.
  const filteredSubcategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activeCategory.subcategories;
    return activeCategory.subcategories
      .map((sub) => ({
        ...sub,
        prompts: sub.prompts.filter((p) =>
          [p.title, p.description, ...(p.tags ?? [])]
            .join(' ')
            .toLowerCase()
            .includes(q),
        ),
      }))
      .filter((sub) => sub.prompts.length > 0);
  }, [activeCategory, query]);

  const resetToBrowse = () => {
    setSelected(null);
    setValues({});
  };

  const handleClose = () => {
    resetToBrowse();
    setQuery('');
    onClose();
  };

  const openPrompt = (prompt: LibraryPrompt) => {
    setSelected(prompt);
    // Seed empty values for each field so inputs are controlled.
    const seed: Record<string, string> = {};
    for (const field of prompt.fields ?? []) seed[field.key] = '';
    setValues(seed);
  };

  const send = () => {
    if (!selected) return;
    const assembled = assemblePrompt(selected, values);
    onSelect(assembled);
    handleClose();
  };

  const ready = selected ? isPromptReady(selected, values) : false;
  const hasFields = !!(selected?.fields && selected.fields.length > 0);

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 gap-0">
        <SheetHeader className="px-5 py-4 border-b border-border/50">
          <SheetTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Prompt Library
          </SheetTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            {selected
              ? hasFields
                ? 'Fill in the details, then send.'
                : 'Review and send this prompt.'
              : 'Browse categories, pick a prompt, fill in details, and send.'}
          </p>
        </SheetHeader>

        {/* ── Fill / Confirm step ────────────────────────────────────────── */}
        {selected ? (
          <div className="flex flex-1 min-h-0 flex-col">
            <div className="px-5 pt-4">
              <button
                type="button"
                onClick={resetToBrowse}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to library
              </button>
            </div>
            <ScrollArea className="flex-1">
              <div className="px-5 py-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">{selected.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{selected.description}</p>
                </div>

                {hasFields ? (
                  <div className="space-y-3.5">
                    {selected.fields!.map((field) => {
                      const optional = field.required === false;
                      return (
                        <div key={field.key} className="space-y-1.5">
                          <label className="text-xs font-medium flex items-center gap-1.5">
                            {field.label}
                            {optional && (
                              <span className="text-[10px] font-normal text-muted-foreground">(optional)</span>
                            )}
                          </label>
                          {field.multiline ? (
                            <Textarea
                              value={values[field.key] ?? ''}
                              placeholder={field.placeholder}
                              onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                              className="min-h-[96px] text-sm"
                            />
                          ) : (
                            <Input
                              value={values[field.key] ?? ''}
                              placeholder={field.placeholder}
                              onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                              className="text-sm"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                      This prompt has no fields to fill. Click send to add it to the chat.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t border-border/50 px-5 py-3 flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={resetToBrowse}>Cancel</Button>
              <Button size="sm" className="gap-1.5" disabled={!ready} onClick={send}>
                <Send className="h-3.5 w-3.5" /> Send
              </Button>
            </div>
          </div>
        ) : (
          /* ── Browse step ─────────────────────────────────────────────── */
          <div className="flex flex-1 min-h-0">
            {/* Category sidebar */}
            <nav className="w-40 shrink-0 border-r border-border/50 py-3 flex flex-col gap-0.5 px-2 overflow-y-auto">
              {PROMPT_LIBRARY.map((cat) => {
                const Icon = PROMPT_ICONS[cat.icon] ?? Sparkles;
                const isActive = cat.id === activeCategoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { setActiveCategoryId(cat.id); setQuery(''); }}
                    className={`flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-left transition-colors w-full ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="leading-tight">{cat.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Prompts */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="px-4 pt-3 pb-2 border-b border-border/40">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Search ${activeCategory.label}…`}
                    className="h-8 pl-8 text-xs"
                  />
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="px-4 py-4 space-y-5">
                  {filteredSubcategories.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-6 text-center">
                      No prompts match “{query}”.
                    </p>
                  ) : (
                    filteredSubcategories.map((sub) => (
                      <div key={sub.id} className="space-y-2">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {sub.label}
                        </p>
                        <div className="space-y-2">
                          {sub.prompts.map((prompt) => (
                            <button
                              key={prompt.id}
                              type="button"
                              onClick={() => openPrompt(prompt)}
                              className="group w-full flex items-start justify-between gap-2 rounded-xl border border-border/60 bg-card px-3.5 py-2.5 text-left hover:border-primary/40 hover:bg-primary/5 transition-all duration-100"
                            >
                              <span className="min-w-0">
                                <span className="block text-[13px] font-medium leading-snug">{prompt.title}</span>
                                <span className="block text-xs text-muted-foreground leading-snug mt-0.5">{prompt.description}</span>
                              </span>
                              <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default PromptLibrarySheet;
