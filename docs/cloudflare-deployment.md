# Cloudflare Deployment

opstruth treats Lovable as a frontend editing surface, not the production deployment source of truth. Production website deployment should use Cloudflare from the canonical monorepo.

## Production URL

The current production website is served by Cloudflare Workers:

```text
https://opstruth.woeinvests.workers.dev
```

Lovable is not the production deployment source. GitHub Actions deploys from the canonical monorepo using GitHub repository secrets; Cloudflare credentials must never be committed to the repository.

## Build Output

The website lives in `website/` and builds to:

```text
website/dist/client
```

Wrangler deploys the TanStack Start SSR worker from `website/dist/server/server.js` and serves `website/dist/client` as static assets using `wrangler.jsonc`.

## Local Preview

```bash
npm run preview:cloudflare
```

This runs the website build and starts `wrangler dev` against the SSR worker plus static assets config.

## Deploy

```bash
npm run deploy:cloudflare
```

Required environment variables or GitHub Actions secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

Do not commit Cloudflare tokens, account credentials, `.dev.vars`, or `.env` files.

## GitHub Actions

`.github/workflows/deploy-cloudflare.yml` deploys the website on `main` changes that affect the website or Cloudflare deployment config. It reads Cloudflare credentials only from GitHub secrets.

## Production Asset

The website hero video is served from:

```text
/demo/opstruth-runtime-truth.mp4
```

The canonical source file is:

```text
website/public/demo/opstruth-runtime-truth.mp4
```
