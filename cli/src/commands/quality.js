import { createResult, finalizeStatus } from '../lib/result.js';
import { runCommand, excerpt } from '../lib/exec.js';
import { detectPackageManager, detectPackageScripts } from '../lib/detect.js';
import { resolveProjectBoundary } from '../lib/boundary.js';

const DEFAULT_SCRIPTS = ['typecheck', 'lint', 'test', 'build', 'ci'];
const INDIVIDUAL_SCRIPTS = ['lint', 'typecheck', 'test', 'build'];
const MUTATION_LIKE_SCRIPT = /\b(supabase\s+(?:secrets\s+set|db\s+push|functions\s+deploy)|wrangler\s+deploy|npm\s+publish|pnpm\s+publish|yarn\s+npm\s+publish|bun\s+publish|pg_cron|psql\s|curl\s+.*production)\b/i;

export const QUALITY_SIGNALS = [
  { key: 'lint', script: 'lint', label: 'Lint' },
  { key: 'typecheck', script: 'typecheck', label: 'Typecheck' },
  { key: 'tests', script: 'test', label: 'Tests' },
  { key: 'build', script: 'build', label: 'Build' },
  { key: 'ci', script: 'ci', label: 'CI' }
];

export function isDefaultPlaceholderTestScript(script = '') {
  return /^echo\s+["']?Error:\s*no test specified["']?\s*(?:&&|;)\s*exit\s+1$/i.test(script.trim());
}

function isRunnableQualityScript(name, script) {
  return !(name === 'test' && isDefaultPlaceholderTestScript(script));
}

export function isMutationLikeQualityScript(script = '') {
  return MUTATION_LIKE_SCRIPT.test(script);
}

export function qualityRunnerFor(manager) {
  if (manager === 'pnpm') return ['pnpm', ['run']];
  if (manager === 'yarn') return ['yarn', []];
  if (manager === 'bun') return ['bun', ['run']];
  return ['npm', ['run']];
}

function signalKeyForScript(script) {
  return script === 'test' ? 'tests' : script;
}

function emptySignals(availableScripts) {
  return Object.fromEntries(QUALITY_SIGNALS.map(({ key, script, label }) => {
    const rawScript = availableScripts[script];
    const configured = Object.prototype.hasOwnProperty.call(availableScripts, script);
    const runnable = configured && isRunnableQualityScript(script, rawScript);
    const requiresReview = runnable && isMutationLikeQualityScript(rawScript);
    let status = 'not_configured';
    let reason = 'package script not found';
    if (configured && !runnable) {
      status = 'skipped';
      reason = 'default npm placeholder test script';
    } else if (requiresReview) {
      status = 'skipped';
      reason = 'script contains mutation-like command and requires human review';
    } else if (configured) {
      status = 'not_verified';
      reason = 'configured but not executed yet';
    }
    return [key, {
      key,
      label,
      script,
      configured,
      status,
      reason,
      command: rawScript || null,
      proofRoute: null,
      exitCode: null,
      durationMs: null,
      logExcerpt: ''
    }];
  }));
}

function ciCoversScript(ciScript = '', script) {
  const escaped = script.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (script === 'test' && /\bnpm\s+test\b|\bpnpm\s+test\b|\bbun\s+test\b|\byarn\s+test\b/.test(ciScript)) return true;
  return new RegExp(`\\b(?:npm|pnpm|bun)\\s+run\\s+${escaped}\\b|\\byarn\\s+${escaped}\\b`).test(ciScript);
}

function checkStatusForSignal(status) {
  if (status === 'passed') return 'pass';
  if (status === 'failed' || status === 'timed_out') return 'fail';
  if (status === 'skipped' || status === 'not_configured') return 'skipped';
  return 'not_verified';
}

function signalMessage(signal) {
  const bits = [signal.status];
  if (signal.proofRoute) bits.push('via ' + signal.proofRoute);
  if (signal.reason) bits.push(signal.reason);
  return bits.join('; ');
}

function statusFromRun(run) {
  if (run.exitCode === 0) return 'passed';
  if (run.exitCode === 124 || run.signal) return 'timed_out';
  return 'failed';
}

function failureText(script, signal) {
  if (signal.status === 'timed_out') return script + ' timed out';
  return script + ' failed';
}

async function executeScript({ script, signal, runner, baseArgs, cwd, timeoutMs, checks }) {
  const run = await runCommand(runner, [...baseArgs, script], { cwd, timeoutMs });
  const status = statusFromRun(run);
  signal.status = status;
  signal.reason = status === 'passed' ? 'configured script exited 0' : `configured script exited ${run.exitCode}`;
  signal.proofRoute = 'direct';
  signal.exitCode = run.exitCode;
  signal.durationMs = run.durationMs;
  signal.logExcerpt = excerpt((run.stdout || '') + '\n' + (run.stderr || ''));
  checks.push({
    name: 'package script ' + script,
    command: run.command,
    exitCode: run.exitCode,
    durationMs: run.durationMs,
    status: run.exitCode === 0 ? 'pass' : 'fail',
    logExcerpt: signal.logExcerpt
  });
  return run;
}

function addSignalChecks(checks, signals) {
  for (const signal of Object.values(signals)) {
    checks.push({
      name: 'quality signal ' + signal.key,
      command: signal.proofRoute === 'direct' ? signal.command : null,
      exitCode: signal.exitCode,
      durationMs: signal.durationMs,
      status: checkStatusForSignal(signal.status),
      message: signalMessage(signal),
      logExcerpt: signal.logExcerpt
    });
  }
}

function signalSummary(signals) {
  return QUALITY_SIGNALS.map(({ key, label }) => `${label}: ${signals[key].status}${signals[key].proofRoute ? ' via ' + signals[key].proofRoute : ''}`).join('; ');
}

export async function runQuality({ cwd = process.cwd(), continueOnFailure = false, strict = false, scripts: wantedScripts, timeoutMs = 180000 } = {}) {
  const boundary = await resolveProjectBoundary(cwd);
  cwd = boundary.root;
  const packageManager = await detectPackageManager(cwd);
  const availableScripts = await detectPackageScripts(cwd);
  const requested = wantedScripts?.length ? wantedScripts : DEFAULT_SCRIPTS;
  const explicitScripts = Boolean(wantedScripts?.length);
  const signals = emptySignals(availableScripts);
  const checks = [];
  const warnings = [];
  const failures = [];
  const skipped = [];
  const notVerified = [];
  const selected = [];
  const [runner, baseArgs] = qualityRunnerFor(packageManager);

  if (boundary.message) skipped.push(boundary.message);
  if (boundary.isGitRepo) {
    const diff = await runCommand('git', ['diff', '--check'], { cwd, timeoutMs: 60000 });
    checks.push({ name: 'git diff --check', command: diff.command, exitCode: diff.exitCode, durationMs: diff.durationMs, status: diff.exitCode === 0 ? 'pass' : 'fail', logExcerpt: excerpt(diff.stderr || diff.stdout) });
    if (diff.exitCode !== 0) failures.push('git diff --check failed');
  } else {
    skipped.push('git diff --check skipped because no git repository was detected');
  }

  const requestedRunnable = requested.filter((name) => Object.prototype.hasOwnProperty.call(availableScripts, name) && isRunnableQualityScript(name, availableScripts[name]));
  const requestedUnsafe = requestedRunnable.filter((name) => isMutationLikeQualityScript(availableScripts[name]));
  for (const name of requestedUnsafe) warnings.push(`package script ${name} requires review before execution`);

  let executionStrategy = 'individual';
  const ciScript = availableScripts.ci || '';
  const ciAvailable = requested.includes('ci') && Object.prototype.hasOwnProperty.call(availableScripts, 'ci') && isRunnableQualityScript('ci', ciScript);
  const ciSafe = ciAvailable && !isMutationLikeQualityScript(ciScript);
  if (!explicitScripts && ciSafe) executionStrategy = 'ci';
  if (!explicitScripts && ciAvailable && !ciSafe) executionStrategy = 'individual';

  if (executionStrategy === 'ci') {
    selected.push('ci');
    const run = await executeScript({ script: 'ci', signal: signals.ci, runner, baseArgs, cwd, timeoutMs, checks });
    for (const script of INDIVIDUAL_SCRIPTS) {
      const signal = signals[signalKeyForScript(script)];
      if (!signal.configured || signal.status === 'skipped') continue;
      if (ciCoversScript(ciScript, script)) {
        signal.status = run.exitCode === 0 ? 'passed' : 'not_verified';
        signal.reason = run.exitCode === 0 ? 'covered by configured ci script' : 'ci did not pass, so individual result is not verified';
        signal.proofRoute = 'ci';
        signal.exitCode = run.exitCode === 0 ? 0 : null;
        signal.durationMs = run.exitCode === 0 ? run.durationMs : null;
      } else {
        signal.status = 'not_verified';
        signal.reason = 'configured script was not run because ci strategy did not explicitly cover it';
      }
    }
    if (run.exitCode !== 0) failures.push(failureText('ci', signals.ci));
  } else {
    const scriptsToRun = requested.filter((name) => name !== 'ci' || explicitScripts).filter((name) => {
      const raw = availableScripts[name];
      if (!Object.prototype.hasOwnProperty.call(availableScripts, name)) return false;
      if (!isRunnableQualityScript(name, raw)) return false;
      if (isMutationLikeQualityScript(raw)) return false;
      return QUALITY_SIGNALS.some((signal) => signal.script === name);
    });
    for (const script of scriptsToRun) {
      if (failures.length && !continueOnFailure) break;
      selected.push(script);
      const signal = signals[signalKeyForScript(script)];
      await executeScript({ script, signal, runner, baseArgs, cwd, timeoutMs, checks });
      if (signal.status === 'failed' || signal.status === 'timed_out') failures.push(failureText(script, signal));
    }
  }

  for (const signal of Object.values(signals)) {
    if (signal.status === 'not_configured') skipped.push(`package script not found, skipped: ${signal.script}`);
    if (signal.status === 'skipped') skipped.push(`${signal.script} skipped: ${signal.reason}`);
    if (signal.status === 'not_verified' && signal.configured) notVerified.push(`${signal.script} configured but not verified: ${signal.reason}`);
  }
  if (!Object.keys(availableScripts).length) skipped.push('No package.json scripts detected');

  addSignalChecks(checks, signals);

  const skippedScripts = Object.values(signals)
    .filter((signal) => ['not_configured', 'skipped'].includes(signal.status))
    .map((signal) => signal.script);

  const result = createResult('quality', failures.length ? 'fail' : warnings.length ? 'warn' : 'pass', {
    summary: `Safe local quality gates reported distinct proof signals. Execution strategy: ${executionStrategy}.`,
    verified: [
      boundary.isGitRepo ? 'git diff --check executed' : 'git diff --check skipped outside git repository',
      'package.json scripts inspected',
      'Quality proof signals: ' + signalSummary(signals),
      'Existing quality scripts selected: ' + (selected.length ? selected.join(', ') : 'none')
    ],
    warnings,
    failures,
    skipped,
    notVerified,
    checks,
    data: {
      boundary,
      packageManager,
      availableScripts,
      requestedScripts: requested,
      selectedScripts: selected,
      skippedScripts,
      quality: {
        executionStrategy,
        runner,
        baseArgs,
        signals
      }
    },
    nextSafeStep: failures.length ? 'Fix the failing quality signal and rerun opstruth quality.' : 'Attach quality signal output to the evidence pack.'
  });
  return finalizeStatus(result, { strict });
}
