# Probe Catalogue

The probe catalogue is the core extension point for opstruth.

Each probe declares:

- `id`
- `name`
- `area`
- `stack`
- `description`
- `detector`
- `safetyLevel`
- `defaultMode`
- `command` or `staticCheck`
- `evidenceCollected`
- `proves`
- `doesNotProve`
- `nextSafeStep`

Safety levels:

- `safe_readonly`: can run automatically.
- `approval_required`: requires explicit human approval.
- `dangerous_disabled`: not available in normal runs.

Default modes:

- `automatic`: selected by `opstruth` when relevant and safe.
- `optional`: reported or run only when appropriate.
- `manual_only`: never part of the default run.

Inspect the catalogue:

```bash
opstruth probes
opstruth probes --json
```

The v0.1 catalogue covers git, Node/TypeScript, quality scripts, route probes, local runtime probes, secret scans, Supabase, Cloudflare/Wrangler, Docker, GitHub Actions, Vercel, and Netlify.
