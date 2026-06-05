# Community Testing

Early users can help by running opstruth on real projects and reporting where the tool is useful, noisy, or missing stack context.

Please try:

```bash
opstruth
opstruth --base-url <your staging URL>
opstruth secrets
opstruth probes
```

Share the evidence report only if it is safe. Redact sensitive paths, URLs, account names, and anything that could identify private infrastructure.

## Feedback Template

```markdown
## Project type
Vite / Next / Supabase / Cloudflare / Node / Other

## Command run

## What opstruth detected correctly

## What felt noisy or wrong

## Missing probe request

## Evidence excerpt
```

Useful reports include false positives, false negatives, confusing skipped checks, missing probes, and places where evidence did not support the finding clearly enough.
