# Supabase Live Proof

## Purpose

`opstruth supabase-live` validates a local, redacted evidence file that describes Supabase production facts already collected by a human/operator process.

It exists so production proof can be represented without making OpsTruth silently call production, inspect secrets, mutate databases, or infer untested state.

## Explicit Opt-In

The command is explicit only:

```bash
opstruth supabase-live --evidence-file cli/examples/supabase-live-redacted-evidence.json
```

The default one-command `opstruth` run does not execute Supabase live checks or make Supabase network requests.

## Evidence File

The evidence file must be JSON with schema:

```text
opstruth.supabase-live.v1
```

The file should contain redacted fields such as:

- `schemaVersion`
- `collectedAt`
- `repositoryCommit`
- `functionName`
- `schedulerJob`
- `evidenceSource`
- `manualOrAutonomous`
- `signals`
- `databaseScope`
- `redactionsApplied`
- `notVerified`

Real production evidence files should remain local-only unless explicitly reviewed for publication.

## Signal Definitions

Supported signals:

- `function_deployed`
- `secret_name_configured`
- `missing_credential_denial`
- `incorrect_credential_denial`
- `authorised_noop`
- `scheduler_configured`
- `scheduler_autonomous_execution`
- `telemetry_count_only`
- `non_admin_authorization`
- `admin_authorization`
- `rate_limit`
- `database_effects`

Supported states:

- `verified`
- `failed`
- `not_verified`
- `not_configured`
- `not_observed`
- `unsafe_to_test`
- `authentication_unavailable`
- `metadata_unavailable`
- `external_evidence`

## Function Deployment

`function_deployed` records deployment metadata only. It does not prove that the function executed successfully or that future invocations will keep working.

## Authorization Paths

Denial-path signals prove only the tested denial cases. Admin and non-admin signals should remain `authentication_unavailable`, `unsafe_to_test`, or `not_verified` when no safe existing identity is available.

## Scheduler Configuration

`scheduler_configured` records the configured job shape. It does not prove pg_cron has actually executed.

## Autonomous Execution

`scheduler_autonomous_execution` should be `verified` only when autonomous run history was observed. A manual scheduled-path invocation is not autonomous scheduler evidence.

## Telemetry

`telemetry_count_only` should be `verified` only when filtered production telemetry was inspected and confirmed to contain count-only, non-sensitive fields. Raw logs must not be copied into the evidence file.

## Rate Limit

Rate-limit evidence must not be manufactured by unsafe loops or production row mutation. Use `unsafe_to_test` when the only way to hit the branch would create or update production rows.

## Database Effects

Database-effect evidence should use scoped, count-only facts. Row contents, request payloads, credentials, and unrelated tables should not be included.

## Redaction

The command rejects evidence containing likely credentials, bearer tokens, JWT-like values, service-role values, project-reference fields, raw headers, raw payloads, raw commands, raw logs, and Supabase project URLs.

## Human Output

Human output summarises verified signals, failures, skipped signals, and proof gaps using the same OpsTruth result model as other commands.

## JSON Output

JSON output is produced with:

```bash
opstruth supabase-live --evidence-file <redacted.json> --json
```

The JSON result includes the normal command status plus structured signal data. It is still redacted before printing.

## What This Proves

This command proves that a supplied local evidence file:

- uses the supported schema
- avoids known sensitive material
- separates verified, failed, skipped, and not-verified Supabase signals
- preserves manual versus autonomous scheduler classification

## What This Does Not Prove

This command does not:

- call Supabase
- inspect remote secrets
- deploy functions
- apply migrations
- execute SQL
- mutate pg_cron
- create or update rows
- prove production reliability from one request
- prove scheduler execution from scheduler configuration alone
- prove telemetry safety without filtered telemetry evidence
