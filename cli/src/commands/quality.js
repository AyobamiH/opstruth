import { createResult, finalizeStatus } from '../lib/result.js';
import { runCommand, excerpt } from '../lib/exec.js';
import { detectPackageManager, detectPackageScripts } from '../lib/detect.js';
import { resolveProjectBoundary } from '../lib/boundary.js';

const DEFAULT_SCRIPTS = ['typecheck', 'lint', 'test', 'build', 'ci'];

export function isDefaultPlaceholderTestScript(script = '') {
  return /^echo\s+["']?Error:\s*no test specified["']?\s*(?:&&|;)\s*exit\s+1$/i.test(script.trim());
}

function isRunnableQualityScript(name, script) {
  return !(name === 'test' && isDefaultPlaceholderTestScript(script));
}

function runnerFor(manager) {
  if (manager === 'pnpm') return ['pnpm', ['run']];
  if (manager === 'yarn') return ['yarn', []];
  if (manager === 'bun') return ['bun', ['run']];
  return ['npm', ['run']];
}
export async function runQuality({ cwd = process.cwd(), continueOnFailure = false, strict = false, scripts: wantedScripts } = {}) {
  const boundary = await resolveProjectBoundary(cwd);
  cwd = boundary.root;
  const packageManager = await detectPackageManager(cwd);
  const availableScripts = await detectPackageScripts(cwd);
  const requested = wantedScripts?.length ? wantedScripts : DEFAULT_SCRIPTS;
  const selected = requested.filter((name) => Object.prototype.hasOwnProperty.call(availableScripts, name) && isRunnableQualityScript(name, availableScripts[name]));
  const skippedScripts = requested.filter((name) => !Object.prototype.hasOwnProperty.call(availableScripts, name) || !isRunnableQualityScript(name, availableScripts[name]));
  const checks = [];
  const warnings = [];
  const failures = [];
  const skipped = skippedScripts.map((name) => {
    if (Object.prototype.hasOwnProperty.call(availableScripts, name) && !isRunnableQualityScript(name, availableScripts[name])) {
      return 'default npm placeholder test script skipped';
    }
    return 'package script not found, skipped: ' + name;
  });
  if (boundary.message) skipped.push(boundary.message);
  if (boundary.isGitRepo) {
    const diff = await runCommand('git', ['diff', '--check'], { cwd, timeoutMs: 60000 });
    checks.push({ name: 'git diff --check', command: diff.command, exitCode: diff.exitCode, durationMs: diff.durationMs, status: diff.exitCode === 0 ? 'pass' : 'fail', logExcerpt: excerpt(diff.stderr || diff.stdout) });
    if (diff.exitCode !== 0) failures.push('git diff --check failed');
  } else {
    skipped.push('git diff --check skipped because no git repository was detected');
  }
  const [runner, baseArgs] = runnerFor(packageManager);
  for (const script of selected) {
    if (failures.length && !continueOnFailure) break;
    const run = await runCommand(runner, [...baseArgs, script], { cwd, timeoutMs: 180000 });
    checks.push({ name: 'package script ' + script, command: run.command, exitCode: run.exitCode, durationMs: run.durationMs, status: run.exitCode === 0 ? 'pass' : 'fail', logExcerpt: excerpt((run.stdout || '') + '\n' + (run.stderr || '')) });
    if (run.exitCode !== 0) failures.push(script + ' failed');
  }
  if (!Object.keys(availableScripts).length) skipped.push('No package.json scripts detected');
  const result = createResult('quality', failures.length ? 'fail' : warnings.length ? 'warn' : 'pass', {
    summary: 'Safe local quality gates ran only scripts that exist in package.json. Missing scripts were skipped, not failed.',
    verified: [boundary.isGitRepo ? 'git diff --check executed' : 'git diff --check skipped outside git repository', 'package.json scripts inspected', 'Existing quality scripts selected: ' + (selected.length ? selected.join(', ') : 'none')],
    warnings,
    failures,
    skipped,
    checks,
    data: { boundary, packageManager, availableScripts, requestedScripts: requested, selectedScripts: selected, skippedScripts },
    nextSafeStep: failures.length ? 'Fix the failing quality command and rerun opstruth quality.' : 'Attach quality output to the evidence pack.'
  });
  return finalizeStatus(result, { strict });
}
