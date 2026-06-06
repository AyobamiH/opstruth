# opstruth

Read-only operational truth checks for AI-assisted engineering workflows.

`opstruth` inspects a local project, detects its stack, runs safe probes, collects evidence, explains proof gaps, and avoids pretending unverified systems are safe.

## Install

After npm publication:

```bash
npm install -g opstruth
opstruth
```

One-off usage:

```bash
npx opstruth
```

## Commands

```bash
opstruth
opstruth welcome
opstruth probes
opstruth secrets
opstruth routes --base-url https://example.com
opstruth local --port 3000 --health /health
```

## Safety Model

opstruth is read-only by default. CLI checks do not deploy, mutate databases, trigger queues or jobs, call OpenAI, restart services, publish content, or print raw secrets.

Skipped checks and not-verified areas are reported as proof gaps instead of being treated as safe.

## Repository

Source, docs, and release evidence live at:

```text
https://github.com/AyobamiH/opstruth
```

The public website is:

```text
https://opstruth.woeinvests.workers.dev
```
