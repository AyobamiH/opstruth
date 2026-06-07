# Deployment

The production opstruth website is deployed from the canonical monorepo to Cloudflare Workers.

```text
https://opstruth.woeinvests.workers.dev
```

The public CLI is published separately on npm as `opstruth@0.1.2`:

```bash
npm install -g opstruth
opstruth
```

One-off usage:

```bash
npx opstruth
```

## Source Of Truth

- Website source lives in `website/`.
- Lovable is an editing surface for the frontend, not the production deployment source.
- Production deployment runs from GitHub Actions in `.github/workflows/deploy-cloudflare.yml`.
- Cloudflare credentials are stored only as GitHub repository secrets.
- npm publishing credentials are not stored in code.

Required GitHub secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

Do not commit Cloudflare tokens, `.env`, `.dev.vars`, or other credential files.

## Local Build

```bash
npm run build:website
```

The website build writes the Cloudflare asset bundle to:

```text
website/dist/client
```

Wrangler serves the static assets from `website/dist/client` and runs the TanStack Start SSR worker from:

```text
website/dist/server/server.js
```

## Cloudflare Commands

Preview locally:

```bash
npm run preview:cloudflare
```

Deploy manually when explicitly authorized:

```bash
npm run deploy:cloudflare
```

Most production deploys should happen through GitHub Actions after changes land on `main`.

## Release Links

- GitHub release: `https://github.com/AyobamiH/opstruth/releases/tag/v0.1.2`
- npm package: `opstruth@0.1.2`
