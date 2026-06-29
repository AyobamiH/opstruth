# npm Publish Smoke

Date: 2026-06-29

## Version

- package: `opstruth`
- published version: `0.2.0`
- previous latest version: `0.1.3`
- package root: `cli/`
- release source tag: `v0.2.0`

## npm Publish

`opstruth@0.2.0` was published to npm with public access after npm CLI auth was restored through
browser login and publish authorization.

The first publish attempt reached npm but stopped at the one-time-auth boundary. The successful
publish used npm's browser authorization flow. No npm token, one-time code, `.npmrc`, or environment
value was printed or committed.

Known npm warning:

- npm warned that package metadata was auto-corrected around the `bin` entry.
- Registry verification confirmed the published `bin` metadata still maps `opstruth` to
  `bin/opstruth.js`.

## Registry Smoke

Registry checks verified:

- `npm view opstruth version` returned `0.2.0`
- `npm view opstruth@0.2.0 version` returned `0.2.0`
- `npm view opstruth@0.2.0 dist.tarball` returned the `0.2.0` tarball URL
- `npm view opstruth@0.2.0 bin --json` returned the expected `opstruth` binary mapping

## Tarball Smoke

Before publish:

- `npm pack --dry-run` passed
- `npm pack` passed
- tarball contents were inspected
- clean temp-project tarball install passed

The tarball included CLI files only and did not include local evidence, launch screenshots, logs,
temporary files, generated website build output, or `node_modules`.

## Commands Verified

The prepublish and smoke checks verified:

- `npm run lint`
- `npm test`
- `npm run build --if-present`
- `node bin/opstruth.js --help`
- `node bin/opstruth.js supabase-live --help`
- `node bin/opstruth.js supabase-live --json`
- `npx opstruth --help`
- `npx opstruth supabase-live --help`
- `npx opstruth supabase-live --json`

## JSON Output Verified

Both the local source smoke and clean install smokes parsed `supabase-live --json` output as JSON
without printing raw JSON into this evidence file.

## Git Tag

- local tag: `v0.2.0`
- remote tag: `v0.2.0`

## GitHub Release

- release: `https://github.com/AyobamiH/opstruth/releases/tag/v0.2.0`

## Known Limitations

- `supabase-live` does not contact production by default.
- Secret values are never inspected.
- Telemetry files must be supplied separately.
- Function telemetry is only verified when safe filtered evidence is provided.
- This release is not a full security audit.
- CI, local checks, and registry smoke do not prove production runtime behavior.

## Redactions

- npm tokens were not printed.
- `.npmrc` was not printed.
- one-time auth material was not repeated in evidence.
- temporary JSON smoke outputs stayed under `/tmp`.

## What Was Not Verified

- production Supabase function telemetry
- production scheduler execution
- production website deployment for this npm release
- long-term package reliability beyond install and command smoke checks
