# Local Preview Header Guidance Evidence

## Date

2026-06-19

## Problem

OpsTruth correctly warned when route responses lacked expected browser security headers, but local Vite preview output used the same wording as a remote URL. That could make local evidence sound like a production conclusion.

## Change

- Loopback hosts `localhost`, `127.0.0.1`, and `::1` are classified as local preview scope.
- Missing headers remain warnings.
- Local findings explain that preview and hosting layers may differ.
- Production security headers are added to `Not Verified` for local checks.
- Non-local URLs retain the stronger runtime-protection warning.
- Route JSON includes `scope: local_preview` or `scope: remote`.

## Tests

The CLI suite covers:

- each supported loopback hostname with missing headers
- a remote HTTPS URL with missing headers
- a local URL with no missing headers
- parseable, ANSI-free JSON guidance
- no production inference from local preview evidence

The standard completion gate passed with 40 CLI tests.

## Wagging Validation

A bounded Wagging preview ran on `127.0.0.1:4173`.

- `/`, `/services`, and `/faq` responded.
- Route status remained `warn` because expected headers were absent.
- JSON reported `scope: local_preview`.
- Production headers were explicitly `Not Verified`.
- Local guidance was present for every missing-header finding.
- The preview process was stopped after validation.

## What Was Not Verified

- Deployed Wagging headers
- Production route availability
- Hosting-platform header behavior
- Supabase production state

## Safety Boundaries

No deploy, production request, database mutation, secret operation, npm publication, or release occurred.
