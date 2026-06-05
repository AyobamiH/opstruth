---
name: github-publish
description: Commit and push local opstruth repository work to the connected GitHub remote. Use when the user asks to publish, push, commit and push, or update GitHub.
---

# GitHub Publish

## Purpose

Commit and push local repo work to the connected GitHub remote.

## When To Use

Use when the user asks to publish changes, push changes, commit and push, update the remote repository, or finish work by sending it to GitHub.

## Commands To Run

Always check state first:

```bash
git status --short
git log --oneline -5
```

Run preflight:

```bash
npm run lint
npm test
node bin/opstruth.js --skip evidence
node bin/opstruth.js secrets
git remote -v
```

Then publish:

```bash
git add .
git commit -m "<meaningful message>"
git push origin main
```

## Safety Boundaries

- Never print tokens.
- Never commit secrets.
- Never fake a push.
- Always run opstruth before risky repo operations.
- If there are no changes, do not create an empty commit.
- If auth fails, stop and separate `Blocked` from `Done`.

## Required Checks

- `git status --short`
- `git log --oneline -5`
- `npm run lint`
- `npm test`
- `node bin/opstruth.js --skip evidence`
- `node bin/opstruth.js secrets`
- `git remote -v`
- Confirm no generated or secret files are accidentally staged.

## Failure Handling

If checks fail, stop before commit and report the failed command and relevant summary.

If `git push origin main` fails due to auth, stop and report:

```bash
gh auth login
git push origin main
```

If there are no changes, report `Done: no changes to publish`.

## Final Report Format

```text
Status: Done | Blocked
Checks: <passed/failed summary>
Commit: <hash and message> | none
Push: pushed to origin/main | blocked
Remote: <remote summary>
Blocker: <exact blocker, if any>
Next step: <exact command, if blocked>
```
