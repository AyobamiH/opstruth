# GitHub Release Checklist

Suggested repo description:

```text
Read-only operational truth checks for AI-assisted engineering workflows.
```

Suggested topics:

- ai-assisted-development
- codex
- devtools
- cli
- observability
- security
- cloudflare
- supabase
- typescript
- evidence

Before marking a release public:

- README reflects current CLI behavior.
- `cd cli && npm run lint` passes.
- `cd cli && npm test` passes.
- `cd cli && node bin/opstruth.js --help` works.
- `cd cli && node bin/opstruth.js welcome` works.
- `cd cli && node bin/opstruth.js probes` works.
- `cd cli && ./scripts/demo-fixtures.sh` regenerates fixture evidence.
- No real secrets are present in fixtures, docs, or evidence.
- GitHub issue/PR templates are present.
- CI workflows are present.
- License is present.
- Current limitations are documented.
