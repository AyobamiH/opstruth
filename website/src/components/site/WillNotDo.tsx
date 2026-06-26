import { X } from "lucide-react";

const items = [
  { k: "deploy", d: "no push, no release, no environment change" },
  { k: "mutate databases", d: "no writes, no migrations, no seeds" },
  { k: "publish content", d: "no posts, no uploads, no outbound webhooks" },
  { k: "restart services", d: "no process control, no orchestrator calls" },
  { k: "trigger jobs", d: "no queues, no cron, no background workers kicked off" },
  { k: "call AI providers", d: "no OpenAI, no Anthropic, no model calls of any kind" },
  { k: "print raw secrets", d: "patterns are redacted before they reach your terminal" },
];

export function WillNotDo() {
  return (
    <section id="boundaries" className="border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="grid min-w-0 gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] md:gap-14">
          <div className="min-w-0">
            <div className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              Boundaries
            </div>
            <h2 className="mt-3 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
              What OpsTruth will never do.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              The read-only boundary is the product. It is enforced in code, visible in output, and
              documented per probe.
            </p>
          </div>

          <ul className="min-w-0 divide-y divide-border rounded-lg border border-border bg-surface">
            {items.map((it) => (
              <li key={it.k} className="flex items-start gap-4 px-5 py-4">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border-strong bg-background">
                  <X className="h-3 w-3 text-status-fail" strokeWidth={2.5} />
                </span>
                <div className="min-w-0">
                  <div className="font-mono text-sm text-foreground">{it.k}</div>
                  <div className="mt-0.5 text-sm leading-6 text-muted-foreground">{it.d}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
