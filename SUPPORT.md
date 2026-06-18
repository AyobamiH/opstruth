# Support

opstruth is early v0.1 public tooling. The fastest useful support path is a clear, redacted
evidence report plus the narrow question you need answered.

## Public Support

Use GitHub issues for:

- bugs or confusing output
- false positives or false negatives
- new read-only probe requests
- evidence pack interpretation questions that can be discussed publicly
- documentation gaps

Before opening an issue:

- redact secrets, tokens, service-role keys, private URLs, customer data, and account identifiers
- include the command you ran
- include your project type, such as Vite, Next.js, Supabase, Cloudflare, Node, or other
- include only the smallest safe evidence excerpt needed to explain the problem

## Security Reports

If the report involves raw secret exposure, unsafe default behavior, command injection, path
traversal, or another security-sensitive issue, follow `SECURITY.md` instead of opening a public
issue with sensitive details.

## Focused Diagnostic Reviews

For AI-built websites, apps, automations, or deployment setups with risk you cannot interpret
safely, start with a redacted Evidence Pack and a narrow public issue when possible. A focused
diagnostic review can cover repo structure, deployment path, secret exposure risk, runtime
verification gaps, and next safe steps before production changes.

opstruth does not replace a security audit and does not guarantee that an app is safe.
