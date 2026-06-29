# CI Usage

## Published Package Usage

The latest published npm package is `opstruth@0.2.0`.

```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: 20
- run: npm install -g opstruth@0.2.0
- run: mkdir -p evidence
- run: opstruth --out evidence/opstruth.md
- run: opstruth --json --skip evidence > evidence/opstruth.json
```

## Local Checkout Usage

When validating this repository itself, run from the checkout:

```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: 20
- run: npm install
  working-directory: cli
- run: node bin/opstruth.js --strict --out ../evidence/opstruth.md
  working-directory: cli
```

## npx Usage

```yaml
- run: npx opstruth@0.2.0 --out evidence/opstruth.md
```

## Upload Evidence

```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: opstruth-evidence
    path: evidence/
```

## Strict Mode

`--strict` returns a non-zero exit code for warnings. This is useful when CI should block on unresolved proof gaps, but it can be noisy for early adoption. Start without strict mode if you are exploring.

## Safety

Recommended CI usage does not deploy, publish, mutate databases, call OpenAI, or require production secrets.
