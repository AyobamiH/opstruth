export function Problem() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              The gap
            </div>
            <h2 className="mt-3 text-lg font-medium tracking-tight text-foreground sm:text-2xl md:text-3xl">
              Generation is fast. Certainty isn&apos;t.
            </h2>
          </div>

          <div className="space-y-6 text-[15px] leading-relaxed text-muted-foreground">
            <p>
              AI tools edit dozens of files in seconds. What they don&apos;t do is tell you, calmly
              and concretely, what the resulting state of your project actually is.
            </p>
            <p className="text-foreground">
              opstruth answers six questions, every run, in the same order:
            </p>
            <ol className="grid gap-px overflow-hidden rounded-md border border-border bg-border font-mono text-[13px] md:grid-cols-2">
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
                  className="flex items-baseline gap-3 bg-surface px-4 py-3 text-muted-foreground"
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
