# Security Policy

Please do not report real secrets in public issues.

opstruth is designed to avoid printing raw secrets, but false negatives and false positives are possible. If you find a case where opstruth prints sensitive material, open a private report if the hosting platform supports it, or share a minimal redacted reproduction.

## Scope

Security-relevant reports include:

- raw secret exposure in output
- unsafe default probe behavior
- probes that mutate state unexpectedly
- command injection or path traversal issues
- misleading reports that mark unverified behavior as safe

## Safety Promise

opstruth should not deploy, mutate databases, trigger jobs, publish content, call OpenAI, restart services, kill processes, or print raw secrets.
