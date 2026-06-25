# Secret Reference Classification

## Why Grouping Matters

Secret scans are only useful when they separate risk from context. A variable name in documentation is not the same as a committed token value, and a local `.env` file should not be read just to prove that opstruth noticed it.

opstruth groups secret and authorization references so the human reviewer can start with actionable source findings while still seeing proof gaps and skipped surfaces.

## Actionable Findings

Actionable findings are warning-level records from source or tracked files. They include secret-like assignments, token-like values, JWT-like values, and tracked `.env` content.

These are the first items to review before publishing, deploying, or sharing evidence.

## Documentation References

Documentation references are variable names or auth concepts mentioned without a value assignment. They are recorded as informational context so docs can explain required secrets without looking like leaked credentials.

## Real Values In Documentation

Documentation can still contain real risk. If a docs line assigns a value to a secret-like name, opstruth treats it as actionable rather than harmless context.

## Placeholders And Examples

Known placeholders such as redacted values, example-only values, and `YOUR_*_HERE` examples are grouped separately. They are informational unless they contain a real-looking value.

## Local-Only Files

Untracked `.env` files are classified as local-only and skipped without reading their contents. Tracked `.env` files are warning-level findings because committing them changes the risk.

## Generated And Dependency Paths

Generated paths, dependencies, and lockfiles are separated from source findings. Lockfiles can be recorded at the path level, while generated and dependency directories are normally excluded by the project boundary scan.

## Binary Files

Binary-like extensions are ignored by default and classified as skipped when evaluated directly.

## Unknown Findings

Long token-like strings without a known variable name are grouped as `unknown_requires_review`. opstruth does not decide they are safe. It asks for review and redacts the preview.

## Redaction Rules

Human output, JSON output, and evidence previews use redaction before display. opstruth redacts known assignment values, bearer-style values, JWT-like strings, and long token-like strings.

## Human Output

The `opstruth secrets` check now reports a grouped summary:

```text
Actionable findings: N; Documentation references: N; Placeholders/examples: N; Local-only files: N; Generated artifacts: N; Dependency/lockfile paths: N; Ignored binaries: N; Unknown requiring review: N
```

## JSON Output

JSON output includes:

- `data.secretSummary`
- `data.classifiedFindings`
- `data.findings`

`classifiedFindings` contains all grouped records. `findings` contains warning/failure records that should drive the next safe step.

## Evidence Output

Findings include category, severity, kind, context, and redacted preview fields so evidence packs can distinguish proof from context without exposing values.

## Limitations

This is a local static scan. It does not prove that secret stores are configured remotely, that deployed functions use the intended values, or that production callers are correctly authorized.
