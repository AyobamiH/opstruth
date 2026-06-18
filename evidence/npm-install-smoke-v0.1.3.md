# npm Install Smoke: opstruth v0.1.3

Date: 2026-06-17T23:05:26Z

## Scope

Verify the published `opstruth@0.1.3` npm package from a clean temporary project without
publishing, deploying, tagging, creating a release, or reading secrets.

Temporary project:

```text
/tmp/tmp.Z3zdx70Ffg
```

Environment:

```text
node v24.13.1
npm 11.8.0
```

## Commands Run

```bash
npm init -y
npm install opstruth@0.1.3
npx opstruth --help
npx opstruth welcome
npx opstruth probes
npx opstruth --version
npm view opstruth version description bin homepage repository license
```

## Results

```text
npm install opstruth@0.1.3
exit: 0
result: added 1 package, audited 2 packages, found 0 vulnerabilities
```

```text
npx opstruth --help
exit: 0
result: printed the opstruth help screen and command list
```

```text
npx opstruth welcome
exit: 0
result: printed the welcome guide and read-only safety boundary
```

```text
npx opstruth probes
exit: 0
result: inspected the probe catalogue and reported 30 safe read-only probes
```

```text
npx opstruth --version
exit: 0
result: ran the default one-command report instead of printing a standalone version
note: `--version` is not listed in the current global help output
```

Package metadata:

```text
version = '0.1.3'
description = 'Read-only operational truth checks for AI-assisted engineering workflows.'
bin = { opstruth: 'bin/opstruth.js' }
homepage = 'https://opstruth.woeinvests.workers.dev'
repository = {
  type: 'git',
  url: 'git+https://github.com/AyobamiH/opstruth.git',
  directory: 'cli'
}
license = 'MIT'
```

## What This Proves

- `opstruth@0.1.3` is installable from npm in a clean temporary project.
- The published package exposes the `opstruth` binary through npm/npx.
- Help, welcome, and probe catalogue commands run without install-time setup.
- The published package metadata points to the current production homepage and repository.
- The smoke run did not publish npm, deploy, create a release, create a tag, or print secrets.

## What This Does Not Prove

- It does not prove every CLI command or probe path.
- It does not prove runtime route checks without explicit `--base-url` input.
- It does not prove local service checks without explicit port/health inputs.
- It does not prove production safety for an arbitrary project.
- It does not replace a security audit.
- It does not prove the package supports a standalone `--version` flag.

## Safety Boundary

No deployment, npm publish, release, tag, database mutation, queue/job trigger, OpenAI call, service
restart, or raw secret printing was performed during this smoke test.
