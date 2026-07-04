import { SAMPLE_PROMPTS, SamplePrompt } from '@/lib/mockData';
import { ShieldCheck } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectPrompt?: (text: string) => void;
}

const categoryStyles: Record<string, string> = {
  safe: 'border-green-200 bg-green-50/80 hover:border-green-400 hover:shadow-green-100',
  warn: 'border-amber-200 bg-amber-50/80 hover:border-amber-400 hover:shadow-amber-100',
  block: 'border-red-200 bg-red-50/80 hover:border-red-400 hover:shadow-red-100',
};

const WelcomeScreen = ({ onSelectPrompt }: WelcomeScreenProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="w-16 h-16 mb-6 rounded-full bg-secondary flex items-center justify-center">
        <ShieldCheck className="w-8 h-8 text-foreground" />
      </div>
      <h1 className="text-2xl font-semibold text-foreground mb-2">How can I help you today?</h1>
      <p className="text-sm text-muted-foreground mb-8 max-w-md text-center">
        Try the sample prompts below to see Kotwal detect different types of sensitive data in real-time.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-3xl">
        {SAMPLE_PROMPTS.map((prompt: SamplePrompt) => (
          <button
            key={prompt.label}
            onClick={() => onSelectPrompt?.(prompt.text)}
            className={`flex flex-col gap-1.5 rounded-xl border p-4 text-left text-sm transition-all shadow-sm hover:shadow-md ${categoryStyles[prompt.category]}`}
          >
            <span className="font-semibold text-foreground text-xs">{prompt.label}</span>
            <span className="text-xs text-muted-foreground line-clamp-2">{prompt.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;
