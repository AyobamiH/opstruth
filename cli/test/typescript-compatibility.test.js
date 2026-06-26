import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { detectPackageManager, detectStack } from '../src/lib/detect.js';
import { qualityRunnerFor, runQuality } from '../src/commands/quality.js';
import { resolveProjectBoundary } from '../src/lib/boundary.js';
import { runSecrets } from '../src/commands/secrets.js';
import { classifySecretReference, scanRiskyReferencesDetailed } from '../src/lib/scan.js';
import { PROBE_CATALOGUE, selectProbes } from '../src/lib/probes.js';
import { buildMissingHeaderFinding, isLocalRouteUrl, runRoutes } from '../src/commands/routes.js';
import { runSupabase } from '../src/commands/supabase.js';
import { runCloudflare } from '../src/commands/cloudflare.js';
import { parseGitHubRemote, runGitHubCi, selectGitHubRun } from '../src/commands/github-ci.js';
import { runCli } from '../src/cli.js';
import { runOrchestrator } from '../src/orchestrator.js';
import { evidenceMarkdown, statusLabel } from '../src/lib/markdown.js';
import { runCommand } from '../src/lib/exec.js';

const execFileAsync = promisify(execFile);
const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const cliBin = path.join(repoRoot, 'bin/opstruth.js');
const ANSI_RE = /\x1B\[[0-?]*[ -/]*[@-~]/;

async function captureCli(args, cwd) {
  let output = '';
  const originalWrite = process.stdout.write;
  process.stdout.write = (chunk, _encoding, callback) => {
    output += String(chunk);
    if (typeof _encoding === 'function') _encoding();
    if (typeof callback === 'function') callback();
    return true;
  };
  const originalExitCode = process.exitCode;
  process.exitCode = 0;
  try {
    await runCli(args, cwd);
    return { stdout: output, exitCode: process.exitCode };
  } finally {
    process.stdout.write = originalWrite;
    process.exitCode = originalExitCode;
  }
}

async function fixture(files) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'opstruth-ts-'));
  for (const [file, content] of Object.entries(files)) {
    const full = path.join(root, file);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, content);
  }
  return root;
}

async function fixtureProject(name, { git = true } = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), `opstruth-${name}-`));
  await fs.cp(path.join(repoRoot, 'fixtures', name), root, { recursive: true });
  if (git) await execFileAsync('git', ['init'], { cwd: root });
  return root;
}

async function rootFixtureProject(name, { git = true } = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), `opstruth-root-${name}-`));
  await fs.cp(path.join(repoRoot, '..', 'fixtures', name), root, { recursive: true });
  if (git) await execFileAsync('git', ['init'], { cwd: root });
  return root;
}

test('detects TypeScript, Vite, React, Next, ESM, configs, scripts, and pnpm', async () => {
  const root = await fixture({
    'package.json': JSON.stringify({ type: 'module', dependencies: { react: '^19.0.0', next: '^15.0.0' }, devDependencies: { typescript: '^5.0.0', vite: '^6.0.0' }, scripts: { typecheck: 'tsc --noEmit', build: 'vite build' } }),
    'tsconfig.json': '{}',
    'vite.config.ts': 'export default {}',
    'next.config.ts': 'export default {}',
    'eslint.config.js': 'export default []',
    'vitest.config.ts': 'export default {}',
    'playwright.config.ts': 'export default {}',
    'pnpm-lock.yaml': 'lockfileVersion: 9',
    'src/App.tsx': 'export function App() { return null }'
  });
  const stack = await detectStack(root);
  assert.equal(stack.isTypeScript, true);
  assert.equal(stack.language, 'TypeScript');
  assert.equal(stack.isEsm, true);
  assert.equal(stack.packageManager, 'pnpm');
  assert.ok(stack.platforms.includes('TypeScript'));
  assert.ok(stack.platforms.includes('Vite'));
  assert.ok(stack.platforms.includes('React'));
  assert.ok(stack.platforms.includes('Next.js'));
  assert.ok(stack.platforms.includes('Node ESM'));
  assert.deepEqual(stack.config.typescript, ['tsconfig.json']);
  assert.deepEqual(stack.config.lockfiles, ['pnpm-lock.yaml']);
});

test('detects yarn, bun, and npm lockfiles with stable precedence', async () => {
  assert.equal(await detectPackageManager(await fixture({ 'package.json': '{}', 'yarn.lock': '' })), 'yarn');
  assert.equal(await detectPackageManager(await fixture({ 'package.json': '{}', 'bun.lockb': '' })), 'bun');
  assert.equal(await detectPackageManager(await fixture({ 'package.json': '{}', 'package-lock.json': '{}' })), 'npm');
});

test('quality skips missing scripts instead of failing them', async () => {
  const root = await fixture({
    'package.json': JSON.stringify({ scripts: { lint: 'node --version' } })
  });
  await execFileAsync('git', ['init'], { cwd: root });
  const result = await runQuality({ cwd: root });
  assert.equal(result.status, 'pass');
  assert.deepEqual(result.data.selectedScripts, ['lint']);
  assert.ok(result.data.skippedScripts.includes('typecheck'));
  assert.ok(result.skipped.some((item) => item.includes('typecheck')));
  assert.equal(result.failures.length, 0);
});

test('quality skips npm default placeholder test script', async () => {
  const root = await fixture({
    'package.json': JSON.stringify({ scripts: { test: 'echo "Error: no test specified" && exit 1' } })
  });
  const result = await runQuality({ cwd: root, scripts: ['test'] });
  assert.equal(result.status, 'pass');
  assert.deepEqual(result.data.selectedScripts, []);
  assert.ok(result.data.skippedScripts.includes('test'));
  assert.ok(result.skipped.some((item) => item.includes('default npm placeholder test script')));
  assert.equal(result.failures.length, 0);
});

test('quality still fails for a real failing test script', async () => {
  const root = await fixture({
    'package.json': JSON.stringify({ scripts: { test: 'node -e "process.exit(1)"' } })
  });
  const result = await runQuality({ cwd: root, scripts: ['test'] });
  assert.equal(result.status, 'fail');
  assert.deepEqual(result.data.selectedScripts, ['test']);
  assert.ok(result.failures.includes('test failed'));
});

