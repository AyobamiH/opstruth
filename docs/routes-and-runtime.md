# Routes And Runtime Checks

Route and local runtime checks are explicit-input probes. They are skipped when opstruth does not have enough information to run them safely.

## Public Routes

Run:

```bash
opstruth routes --base-url https://example.com
```

When routes are configured, opstruth records:

- URL
- method
- status
- redirect target
- latency
- required header presence

Route checks are read-only HTTP probes. They do not deploy, warm caches intentionally, publish content, or mutate data.

## Config Routes

`opstruth.config.json` can provide route paths and expected statuses:

```json
{
  "routes": [
    {
      "path": "/",
      "expectedStatus": 200
    }
  ]
}
```

Without `--base-url`, public route availability remains not verified.

## Local Runtime

Run:

```bash
opstruth local --port 3000 --health /health
```

opstruth checks:

- whether the port appears to be listening
- whether the health URL responds
- optional process name matches
- optional user systemd service status

It never kills, restarts, or starts a service.

## Proof Limits

- A route check proves only the observed response at probe time.
- A local check proves only local runtime visibility from the current environment.
- Process ownership can be incomplete on restricted systems.
- Passing route probes do not replace monitoring, load testing, or a security audit.
