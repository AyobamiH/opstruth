# Cloudflare Static Audit

opstruth's Cloudflare check inspects local configuration and optional route evidence. It does not deploy.

## What It Detects

- `wrangler.toml`
- `wrangler.json`
- `wrangler.jsonc`
- Worker name
- Worker entry point
- compatibility date
- routes
- variable names
- package scripts that run `wrangler deploy`
- GitHub workflows that mention Wrangler or Cloudflare

## Optional Route Probe

If you provide a URL, opstruth can run a read-only route probe:

```bash
opstruth cloudflare --url https://example.com
```

This checks observed HTTP availability. It does not inspect Cloudflare dashboard state.

## What It Proves

- local Cloudflare config exists
- certain deploy and workflow signals are present
- optional route evidence was observed at probe time

## What It Does Not Prove

- a deploy happened
- the dashboard matches local config
- DNS is configured correctly unless probed through a route
- secrets are present in Cloudflare
- production behavior under load

## Next Safe Step

Compare local config findings with read-only public route evidence before trusting production status.
