type LogoProps = {
  className?: string;
  showWordmark?: boolean;
  size?: number;
  title?: string;
};

/**
 * opstruth logo — chevron (>) paired with an overlapping checkmark.
 * Mirrors the brand sign: muted steel chevron + sage-green check,
 * optional wordmark with "ops" in foreground and "truth" in the brand green.
 */
export function Logo({ className, showWordmark = true, size = 28, title = "opstruth" }: LogoProps) {
  const h = size;
  return (
    <span className={"inline-flex items-center gap-2 " + (className ?? "")} aria-label={title}>
      <LogoMark size={h} />
      {showWordmark && (
        <span
          className="font-mono tracking-tight leading-none"
          style={{ fontSize: Math.round(h * 0.55) }}
        >
          <span className="text-foreground">ops</span>
          <span className="text-status-pass">truth</span>
        </span>
      )}
    </span>
  );
}

export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* subtle plate */}
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="6.5"
        fill="var(--surface-elevated)"
        stroke="var(--border-strong)"
      />
      {/* chevron > in muted steel */}
      <path
        d="M8 9 L15 16 L8 23"
        stroke="var(--muted-foreground)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* checkmark in sage green */}
      <path
        d="M14 17 L18.5 22 L25 11"
        stroke="var(--status-pass)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
