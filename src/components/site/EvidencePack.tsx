export function EvidencePack() {
  return (
    <section id="evidence" className="border-b border-border/60 bg-surface/30">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-2xl">
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Evidence pack
          </div>
          <h2 className="mt-3 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            One markdown file. Reviewable. Attachable. Boring on purpose.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Every run writes a timestamped report you can paste into a PR, attach to a CI artifact,
            or hand to a reviewer. No dashboard required.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <article className="rounded-lg border border-border-strong bg-background">
            <header className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="font-mono text-[11px] text-muted-foreground">
                .opstruth/2026-05-28-1409.md
              </span>
              <span className="font-mono text-[11px] text-status-pass">read-only</span>
            </header>
            <div className="px-5 py-5 font-mono text-[12.5px] leading-[1.75] text-foreground/90">
              <p className="text-foreground"># opstruth evidence pack</p>
              <p className="text-muted-foreground">
                generated: 2026-05-28T14:09:02Z
                <br />
                stack: typescript, react, vite, supabase
                <br />
                probes: 11 selected · 9 ran · 2 skipped
              </p>
              <p className="mt-4 text-foreground">## Finding · supabase anon key in client</p>
              <p className="text-muted-foreground">
                severity: warn
                <br />
                file: <span className="text-foreground">src/lib/client.ts:12</span>
                <br />
                evidence: <span className="text-foreground">VITE_SUPABASE_ANON_KEY=eyJh…[redacted]</span>
                <br />
                proves: anon key reaches the browser bundle.
                <br />
                does not prove: RLS coverage is sufficient.
                <br />
                next: confirm RLS on all <span className="text-foreground">public.*</span> tables.
              </p>
              <p className="mt-4 text-foreground">## Not verified</p>
              <p className="text-muted-foreground">
                · routes — no base URL provided
                <br />
                · runtime — production not reachable from local
              </p>
            </div>
          </article>

          <aside className="rounded-lg border border-border bg-surface p-6">
            <h3 className="font-mono text-[13px] text-foreground">Use it in</h3>
            <ul className="mt-4 space-y-3 text-[13px] text-muted-foreground">
              <li className="flex items-baseline gap-3">
                <span className="font-mono text-status-skip">→</span>
                Pull request descriptions, as the &ldquo;what I verified&rdquo; section.
              </li>
              <li className="flex items-baseline gap-3">
                <span className="font-mono text-status-skip">→</span>
                CI artifacts, uploaded per run for later review.
              </li>
              <li className="flex items-baseline gap-3">
                <span className="font-mono text-status-skip">→</span>
                Handoffs between an AI agent and a human reviewer.
              </li>
              <li className="flex items-baseline gap-3">
                <span className="font-mono text-status-skip">→</span>
                Pre-deploy sanity checks, before promoting a build.
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