test('quality runs an existing valid test script', async () => {
  const root = await fixture({
    'package.json': JSON.stringify({ scripts: { test: 'node --version' } })
  });
  const result = await runQuality({ cwd: root, scripts: ['test'] });
  assert.equal(result.status, 'pass');
  assert.deepEqual(result.data.selectedScripts, ['test']);
  assert.ok(result.checks.some((check) => check.name === 'package script test' && check.status === 'pass'));
});

test('quality reports all proof signals through a passing ci script', async () => {
  const root = await fixture({
    'package.json': JSON.stringify({
      scripts: {
        lint: 'node --version',
        typecheck: 'node --version',
        test: 'node --version',
        build: 'node --version',
        ci: 'npm run lint && npm run typecheck && npm test && npm run build'
      }
    })
  });
  const result = await runQuality({ cwd: root });
  assert.equal(result.status, 'pass');
  assert.equal(result.data.quality.executionStrategy, 'ci');
  assert.deepEqual(result.data.selectedScripts, ['ci']);
  assert.equal(result.data.quality.signals.lint.status, 'passed');
  assert.equal(result.data.quality.signals.typecheck.status, 'passed');
  assert.equal(result.data.quality.signals.tests.status, 'passed');
  assert.equal(result.data.quality.signals.build.status, 'passed');
  assert.equal(result.data.quality.signals.ci.status, 'passed');
  assert.equal(result.data.quality.signals.lint.proofRoute, 'ci');
  assert.ok(result.checks.some((check) => check.name === 'quality signal lint' && check.status === 'pass'));
});

test('quality keeps missing test script not configured instead of passed', async () => {
  const root = await fixture({
    'package.json': JSON.stringify({ scripts: { lint: 'node --version' } })
  });
  const result = await runQuality({ cwd: root });
  assert.equal(result.data.quality.signals.tests.status, 'not_configured');
  assert.ok(result.skipped.some((item) => item.includes('test')));
  assert.notEqual(result.data.quality.signals.tests.status, 'passed');
});

test('quality records failing lint as a distinct failed signal', async () => {
  const root = await fixture({
    'package.json': JSON.stringify({ scripts: { lint: 'node -e "process.exit(1)"' } })
  });
  const result = await runQuality({ cwd: root, scripts: ['lint'] });
  assert.equal(result.status, 'fail');
  assert.equal(result.data.quality.signals.lint.status, 'failed');
  assert.ok(result.failures.includes('lint failed'));
});

test('quality records build timeouts as timed out', async () => {
  const root = await fixture({
    'package.json': JSON.stringify({ scripts: { build: 'node -e "setTimeout(() => {}, 5000)"' } })
  });
  const result = await runQuality({ cwd: root, scripts: ['build'], timeoutMs: 100 });
  assert.equal(result.status, 'fail');
  assert.equal(result.data.quality.signals.build.status, 'timed_out');
  assert.ok(result.failures.includes('build timed out'));
});

test('quality skips mutation-like ci script and uses safe individual scripts', async () => {
  const root = await fixture({
    'package.json': JSON.stringify({
      scripts: {
        lint: 'node --version',
        ci: 'supabase db push'
      }
    })
  });
  const result = await runQuality({ cwd: root });
  assert.equal(result.status, 'warn');
  assert.deepEqual(result.data.selectedScripts, ['lint']);
  assert.equal(result.data.quality.signals.ci.status, 'skipped');
  assert.match(result.data.quality.signals.ci.reason, /requires human review/);
  assert.ok(result.warnings.some((item) => item.includes('requires review')));
});

test('quality command runner selection stays package-manager aware', () => {
  assert.deepEqual(qualityRunnerFor('npm'), ['npm', ['run']]);
  assert.deepEqual(qualityRunnerFor('pnpm'), ['pnpm', ['run']]);
  assert.deepEqual(qualityRunnerFor('yarn'), ['yarn', []]);
  assert.deepEqual(qualityRunnerFor('bun'), ['bun', ['run']]);
});

test('quality json exposes distinct signals and stays ANSI-free', async () => {
  const root = await fixture({
    'package.json': JSON.stringify({ scripts: { lint: 'node --version', test: 'node --version' } })
  });
  const { stdout, exitCode } = await captureCli(['quality', '--json'], root);
  const parsed = JSON.parse(stdout);
  assert.equal(exitCode, 0);
  assert.doesNotMatch(stdout, ANSI_RE);
  assert.equal(parsed.data.quality.signals.lint.status, 'passed');
  assert.equal(parsed.data.quality.signals.tests.status, 'passed');
  assert.equal(parsed.data.quality.signals.typecheck.status, 'not_configured');
});

test('quality evidence includes each proof signal in checks', async () => {
  const root = await fixture({
    'package.json': JSON.stringify({ scripts: { lint: 'node --version', build: 'node --version' } })
  });
  const result = await runQuality({ cwd: root });
  const checkNames = result.checks.map((check) => check.name);
  for (const signal of ['lint', 'typecheck', 'tests', 'build', 'ci']) {
    assert.ok(checkNames.includes('quality signal ' + signal));
  }
});


test('suppresses opstruth internal scanner pattern definitions', async () => {
  const root = await fixture({
    'package.json': JSON.stringify({ name: 'opstruth' }),
    'src/lib/redact.js': 'OPENAI_API_KEY SUPABASE_SERVICE_ROLE_KEY private_key',
    'src/lib/scan.js': 'authorization bearer api_key',
    'src/app.js': 'console.log("hello")'
  });
  const { scanRiskyReferences } = await import('../src/lib/scan.js');
  const findings = await scanRiskyReferences(root);
  assert.deepEqual(findings, []);
});

