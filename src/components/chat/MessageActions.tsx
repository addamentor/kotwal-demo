/**
 * MessageActions — Copy + Save-as-PDF buttons under each assistant response.
 * Hover-reveal by default; always visible when `alwaysVisible` is true (touch).
 *
 * DEMO NOTE: "Save as PDF" is intentionally cosmetic — we show the button and
 * a friendly toast to demonstrate the feature exists in the real product, but
 * no PDF is generated client-side. Wiring in a real PDF renderer isn't worth
 * the demo weight; this button lives to prove "yes, this is a real button in
 * the real app, and it works there."
 */
import { useCallback, useState } from 'react';
import { Check, Copy, FileDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface Props {
  content: string;
  /** Reserved for parity with the real component; currently unused in demo. */
  timestamp?: Date | string | null;
  modelLabel?: string | null;
  alwaysVisible?: boolean;
  className?: string;
}

const MessageActions = ({ content, alwaysVisible = false, className }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* browsers occasionally block clipboard without a user gesture */
    }
  }, [content]);

  const handleExportPdf = useCallback(() => {
    // Cosmetic in the demo — see file header.
    toast({
      title: 'Save as PDF',
      description: 'Available in the full product. Live demo skips the download to keep things fast.',
    });
  }, []);

  return (
    <div
      className={cn(
        'flex items-center gap-1 mt-1.5',
        alwaysVisible
          ? 'opacity-100'
          : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity',
        className,
      )}
    >
      <button
        type="button"
        onClick={handleCopy}
        title="Copy response"
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        {copied
          ? <><Check className="h-3 w-3 text-emerald-600" /> Copied</>
          : <><Copy className="h-3 w-3" /> Copy</>}
      </button>
      <button
        type="button"
        onClick={handleExportPdf}
        title="Save this response as PDF (available in the full product)"
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <FileDown className="h-3 w-3" />
        Save as PDF
      </button>
    </div>
  );
};

export default MessageActions;
