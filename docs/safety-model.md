# Safety Model

opstruth is read-only by default. It gathers local facts, runs safe local quality scripts that already exist, performs static scans, sends only HEAD/GET route probes, and writes evidence files.

It does not deploy, mutate databases, write DNS, install dependencies, print raw secrets, call OpenAI, publish content, restart services, or kill processes.

## Boundaries

If opstruth starts inside a git repository, the git root is the project boundary. If no git repository is detected, only the current directory is scanned with default safety ignores. Stack detection and secret scans must stay inside that boundary.

Default ignored directories include caches, dependency folders, generated builds, editor/server folders, personal home folders such as Downloads/Documents/Pictures, `.agents`, and generated evidence output.

## Reporting

Skipped is not failed. Unverified is not safe. Warnings and failures should include evidence, why it matters, and a next safe step. opstruth should prefer an honest proof gap over a confident claim without evidence.
