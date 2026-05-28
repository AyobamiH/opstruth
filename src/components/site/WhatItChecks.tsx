import {
  GitBranch,
  Layers,
  KeyRound,
  Route as RouteIcon,
  Activity,
  Database,
  Cloud,
  FileText,
} from "lucide-react";

const checks = [
  {
    icon: GitBranch,
    title: "Repo state",
    desc: "Working tree, branch, recent changes — the baseline for every other probe.",
  },
  {
    icon: Layers,
    title: "Stack detection",
    desc: "TypeScript, React, Vite, Next.js, Docker, GitHub Actions. Probes are selected by what you actually use.",
  },
  {
    icon: KeyRound,
    title: "Secret scanning",
    desc: "Pattern-based detection with redacted previews. Raw secrets never leave your terminal.",
  },
  {
    icon: RouteIcon,
    title: "Route checks",
    desc: "Reachability and status of declared routes when a base URL is provided. Skipped honestly otherwise.",
  },
  {
    icon: Activity,
    title: "Runtime checks",
    desc: "Opt-in probes against a running service. Local-first, no agents installed.",
  },
  {
    icon: Database,
    title: "Supabase exposure",
    desc: "Heuristics for anon keys, public RLS gaps, and client-exposed config.",
  },
  {
    icon: Cloud,
    title: "Cloudflare config",
    desc: "Inspects wrangler.toml, bindings, and deployment surface for obvious risk.",
  },
  {
    icon: FileText,
    title: "Evidence pack",
    desc: "A structured markdown report with file, line, and operational meaning for every finding.",
  },
];

export function WhatItChecks() {
  return (
    <section id="checks" className="border-b border-border/60">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="flex items-end justify-between gap-8 flex-wrap">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Probe catalogue
            </div>
            <h2 className="mt-3 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
              Stack-aware checks, evidence per finding.
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Each probe declares what it checks, what it proves, what it does <em>not</em> prove, and
            the next safe step.
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          {checks.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-surface p-6 transition-colors hover:bg-surface-elevated"
            >
              <Icon className="h-4 w-4 text-status-pass" strokeWidth={2} />
              <h3 className="mt-4 font-mono text-[13px] text-foreground">{title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
