# Codex Skills Direction

Each command is intended to become a reusable proof primitive for future Codex skills and MCP tools. The CLI remains the local-first reference implementation.

Codex-facing workflows should treat `opstruth` as an operational truth runner after AI-assisted changes, not as a deployment agent or AI assistant. The useful loop is:

1. Establish repo truth with `opstruth repo`.
2. Make the requested code change.
3. Run `opstruth` or the narrowest relevant subcommand.
4. Attach the evidence pack and call out proof gaps.

Skills should preserve the probe catalogue shape: detector, safety level, default mode, evidence collected, proves, does not prove, and next safe step.
