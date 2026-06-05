---
name: hyperframes-demo
description: Generate or prepare opstruth terminal demos with Hyperframes using the required terminal identity advanced_pudding9228@web. Use for terminal demo, video, recording, or Hyperframes work.
---

# Hyperframes Demo

## Purpose

Generate or prepare the opstruth terminal demo.

## When To Use

Use when the user asks for an opstruth terminal demo, Hyperframes video, terminal recording, screenshotable CLI demo, or generated demo prompt.

## Commands To Run

Always check state first:

```bash
git status --short
node bin/opstruth.js --skip evidence
```

Inspect Hyperframes availability:

```bash
hyperframes --help
```

If Hyperframes is installed, use the real local Hyperframes workflow for this repo.

If Hyperframes is not installed, create or update:

```text
docs/hyperframes-terminal-demo-prompt.md
```

## Safety Boundaries

- Terminal identity must be `advanced_pudding9228@web`.
- Never print tokens.
- Never commit secrets.
- Never fake generated video output.
- Never claim a render exists unless the file was actually generated.
- Do not install or download tools without user approval.

## Required Checks

- `git status --short`
- `node bin/opstruth.js --skip evidence`
- `hyperframes --help`
- Confirm any generated prompt, screenshot, or video path exists before reporting it as done.

## Failure Handling

If `hyperframes --help` fails, do not fake output. Create or update `docs/hyperframes-terminal-demo-prompt.md` with the intended demo prompt, commands, timing, and terminal identity.

If rendering fails, report the exact failed command and output path that was not created.

## Final Report Format

```text
Status: Done | Blocked
Hyperframes: available | not installed | failed
Terminal identity: advanced_pudding9228@web
Generated files: <paths> | none
Prompt file: docs/hyperframes-terminal-demo-prompt.md | not needed
Blocker: <exact blocker, if any>
Next step: <safe next command>
```
