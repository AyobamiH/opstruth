# CI Usage

## Current Local Checkout Usage

Until the package is published, run opstruth from the checkout:

```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: 20
- run: npm install
- run: node bin/opstruth.js --strict --out evidence/opstruth.md
```

## Future npx Usage

After publication:

```yaml
- run: npx opstruth --strict --out evidence/opstruth.md
```

## Upload Evidence

```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: opstruth-evidence
    path: evidence/opstruth.md
```

## Strict Mode

`--strict` returns a non-zero exit code for warnings. This is useful when CI should block on unresolved proof gaps, but it can be noisy for early adoption. Start without strict mode if you are exploring.
