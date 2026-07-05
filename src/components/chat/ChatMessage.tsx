/**
 * ChatMessage — rail-aligned message block, matching the real kotwaluiapp.
 *
 * Both user and assistant messages span the full content column. A left
 * gutter carries a short uppercase role label + timestamp, and a small
 * accent stripe separates user (muted) from assistant (primary). No
 * chat-bubble avatars — deliberately not the ChatGPT / Anthropic look.
 *
 * Assistant messages get hover-revealed Copy + Save-as-PDF controls via
 * MessageActions. During streaming those are hidden so users can't copy a
 * half-written response.
 */
import { Message } from '@/types/chat';
import MarkdownRenderer from './MarkdownRenderer';
import MessageActions from './MessageActions';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
  /** Label of the model that produced this response. */
  modelLabel?: string | null;
}

const formatTime = (date: Date): string => {
  try {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const ChatMessage = ({ message, isTyping, modelLabel }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const timeLabel = message.timestamp ? formatTime(new Date(message.timestamp)) : '';

  return (
    <article
      className={cn(
        'group fade-in grid grid-cols-[68px_1fr] gap-4 px-3 py-3 rounded-lg',
        // User prompts are slightly lifted so the eye can find "who said what"
        // without needing chat bubbles.
        isUser ? 'bg-muted/30' : 'bg-transparent',
      )}
      data-role={message.role}
    >
      {/* ── Left gutter: role label + accent stripe + timestamp ──────── */}
      <header className="flex flex-col items-start gap-1.5 pt-0.5 select-none">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn(
              'h-3 w-1 rounded-sm',
              isUser ? 'bg-foreground/40' : 'bg-primary',
            )}
          />
          <span
            className={cn(
              'text-[10px] font-bold uppercase tracking-[0.12em]',
              isUser ? 'text-muted-foreground' : 'text-primary',
            )}
          >
            {isUser ? 'You' : 'Kotwal'}
          </span>
        </div>
        {timeLabel && !isTyping && (
          <span className="text-[10px] font-mono text-muted-foreground/70">
            {timeLabel}
          </span>
        )}
      </header>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="min-w-0 pt-0.5">
        {isUser ? (
          <p className="whitespace-pre-wrap break-words text-[0.92rem] leading-relaxed text-foreground">
            {message.content}
          </p>
        ) : (
          <>
            <div className="prose-chat">
              <div className={isTyping ? 'typing-cursor' : ''}>
                <MarkdownRenderer content={message.content} />
              </div>
            </div>
            {!isTyping && message.content && (
              <MessageActions
                content={message.content}
                timestamp={message.timestamp}
                modelLabel={modelLabel}
              />
            )}
          </>
        )}
      </div>
    </article>
  );
};

export default ChatMessage;

/** Streaming placeholder — three bouncing dots in the same rail layout. */
export const TypingIndicator = () => (
  <article className="grid grid-cols-[68px_1fr] gap-4 px-3 py-3 fade-in">
    <header className="flex flex-col items-start gap-1.5 pt-0.5 select-none">
      <div className="flex items-center gap-2">
        <span className="h-3 w-1 rounded-sm bg-primary" aria-hidden="true" />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
          Kotwal
        </span>
      </div>
    </header>
    <div className="flex items-center gap-1 py-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" />
    </div>
  </article>
);
