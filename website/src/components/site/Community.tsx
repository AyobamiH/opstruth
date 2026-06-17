import { ArrowUpRight } from "lucide-react";
import { CommandBlock } from "./CommandBlock";

export function Community() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-end">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Community testing
            </div>
            <h2 className="mt-3 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
              Bring messy repos. File false positives. Request probes.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              opstruth is local, open, and inspectable. The probe catalogue grows with real
              operational pain — not with what sounds impressive on a homepage. It is for
              developers, founders, agencies, and teams who need to understand AI-assisted changes
              before touching production.
            </p>
          </div>

          <div className="space-y-3">
            <CommandBlock command="opstruth" />
            <CommandBlock command="opstruth --out evidence/opstruth.md" prompt="$" />
            <p className="font-mono text-[11px] text-muted-foreground">
              runs locally · writes one file · changes nothing
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-[0.95fr_1.05fr]">
          <section className="bg-surface p-6">
            <h3 className="font-mono text-[13px] text-foreground">Start with the CLI</h3>
            <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
              Run opstruth first. It can surface proof gaps in repo structure, deployment
              assumptions, secret exposure risk, runtime inputs, and what still needs a human
              decision.
            </p>
          </section>
          <section className="bg-surface p-6">
            <h3 className="font-mono text-[13px] text-foreground">Need more than a CLI report?</h3>
            <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
              Some AI-built websites, apps, and automations need a focused diagnostic review before
              production changes. If the report shows risk you cannot interpret safely, open an
              issue with the evidence and ask for the next narrow review.
            </p>
            <a
              href="https://github.com/ayobamih/opstruth/issues"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 font-mono text-[12px] text-foreground hover:text-status-pass transition-colors"
            >
              Open an issue
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </section>
        </div>
      </div>
    </section>
  );
}
