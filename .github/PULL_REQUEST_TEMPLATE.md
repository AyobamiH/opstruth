## Summary

## Safety

- [ ] No deploys
- [ ] No database mutations
- [ ] No queue/job triggers
- [ ] No service restarts or kills
- [ ] No OpenAI calls
- [ ] No raw secrets printed

## Evidence

```bash
cd cli
npm run lint
npm test
node bin/opstruth.js
```

## Probe Changes

If this changes probes, describe evidence collected, what it proves, what it does not prove, and the next safe step.
