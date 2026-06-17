# Cloudflare Deployment

opstruth treats Lovable as a frontend editing surface, not the production deployment source of truth. Production website deployment should use Cloudflare from the canonical monorepo.

## Production URL

The current production website is served by Cloudflare Workers:

```text
https://opstruth.woeinvests.workers.dev
```

Lovable is not the production deployment source. GitHub Actions deploys from the canonical monorepo using GitHub repository secrets; Cloudflare credentials must never be committed to the repository.

The CLI is published to npm independently as `opstruth@0.1.3`:

```bash
npm install -g opstruth
opstruth
```

One-off usage is available with:

```bash
npx opstruth
```

GitHub release:

```text
https://github.com/AyobamiH/opstruth/releases/tag/v0.1.3
```

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

Secrets for Cloudflare and release operations belong in GitHub, Cloudflare, or npm-controlled secret storage. They must not be committed to the repository.

## Production Assets

The current website hero loop is served from:

```text
/demo/opstruth-hero-runtime-truth.mp4
```

The canonical source file is:

```text
website/public/demo/opstruth-hero-runtime-truth.mp4
```

The controlled current-truth product film is served from:

```text
/demo/opstruth-current-runtime-truth.mp4
```

The canonical source file is:

```text
website/public/demo/opstruth-current-runtime-truth.mp4
```
