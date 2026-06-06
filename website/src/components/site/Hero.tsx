import { CommandBlock } from "./CommandBlock";
import { ArrowUpRight } from "lucide-react";
import { LogoMark, Logo } from "./Logo";

const launchVideoSrc = "/demo/opstruth-runtime-truth.mp4";

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

        <h1 className="mt-6 max-w-3xl text-2xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl md:text-6xl md:leading-[1.05]">
          AI coding tools are fast.
          <span className="block text-muted-foreground">
            opstruth checks what is true afterward.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
          A local CLI that inspects your repo, picks safe probes, and writes evidence without
          deploying, mutating, or calling out to anything.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-2">
            <CommandBlock command="npm install -g opstruth" />
            <CommandBlock command="opstruth" />
            <CommandBlock command="npx opstruth" />
          </div>
          <a
            href="https://github.com/ayobamih/opstruth"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 rounded-md px-3 py-2.5 font-mono text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            View on GitHub
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <div className="mt-12 overflow-hidden rounded-xl border border-border bg-surface shadow-[0_30px_80px_-30px_oklch(0_0_0/0.6)]">
          <div className="flex flex-col gap-1 border-b border-border bg-background/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Runtime truth, rendered from the product itself.
            </p>
            <p className="font-mono text-[11px] text-muted-foreground">
              /demo/opstruth-runtime-truth.mp4
            </p>
          </div>
          <video
            className="block aspect-video w-full"
            src={launchVideoSrc}
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="metadata"
            aria-label="opstruth runtime truth launch video"
          >
            <a href={launchVideoSrc}>Watch the opstruth runtime truth launch video.</a>
          </video>
        </div>

        <dl className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 md:grid-cols-4">
          {[
            { k: "Catalogue probes", v: "30" },
            { k: "Mutating actions", v: "0" },
            { k: "Raw secrets printed", v: "0" },
            { k: "Default evidence", v: "evidence/opstruth-report.md" },
          ].map((s) => (
            <div key={s.k} className="min-w-0 bg-surface px-5 py-4">
              <dt className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {s.k}
              </dt>
              <dd className="mt-1 break-all font-mono text-lg text-foreground">{s.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
