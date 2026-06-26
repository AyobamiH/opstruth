import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Logo size={22} />
          <span className="font-mono text-sm leading-6 text-muted-foreground">
            · local, read-only operational proof for AI-assisted engineering
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-sm text-muted-foreground">
          <a
            href="https://github.com/ayobamih/opstruth"
            className="inline-flex min-h-11 items-center transition-colors hover:text-foreground"
          >
            github
          </a>
          <a
            href="#checks"
            className="inline-flex min-h-11 items-center transition-colors hover:text-foreground"
          >
            probes
          </a>
          <a
            href="#evidence"
            className="inline-flex min-h-11 items-center transition-colors hover:text-foreground"
          >
            evidence
          </a>
          <span className="text-status-skip">v0.1.3 · public testing</span>
        </div>
      </div>
    </footer>
  );
}
