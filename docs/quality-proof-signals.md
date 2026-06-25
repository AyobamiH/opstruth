# Quality Proof Signals

## Purpose

Quality checks are separate proof signals. A repo can have lint, typecheck, tests, build, and CI configured differently, and opstruth should show which signal was actually verified instead of compressing them into one generic quality result.

## Lint

The lint signal maps to a real `lint` script in `package.json`. If it is missing, opstruth records `not_configured` instead of treating lint as passed.

## Typecheck

The typecheck signal maps to a real `typecheck` script. It proves only that the configured command exited successfully.

## Tests

The tests signal maps to a real `test` script. The default npm placeholder test script is skipped and reported as not configured proof, not as a failure or pass.

## Build

The build signal maps to a real `build` script. It proves the local build command completed. It does not prove deployment or production route health.

## CI

The CI signal maps to a real `ci` script. When CI is safe and configured, opstruth may run it as the aggregate proof path and report the individual scripts it covers.

## Execution Strategy

opstruth uses one of two strategies:

- `ci`: run the configured safe `ci` script once, then mark covered configured signals as passed via CI.
- `individual`: run safe configured scripts individually when CI is absent, unsafe, or a specific script list was requested.

This avoids automatically duplicating expensive checks by running both individual scripts and the aggregate CI script.

## Missing Scripts

Missing scripts are reported as `not_configured`. Missing proof is not a pass.

## Failures And Timeouts

Configured scripts that exit non-zero are `failed`. Configured scripts that exceed the configured timeout are `timed_out`.

## Mutation-Safe Script Review

Quality scripts that appear to deploy, publish, run Supabase mutations, push databases, or mutate cron are not executed automatically. They are marked as skipped and requiring review.

## Human Output

The human `opstruth quality` output includes a quality signal summary and check rows for each signal.

## JSON Output

JSON output includes:

```json
{
  "quality": {
    "executionStrategy": "ci",
    "signals": {
      "lint": { "configured": true, "status": "passed", "proofRoute": "ci" },
      "typecheck": { "configured": true, "status": "passed", "proofRoute": "ci" },
      "tests": { "configured": true, "status": "passed", "proofRoute": "ci" },
      "build": { "configured": true, "status": "passed", "proofRoute": "ci" },
      "ci": { "configured": true, "status": "passed", "proofRoute": "direct" }
    }
  }
}
```

## Evidence Output

Evidence packs receive the same checks and JSON fields as terminal output. Human, JSON, and evidence output should agree on which proof path ran.

## Limitations

Quality proof is local or CI command proof. It does not prove production deployment, live database permissions, scheduler state, remote secret configuration, route headers, or deployed function behavior.