function mockGhRunner({ runs = [], views = {}, failList = null, failView = null } = {}) {
  const calls = [];
  const runner = async (args) => {
    calls.push(args);
    if (args[0] === 'run' && args[1] === 'list') {
      if (failList) return { exitCode: failList.exitCode ?? 1, stdout: failList.stdout || '', stderr: failList.stderr || '', durationMs: 1 };
      return { exitCode: 0, stdout: JSON.stringify(runs), stderr: '', durationMs: 1 };
    }
    if (args[0] === 'run' && args[1] === 'view') {
      if (failView) return { exitCode: failView.exitCode ?? 1, stdout: failView.stdout || '', stderr: failView.stderr || '', durationMs: 1 };
      const id = args[2];
      return { exitCode: 0, stdout: JSON.stringify(views[id] || runs.find((run) => String(run.databaseId) === String(id)) || {}), stderr: '', durationMs: 1 };
    }
    return { exitCode: 1, stdout: '', stderr: 'unexpected gh call', durationMs: 1 };
  };
  runner.calls = calls;
  return runner;
}

function githubRun(overrides = {}) {
  return {
    databaseId: 123,
    headSha: 'abc123',
    conclusion: 'success',
    status: 'completed',
    event: 'push',
    createdAt: '2026-06-26T01:00:00Z',
    updatedAt: '2026-06-26T01:01:00Z',
    workflowName: 'CI',
    url: 'https://github.com/owner/repo/actions/runs/123',
    jobs: [{ name: 'quality', status: 'completed', conclusion: 'success', startedAt: '2026-06-26T01:00:00Z', completedAt: '2026-06-26T01:01:00Z' }],
    ...overrides
  };
}

test('github remote parsing supports SSH and HTTPS origins', () => {
  assert.equal(parseGitHubRemote('git@github.com:AyobamiH/wagging-web-wins.git'), 'AyobamiH/wagging-web-wins');
  assert.equal(parseGitHubRemote('https://github.com/AyobamiH/opstruth.git'), 'AyobamiH/opstruth');
  assert.equal(parseGitHubRemote('ssh://git@github.com/AyobamiH/coding-workflow-library.git'), 'AyobamiH/coding-workflow-library');
  assert.equal(parseGitHubRemote('https://example.com/AyobamiH/opstruth.git'), null);
});

test('github ci verifies successful exact-commit run', async () => {
  const runner = mockGhRunner({ runs: [githubRun()], views: { 123: githubRun() } });
  const result = await runGitHubCi({ cwd: await fixture({}), commitSha: 'abc123', remoteUrl: 'https://github.com/owner/repo.git', ghRunner: runner, workflow: 'CI' });
  assert.equal(result.status, 'pass');
  assert.equal(result.data.githubCi.state, 'verified_success');
  assert.equal(result.data.githubCi.exactCommitMatch, true);
  assert.equal(result.data.githubCi.jobs[0].name, 'quality');
});

test('github ci can parse raw command stdout without commit SHA redaction', async () => {
  const sha = '70d78459150df8a9753503323d28dd3d7b93b3dd';
  const stdout = JSON.stringify([{ headSha: sha }]);
  const script = `process.stdout.write(${JSON.stringify(stdout)})`;

  const redacted = await runCommand(process.execPath, ['-e', script], { timeoutMs: 30000 });
  assert.notEqual(redacted.stdout, stdout);

  const raw = await runCommand(process.execPath, ['-e', script], { timeoutMs: 30000, redactStdout: false });
  assert.equal(raw.stdout, stdout);
});

test('github ci preserves resolved git commit SHA for exact-run matching', async () => {
  const root = await fixture({ 'README.md': 'hello\n' });
  await execFileAsync('git', ['init'], { cwd: root });
  await execFileAsync('git', ['config', 'user.email', 'opstruth@example.test'], { cwd: root });
  await execFileAsync('git', ['config', 'user.name', 'OpsTruth Test'], { cwd: root });
  await execFileAsync('git', ['add', 'README.md'], { cwd: root });
  await execFileAsync('git', ['commit', '-m', 'initial'], { cwd: root });
  await execFileAsync('git', ['remote', 'add', 'origin', 'https://github.com/owner/repo.git'], { cwd: root });

  const sha = (await execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: root })).stdout.trim();
  const run = githubRun({ headSha: sha });
  const runner = mockGhRunner({ runs: [run], views: { 123: run } });
  const result = await runGitHubCi({ cwd: root, ghRunner: runner, workflow: 'CI' });

  assert.equal(result.status, 'pass');
  assert.equal(result.data.githubCi.localCommitSha, sha);
  assert.equal(result.data.githubCi.exactCommitMatch, true);
});

test('github ci fails failed or cancelled exact-commit runs', async () => {
  for (const conclusion of ['failure', 'cancelled']) {
    const run = githubRun({ databaseId: conclusion, conclusion });
    const runner = mockGhRunner({ runs: [run], views: { [conclusion]: run } });
    const result = await runGitHubCi({ cwd: await fixture({}), commitSha: 'abc123', remoteUrl: 'git@github.com:owner/repo.git', ghRunner: runner });
    assert.equal(result.status, 'fail');
    assert.equal(result.data.githubCi.state, 'verified_failure');
    assert.match(result.failures[0], /did not succeed/);
  }
});

test('github ci reports queued or in-progress run without passing it', async () => {
  const run = githubRun({ databaseId: 124, status: 'in_progress', conclusion: '' });
  const runner = mockGhRunner({ runs: [run], views: { 124: run } });
  const result = await runGitHubCi({ cwd: await fixture({}), commitSha: 'abc123', remoteUrl: 'https://github.com/owner/repo.git', ghRunner: runner });
  assert.equal(result.status, 'warn');
  assert.equal(result.data.githubCi.state, 'in_progress');
});

test('github ci rejects successful run for a different commit', async () => {
  const runner = mockGhRunner({ runs: [githubRun({ headSha: 'other' })] });
  const result = await runGitHubCi({ cwd: await fixture({}), commitSha: 'abc123', remoteUrl: 'https://github.com/owner/repo.git', ghRunner: runner });
  assert.equal(result.status, 'not_verified');
  assert.equal(result.data.githubCi.state, 'commit_mismatch');
});

test('github ci reports no run for current commit', async () => {
  const runner = mockGhRunner({ runs: [] });
  const result = await runGitHubCi({ cwd: await fixture({}), commitSha: 'abc123', remoteUrl: 'https://github.com/owner/repo.git', ghRunner: runner });
  assert.equal(result.status, 'skipped');
  assert.equal(result.data.githubCi.state, 'no_run_for_commit');
});

