export function Problem() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] md:gap-14">
          <div className="min-w-0">
            <div className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              The gap
            </div>
            <h2 className="mt-3 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
              Generation is fast. Certainty isn&apos;t.
            </h2>
          </div>

          <div className="min-w-0 space-y-6 text-base leading-7 text-muted-foreground">
            <p>
              AI tools edit dozens of files in seconds. What they don&apos;t do is tell you, calmly
              and concretely, what the resulting state of your project actually is.
            </p>
            <p className="text-foreground">
              OpsTruth answers six questions, every run, in the same order:
            </p>
            <ol className="grid min-w-0 gap-px overflow-hidden rounded-md border border-border bg-border font-mono text-sm sm:grid-cols-2">
              {[
                "what changed?",
                "what is configured?",
                "what looks risky?",
                "what was verified?",
                "what was NOT verified?",
                "what did the tool explicitly NOT do?",
              ].map((q, i) => (
                <li
                  key={q}
                  className="flex min-w-0 items-baseline gap-3 bg-surface px-4 py-3 text-muted-foreground"
                >
                  <span className="text-status-skip">0{i + 1}</span>
                  <span className="text-foreground">{q}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
