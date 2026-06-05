---
name: github-auth-check
description: Verify GitHub CLI authentication and connected remotes before any push, release, or GitHub publishing operation. Use before GitHub operations, especially when a previous push failed due to missing credentials.
---

# GitHub Auth Check

## Purpose

Verify GitHub authentication before any push, release, or publishing work.

## When To Use

Use before GitHub operations, including `git push`, tag pushes, `gh release`, repository inspection through `gh`, or any workflow that depends on GitHub credentials.

## Commands To Run

Run these first:

```bash
git status --short
gh auth status
gh api user --jq .login
git remote -v
```

## Safety Boundaries

- Never print tokens.
- Never ask the user to paste a token into chat.
- Never commit secrets.
- Never fake authentication, push, release, or deploy success.
- Do not continue to push or release steps if auth checks fail.

## Required Checks

- Confirm working tree state with `git status --short`.
- Confirm `gh auth status` succeeds.
- Confirm `gh api user --jq .login` prints a login.
- Confirm `git remote -v` points to the intended GitHub repository.

## Failure Handling

If `gh auth status` or `gh api user --jq .login` fails, stop and report the exact blocker. Tell the user:

```bash
gh auth login
```

If `git remote -v` is missing or points to the wrong repository, stop and report the exact remote shown.

## Final Report Format

```text
Status: Done | Blocked
GitHub auth: authenticated as <login> | failed
Remote: <remote output summary>
Working tree: clean | dirty
Next step: <safe next command or blocker>
```
