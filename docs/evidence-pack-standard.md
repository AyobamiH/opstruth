# Evidence Pack Standard

An opstruth evidence pack should help a reviewer answer one question:

```text
What can we prove?
```

## Required Sections

Evidence markdown should include:

```text
Status
Operator Summary
Scope
Commands Run
Probe Results
Verified Facts
Warnings
Failures
Skipped / Not Configured
Not Verified
Risks And Gaps
What opstruth Did Not Do
Safety Boundaries
Evidence Files / Paths
Next Safe Step
Confidence
```

## Evidence Principles

- Keep output concise.
- Do not include ANSI codes.
- Do not print raw secrets.
- Redact risky values in previews.
- Separate warnings from failures.
- Separate skipped checks from not-verified claims.
- Clearly distinguish static proof from runtime proof.
- Avoid massive logs by default.

## Status Language

- `Pass`: the checks that ran passed.
- `Partial pass`: some checks passed, but warnings or proof gaps remain.
- `Fail`: one or more checks failed.
- `Skipped`: the check was not configured or not applicable.
- `Not verified`: opstruth did not collect evidence for that area.

## Proof Gaps

Evidence packs should make proof gaps visible. A route check skipped because no base URL exists should not read like production is safe. A static Supabase check should not read like live database permissions were verified.

## Next Safe Step

Every evidence pack should end with an action the operator can take without opstruth mutating production:

- add `--base-url` for route evidence
- add `--port` and `--health` for local runtime evidence
- fix failing quality scripts
- review redacted secret findings
- attach the evidence file to a PR or issue
