# OpsTruth owned-domain cutover evidence

Observed: 2026-08-30

## Public website

- canonical URL: `https://opstruth.io`
- implementation PR: [#13](https://github.com/AyobamiH/opstruth/pull/13)
- merge commit: [`43c9029b06b0746e895d9e8136b1e6830f207a57`](https://github.com/AyobamiH/opstruth/commit/43c9029b06b0746e895d9e8136b1e6830f207a57)
- pull-request CI: [33299963216](https://github.com/AyobamiH/opstruth/actions/runs/33299963216) — success
- post-merge CI: [33300001349](https://github.com/AyobamiH/opstruth/actions/runs/33300001349) — success
- deployment: [33300001348](https://github.com/AyobamiH/opstruth/actions/runs/33300001348) — success
- deployment job: `99226224422`
- Cloudflare version: `111ebf9e-fd06-48fd-b162-3f976877f39e`

The deployment log records `opstruth.io` as a custom domain. A live browser observation after deployment loaded the public website with the title “OpsTruth — Operational proof for AI-assisted engineering”.

## Independent MCP service

- canonical MCP URL: `https://mcp.opstruth.io/mcp`
- source repository: [`AyobamiH/opstruth-chatgpt-plugin`](https://github.com/AyobamiH/opstruth-chatgpt-plugin)
- implementation PR: [opstruth-chatgpt-plugin#7](https://github.com/AyobamiH/opstruth-chatgpt-plugin/pull/7)
- merge commit: `915ab91110bddf520551b318723baac49213e33a`
- deployment: [33300000143](https://github.com/AyobamiH/opstruth-chatgpt-plugin/actions/runs/33300000143) — success
- Cloudflare version: `4a5ef5ed-fad8-48a4-9d2b-5eaeb4ad4bfe`

The MCP deployment smoke test reported version `0.4.0`, exact source commit, 21 read-only tools, and a signed Evidence Graph. Its separate source and deploy chain preserves the executor/verifier trust boundary.

## Preflight closure

Before migration, `https://opstruth.io` was truthfully observed at HTTP 502. The post-deploy checks above close that reachability gap. Existing Fast Refresh and redacted fixture warnings were non-new warnings and did not prevent all 80 CLI tests, plugin validation, client build, or SSR build from passing.

This evidence records publication and live reachability. It does not grant OpsTruth mutation authority and does not rerun a DoneState maintenance canary.
