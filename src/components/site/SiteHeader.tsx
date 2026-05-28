import { Link } from "@tanstack/react-router";
import { Github, Terminal } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border-strong bg-surface-elevated">
            <Terminal className="h-3.5 w-3.5 text-status-pass" strokeWidth={2.25} />
          </div>
          <span className="font-mono text-sm tracking-tight text-foreground">opstruth</span>
          <span className="hidden md:inline font-mono text-[11px] text-muted-foreground">
            v0.1 · read-only
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 font-mono text-[13px] text-muted-foreground">
          <a href="#checks" className="hover:text-foreground transition-colors">checks</a>
          <a href="#output" className="hover:text-foreground transition-colors">output</a>
          <a href="#boundaries" className="hover:text-foreground transition-colors">boundaries</a>
          <a href="#evidence" className="hover:text-foreground transition-colors">evidence</a>
        </nav>

        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 font-mono text-[12px] text-foreground hover:border-border-strong hover:bg-surface-elevated transition-colors"
        >
          <Github className="h-3.5 w-3.5" />
          GitHub
        </a>
      </div>
    </header>
  );
}
