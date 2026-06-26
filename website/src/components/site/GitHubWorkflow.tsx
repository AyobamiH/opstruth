import { ArrowUpRight, BookOpen, GitPullRequest, PackageCheck, TerminalSquare } from "lucide-react";

const repoLinks = [
  {
    icon: BookOpen,
    label: "Safety model",
    href: "https://github.com/ayobamih/opstruth/blob/main/docs/safety-model.md",
    detail: "read-only boundaries, ignored folders, reporting philosophy",
  },
  {
    icon: PackageCheck,
    label: "Probe catalogue",
    href: "https://github.com/ayobamih/opstruth/blob/main/docs/probe-catalogue.md",
    detail: "what each probe collects, proves, and does not prove",
  },
  {
    icon: TerminalSquare,
    label: "Fixture evidence",
    href: "https://github.com/ayobamih/opstruth/tree/main/evidence/fixture-runs",
    detail: "Vite, Next, Node, Supabase/Cloudflare, and risky secret examples",
  },
  {
    icon: GitPullRequest,
    label: "Community testing",
    href: "https://github.com/ayobamih/opstruth/blob/main/docs/community-testing.md",
    detail: "run real repos, report false positives, request missing probes",
  },
];

export function GitHubWorkflow() {
  return (
    <section id="github" className="border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="grid min-w-0 gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] md:gap-14">
          <div className="min-w-0">
            <div className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              GitHub-first workflow
            </div>
            <h2 className="mt-3 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
              The checks are open and reviewable.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              OpsTruth is meant to be inspected, run locally, attached to PRs, and extended through
              concrete probe requests. The site sends developers back to the evidence, not a black
              box.
            </p>
          </div>

          <div className="grid min-w-0 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            {repoLinks.map(({ icon: Icon, label, href, detail }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group min-h-36 min-w-0 bg-surface p-5 transition-colors hover:bg-surface-elevated focus-visible:bg-surface-elevated"
              >
                <div className="flex items-center justify-between gap-4">
                  <Icon className="h-4 w-4 text-status-pass" />
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <h3 className="mt-4 font-mono text-sm text-foreground">{label}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10 min-w-0 overflow-hidden rounded-lg border border-border-strong bg-[oklch(0.13_0.005_250)]">
          <div className="border-b border-border px-4 py-2.5 font-mono text-xs text-muted-foreground">
            GitHub Actions evidence job
          </div>
          <pre className="max-w-full overflow-x-auto px-4 py-5 font-mono text-[12px] leading-[1.75] text-foreground/90 sm:px-5 sm:text-[12.5px]">
            <code>{`- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: 20
- run: npm install
- run: node bin/opstruth.js --strict --out evidence/opstruth.md
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: opstruth-evidence
    path: evidence/opstruth.md`}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
