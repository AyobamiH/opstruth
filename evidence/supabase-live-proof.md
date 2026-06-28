# Supabase Live Proof Placeholder

This is a committed placeholder for the `opstruth supabase-live` evidence model.

It is not real production evidence.

Real production evidence should remain local-only unless explicitly reviewed for publication. It must not contain credentials, project references, authorization headers, raw logs, scheduler payloads, request bodies, database credentials, or row dumps.

Use the placeholder JSON example at:

```text
cli/examples/supabase-live-redacted-evidence.json
cli/test/fixtures/supabase-telemetry-count-only.json
```

Validate a redacted local evidence file with:

```bash
opstruth supabase-live --evidence-file <redacted.json>
opstruth supabase-live --evidence-file <redacted.json> --json
opstruth supabase-live --telemetry-file /tmp/opstruth-supabase-telemetry.json
opstruth supabase-live --evidence-file <redacted.json> --telemetry-file /tmp/opstruth-supabase-telemetry.json --json
```

OpsTruth does not make Supabase network requests for this command. It validates and renders supplied evidence only, and discards unknown telemetry fields before producing count-only output.
