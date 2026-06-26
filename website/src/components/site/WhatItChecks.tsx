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
    desc: "Working tree, branch, recent changes, diff check, and conflict marker scan inside the resolved boundary.",
    proof: "Proves what git can see; does not prove deployment state.",
  },
  {
    icon: Layers,
    title: "Stack detection",
    desc: "TypeScript, React, Vite, Next.js, Docker, GitHub Actions, Vercel, Netlify, Supabase, and Cloudflare signals.",
    proof: "Selects safe probes from the catalogue; does not invent missing checks.",
  },
  {
    icon: KeyRound,
    title: "Secret scanning",
    desc: "Pattern-based detection with redacted previews. Raw secrets never leave your terminal.",
    proof: "Shows file, line, pattern, why it matters, and next safe step.",
  },
  {
    icon: RouteIcon,
    title: "Route checks",
    desc: "Reachability and status of declared routes when a base URL is provided. Skipped honestly otherwise.",
    proof: "Uses read-only HEAD/GET; does not authenticate or cover every flow.",
  },
  {
    icon: Activity,
    title: "Runtime checks",
    desc: "Opt-in probes against a running service. Local-first, no agents installed.",
    proof: "Checks explicit ports and health inputs; never starts or restarts services.",
  },
  {
    icon: Database,
    title: "Supabase exposure",
    desc: "Heuristics for anon keys, public RLS gaps, and client-exposed config.",
    proof: "Static and config-aware unless stronger inputs are attached.",
  },
  {
    icon: Cloud,
    title: "Cloudflare config",
    desc: "Inspects wrangler.toml, bindings, and deployment surface for obvious risk.",
    proof: "Reads local config; does not deploy or mutate Cloudflare state.",
  },
  {
    icon: FileText,
    title: "Evidence pack",
    desc: "A structured markdown report with file, line, and operational meaning for every finding.",
    proof: "Designed for PRs, CI artifacts, and AI-to-human handoffs.",
  },
];

export function WhatItChecks() {
  return (
    <section id="checks" className="border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="flex min-w-0 flex-wrap items-end justify-between gap-8">
          <div className="min-w-0">
            <div className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              Probe catalogue
            </div>
            <h2 className="mt-3 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
              Stack-aware checks, evidence per finding.
            </h2>
          </div>
          <p className="max-w-md text-base leading-7 text-muted-foreground">
            Each probe declares what it checks, what it proves, what it does <em>not</em> prove, and
            the next safe step.
          </p>
        </div>

        <div className="mt-10 grid min-w-0 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {checks.map(({ icon: Icon, title, desc, proof }) => (
            <div
              key={title}
              className="min-w-0 bg-surface p-5 transition-colors hover:bg-surface-elevated sm:p-6"
            >
              <Icon className="h-4 w-4 text-status-pass" strokeWidth={2} />
              <h3 className="mt-4 font-mono text-sm text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
              <p className="mt-4 border-t border-border pt-3 font-mono text-xs leading-6 text-muted-foreground">
                {proof}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
