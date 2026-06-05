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
            Every default run writes a report you can paste into a PR, attach to a CI artifact, or
            hand to a reviewer. No dashboard required.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <article className="rounded-lg border border-border-strong bg-background">
            <header className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="font-mono text-[11px] text-muted-foreground">
                evidence/fixture-runs/risky-secret-app.md
              </span>
              <span className="font-mono text-[11px] text-status-pass">read-only</span>
            </header>
            <div className="px-5 py-5 font-mono text-[12.5px] leading-[1.75] text-foreground/90">
              <p className="text-foreground"># opstruth Evidence Pack</p>
              <p className="text-muted-foreground">
                Status: Partial pass
                <br />
                Working directory: /tmp/opstruth-fixture-runs/risky-secret-app
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

          <aside className="rounded-lg border border-border bg-surface p-6">
            <h3 className="font-mono text-[13px] text-foreground">Use it in</h3>
            <ul className="mt-4 space-y-3 text-[13px] text-muted-foreground">
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
