import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { detectPackageManager, detectStack } from '../src/lib/detect.js';
import { runQuality } from '../src/commands/quality.js';
import { resolveProjectBoundary } from '../src/lib/boundary.js';
import { runSecrets } from '../src/commands/secrets.js';
import { selectProbes } from '../src/lib/probes.js';
import { runRoutes } from '../src/commands/routes.js';
import { runCli } from '../src/cli.js';

const execFileAsync = promisify(execFile);
const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const cliBin = path.join(repoRoot, 'bin/opstruth.js');

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

test('help modes print help without running checks', async () => {
  const root = await fixture({});
  for (const args of [['--help'], ['-h'], ['repo', '--help'], ['routes', '--help']]) {
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

test('init mode writes config only with yes flag', async () => {
  const root = await fixture({});
  const { stdout } = await captureCli(['init', '--yes'], root);
  assert.match(stdout, /Created opstruth.config.json/);
  const config = JSON.parse(await fs.readFile(path.join(root, 'opstruth.config.json'), 'utf8'));
  assert.deepEqual(config.routes.paths, ['/', '/login', '/healthz']);
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
  const root = await fixture({
    'package.json': '{}',
    'src/app.js': 'const OPENAI_API_KEY = "sk-test-secret-value";\n'
  });
  const result = await runSecrets({ cwd: root });
  assert.equal(result.status, 'warn');
  assert.equal(result.findings.length, 1);
  assert.match(result.findings[0].evidence.join('\n'), /redacted preview/);
  assert.doesNotMatch(result.findings[0].evidence.join('\n'), /sk-test-secret-value/);
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
