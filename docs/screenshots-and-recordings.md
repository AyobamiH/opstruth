# Screenshots And Recordings

opstruth does not require a recording tool, but the demo scripts make terminal captures repeatable.

## Quick Demo

```bash
cd cli
./scripts/demo-run.sh
```

## Fixture Evidence Demo

```bash
cd cli
./scripts/demo-fixtures.sh
```

## asciinema

If you already use asciinema:

```bash
asciinema rec opstruth-demo.cast
cd cli
./scripts/demo-run.sh
exit
```

## Simple Terminal Capture

```bash
cd cli
./scripts/demo-run.sh | tee ../evidence/demo-output.txt
```

Before sharing screenshots or recordings, check that no private paths, URLs, or secret-like values are visible.
