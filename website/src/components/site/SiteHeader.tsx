import { Link } from "@tanstack/react-router";
import { Github } from "lucide-react";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <Logo size={26} />
          <span className="hidden md:inline font-mono text-[11px] text-muted-foreground">
            v0.1.2 · read-only
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 font-mono text-[13px] text-muted-foreground">
          <a href="#checks" className="hover:text-foreground transition-colors">
            probes
          </a>
          <a href="#output" className="hover:text-foreground transition-colors">
            output
          </a>
          <a href="#github" className="hover:text-foreground transition-colors">
            github
          </a>
          <a href="#boundaries" className="hover:text-foreground transition-colors">
            boundaries
          </a>
          <a href="#evidence" className="hover:text-foreground transition-colors">
            evidence
          </a>
        </nav>

        <a
          href="https://github.com/ayobamih/opstruth"
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
