import path from 'node:path';
import { runRepo } from './commands/repo.js';
import { runSecrets } from './commands/secrets.js';
import { runQuality } from './commands/quality.js';
import { runSupabase } from './commands/supabase.js';
import { runCloudflare } from './commands/cloudflare.js';
import { runRoutes } from './commands/routes.js';
import { runLocal } from './commands/local.js';
import { runEvidence } from './commands/evidence.js';
import { createResult, finalizeStatus, worstStatus } from './lib/result.js';
import { detectStack, hasSupabase, hasCloudflare } from './lib/detect.js';
import { findDefaultRoutesConfig } from './lib/config.js';
import { pathExists } from './lib/fs.js';
import { resolveProjectBoundary } from './lib/boundary.js';
import { selectProbes } from './lib/probes.js';

function skippedResult(command, reason, notVerified) {
  return createResult(command, 'skipped', { skipped: [reason], notVerified: [notVerified || command + ' was not verified'] });
}

function nextStepFor(aggregate) {
  if (aggregate.failures.length) return 'Fix the failing check first, then rerun opstruth.';
  if (aggregate.warnings.length) return 'Review warnings, then rerun opstruth or the specific command after addressing them.';
  if (aggregate.skipped.length) return 'Add read-only inputs such as --base-url or --port when route or runtime proof matters.';
  return 'Attach the evidence pack to the change or handoff.';
}

function probeJson(probe) {
  return {
    id: probe.id,
    name: probe.name,
    area: probe.area,
    stack: probe.stack,
    mode: probe.mode,
    safetyLevel: probe.safetyLevel,
    defaultMode: probe.defaultMode,
    mutability: probe.mutability,
    inputsRequired: probe.inputsRequired,
    evidenceCollected: probe.evidenceCollected,
    evidenceExpectation: probe.evidenceExpectation,
    proves: probe.proves,
    doesNotProve: probe.doesNotProve,
    proofLimitation: probe.proofLimitation,
    skipReason: probe.skipReason,
    nextSafeStep: probe.nextSafeStep,
    supportedStacks: probe.supportedStacks,
    notVerified: probe.notVerified
  };
}

export async function runOrchestrator(options = {}) {
  const startCwd = options.cwd || process.cwd();
  const boundary = await resolveProjectBoundary(startCwd);
  const cwd = boundary.root;
  const stack = await detectStack(cwd);
  const probeSelection = await selectProbes({ root: cwd, stack, boundary, options });
  options = { ...options, cwd };
  const skip = new Set(options.skip || []);
  const childResults = [];
  async function maybe(name, fn) {
    if (skip.has(name)) { childResults.push(skippedResult(name, 'Skipped by user request: --skip ' + name, name + ' was intentionally not checked')); return; }
    childResults.push(await fn());
  }
  await maybe('repo', () => runRepo(options));
  await maybe('secrets', () => runSecrets(options));
  await maybe('quality', () => runQuality(options));
  if (await hasSupabase(cwd)) await maybe('supabase', () => runSupabase(options));
  else childResults.push(skippedResult('supabase', 'Supabase checks skipped because no supabase directory was detected.', 'Supabase database exposure was not checked'));
  if (await hasCloudflare(cwd)) await maybe('cloudflare', () => runCloudflare(options));
  else childResults.push(skippedResult('cloudflare', 'Cloudflare checks skipped because no Wrangler config was detected.', 'Cloudflare deployment configuration was not checked'));
  const routeConfig = await findDefaultRoutesConfig(cwd);
  if (options.baseUrl || options.routesFile || routeConfig) await maybe('routes', () => runRoutes(options));
  else childResults.push(skippedResult('routes', 'Route checks skipped because no base URL or routes config was provided.', 'Production/public route availability was not checked'));
  const hasLocalConfig = await pathExists(path.join(cwd, 'opstruth.local.json'));
  if (options.port?.length || options.healthProvided || options.process || options.service || hasLocalConfig) await maybe('local', () => runLocal(options));
  else childResults.push(skippedResult('local', 'Local runtime checks skipped because no port, health path, process, or service was provided.', 'Local runtime liveness was not checked'));
  const aggregate = createResult('opstruth', worstStatus(childResults.map((item) => item.status)), {
    summary: 'One-command read-only proof run completed.',
    verified: [
      'Project boundary: ' + cwd,
      'Probe catalogue entries: ' + probeSelection.catalogueSize,
      'Automatic safe probes selected: ' + probeSelection.selected.length,
      ...childResults.flatMap((item) => item.verified || []),
      'Safety boundary observed: no deploys, database mutations, OpenAI calls, publishing, queue triggers, restarts, or kills were run by opstruth'
    ],
    warnings: childResults.flatMap((item) => item.warnings || []),
    failures: childResults.flatMap((item) => item.failures || []),
    findings: childResults.flatMap((item) => item.findings || []),
    skipped: [
      ...(boundary.message ? [boundary.message] : []),
      ...probeSelection.skipped.slice(0, 20).map((probe) => `${probe.id}: ${probe.reason}`),
      ...childResults.flatMap((item) => item.skipped || [])
    ],
    notVerified: ['No production deploy was executed', 'No database mutation was executed', 'No OpenAI usage was monitored', 'No publishing or job side effects were verified'].concat(childResults.flatMap((item) => item.notVerified || [])),
    checks: childResults.flatMap((item) => item.checks || []),
    data: {
      boundary,
      stack,
      probes: {
        catalogueSize: probeSelection.catalogueSize,
        selected: probeSelection.selected.map(probeJson),
        skipped: probeSelection.skipped.map((probe) => ({ ...probeJson(probe), reason: probe.reason }))
      },
      childResults
    },
    nextSafeStep: 'Review the summary and fill only the proof gaps that matter for this change.'
  });
  finalizeStatus(aggregate, { strict: options.strict });
  if (aggregate.status === 'pass' && (aggregate.skipped.length || aggregate.notVerified.length)) aggregate.status = options.strict ? 'fail' : 'warn';
  aggregate.nextSafeStep = nextStepFor(aggregate);
  if (!skip.has('evidence')) {
    const evidence = await runEvidence({ ...options, out: options.out || 'evidence/opstruth-report.md', aggregate });
    aggregate.data.evidence = evidence.data;
    aggregate.verified.push('Evidence file written: ' + evidence.data.out);
  }
  finalizeStatus(aggregate, { strict: options.strict });
  if (aggregate.status === 'pass' && (aggregate.skipped.length || aggregate.notVerified.length)) aggregate.status = options.strict ? 'fail' : 'warn';
  return aggregate;
}
