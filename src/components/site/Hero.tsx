import { CommandBlock } from "./CommandBlock";
import { ArrowUpRight } from "lucide-react";
import { LogoMark, Logo } from "./Logo";


export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="flex items-center gap-4">

          <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-xl border border-border-strong bg-surface-elevated shadow-[0_0_40px_-12px_oklch(0.72_0.11_155/0.35)]">
            <LogoMark size={40} />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 font-mono text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-status-pass" />
            local · read-only · evidence-first
          </div>
        </div>

        <div className="mt-6 md:hidden">
          <Logo size={28} />
        </div>


        <h1 className="mt-6 max-w-3xl text-balance text-4xl font-medium tracking-tight text-foreground md:text-6xl md:leading-[1.05]">
          AI coding tools are fast.{" "}
          <span className="text-muted-foreground">opstruth checks what is actually true afterward.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
          A local CLI that inspects your repo, picks stack-aware probes, and writes an evidence
          report — without deploying, mutating, or calling out to anything.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <CommandBlock command="opstruth" />
          <a
            href="https://github.com/AyobamiH/opstruth"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 rounded-md px-3 py-2.5 font-mono text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            View on GitHub
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-4">
          {[
            { k: "Mutations", v: "0" },
            { k: "Network calls", v: "0" },
            { k: "Secrets printed", v: "0" },
            { k: "Evidence files", v: "1 per run" },
          ].map((s) => (
            <div key={s.k} className="bg-surface px-5 py-4">
              <dt className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {s.k}
              </dt>
              <dd className="mt-1 font-mono text-lg text-foreground">{s.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
