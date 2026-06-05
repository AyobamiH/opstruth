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
    detail: "bring repos, file false positives, request probes",
  },
];

export function GitHubWorkflow() {
  return (
    <section id="github" className="border-b border-border/60">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              GitHub-first workflow
            </div>
            <h2 className="mt-3 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
              The repo is part of the product.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              opstruth is meant to be inspected, run locally, attached to PRs, and extended through
              concrete probe requests. The website should send developers back to the evidence.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            {repoLinks.map(({ icon: Icon, label, href, detail }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group bg-surface p-5 transition-colors hover:bg-surface-elevated"
              >
                <div className="flex items-center justify-between gap-4">
                  <Icon className="h-4 w-4 text-status-pass" />
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <h3 className="mt-4 font-mono text-[13px] text-foreground">{label}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{detail}</p>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-lg border border-border-strong bg-[oklch(0.13_0.005_250)]">
          <div className="border-b border-border px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
            .github/workflows/opstruth.yml
          </div>
          <pre className="max-w-full overflow-x-auto px-5 py-5 font-mono text-[12.5px] leading-[1.7] text-foreground/90">
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
