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
    <div className="group inline-flex min-h-11 max-w-full min-w-0 items-center gap-3 rounded-md border border-border-strong bg-surface-elevated py-1.5 pr-1.5 pl-4 font-mono text-sm shadow-[0_1px_0_0_oklch(1_0_0_/_0.03)_inset]">
      <span className="select-none text-status-pass">{prompt}</span>
      <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-foreground">
        {command}
      </span>
      <button
        type="button"
        onClick={onCopy}
        aria-label="Copy command"
        className="ml-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-status-pass" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
