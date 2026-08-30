# OpsTruth GitHub Marketplace action

OpsTruth can run as a composite GitHub Action from the repository root. The action executes the reviewed CLI source bundled in the same immutable Git tag; it does not install packages or fetch executable code at runtime.

```yaml
name: OpsTruth evidence

on:
  pull_request:

permissions:
  contents: read

jobs:
  evidence:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: AyobamiH/opstruth@v1
        with:
          output_path: evidence/opstruth.md
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: opstruth-evidence
          path: evidence/opstruth.md
```

## Inputs

- `output_path` writes the Markdown evidence report inside the checked-out workspace. The default is `evidence/opstruth.md`.
- `strict` accepts only `true` or `false`. When enabled, unresolved warnings produce a non-zero exit status.
- `base_url` optionally adds bounded read-only route observations for a public HTTPS deployment. Non-HTTPS and multiline values fail closed.

`output_path` must be a non-empty repository-relative path. Absolute paths, multiline values, and parent-directory traversal are rejected before the CLI runs.

## Output

`report_path` contains the configured evidence-report path for later workflow steps.

## Authority boundary

The action reads the checked-out repository and may write only the requested local evidence report. It does not push commits, approve or merge pull requests, deploy, publish, mutate databases, trigger queues, call AI providers, or print raw secrets. A successful run is repository evidence, not proof of a production deployment.

Marketplace publication uses an Action-interface `v1.0.0` release and a stable `v1` major tag. That Action version is independent of the bundled OpsTruth CLI package version. Consumers should pin the full commit SHA when their supply-chain policy requires exact immutability.

## Published release

- Marketplace listing: https://github.com/marketplace/actions/opstruth-evidence
- Immutable Action release: `v1.0.0`
- Stable major reference: `v1`
- Source commit: `45f4debbd3fbe8217599ab697b8f6c855b372e0b`
- Categories: Code quality and AI Assisted

Both published references resolve to the same verified source commit. The Marketplace publication does not change the read-only authority boundary above.
