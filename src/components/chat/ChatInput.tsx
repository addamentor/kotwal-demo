import { useRef, useEffect, KeyboardEvent, useState } from 'react';
import { ArrowUp, Sparkles, Globe, Server, Lock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ProjectSwitcher from './ProjectSwitcher';
import PromptLibrarySheet from './PromptLibrarySheet';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  selectedModel: string;
  onChangeModel: (value: string) => void;
  modelOptions: { value: string; label: string }[];
  value: string;
  onInputChange: (value: string) => void;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
}

/**
 * A visually-present but disabled feature toggle for the demo. Shows the real
 * product's capability (Web search, MCP tools) greyed out, with a tooltip that
 * it's available in the live app. Never interactive.
 */
const LockedToggle = ({
  icon: Icon,
  label,
}: {
  icon: typeof Globe;
  label: string;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span
        role="button"
        aria-disabled="true"
        tabIndex={-1}
        className="inline-flex items-center gap-1 rounded-lg border border-chat-input-border bg-chat-input/60 px-2 py-1 text-xs font-medium text-slate-400 cursor-not-allowed select-none"
      >
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
        <Lock className="h-3 w-3" />
      </span>
    </TooltipTrigger>
    <TooltipContent side="top" className="text-xs">
      {label} is available in the live app
    </TooltipContent>
  </Tooltip>
);

const ChatInput = ({
  onSend,
  disabled,
  selectedModel,
  onChangeModel,
  modelOptions,
  value,
  onInputChange,
  inputRef,
}: ChatInputProps) => {
  const textareaRef = inputRef ?? useRef<HTMLTextAreaElement>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value, textareaRef]);

  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      onSend(value.trim());
      onInputChange('');
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePromptSelect = (prompt: string) => {
    // The library assembles the full prompt; send it straight into the chat.
    if (!disabled) onSend(prompt);
  };

  return (
    <div className="p-4 pb-6">
      <div className="max-w-3xl mx-auto space-y-3">
        <div className="flex flex-col gap-2">
          <div className="flex-1">
            <div className="relative bg-chat-input border border-chat-input-border rounded-2xl shadow-lg text-slate-900">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Kotwal"
                disabled={disabled}
                rows={1}
                className="w-full resize-none bg-transparent px-4 py-3 pr-12 text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
                style={{ maxHeight: '200px' }}
              />
              <button
                onClick={handleSubmit}
                disabled={!value.trim() || disabled}
                className="absolute right-2 bottom-2 p-1.5 rounded-lg bg-foreground text-background disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-3 pt-1">
            {/* Model selector */}
            <div className="flex items-center gap-2">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Model</p>
              <Select value={selectedModel} onValueChange={onChangeModel} disabled={disabled}>
                <SelectTrigger className="h-8 rounded-lg border border-chat-input-border bg-chat-input px-2 text-xs shadow-sm w-40 text-slate-900">
                  <SelectValue placeholder="Select model" className="text-slate-900 data-[placeholder]:text-slate-400" />
                </SelectTrigger>
                <SelectContent className="bg-white text-slate-900">
                  {modelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-slate-900">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Project chip */}
            <div className="flex items-center gap-2">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Project</p>
              <ProjectSwitcher />
            </div>

            {/* Tool toggles — demo shows them locked (live-app only) */}
            <div className="flex items-center gap-1.5">
              <LockedToggle icon={Globe} label="Web search" />
              <LockedToggle icon={Server} label="MCP" />
            </div>

            {/* Prompt Library button */}
            <button
              type="button"
              onClick={() => setLibraryOpen(true)}
              disabled={disabled}
              className="ml-auto inline-flex items-center gap-1.5 h-8 rounded-lg border border-chat-input-border bg-chat-input px-2.5 text-xs shadow-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Prompt library
            </button>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Kotwal can make mistakes. Check important info.
        </p>
      </div>

      <PromptLibrarySheet
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={handlePromptSelect}
      />
    </div>
  );
};

export default ChatInput;
