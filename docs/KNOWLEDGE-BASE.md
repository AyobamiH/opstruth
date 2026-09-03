# OpsTruth Product Knowledge Base

This is the canonical entry point for understanding OpsTruth as a product. It indexes authoritative sources and evidence; it must not become a parallel mutable status store.

## Product contract

OpsTruth is the independent, read-only verification layer for AI-assisted engineering. It gathers repository/runtime evidence within its granted read authority, evaluates what the evidence actually proves, and returns evidence-bound verification results without mutating the target system to manufacture success.

OpsTruth may say that something is verified, risky, partial, uncertain, unsupported or not verified. Missing evidence is a proof gap, not permission to infer success.

For DoneState integration, OpsTruth is the independent verifier. DoneState may request verification and consume the signed/versioned result, but DoneState cannot author its own successful verification decision.

## Non-goals and hard boundaries

OpsTruth is not:

- an implementation agent;
- an automatic repairer;
- a deployment system;
- a merge authority;
- authorised to mutate a target repository or production system merely to make verification pass;
- allowed to turn warnings, missing evidence or failed probes into success;
- allowed to broaden credentials or target scope silently.

Its GitHub Marketplace Action remains read-only with respect to target repositories and writes only the configured local evidence report.

## Canonical sources

| Question | Canonical source |
|---|---|
| Public product positioning and install surfaces | `README.md` |
| Agent operating rules and completion gate | `AGENTS.md` |
| Completion semantics | `docs/completion-gate.md` |
| Evidence-pack expectations | `docs/evidence-pack-standard.md` |
| GitHub Action behaviour | `docs/github-actions.md`, `docs/github-actions-proof.md`, `docs/github-marketplace-action.md` |
| Hosted/Cloudflare deployment | `docs/cloudflare-deployment.md`, `docs/deployment.md` |
| ChatGPT/plugin submission state | `docs/chatgpt-plugin-submission.md` and live provider evidence |
| Configuration | `docs/configuration.md` |
| Historical exact evidence | `evidence/` |
| Executable behaviour | `cli/`, hosted service source, schemas/contracts and tests |

When documentation conflicts with executable contracts or fresh evidence, do not choose the more convenient claim. Treat the contradiction as a defect and preserve the narrower proven statement until reconciled.

## Independent-verification contract

A verification claim must be bound to the exact subject it evaluates. Repository identity, commit/head identity, required checks and verifier response fields must retain their contract types and values. A subject mismatch fails closed.

The DoneState production canary on 3 September 2026 exposed and repaired a verifier adapter defect where GitHub's numeric repository ID was serialised with the wrong runtime type. The correct product behaviour is to preserve the verification contract, repair the evidence adapter, and never weaken DoneState's sealed-subject comparison to accept malformed verifier output.

## Anti-drift rules

1. This KB indexes canonical sources; it does not duplicate mutable deployment, review or release state.
2. Evidence claims must identify the exact subject and distinguish local repository evidence from production/runtime evidence.
3. `Verified` requires evidence sufficient for the named claim. Warnings and unobserved surfaces remain proof gaps.
4. Behavioural or contract changes require tests and corresponding documentation/evidence updates.
5. README, website, Marketplace, npm and ChatGPT/plugin copy must not claim capabilities beyond the executable product contract.
6. Production mutation remains separately authorised; documentation work does not grant deployment authority.
7. DoneState integration must preserve independent-verifier separation and exact-subject binding.

## Development order

Future capability work enters through:

`product contract -> bounded change -> executable tests -> evidence -> documentation/KB impact -> completion gate -> separately authorised publication/deployment`

If a proposed feature requires OpsTruth to mutate the target in order to prove the target, it violates the product boundary and must be redesigned.