test('github ci chooses latest completed matching run deterministically', async () => {
  const older = githubRun({ databaseId: 1, updatedAt: '2026-06-26T01:00:00Z' });
  const newer = githubRun({ databaseId: 2, updatedAt: '2026-06-26T02:00:00Z' });
  const selected = selectGitHubRun([older, newer], { commitSha: 'abc123' });
  assert.equal(selected.run.databaseId, 2);
  assert.equal(selected.state, 'verified_success');
});

test('github ci supports workflow-name filtering', async () => {
  const runner = mockGhRunner({ runs: [githubRun({ workflowName: 'Other' })] });
  const result = await runGitHubCi({ cwd: await fixture({}), commitSha: 'abc123', remoteUrl: 'https://github.com/owner/repo.git', ghRunner: runner, workflow: 'CI' });
  assert.equal(result.status, 'skipped');
  assert.equal(result.data.githubCi.state, 'workflow_not_found');
});

test('github ci handles missing origin and missing gh auth', async () => {
  const unresolved = await runGitHubCi({ cwd: await fixture({}), commitSha: 'abc123', remoteUrl: '', ghRunner: mockGhRunner() });
  assert.equal(unresolved.status, 'not_verified');
  assert.equal(unresolved.data.githubCi.state, 'repository_unresolved');

  const authFail = await runGitHubCi({
    cwd: await fixture({}),
    commitSha: 'abc123',
    remoteUrl: 'https://github.com/owner/repo.git',
    ghRunner: mockGhRunner({ failList: { exitCode: 127, stderr: 'gh: not found' } })
  });
  assert.equal(authFail.status, 'not_verified');
  assert.equal(authFail.data.githubCi.state, 'authentication_unavailable');
});

test('github ci handles malformed GitHub response', async () => {
  const runner = async () => ({ exitCode: 0, stdout: '{not-json', stderr: '', durationMs: 1 });
  const result = await runGitHubCi({ cwd: await fixture({}), commitSha: 'abc123', remoteUrl: 'https://github.com/owner/repo.git', ghRunner: runner });
  assert.equal(result.status, 'not_verified');
  assert.equal(result.data.githubCi.state, 'not_verified');
});

test('github ci human and JSON output stay redacted and parseable', async () => {
  const root = await fixture({});
  const runner = mockGhRunner({ runs: [githubRun()], views: { 123: githubRun() } });
  const result = await runGitHubCi({ cwd: root, commitSha: 'abc123', remoteUrl: 'https://github.com/owner/repo.git', ghRunner: runner });
  const serialized = JSON.stringify(result);
  assert.doesNotMatch(serialized, ANSI_RE);
  assert.doesNotMatch(serialized, /GH_TOKEN|GITHUB_TOKEN|SUPABASE_ACCESS_TOKEN|NPM_TOKEN/);
  assert.equal(JSON.parse(serialized).data.githubCi.state, 'verified_success');
});

test('one-command github ci is opt-in through config and default run makes no gh call', async () => {
  const root = await fixture({ 'package.json': JSON.stringify({ scripts: { lint: 'node --version' } }) });
  await execFileAsync('git', ['init'], { cwd: root });
  const defaultRunner = mockGhRunner();
  const defaultResult = await runOrchestrator({ cwd: root, skip: ['evidence'], ghRunner: defaultRunner, commitSha: 'abc123', remoteUrl: 'https://github.com/owner/repo.git' });
  assert.equal(defaultRunner.calls.length, 0);
  assert.equal(defaultResult.data.childResults.some((item) => item.command === 'github-ci'), false);

  await fs.writeFile(path.join(root, 'opstruth.config.json'), JSON.stringify({ github: { ci: { enabled: true, workflow: 'CI' } } }));
  const enabledRunner = mockGhRunner({ runs: [githubRun()], views: { 123: githubRun() } });
  const enabledResult = await runOrchestrator({ cwd: root, skip: ['evidence'], ghRunner: enabledRunner, commitSha: 'abc123', remoteUrl: 'https://github.com/owner/repo.git' });
  assert.ok(enabledRunner.calls.length > 0);
  assert.equal(enabledResult.data.childResults.some((item) => item.command === 'github-ci'), true);
});

test('help modes print help without running checks', async () => {
  const root = await fixture({});
  for (const args of [['--help'], ['-h'], ['repo', '--help'], ['quality', '--help'], ['routes', '--help'], ['secrets', '--help'], ['supabase', '--help'], ['cloudflare', '--help'], ['local', '--help'], ['github-ci', '--help'], ['probes', '--help'], ['evidence', '--help'], ['init', '--help']]) {
    const { stdout, exitCode } = await captureCli(args, root);
    assert.match(stdout, /Usage:/);
    assert.match(stdout, /Operational truth checks/);
    assert.doesNotMatch(stdout, /STATUS:/);
    assert.equal(exitCode, 0);
  }
});

test('welcome mode explains read-only safety', async () => {
  const root = await fixture({});
  const { stdout, exitCode } = await captureCli(['welcome'], root);
  assert.match(stdout, /Welcome to opstruth/);
  assert.match(stdout, /It will not deploy/);
  assert.match(stdout, /call OpenAI/);
  assert.equal(exitCode, 0);
});

test('terminal colour can be forced and disabled', async () => {
  const root = await fixture({ 'package.json': '{}' });
  const originalNoColor = process.env.NO_COLOR;
  try {
    delete process.env.NO_COLOR;
    const forced = await captureCli(['repo', '--color'], root);
    assert.match(forced.stdout, ANSI_RE);
    assert.match(forced.stdout, /STATUS:/);

    const disabled = await captureCli(['repo', '--color', '--no-color'], root);
    assert.doesNotMatch(disabled.stdout, ANSI_RE);

    process.env.NO_COLOR = '1';
    const noColorEnv = await captureCli(['repo'], root);
    assert.doesNotMatch(noColorEnv.stdout, ANSI_RE);
  } finally {
    if (originalNoColor === undefined) delete process.env.NO_COLOR;
    else process.env.NO_COLOR = originalNoColor;
  }
});

