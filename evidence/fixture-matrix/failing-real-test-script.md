# Fixture Matrix: failing-real-test-script

Source fixture: `fixtures/failing-real-test-script`

Temporary copy: `/tmp/opstruth-fixture-matrix/failing-real-test-script`

No source fixture files were mutated.

## Commands

| Command | Status |
| --- | --- |
| `opstruth repo` | `pass` |
| `opstruth probes` | `pass` |
| `opstruth secrets` | `pass` |
| `opstruth quality` | `fail` |
| `opstruth --skip evidence` | `fail` |
| `opstruth --json --skip evidence` | `fail` |

## Notes

- Expected quality failure fixture. A failing test script should fail.
