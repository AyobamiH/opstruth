# Current Runtime Truth Videos Live

## Verification Summary

- Commit: `85b694da18e47cd2b9b5f4b5f59ee9b4b4762285`
- Short SHA: `85b694d`
- Commit title: `Regenerate website videos from current runtime truth`
- Production URL: `https://opstruth.woeinvests.workers.dev`
- Hero video URL: `https://opstruth.woeinvests.workers.dev/demo/opstruth-hero-runtime-truth.mp4`
- Flagship video URL: `https://opstruth.woeinvests.workers.dev/demo/opstruth-current-runtime-truth.mp4`
- Verified at: `2026-06-06`

## GitHub Actions Deploy Run

- Workflow: `Deploy Website To Cloudflare`
- Run ID: `27063057625`
- Job: `deploy`
- Job ID: `79879070376`
- Event: `push`
- Branch: `main`
- Status: `completed`
- Conclusion: `success`
- Deploy step: `Deploy website to Cloudflare`
- Deploy step conclusion: `success`
- Run URL: `https://github.com/AyobamiH/opstruth/actions/runs/27063057625`

The run was triggered by commit `85b694da18e47cd2b9b5f4b5f59ee9b4b4762285`.

## HTTP Verification Results

Homepage:

```text
URL: https://opstruth.woeinvests.workers.dev
Status: HTTP/2 200
Content-Type: text/html; charset=utf-8
Server: cloudflare
```

Hero video:

```text
URL: https://opstruth.woeinvests.workers.dev/demo/opstruth-hero-runtime-truth.mp4
Status: HTTP/2 200
Content-Type: video/mp4
Server: cloudflare
Cache: HIT
```

Flagship video:

```text
URL: https://opstruth.woeinvests.workers.dev/demo/opstruth-current-runtime-truth.mp4
Status: HTTP/2 200
Content-Type: video/mp4
Server: cloudflare
Cache: HIT
```

## HTML Verification

The production homepage HTML references both regenerated video paths:

```text
/demo/opstruth-hero-runtime-truth.mp4
/demo/opstruth-current-runtime-truth.mp4
```

## Local Build Verification

Source assets:

```text
website/public/demo/opstruth-hero-runtime-truth.mp4      247K
website/public/demo/opstruth-current-runtime-truth.mp4   640K
```

Build command:

```bash
cd website
npm run build
```

Result:

```text
Build passed.
```

Built assets:

```text
website/dist/client/demo/opstruth-hero-runtime-truth.mp4      247K
website/dist/client/demo/opstruth-current-runtime-truth.mp4   640K
```

## Operational Boundaries

- Lovable was not used.
- No npm package was published.
- No release was created.
- No manual deployment was performed.
- No secrets or tokens were printed in this evidence file.
