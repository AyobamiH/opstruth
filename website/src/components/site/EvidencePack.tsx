export function EvidencePack() {
  return (
    <section id="evidence" className="border-b border-border/60 bg-surface/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="max-w-2xl">
          <div className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            Evidence pack
          </div>
          <h2 className="mt-3 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            One Markdown report. Easy to review, share, and attach.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Every default run writes a report you can paste into a PR, attach to a CI artifact, or
            hand to a reviewer. It is intentionally plain: evidence first, no dashboard required.
          </p>
        </div>

        <div className="mt-10 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <article className="min-w-0 rounded-lg border border-border-strong bg-background">
            <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
              <span className="min-w-0 font-mono text-xs text-muted-foreground">
                Example evidence report
              </span>
              <span className="shrink-0 font-mono text-xs text-status-pass">read-only</span>
            </header>
            <div className="px-4 py-5 font-mono text-[12px] leading-[1.8] text-foreground/90 sm:px-5 sm:text-[12.5px]">
              <p className="text-foreground"># OpsTruth Evidence Pack</p>
              <p className="text-muted-foreground">
                Status: Partial pass
                <br />
                Working directory: redacted fixture checkout
                <br />
                Commands run: git diff --check, npm run test
              </p>
              <p className="mt-4 text-foreground">## Risks And Gaps</p>
              <p className="text-muted-foreground">
                warn: <span className="text-foreground">src/config.js:1</span> matched OpenAI key
                pattern
                <br />
                evidence: redacted preview: service key value was replaced with [REDACTED]
                <br />
                warn: <span className="text-foreground">src/config.js:2</span> matched Supabase
                service role pattern
                <br />
                why it matters: secret-like values can create account, data, or infrastructure
                exposure.
                <br />
                next: move real secrets to secret storage and keep placeholders in source.
              </p>
              <p className="mt-4 text-foreground">## Not verified</p>
              <p className="text-muted-foreground">
                · production/public route availability was not checked
                <br />
                · local runtime liveness was not checked
                <br />· no OpenAI usage was monitored
              </p>
            </div>
          </article>

          <aside className="min-w-0 rounded-lg border border-border bg-surface p-5 sm:p-6">
            <h3 className="font-mono text-sm text-foreground">Use it in</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              <li className="flex items-baseline gap-3">
                <span className="font-mono text-status-skip">→</span>
                Pull request descriptions, as the &ldquo;what was verified&rdquo; section.
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
