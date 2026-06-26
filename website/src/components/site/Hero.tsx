import { CommandBlock } from "./CommandBlock";
import { ArrowUpRight } from "lucide-react";
import { LogoMark, Logo } from "./Logo";

const launchVideoSrc = "/demo/opstruth-hero-runtime-truth.mp4";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6 md:pt-24 md:pb-28">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative inline-flex h-14 w-14 items-center justify-center rounded-xl border border-border-strong bg-surface-elevated shadow-[0_0_40px_-12px_oklch(0.72_0.11_155/0.35)] sm:h-16 sm:w-16">
            <LogoMark size={40} />
          </div>
          <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1.5 font-mono text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-status-pass" />
            local · read-only · evidence-first
          </div>
        </div>

        <div className="mt-6 md:hidden">
          <Logo size={28} />
        </div>

        <h1 className="mt-6 max-w-3xl text-[clamp(2.35rem,13vw,4rem)] font-medium leading-[0.98] tracking-tight text-foreground md:text-6xl md:leading-[1.04]">
          AI coding tools are fast.
          <span className="block text-muted-foreground">
            OpsTruth checks what is actually true afterwards.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
          A local CLI that inspects your repo, picks safe probes, and writes evidence without
          deploying, mutating, or calling out to anything.
        </p>

        <div className="mt-10 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-col gap-2">
            <CommandBlock command="npm install -g opstruth" />
            <CommandBlock command="opstruth" />
            <CommandBlock command="npx opstruth" />
          </div>
          <a
            href="https://github.com/ayobamih/opstruth"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 py-2.5 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            View on GitHub
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <div className="mt-12 min-w-0 overflow-hidden rounded-xl border border-border bg-surface shadow-[0_30px_80px_-30px_oklch(0_0_0/0.6)]">
          <div className="flex flex-col gap-1 border-b border-border bg-background/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              Runtime truth walkthrough
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              See verified, warning, and not verified states.
            </p>
          </div>
          <video
            className="block aspect-video w-full bg-background"
            src={launchVideoSrc}
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="metadata"
            aria-label="OpsTruth runtime truth walkthrough"
          >
            <a href={launchVideoSrc}>Watch the OpsTruth runtime truth walkthrough.</a>
          </video>
        </div>

        <dl className="mt-12 grid min-w-0 grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 md:mt-16 md:grid-cols-4">
          {[
            { k: "Catalogue probes", v: "30" },
            { k: "Mutating actions", v: "0" },
            { k: "Raw secrets printed", v: "0" },
            { k: "Default report", v: "Markdown evidence file" },
          ].map((s) => (
            <div key={s.k} className="min-w-0 bg-surface px-5 py-4">
              <dt className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                {s.k}
              </dt>
              <dd className="mt-1 break-words font-mono text-base text-foreground md:text-lg">
                {s.v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
