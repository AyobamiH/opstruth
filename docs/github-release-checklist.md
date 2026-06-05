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
- `npm run lint` passes.
- `npm test` passes.
- `node bin/opstruth.js --help` works.
- `node bin/opstruth.js welcome` works.
- `node bin/opstruth.js probes` works.
- `./scripts/demo-fixtures.sh` regenerates fixture evidence.
- No real secrets are present in fixtures, docs, or evidence.
- GitHub issue/PR templates are present.
- CI workflows are present.
- License is present.
- Current limitations are documented.
