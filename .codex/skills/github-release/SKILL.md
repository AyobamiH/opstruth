---
name: github-release
description: Create safe v0.x GitHub releases for opstruth using tags and gh release. Use when the user asks for a GitHub release, version tag, or v0.x release.
---

# GitHub Release

## Purpose

Create v0.x GitHub releases safely.

## When To Use

Use when the user asks to create a release, tag a version, publish release notes, or prepare a v0.x GitHub release.

## Commands To Run

Always check state first:

```bash
git status --short
node bin/opstruth.js --skip evidence
git tag --list
gh auth status
gh repo view
```

Then release, replacing values intentionally:

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
gh release create vX.Y.Z --title "<title>" --notes "<notes>"
```

## Safety Boundaries

- Never print tokens.
- Never commit secrets.
- Never fake a release.
- Never overwrite existing tags.
- Do not release from a dirty or unverified state unless the user explicitly approves the exact risk.
- Always separate `Done` from `Blocked`.

## Required Checks

- Working tree state is understood.
- `node bin/opstruth.js --skip evidence` completed.
- Requested tag is not present in `git tag --list`.
- `gh auth status` succeeds.
- `gh repo view` points to the intended repository.

## Failure Handling

If the tag already exists, stop and report it. Do not delete or overwrite it.

If GitHub auth fails, stop and tell the user:

```bash
gh auth login
```

If tag push or release creation fails, report the exact failed command and leave the local state clear.

## Final Report Format

```text
Status: Done | Blocked
Version: vX.Y.Z
Tag: created and pushed | blocked | already exists
Release: created | blocked
Repository: <repo>
Blocker: <exact blocker, if any>
Next step: <exact command, if blocked>
```
