# Release Notes

Release evidence in this directory records package-publication workflow rules and the current npm
package truth. Historical release evidence remains in `evidence/`.

## Current Package

- npm package: `opstruth@0.2.0`
- GitHub tag: `v0.2.0`
- GitHub release: `https://github.com/AyobamiH/opstruth/releases/tag/v0.2.0`

## Release Workflow Rule

Before changing package version for an npm release, check npm CLI authentication.

If npm auth is missing:

- run `npm login --auth-type=web` first
- confirm `npm whoami` succeeds
- only then bump version and prepare release commits

If a release is already prepared and auth is missing:

- do not redo release prep
- resume from `npm login` and `npm publish`
