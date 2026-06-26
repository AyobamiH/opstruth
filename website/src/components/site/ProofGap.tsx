const lanes = [
  {
    label: "Verified",
    lines: [
      "project boundary resolved before scanning",
      "30 probes in the catalogue",
      "15 safe automatic probes selected here",
      "quality scripts run only when present",
    ],
  },
  {
    label: "Not verified",
    lines: [
      "production route availability without --base-url",
      "local runtime liveness without --port or health input",
      "database exposure when Supabase config is absent",
      "remote CI or deployed state unless attached separately",
    ],
  },
  {
    label: "Did not do",
    lines: [
      "deploy",
      "mutate databases",
      "call OpenAI or other model APIs",
      "restart services, kill processes, or trigger queues",
    ],
  },
];

export function ProofGap() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="max-w-2xl">
          <div className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            Operational proof gap
          </div>
          <h2 className="mt-3 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            The useful answer is not just pass or fail.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            OpsTruth separates facts from assumptions so a human reviewer can see what became more
            certain, what remains a proof gap, and which actions were intentionally outside scope.
          </p>
        </div>

        <div className="mt-10 grid min-w-0 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
          {lanes.map((lane) => (
            <section key={lane.label} className="min-w-0 bg-surface p-5 sm:p-6">
              <h3 className="font-mono text-sm text-foreground">{lane.label}</h3>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">
                {lane.lines.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className="font-mono text-status-skip">/</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
