export function ExampleOutput() {
  return (
    <section id="output" className="border-b border-border/60 bg-surface/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="grid min-w-0 gap-10 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)] md:gap-14 md:items-start">
          <div className="min-w-0 md:sticky md:top-24">
            <div className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              Example output
            </div>
            <h2 className="mt-3 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
              Calm. Structured. Honest about gaps.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              This excerpt is from the local checkout with evidence writing skipped for display. The
              normal run writes a Markdown evidence pack to <code>evidence/opstruth-report.md</code>
              .
            </p>

            <ul className="mt-6 space-y-2 font-mono text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-status-pass" /> verified
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-status-warn" /> warning
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-status-skip" /> not verified
              </li>
            </ul>
          </div>

          <div className="min-w-0 rounded-lg border border-border-strong bg-[oklch(0.13_0.005_250)] shadow-2xl shadow-black/40">
            <div className="flex min-w-0 items-center justify-between gap-3 border-b border-border/80 px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.32_0.01_250)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.32_0.01_250)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.32_0.01_250)]" />
              </div>
              <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">
                advanced_pudding9228@web — opstruth
              </span>
              <span className="hidden w-10 sm:block" />
            </div>

            <pre className="max-w-full overflow-x-auto px-4 py-5 font-mono text-[12px] leading-[1.75] text-foreground/90 sm:px-5 sm:text-[12.5px]">
              <Line prompt>node bin/opstruth.js --skip evidence</Line>
              <Line muted>Operational truth checks for AI-assisted engineering.</Line>
              <Line> </Line>
              <Line strong>STATUS: Partial pass</Line>
              <Line muted>One-command operational truth check completed.</Line>
              <Line> </Line>
              <Line tag="pass">Verified</Line>
              <Line indent>
                Project boundary: <Mono>/home/johnh/opstruth</Mono>
              </Line>
              <Line indent>
                Probe catalogue entries: <Mono>30</Mono>
              </Line>
              <Line indent>
                Automatic safe probes selected: <Mono>15</Mono>
              </Line>
              <Line indent>Platforms detected: TypeScript, Node ESM, GitHub Actions</Line>
              <Line> </Line>
              <Line tag="warn">Warnings</Line>
              <Line indent>None</Line>
              <Line> </Line>
              <Line tag="skip">Not Verified</Line>
              <Line indent>Production/public route availability was not checked</Line>
              <Line indent>Local runtime liveness was not checked</Line>
              <Line indent>Supabase database exposure was not checked</Line>
              <Line> </Line>
              <Line tag="not">Did NOT do</Line>
              <Line indent>
                No deploys, database mutations, OpenAI calls, publishing, queue triggers, restarts,
                or kills
              </Line>
              <Line> </Line>
              <Line muted>Next: add --base-url or --port when route or runtime proof matters.</Line>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return <span className="text-foreground bg-surface-elevated px-1 rounded">{children}</span>;
}

interface LineProps {
  children: React.ReactNode;
  prompt?: boolean;
  muted?: boolean;
  dim?: boolean;
  strong?: boolean;
  indent?: boolean;
  tag?: "pass" | "warn" | "skip" | "not";
}

function Line({ children, prompt, muted, dim, strong, indent, tag }: LineProps) {
  const tagColor =
    tag === "pass"
      ? "text-status-pass"
      : tag === "warn"
        ? "text-status-warn"
        : tag === "skip"
          ? "text-status-skip"
          : tag === "not"
            ? "text-status-fail"
            : "";

  const tagLabel =
    tag === "pass"
      ? "✓ "
      : tag === "warn"
        ? "! "
        : tag === "skip"
          ? "○ "
          : tag === "not"
            ? "× "
            : "";

  if (tag) {
    return (
      <div className={`${tagColor} font-medium mt-1`}>
        {tagLabel}
        {children}
      </div>
    );
  }

  return (
    <div
      className={[
        indent ? "pl-5" : "",
        muted ? "text-muted-foreground" : "",
        dim ? "text-status-skip pl-5" : "",
        strong ? "text-foreground font-medium" : "",
      ].join(" ")}
    >
      {prompt && <span className="text-status-pass select-none">$ </span>}
      {children}
    </div>
  );
}
