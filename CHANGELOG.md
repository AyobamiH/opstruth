# Changelog

opstruth uses GitHub releases for package release artifacts and this file for a compact human
history of public changes.

## v0.1.3

- Published `opstruth@0.1.3` as the current v0.1 public testing package.
- Expanded product maturity evidence and real-repo validation notes.
- Refreshed the production website and docs around current package, release, and Cloudflare URL
  truth.
- Added `website/public/sitemap.xml` and verified it was emitted by the website build.
- Added a soft diagnostic review path for teams that need help interpreting evidence packs.

## v0.1.2

- Published the CLI identity release as `opstruth@0.1.2`.
- Documented npm package metadata, GitHub tag/release evidence, and installability.

## v0.1.1

- Published the early npm release evidence for public CLI testing.

## Notes

- v0.1 releases are early public tooling, not a claim of mature production coverage.
- opstruth is read-only by default and does not deploy, mutate databases, trigger jobs, call OpenAI,
  restart services, or print raw secrets.
- Route and runtime proof require explicit safe inputs such as `--base-url`, `--port`, or
  configured health checks.
