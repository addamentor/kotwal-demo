/**
 * PromptLibrarySheet — drawer of curated prompts, grouped by category.
 *
 * Selecting a prompt populates the chat input. In the real product these
 * prompts are tenant-configurable; in the demo we ship a fixed set.
 */
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code2, FileText, BarChart2, Mail, Users, Search, Scale, ArrowRight } from 'lucide-react';

interface Category {
  id: string;
  label: string;
  icon: typeof Code2;
  prompts: string[];
}

const CATEGORIES: Category[] = [
  {
    id: 'coding',
    label: 'Coding',
    icon: Code2,
    prompts: [
      'Explain what this code does and suggest improvements',
      'Write unit tests for this function',
      'Debug this code and explain the root cause',
      'Refactor this code for readability and maintainability',
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    prompts: [
      'Summarise this document in 3 concise bullet points',
      'Create an executive summary of the following content',
      'Extract all action items and owners from this text',
      'Rewrite this in plain language for a general audience',
    ],
  },
  {
    id: 'data',
    label: 'Data & Analysis',
    icon: BarChart2,
    prompts: [
      'Analyse this data and identify the key trends',
      'Compare these options and recommend the best one with reasoning',
      'Create a structured report from this information',
      'What are the top insights I should act on from this dataset?',
    ],
  },
  {
    id: 'communication',
    label: 'Communication',
    icon: Mail,
    prompts: [
      'Draft a professional email for the following situation',
      'Summarise this email thread and suggest a concise reply',
      'Write meeting minutes from these notes',
      'Create a clear agenda for this meeting',
    ],
  },
  {
    id: 'hr',
    label: 'HR & Policy',
    icon: Users,
    prompts: [
      'Explain this policy in simple, plain language',
      'Draft a job description for this role',
      'Review this feedback and suggest improvements',
      'Create an onboarding checklist for a new employee in this role',
    ],
  },
  {
    id: 'research',
    label: 'Research',
    icon: Search,
    prompts: [
      'What are the pros and cons of the following approach?',
      'What are best practices for this topic in an enterprise context?',
      'Give me a concise overview of this subject',
      'Compare these two technologies and help me choose',
    ],
  },
  {
    id: 'legal',
    label: 'Legal & Compliance',
    icon: Scale,
    prompts: [
      'Summarise the key obligations in this contract',
      'Identify potential risks or red flags in this agreement',
      'Explain this regulation in plain language',
      'Does this process align with GDPR data minimisation requirements?',
    ],
  },
];

interface PromptLibrarySheetProps {
  open: boolean;
  onClose: () => void;
  onSelect: (prompt: string) => void;
}

const PromptLibrarySheet = ({ open, onClose, onSelect }: PromptLibrarySheetProps) => {
  const [activeCategoryId, setActiveCategoryId] = useState(CATEGORIES[0].id);
  const activeCategory = CATEGORIES.find((c) => c.id === activeCategoryId) ?? CATEGORIES[0];

  const handleSelect = (prompt: string) => {
    onSelect(prompt);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        <SheetHeader className="px-5 py-4 border-b border-border/50">
          <SheetTitle className="text-base font-semibold">Prompt Library</SheetTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select a category and click a prompt to populate the chat input.
          </p>
        </SheetHeader>

        <div className="flex flex-1 min-h-0">
          {/* Category sidebar */}
          <nav className="w-36 shrink-0 border-r border-border/50 py-3 flex flex-col gap-0.5 px-2">
            {CATEGORIES.map(({ id, label, icon: Icon }) => {
              const isActive = id === activeCategoryId;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveCategoryId(id)}
                  className={`flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-left transition-colors w-full ${
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="leading-tight">{label}</span>
                </button>
              );
            })}
          </nav>

          {/* Prompts */}
          <ScrollArea className="flex-1">
            <div className="px-4 py-4 space-y-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-3">
                {activeCategory.label}
              </p>
              {activeCategory.prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSelect(prompt)}
                  className="group w-full flex items-start justify-between gap-2 rounded-xl border border-border/60 bg-card px-3.5 py-3 text-left text-sm text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-100"
                >
                  <span className="leading-snug text-[13px]">{prompt}</span>
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PromptLibrarySheet;
