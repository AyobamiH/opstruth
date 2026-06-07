# Configuration

opstruth can run with no config, but explicit inputs improve confidence.

The supported config file is:

```text
opstruth.config.json
```

## Starter Config

```json
{
  "projectName": "example",
  "routes": [
    {
      "path": "/",
      "expectedStatus": 200
    }
  ],
  "local": {
    "ports": [3000],
    "healthPaths": ["/health"]
  },
  "quality": {
    "skipScripts": [],
    "requiredScripts": []
  },
  "secrets": {
    "allowlistPaths": [],
    "allowlistPatterns": []
  },
  "supabase": {
    "enabled": true,
    "protectedTables": []
  },
  "cloudflare": {
    "enabled": true
  }
}
```

Generate a starter file:

```bash
opstruth init --yes
```

## Route Config

Routes can be provided through config:

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

CLI flags remain explicit. Passing `--base-url` tells opstruth which origin to probe.

```bash
opstruth routes --base-url https://example.com
```

## Local Runtime Config

Local checks can read ports and health paths:

```json
{
  "local": {
    "ports": [3000],
    "healthPaths": ["/health"]
  }
}
```

opstruth does not start, restart, kill, or repair services. It only checks the inputs you provide.

## Secret Allowlists

Use allowlists sparingly:

```json
{
  "secrets": {
    "allowlistPaths": ["fixtures/demo.js"],
    "allowlistPatterns": ["^docs/examples/"]
  }
}
```

Allowlisting suppresses configured false positives. It must not be used to hide real risky values.

## Invalid Config

Invalid JSON should produce a clear warning. opstruth should not silently trust a malformed config file.
