# Contributing

Thanks for helping make opstruth more trustworthy.

opstruth is a read-only operational truth checker. Contributions should improve evidence, clarity, stack detection, or safety without turning the project into a deployment framework, dashboard, or AI assistant.

## Local Checks

```bash
npm run lint
npm test
node bin/opstruth.js
./scripts/demo-fixtures.sh
```

## Probe Guidelines

Every probe should define:

- id
- name
- area
- stack/platform
- description
- safety level
- default mode
- evidence collected
- what it proves
- what it does not prove
- next safe step

Default probes must be read-only. Dangerous actions should be disabled or require explicit human approval.

## Reporting

Findings should include evidence and avoid raw secrets. Prefer honest `skipped` or `not verified` output over unsupported confidence.
