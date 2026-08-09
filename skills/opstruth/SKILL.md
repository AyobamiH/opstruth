---
name: opstruth
description: Run evidence-first operational checks for repositories, CI, routes, local services, Cloudflare, and Supabase while preserving proof gaps and avoiding deployment or production mutation.
version: 1.0.0
metadata: {"openclaw":{"requires":{"bins":["opstruth"]},"install":[{"kind":"node","package":"opstruth@0.2.0","bins":["opstruth"],"label":"Install OpsTruth CLI (npm)"}],"homepage":"https://github.com/AyobamiH/opstruth"}}
---

# OpsTruth

Use this skill when the user wants evidence about repository state, release readiness, CI, routes, local runtime, Cloudflare configuration, Supabase posture, secret exposure risk, or what is and is not actually verified.

OpsTruth is an evidence tool, not an execution engine. Prefer a truthful `not verified` or `skipped` result over an inferred green status.

## Safety contract

- Do not deploy, publish, restart services, mutate databases, trigger jobs, change infrastructure, or alter production state.
- Do not print raw secrets or `.env` contents.
- Do not invent a base URL, port, workflow name, protected table, evidence file, or provider result. Ask for missing inputs when they materially affect the check.
- Treat `init` as a write operation. Run it only when the user explicitly asks to create `opstruth.config.json`.
- Treat `evidence --out` as a write operation. Write an evidence file only when the user explicitly asks to save one.
- `quality` may execute existing project quality scripts selected by OpsTruth. Use it only when validation is requested and repository policy permits those scripts.
- Never turn warnings, skipped probes, missing inputs, or unavailable production evidence into a claim of verification.

## Default workflow

1. Work from the intended repository root. If the target is ambiguous, resolve it before running checks.
2. Start with the lowest-risk repository fact check:

```bash
opstruth repo --json
```

3. Add only the checks needed for the user's question:

```bash
opstruth secrets --json
opstruth supabase --json
opstruth cloudflare --json
opstruth probes --json
```

4. Use explicit runtime or external inputs only when they are known:

```bash
opstruth routes --base-url https://example.com --json
opstruth local --port 3000 --health /health --json
opstruth github-ci --workflow CI --json
opstruth supabase-live --evidence-file redacted.json --json
```

5. For a broader audit, run the orchestrated check only when the user wants the full safe probe set:

```bash
opstruth --json
```

Use `--strict` when the user wants warnings and skipped proof to fail confidence, such as a release gate.

## Evidence handling

When reporting results, separate:

- verified facts;
- warnings or risks;
- skipped or not-applicable checks;
- missing inputs;
- facts that remain unverified;
- the next safe action.

Do not claim that a command was successful merely because it ran. Preserve OpsTruth's result status and confidence semantics.

If the user explicitly wants a durable evidence pack, use:

```bash
opstruth evidence --title "<title>" --out <path>
```

Otherwise keep results in stdout and do not create files.

## Command reference

Use `opstruth --help` or `opstruth <command> --help` when exact options are needed. Current command families include `repo`, `quality`, `routes`, `secrets`, `supabase`, `supabase-live`, `cloudflare`, `local`, `github-ci`, `evidence`, `probes`, `welcome`, and `init`.
