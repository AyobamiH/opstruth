# GitHub Actions Usage

opstruth can run in CI as a read-only evidence producer.

## Published Package Workflow

```yaml
name: opstruth Evidence

on:
  workflow_dispatch:
  pull_request:

jobs:
  opstruth:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install -g opstruth@0.1.2
      - run: mkdir -p evidence
      - run: opstruth --out evidence/opstruth.md
      - run: opstruth --json --skip evidence > evidence/opstruth.json
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: opstruth-evidence
          path: evidence/
```

## Route Config

CI can add route evidence when the target is safe to probe:

```yaml
- run: opstruth routes --base-url https://example.com --out evidence/routes.md
```

Do not add production secrets only to satisfy opstruth. The tool should remain useful without secret-bearing CI contexts.

## Strict Mode

`--strict` exits non-zero for warnings. This can be useful once the project has a stable config and known proof gaps are resolved.

For early adoption, start without strict mode and review the evidence artifact.

## Safety

The recommended workflow does not:

- deploy
- publish npm
- mutate databases
- call OpenAI
- print tokens
- require production credentials
