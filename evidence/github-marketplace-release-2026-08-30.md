# OpsTruth GitHub Marketplace release evidence — 2026-08-30

## Outcome

OpsTruth evidence is publicly available in GitHub Marketplace as a read-only GitHub Action:

- Marketplace: https://github.com/marketplace/actions/opstruth-evidence
- Immutable release: https://github.com/AyobamiH/opstruth/releases/tag/v1.0.0
- Stable major reference: https://github.com/AyobamiH/opstruth/releases/tag/v1
- Source commit: `45f4debbd3fbe8217599ab697b8f6c855b372e0b`
- Categories: Code quality and AI Assisted

GitHub accepted `action.yml` and the README as complete for Marketplace publication. The `v1.0.0` release is marked Latest. Both `v1.0.0` and `v1` resolve to the same verified source commit.

## Install

```yaml
- name: Verify repository evidence
  uses: AyobamiH/opstruth@v1
  with:
    output_path: evidence/opstruth.md
```

Consumers with an exact-immutability policy should pin the full commit SHA instead of the moving major reference.

## Preserved authority boundary

Marketplace publication does not widen OpsTruth authority. The Action reads the checked-out repository and may write only its configured local evidence report. It cannot push, merge, deploy, publish target artifacts, administer repositories, manage secrets, or mutate target systems.
