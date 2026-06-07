# Probe Quality Model

opstruth probes are evidence contracts. Each probe should make clear what it checks, what it proves, what it cannot prove, and which input would improve confidence.

## Required Probe Metadata

Each probe should expose:

```text
Probe ID:
Area:
Mode:
Safety level:
Mutability:
Inputs required:
What it checks:
Why it matters:
Evidence collected:
Pass condition:
Warning condition:
Fail condition:
Skipped condition:
False positive risk:
False negative risk:
Next safe step:
Supported stacks:
Not verified:
```

## Minimum Runtime Fields

The catalogue implementation should provide, at minimum:

- stable ID
- area
- mode
- safety level
- description
- evidence expectation
- skip reason
- next safe step
- proof limitation

## Safety Levels

- `safe_readonly`: can run automatically without mutating the project or external systems.
- `approval_required`: should only run with explicit human approval.
- `dangerous_disabled`: not available in normal runs.

## Modes

- `automatic`: selected by the default one-command run when relevant and safe.
- `optional`: visible in the catalogue but only used when the repo or explicit inputs make it relevant.
- `manual_only`: never selected automatically.

## Mutability

Current v0.1 probes should use `mutability: none`.

That means a probe must not:

- deploy
- publish
- call OpenAI
- mutate a database
- trigger a job or queue
- restart a service
- kill a process
- print raw secrets

## Skipped Is A Proof Gap

Skipped probes are not failures. They are proof gaps.

For example:

- route probes skip when no `--base-url` or route config exists
- local runtime probes skip when no port/process/service input exists
- Supabase probes skip when no Supabase structure is detected
- Cloudflare probes skip when no Wrangler config is detected

The CLI should tell the operator why the probe skipped and the next safe step to improve confidence.

## JSON Requirements

`opstruth probes --json` should be ANSI-free and include:

- full catalogue
- selected/eligible probes
- skipped probes
- skip reasons
- required inputs
- proof limitations
- next safe steps

Machine output must stay parseable even when human output uses terminal colour.
