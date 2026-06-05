---
name: opstruth-site-deploy
description: Prepare the opstruth frontend/site for deployment and recommend GitHub Pages or Cloudflare Pages without deploying unless explicitly asked.
---

# opstruth Site Deploy

## Purpose

Prepare the frontend/site for deployment and report the safest deployment target and next command.

## When To Use

Use before site deployment, when the user asks to deploy the frontend, prepare Cloudflare Pages, prepare GitHub Pages, inspect deployment readiness, or choose a deployment target.

## Commands To Run

Always check state first:

```bash
git status --short
cd cli
node bin/opstruth.js --skip evidence
cd ..
```

Inspect:

```text
package.json
website/
website/dist/
docs/webpage.md
GitHub Pages config
Cloudflare Pages config
```

Run:

```bash
npm --prefix website run build
```

## Safety Boundaries

- Never print tokens.
- Never commit secrets.
- Never fake a deploy.
- Do not deploy unless explicitly asked.
- Do not mutate DNS, production settings, or Pages settings without explicit approval.

## Required Checks

- Confirm repo state.
- Confirm opstruth run completed before deploy preparation.
- Inspect build scripts and output directory.
- Inspect GitHub Pages and Cloudflare Pages signals/config.
- Run `npm --prefix website run build`.

## Failure Handling

If build fails, stop and report the exact failed command and relevant error.

If deployment config is missing, report `Blocked` for deploy automation and recommend the minimal config needed.

If the user asks to deploy but auth is missing, report the exact auth blocker. Do not pretend deployment happened.

## Final Report Format

```text
Status: Done | Blocked
Build: passed | failed
Build output directory: <path>
Recommended target: GitHub Pages | Cloudflare Pages | unknown
Why: <short reason>
Exact next deploy command: <command or blocked reason>
Deploy performed: no, unless explicitly requested
Blocker: <exact blocker, if any>
```
