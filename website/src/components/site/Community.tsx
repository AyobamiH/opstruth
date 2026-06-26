import { ArrowUpRight } from "lucide-react";
import { CommandBlock } from "./CommandBlock";

export function Community() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="grid min-w-0 gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-end">
          <div className="min-w-0">
            <div className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              Community testing
            </div>
            <h2 className="mt-3 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
              Run OpsTruth on a real repository. Report false positives. Request a missing probe.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              OpsTruth is local, open, and inspectable. The probe catalogue grows with real
              operational pain — not with what sounds impressive on a homepage. It is for
              developers, founders, agencies, and teams who need to understand AI-assisted changes
              before touching production.
            </p>
          </div>

          <div className="min-w-0 space-y-3">
            <CommandBlock command="opstruth" />
            <CommandBlock command="opstruth --out evidence/opstruth.md" prompt="$" />
            <p className="font-mono text-xs text-muted-foreground">
              runs locally · writes one file · changes nothing
            </p>
          </div>
        </div>

        <div className="mt-10 grid min-w-0 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="min-w-0 bg-surface p-5 sm:p-6">
            <h3 className="font-mono text-sm text-foreground">Start with the CLI</h3>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Run OpsTruth first. It can surface proof gaps in repo structure, deployment
              assumptions, secret exposure risk, runtime inputs, and what still needs a human
              decision.
            </p>
          </section>
          <section className="min-w-0 bg-surface p-5 sm:p-6">
            <h3 className="font-mono text-sm text-foreground">Need more than a CLI report?</h3>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Some AI-built websites, apps, and automations need a focused diagnostic review before
              production changes. If the report shows risk you cannot interpret safely, open an
              issue with the evidence and ask for the next narrow review.
            </p>
            <a
              href="https://github.com/ayobamih/opstruth/issues"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex min-h-11 items-center gap-1.5 font-mono text-sm text-foreground transition-colors hover:text-status-pass"
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
