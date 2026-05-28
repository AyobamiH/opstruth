import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CommandBlockProps {
  command: string;
  prompt?: string;
}

export function CommandBlock({ command, prompt = "$" }: CommandBlockProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* no-op */
    }
  };

  return (
    <div className="group inline-flex items-center gap-3 rounded-md border border-border-strong bg-surface-elevated pl-4 pr-1.5 py-1.5 font-mono text-sm shadow-[0_1px_0_0_oklch(1_0_0_/_0.03)_inset]">
      <span className="select-none text-status-pass">{prompt}</span>
      <span className="text-foreground">{command}</span>
      <button
        type="button"
        onClick={onCopy}
        aria-label="Copy command"
        className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-status-pass" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
