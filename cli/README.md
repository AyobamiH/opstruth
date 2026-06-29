# opstruth

Read-only operational truth checks for AI-assisted engineering workflows.

`opstruth` inspects a local project, detects its stack, runs safe probes, collects evidence, explains proof gaps, and avoids pretending unverified systems are safe.

## Install

Current published package:

```bash
npm install -g opstruth
opstruth
```

The latest published npm package is `opstruth@0.2.0`.

One-off usage:

```bash
npx opstruth
```

## Commands

```bash
opstruth
opstruth welcome
opstruth init --yes
opstruth repo
opstruth quality
opstruth github-ci --workflow CI
opstruth probes
opstruth secrets
opstruth routes --base-url https://example.com
opstruth local --port 3000 --health /health
opstruth supabase
opstruth supabase-live --evidence-file <redacted.json>
opstruth supabase-live --telemetry-file /tmp/opstruth-supabase-telemetry.json
opstruth cloudflare
opstruth evidence
opstruth --json
opstruth --no-color
```

## Terminal Output

Human output uses a restrained colour theme for status, warnings, proof gaps, evidence, and next safe steps when the terminal supports ANSI colour.

Use `--no-color` or `NO_COLOR=1` to disable colour. Use `--color` to force colour for demos. JSON output remains machine-readable and does not include ANSI codes. Evidence markdown output remains ANSI-free.

## Safety Model

opstruth is read-only by default. CLI checks do not deploy, mutate databases, trigger queues or jobs, call OpenAI, restart services, publish content, or print raw secrets.

Skipped checks and not-verified areas are reported as proof gaps instead of being treated as safe.

## Configuration

`opstruth.config.json` can provide route paths, local ports/health paths, and secret allowlists. Generate a starter config:

```bash
opstruth init --yes
```

CLI flags remain the clearest way to provide runtime inputs.

## Repository

Source, docs, and release evidence live at:

```text
https://github.com/AyobamiH/opstruth
```

The public website is:

```text
https://opstruth.woeinvests.workers.dev
```
