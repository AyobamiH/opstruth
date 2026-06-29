# npm Package Release

## Package

- package root: `cli/`
- package name: `opstruth`
- latest published version: `0.2.0`

## Auth Preflight

Before changing package version for an npm release, check npm CLI authentication.

If npm auth is missing:

- run `npm login --auth-type=web` first
- confirm `npm whoami` succeeds
- only then bump version and prepare release commits

If a release is already prepared and auth is missing:

- do not redo release prep
- resume from `npm login` and `npm publish`

Do not print npm tokens, `.npmrc`, environment values, one-time passwords, or registry auth
material.

## Package Contents

The `0.2.0` package contains the CLI binary, source, examples, fixtures, scripts, package metadata,
README, and license. It does not include local evidence, launch screenshots, logs, generated website
build output, `node_modules`, or temporary smoke-test files.
