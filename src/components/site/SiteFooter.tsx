export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="font-mono text-[12px] text-muted-foreground">
          opstruth · local, read-only operational proof for AI-assisted engineering
        </div>
        <div className="flex items-center gap-6 font-mono text-[12px] text-muted-foreground">
          <a href="https://github.com" className="hover:text-foreground transition-colors">github</a>
          <a href="#checks" className="hover:text-foreground transition-colors">probes</a>
          <a href="#evidence" className="hover:text-foreground transition-colors">evidence</a>
          <span className="text-status-skip">v0.1 · pre-release</span>
        </div>
      </div>
    </footer>
  );
}