test('machine-readable and file outputs stay ANSI-free', async () => {
  const root = await fixture({ 'package.json': '{}' });
  const originalNoColor = process.env.NO_COLOR;
  try {
    delete process.env.NO_COLOR;
    const json = await captureCli(['repo', '--json', '--color'], root);
    assert.doesNotMatch(json.stdout, ANSI_RE);
    assert.equal(JSON.parse(json.stdout).command, 'repo');

    const out = path.join(root, 'repo.md');
    const human = await captureCli(['repo', '--out', out, '--color'], root);
    assert.match(human.stdout, ANSI_RE);
    const written = await fs.readFile(out, 'utf8');
    assert.doesNotMatch(written, ANSI_RE);
    assert.match(written, /STATUS: Partial pass/);

    const evidence = evidenceMarkdown({ title: 'Test Evidence', status: 'warn', scope: ['src/app.js'] });
    assert.doesNotMatch(evidence, ANSI_RE);
    assert.match(evidence, /## Skipped \/ Not Configured/);
    assert.match(evidence, /## Not Verified/);
    assert.match(evidence, /## Confidence/);
  } finally {
    if (originalNoColor === undefined) delete process.env.NO_COLOR;
    else process.env.NO_COLOR = originalNoColor;
  }
});

test('status labels stay stable for terminal and markdown renderers', () => {
  assert.equal(statusLabel('pass'), 'Pass');
  assert.equal(statusLabel('warn'), 'Partial pass');
  assert.equal(statusLabel('fail'), 'Fail');
  assert.equal(statusLabel('skipped'), 'Skipped');
  assert.equal(statusLabel('not_verified'), 'Not verified');
});

test('init mode writes config only with yes flag', async () => {
  const root = await fixture({});
  const { stdout } = await captureCli(['init', '--yes'], root);
  assert.match(stdout, /Created opstruth.config.json/);
  const config = JSON.parse(await fs.readFile(path.join(root, 'opstruth.config.json'), 'utf8'));
  assert.equal(config.projectName, 'example');
  assert.deepEqual(config.routes.map((route) => route.path), ['/', '/health']);
  assert.deepEqual(config.local.healthPaths, ['/health']);
  assert.deepEqual(config.secrets.allowlistPaths, []);
  assert.ok(config.ignore.includes('node_modules'));
});

test('project boundary uses git root and non-git current directory only', async () => {
  const root = await fixture({ 'package.json': '{}', 'src/index.ts': '' });
  await execFileAsync('git', ['init'], { cwd: root });
  await fs.mkdir(path.join(root, 'nested'), { recursive: true });
  const gitBoundary = await resolveProjectBoundary(path.join(root, 'nested'));
  assert.equal(gitBoundary.root, root);
  assert.equal(gitBoundary.isGitRepo, true);

  const nonGit = await fixture({ 'node_modules/other/index.ts': '', 'local.js': '' });
  const nonGitBoundary = await resolveProjectBoundary(nonGit);
  assert.equal(nonGitBoundary.root, nonGit);
  assert.equal(nonGitBoundary.isGitRepo, false);
  assert.match(nonGitBoundary.message, /No git repository detected/);
  const stack = await detectStack(nonGit);
  assert.equal(stack.isTypeScript, false);
});

test('secret findings include redacted evidence', async () => {
  const secretName = ['OPENAI', 'API', 'KEY'].join('_');
  const fakeValue = 's' + 'k-test-secret-value';
  const root = await fixture({
    'package.json': '{}',
    'src/app.js': `const ${secretName} = "${fakeValue}";\n`
  });
  const result = await runSecrets({ cwd: root });
  assert.equal(result.status, 'warn');
  assert.equal(result.findings.length, 1);
  assert.match(result.findings[0].evidence.join('\n'), /redacted preview/);
  assert.doesNotMatch(result.findings[0].evidence.join('\n'), new RegExp(fakeValue));
});

test('secret scan skips env and cache files while preserving redacted source findings', async () => {
  const secretName = ['OPENAI', 'API', 'KEY'].join('_');
  const envValue = 's' + 'k-env-value-should-not-print';
  const root = await fixture({
    '.env': `${secretName}=${envValue}\n`,
    'node_modules/pkg/index.js': 'const token = "node-module-token";\n',
    'dist/bundle.js': 'const api_key = "dist-token";\n',
    'src/app.js': 'const refresh_token = "source-token";\n'
  });
  const result = await runSecrets({ cwd: root });
  const findings = JSON.stringify(result.findings);
  assert.equal(result.findings.length, 1);
  assert.match(findings, /src\/app.js/);
  assert.match(findings, /REDACTED/);
  assert.doesNotMatch(findings, new RegExp([envValue, 'node-module-token', 'dist-token', 'source-token'].join('|')));
});

test('secret reference classifier separates actionable, docs, placeholder, local, and skipped path classes', () => {
  const jwtLike = `eyJ${'a'.repeat(12)}.${'b'.repeat(12)}.${'c'.repeat(12)}`;
  const unknownToken = `tok_${'d'.repeat(44)}`;
  const openAiKeyName = ['OPENAI', 'API', 'KEY'].join('_');
  const supabaseAccessTokenName = ['SUPABASE', 'ACCESS', 'TOKEN'].join('_');

  assert.equal(classifySecretReference({ file: 'src/app.ts', line: `const token = "${jwtLike}"`, pattern: 'jwt_like' }).category, 'actionable_source_finding');
  assert.equal(classifySecretReference({ file: 'docs/security.md', line: 'Use SUPABASE_ACCESS_TOKEN in CI.', pattern: 'SUPABASE_ACCESS_TOKEN' }).category, 'documentation_reference');
  assert.equal(classifySecretReference({ file: 'docs/case-study.md', line: 'Repo: authorization hardening and scheduler proof gaps.', pattern: 'authorization' }).category, 'documentation_reference');
  assert.equal(classifySecretReference({ file: 'docs/security.md', line: `${supabaseAccessTokenName}=abc123`, pattern: 'SUPABASE_ACCESS_TOKEN' }).category, 'actionable_source_finding');
  assert.equal(classifySecretReference({ file: 'src/config.ts', line: `${openAiKeyName}=YOUR_TOKEN_HERE`, pattern: 'OPENAI_API_KEY' }).category, 'placeholder_or_example');
  assert.equal(classifySecretReference({ file: '.env', line: `${openAiKeyName}=abc123`, pattern: 'OPENAI_API_KEY', tracked: false }).category, 'local_only_file');
  assert.equal(classifySecretReference({ file: '.env', line: `${openAiKeyName}=abc123`, pattern: 'OPENAI_API_KEY', tracked: true }).category, 'actionable_source_finding');
  assert.equal(classifySecretReference({ file: 'package-lock.json', line: unknownToken, pattern: 'unknown_token_like' }).category, 'dependency_or_lockfile');
  assert.equal(classifySecretReference({ file: 'node_modules/pkg/index.js', line: unknownToken, pattern: 'unknown_token_like' }).category, 'dependency_or_lockfile');
  assert.equal(classifySecretReference({ file: 'dist/app.js', line: unknownToken, pattern: 'unknown_token_like' }).category, 'generated_artifact');
  assert.equal(classifySecretReference({ file: 'public/logo.png', line: unknownToken, pattern: 'unknown_token_like' }).category, 'ignored_binary');
  assert.equal(classifySecretReference({ file: 'src/config.ts', line: `const opaque = "${unknownToken}"`, pattern: 'unknown_token_like' }).category, 'unknown_requires_review');
});

test('detailed secret scan groups references without leaking values', async () => {
  const sourceValue = `source-${'e'.repeat(44)}`;
  const envValue = `env-${'f'.repeat(44)}`;
  const lockValue = `lock-${'g'.repeat(44)}`;
  const unknownToken = `opaque_${'h'.repeat(44)}`;
  const openAiKeyName = ['OPENAI', 'API', 'KEY'].join('_');
  const supabaseAccessTokenName = ['SUPABASE', 'ACCESS', 'TOKEN'].join('_');
  const root = await fixture({
    'package.json': '{}',
    'docs/security.md': `Use SUPABASE_ACCESS_TOKEN in CI.\n${supabaseAccessTokenName}=YOUR_TOKEN_HERE\n`,
    'src/app.js': `const access_token = "${sourceValue}";\nconst opaque = "${unknownToken}";\n`,
    '.env': `${openAiKeyName}=${envValue}\n`,
    'package-lock.json': JSON.stringify({ token: lockValue })
  });

  const scan = await scanRiskyReferencesDetailed(root);
  const serialized = JSON.stringify(scan);
  assert.ok(scan.summary.actionable_source_finding >= 1);
  assert.ok(scan.summary.documentation_reference >= 1);
  assert.ok(scan.summary.placeholder_or_example >= 1);
  assert.ok(scan.summary.local_only_file >= 1);
  assert.ok(scan.summary.dependency_or_lockfile >= 1);
  assert.ok(scan.summary.unknown_requires_review >= 1);
  assert.match(scan.summaryText, /Actionable findings:/);
  assert.doesNotMatch(serialized, new RegExp([sourceValue, envValue, lockValue, unknownToken].join('|')));
});

test('secret command exposes grouped summary consistently', async () => {
  const sourceValue = `source-${'i'.repeat(44)}`;
  const root = await fixture({
    'package.json': '{}',
    'docs/security.md': 'Use SUPABASE_ACCESS_TOKEN in CI.\n',
    'src/app.js': `const refresh_token = "${sourceValue}";\n`
  });
  const result = await runSecrets({ cwd: root });

  assert.equal(result.status, 'warn');
  assert.ok(result.data.secretSummary);
  assert.ok(Array.isArray(result.data.classifiedFindings));
  assert.match(result.checks[0].message, /Actionable findings:/);
  assert.ok(result.findings[0].evidence.some((item) => item.includes('category:')));
  assert.ok(result.findings[0].evidence.some((item) => item.includes('severity:')));
  assert.doesNotMatch(JSON.stringify(result), new RegExp(sourceValue));
});

test('CLI secrets JSON keeps grouped output redacted', async () => {
  const sourceValue = `source-${'j'.repeat(44)}`;
  const root = await fixture({
    'package.json': '{}',
    'docs/security.md': 'Use SUPABASE_ACCESS_TOKEN in CI.\n',
    'src/app.js': `const webhook_secret = "${sourceValue}";\n`
  });
  const { stdout, exitCode } = await captureCli(['secrets', '--json'], root);
  const parsed = JSON.parse(stdout);

  assert.equal(exitCode, 0);
  assert.ok(parsed.data.secretSummary);
  assert.ok(parsed.data.classifiedFindings.some((item) => item.category === 'documentation_reference'));
  assert.ok(parsed.data.classifiedFindings.some((item) => item.category === 'actionable_source_finding'));
  assert.doesNotMatch(stdout, ANSI_RE);
  assert.doesNotMatch(stdout, new RegExp(sourceValue));
});

test('secret allowlist paths suppress configured fixture warnings only', async () => {
  const secretName = ['OPENAI', 'API', 'KEY'].join('_');
  const root = await fixture({
    'opstruth.config.json': JSON.stringify({ secrets: { allowlistPaths: ['fixtures/demo.js'] } }),
    'fixtures/demo.js': `const ${secretName} = "fake_fixture_value";\n`,
    'src/app.js': 'const api_key = "real-looking-fixture-value";\n'
  });
  const result = await runSecrets({ cwd: root });
  assert.equal(result.status, 'warn');
  assert.equal(result.findings.length, 1);
  assert.ok(result.findings[0].evidence.some((item) => item.includes('src/app.js')));
  assert.equal(result.data.allowlistPaths[0], 'fixtures/demo.js');
});

test('secret findings classify fixture values without leaking them', async () => {
  const root = await rootFixtureProject('risky-secret-app');
  const result = await runSecrets({ cwd: root });
  assert.equal(result.status, 'warn');
  assert.ok(result.findings.every((finding) => finding.evidence.some((item) => item.includes('kind:'))));
  assert.ok(result.findings.every((finding) => finding.evidence.some((item) => item.includes('context: fixture/demo file'))));
  assert.doesNotMatch(JSON.stringify(result.findings), /fake-openai-key-for-redaction|fake-service-role-for-redaction/);
});

test('route evidence captures URL status latency and missing headers', async () => {
  const root = await fixture({});
  const result = await runRoutes({ cwd: root, baseUrl: 'http://127.0.0.1:9' });
  assert.equal(result.status, 'fail');
  assert.ok(result.findings[0].evidence.some((item) => item.includes('url:')));
  assert.ok(result.findings[0].evidence.some((item) => item.includes('status:')));
  assert.ok(result.findings[0].evidence.some((item) => item.includes('latency:')));
  assert.ok(result.findings[0].evidence.some((item) => item.includes('missing headers:')));
});

test('local route header guidance preserves warnings without inferring production risk', () => {
  for (const url of ['http://127.0.0.1:4173/', 'http://localhost:4173/', 'http://[::1]:4173/']) {
    assert.equal(isLocalRouteUrl(url), true);
    const finding = buildMissingHeaderFinding({
      url,
      routePath: '/',
      missingHeaders: ['strict-transport-security'],
      evidence: ['missing headers: strict-transport-security']
    });
    assert.equal(finding.status, 'warn');
    assert.match(finding.finding, /local preview/i);
    assert.match(finding.whyItMatters, /production headers remain Not Verified/i);
    assert.match(finding.nextSafeStep, /production URL/i);
  }
});

test('remote route header guidance retains production-relevant warning', () => {
  assert.equal(isLocalRouteUrl('https://example.com/'), false);
  const finding = buildMissingHeaderFinding({
    url: 'https://example.com/',
    routePath: '/',
    missingHeaders: ['content-security-policy'],
    evidence: ['missing headers: content-security-policy']
  });
  assert.equal(finding.status, 'warn');
  assert.doesNotMatch(finding.finding, /local preview/i);
  assert.match(finding.whyItMatters, /weaken runtime protection/i);
});

test('route header guidance is absent when expected headers are present', () => {
  const finding = buildMissingHeaderFinding({
    url: 'http://127.0.0.1:4173/',
    routePath: '/',
    missingHeaders: [],
    evidence: ['missing headers: none']
  });
  assert.equal(finding, null);
});

test('local route header guidance stays parseable and ANSI-free in JSON', () => {
  const finding = buildMissingHeaderFinding({
    url: 'http://localhost:4173/',
    routePath: '/',
    missingHeaders: ['x-frame-options'],
    evidence: ['missing headers: x-frame-options']
  });
  const output = JSON.stringify(finding);
  assert.deepEqual(JSON.parse(output), finding);
  assert.doesNotMatch(output, ANSI_RE);
});

test('probe orchestration selects and skips catalogue entries', async () => {
  const root = await fixture({
    'package.json': JSON.stringify({ dependencies: { react: '^19.0.0' }, scripts: { test: 'node --version' } }),
    'tsconfig.json': '{}',
    'wrangler.toml': 'name = "demo"',
    'src/index.tsx': ''
  });
  const boundary = await resolveProjectBoundary(root);
  const stack = await detectStack(root);
  const selection = await selectProbes({ root, stack, boundary, options: {} });
  assert.ok(selection.catalogueSize >= 25);
  assert.ok(selection.selected.some((probe) => probe.id === 'node.react'));
  assert.ok(selection.selected.some((probe) => probe.id === 'quality.test'));
  assert.ok(selection.selected.some((probe) => probe.id === 'cloudflare.wrangler'));
  assert.ok(selection.skipped.some((probe) => probe.reason));
});

test('every probe exposes maturity metadata', () => {
  for (const probe of PROBE_CATALOGUE) {
    assert.ok(probe.id);
    assert.ok(probe.area);
    assert.ok(probe.mode);
    assert.ok(probe.safetyLevel);
    assert.ok(probe.description);
    assert.ok(Array.isArray(probe.evidenceExpectation));
    assert.ok(probe.skipReason);
    assert.ok(probe.nextSafeStep);
    assert.ok(probe.proofLimitation);
    assert.ok(Array.isArray(probe.inputsRequired));
  }
});

test('probes json includes skipped reasons and ANSI-free metadata', async () => {
  const root = await fixture({ 'package.json': '{}' });
  const { stdout, exitCode } = await captureCli(['probes', '--json', '--color'], root);
  assert.doesNotMatch(stdout, ANSI_RE);
  const result = JSON.parse(stdout);
  assert.equal(exitCode, 0);
  assert.ok(result.data.catalogue.every((probe) => probe.proofLimitation && probe.nextSafeStep));
  assert.ok(result.data.skipped.every((probe) => probe.reason));
});

test('route config supports current opstruth.config.json schema', async () => {
  const root = await fixture({
    'opstruth.config.json': JSON.stringify({ routes: [{ path: '/', expectedStatus: 200 }] })
  });
  const result = await runRoutes({ cwd: root, baseUrl: 'http://127.0.0.1:9' });
  assert.equal(result.status, 'fail');
  assert.equal(result.data.routes[0].expectStatus[0], 200);
});

test('local command can read ports and health paths from config', async () => {
  const root = await fixture({
    'opstruth.config.json': JSON.stringify({ local: { ports: [9], healthPaths: ['/health'] } })
  });
  const { stdout } = await captureCli(['local', '--json'], root);
  const result = JSON.parse(stdout);
  assert.equal(result.status, 'warn');
  assert.ok(result.checks.some((check) => check.name === 'port 9 listening'));
});

test('one-command run consumes route and local inputs from config', async () => {
  const root = await fixture({
    'package.json': JSON.stringify({ scripts: { lint: 'node --version' } }),
    'opstruth.config.json': JSON.stringify({
      routes: {
        baseUrl: 'http://127.0.0.1:9',
        routes: [{ path: '/', method: 'GET', expectedStatus: 200 }],
        requiredHeaders: []
      },
      local: {
        ports: [9],
        healthPaths: ['/']
      }
    })
  });
  await execFileAsync('git', ['init'], { cwd: root });
  const result = await runOrchestrator({ cwd: root, skip: ['evidence'] });
  const routes = result.data.childResults.find((item) => item.command === 'routes');
  const local = result.data.childResults.find((item) => item.command === 'local');
  assert.ok(routes);
  assert.ok(local);
  assert.notEqual(routes.status, 'skipped');
  assert.notEqual(local.status, 'skipped');
  assert.ok(routes.checks.some((check) => check.name === 'GET /'));
  assert.ok(local.checks.some((check) => check.name === 'health 9'));
});

test('one-command json output includes config-driven local evidence and stays ANSI-free', async () => {
  const root = await fixture({
    'package.json': JSON.stringify({ scripts: { lint: 'node --version' } }),
    'opstruth.config.json': JSON.stringify({
      routes: {
        baseUrl: 'http://127.0.0.1:9',
        routes: [{ path: '/', method: 'GET', expectedStatus: 200 }],
        requiredHeaders: []
      },
      local: {
        ports: [9],
        healthPaths: ['/']
      }
    })
  });
  await execFileAsync('git', ['init'], { cwd: root });
  const { stdout } = await captureCli(['--json', '--skip', 'evidence', '--color'], root);
  assert.doesNotMatch(stdout, ANSI_RE);
  const result = JSON.parse(stdout);
  const local = result.data.childResults.find((item) => item.command === 'local');
  assert.ok(local);
  assert.notEqual(local.status, 'skipped');
  assert.ok(local.checks.some((check) => check.name === 'health 9'));
});

test('invalid config warns clearly for config-driven routes', async () => {
  const root = await fixture({ 'opstruth.config.json': '{ invalid json' });
  const result = await runRoutes({ cwd: root, baseUrl: 'https://example.com' });
  assert.equal(result.status, 'warn');
  assert.match(result.warnings[0], /Invalid route config opstruth.config.json/);
  assert.ok(result.notVerified.includes('Public route availability'));
});

test('supabase static audit detects migration and frontend proof gaps', async () => {
  const root = await rootFixtureProject('supabase-app');
  const result = await runSupabase({ cwd: root, protectedTable: ['agent_jobs'] });
  assert.equal(result.command, 'supabase');
  assert.ok(result.verified.some((item) => item.includes('Supabase migrations inspected')));
  assert.ok(result.data.policies.length >= 1);
  assert.ok(result.notVerified.includes('Live Supabase permissions were not checked'));
});

test('cloudflare static audit detects wrangler config without deploying', async () => {
  const root = await rootFixtureProject('cloudflare-worker-app');
  const result = await runCloudflare({ cwd: root });
  assert.equal(result.command, 'cloudflare');
  assert.ok(result.verified.some((item) => item.includes('Cloudflare config detected')));
  assert.equal(result.data.configFile, 'wrangler.toml');
  assert.ok(result.notVerified.includes('No Cloudflare deploy was executed'));
});

test('strict mode treats warnings as failures in CLI exit code', async () => {
  const root = await fixture({
    'package.json': '{}',
    'src/app.js': 'const api_key = "not-real";\n'
  });
  const { exitCode } = await captureCli(['secrets', '--strict'], root);
  assert.equal(exitCode, 1);
});

test('fixture: Vite React detects Vite, React, and TypeScript', async () => {
  const root = await fixtureProject('vite-react-app');
  const { stdout } = await captureCli(['repo', '--json'], root);
  const result = JSON.parse(stdout);
  assert.equal(result.status, 'pass');
  assert.ok(result.data.platforms.includes('Vite'));
  assert.ok(result.data.platforms.includes('React'));
  assert.equal(result.data.isTypeScript, true);
});

test('fixture: Next detects Next.js', async () => {
  const root = await fixtureProject('next-app');
  const { stdout } = await captureCli(['repo', '--json'], root);
  const result = JSON.parse(stdout);
  assert.ok(result.data.platforms.includes('Next.js'));
  assert.equal(result.data.isTypeScript, true);
});

test('fixture: Supabase and Cloudflare are detected', async () => {
  const root = await fixtureProject('supabase-cloudflare-app');
  const { stdout } = await captureCli(['probes', '--json'], root);
  const result = JSON.parse(stdout);
  assert.ok(result.data.stack.platforms.includes('Supabase'));
  assert.ok(result.data.stack.platforms.includes('Cloudflare'));
  assert.ok(result.data.detected.some((probe) => probe.id === 'supabase.migrations'));
  assert.ok(result.data.detected.some((probe) => probe.id === 'cloudflare.wrangler'));
});

test('fixture: risky secret app reports redacted evidence', async () => {
  const root = await fixtureProject('risky-secret-app');
  const { stdout } = await captureCli(['secrets', '--json'], root);
  const result = JSON.parse(stdout);
  assert.equal(result.status, 'warn');
  assert.ok(result.findings.length >= 2);
  const evidence = JSON.stringify(result.findings);
  assert.match(evidence, /REDACTED/);
  assert.doesNotMatch(evidence, /fake-openai-key-for-redaction/);
  assert.doesNotMatch(evidence, /fake-service-role-for-redaction/);
});

test('fixture: non-git folder skips git diff check without failing', async () => {
  const root = await fixtureProject('non-git-folder', { git: false });
  const { stdout } = await captureCli(['quality', '--json'], root);
  const result = JSON.parse(stdout);
  assert.notEqual(result.status, 'fail');
  assert.ok(result.skipped.some((item) => item.includes('git diff --check skipped')));
});

test('fixture: evidence pack is created and route/local remain skipped unless configured', async () => {
  const root = await fixtureProject('plain-node-app');
  const out = path.join(root, 'evidence', 'opstruth.md');
  const { stdout } = await captureCli(['--json', '--out', out], root);
  const result = JSON.parse(stdout);
  assert.notEqual(result.status, 'fail');
  assert.ok(result.skipped.some((item) => item.includes('routes.head_root') || item.includes('Route checks skipped')));
  assert.ok(result.skipped.some((item) => item.includes('local.ports') || item.includes('Local runtime checks skipped')));
  const evidence = await fs.readFile(out, 'utf8');
  assert.match(evidence, /opstruth Evidence Pack|STATUS:/);
});
