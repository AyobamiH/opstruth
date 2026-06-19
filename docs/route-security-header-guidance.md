# Route Security Header Guidance

## Local Preview Scope

Route checks against `localhost`, `127.0.0.1`, or `::1` describe the local development or preview response only. A local Vite preview can prove that configured routes respond and can show which headers that preview server returns.

It cannot prove which headers a deployed hosting platform adds, removes, or rewrites.

## Why Warnings Remain

Missing expected security headers remain warnings because local parity can still be useful and the response evidence is real. OpsTruth does not turn a missing-header finding into a pass merely because the URL is local.

For a local URL, the finding explains that preview servers may differ from the deployed hosting layer and adds production security headers to `Not Verified`.

## Production Checks

An explicitly supplied non-local URL is treated as remote runtime evidence. Missing headers on that checked URL retain the stronger production-relevant warning because the observed response came from the supplied remote endpoint.

Production headers are verified only when the production URL itself is explicitly checked.

## Output Consistency

Human and JSON output use the same finding, scope, and proof limitation. JSON route data records the scope as `local_preview` or `remote` and remains ANSI-free.

## Safe Commands

```bash
opstruth routes --base-url http://127.0.0.1:4173
opstruth routes --base-url https://example.com
```

Both commands are read-only. Neither deploys, changes hosting configuration, or mutates application state.
