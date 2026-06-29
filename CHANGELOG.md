# Changelog

opstruth uses GitHub releases for package release artifacts and this file for a compact human
history of public changes.

## v0.2.0 (prepared, not yet published)

- Prepared as the next minor release after local validation, exact-commit CI, tarball inspection,
  and tarball smoke testing. npm publish is pending npm authentication.
- Adds `opstruth github-ci` and `--github-ci` exact-commit GitHub Actions proof so hosted
  quality evidence can be attached without treating CI as production truth.
- Adds `opstruth supabase-live` for explicit local evidence files describing already collected
  Supabase production facts.
- Adds `--telemetry-file` parsing for count-only, redacted Supabase telemetry summaries.
- Fails closed on secret-like values, authorization headers, JWT-like strings, project references,
  raw logs, raw scheduler payloads, and other sensitive production material in Supabase proof
  inputs.
- Keeps default `opstruth` runs offline and read-only; Supabase live proof does not make provider
  calls, inspect secret values, mutate production, or infer autonomous scheduler execution without
  evidence.
- Separates lint, typecheck, tests, build, local runtime, route probes, GitHub CI, and production
  evidence as distinct proof surfaces.
- Improves local route/runtime config orchestration, secret-reference grouping, website copy and
  responsive layout, and real-repo evidence documentation.

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
