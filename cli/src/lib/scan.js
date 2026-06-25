import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { walkFiles, readText, readJson, pathExists } from './fs.js';
import { redact } from './redact.js';
import { mergeIgnores } from './boundary.js';

const execFileAsync = promisify(execFile);

export const DEFAULT_SKIP_DIRS = mergeIgnores();
export const SECRET_CATEGORIES = [
  'actionable_source_finding',
  'documentation_reference',
  'placeholder_or_example',
  'local_only_file',
  'generated_artifact',
  'dependency_or_lockfile',
  'ignored_binary',
  'unknown_requires_review'
];

export const RISK_PATTERNS = [
  { label: 'OPENAI_API_KEY', regex: /OPENAI_API_KEY/i },
  { label: 'SUPABASE_SERVICE_ROLE_KEY', regex: /SUPABASE_SERVICE_ROLE_KEY/i },
  { label: 'service_role', regex: /service_role/i },
  { label: 'access_token', regex: /access_token/i },
  { label: 'refresh_token', regex: /refresh_token/i },
  { label: 'client_secret', regex: /client_secret/i },
  { label: 'private_key', regex: /private_key/i },
  { label: 'webhook_secret', regex: /webhook_secret/i },
  { label: 'api_key', regex: /api_key/i },
  { label: 'bearer', regex: /bearer/i },
  { label: 'authorization', regex: /authorization/i },
  { label: 'GH_TOKEN', regex: /GH_TOKEN/i },
  { label: 'GITHUB_TOKEN', regex: /GITHUB_TOKEN/i },
  { label: 'SUPABASE_ACCESS_TOKEN', regex: /SUPABASE_ACCESS_TOKEN/i },
  { label: 'IMPORT_REDDIT_TIPS_SECRET', regex: /IMPORT_REDDIT_TIPS_SECRET/i },
  { label: 'NPM_TOKEN', regex: /NPM_TOKEN/i },
  { label: 'jwt_like', regex: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/ },
  { label: 'unknown_token_like', regex: /\b[A-Za-z0-9_-]{40,}\b/ }
];

const OPSTRUTH_SCANNER_FILES = new Set([
  'src/lib/redact.js',
  'src/lib/scan.js',
  'src/lib/probes.js',
  'test/typescript-compatibility.test.js',
  'cli/src/lib/redact.js',
  'cli/src/lib/scan.js',
  'cli/src/lib/probes.js',
  'cli/test/typescript-compatibility.test.js',
  'fixtures/risky-secret-app/src/config.js'
]);

const FIXTURE_PACKAGE_NAMES = new Set([
  'plain-node-app',
  'vite-react-app',
  'next-app',
  'tanstack-app',
  'cloudflare-worker-app',
  'supabase-app',
  'default-npm-placeholder-test',
  'failing-real-test-script',
  'risky-secret-app',
  'missing-build-script',
  'route-config-app'
]);

const LOCKFILE_NAMES = new Set(['package-lock.json', 'npm-shrinkwrap.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lock', 'bun.lockb']);
const GENERATED_PREFIXES = ['dist/', 'dist-ssr/', 'build/', '.next/', '.cache/', 'coverage/'];
const DEPENDENCY_PREFIXES = ['node_modules/'];

export function isLikelyText(file) {
  return /\.(js|mjs|cjs|ts|tsx|jsx|json|jsonc|toml|yml|yaml|md|txt|env|sql|html|css)$/i.test(file) || !path.extname(file);
}

function matchesAllowlist(file, line, { allowlistPaths = [], allowlistPatterns = [] } = {}) {
  if (allowlistPaths.some((item) => file === item || file.startsWith(item.replace(/\/$/, '') + '/'))) return true;
  return allowlistPatterns.some((pattern) => {
    try {
      return new RegExp(pattern).test(line) || new RegExp(pattern).test(file);
    } catch {
      return false;
    }
  });
}

function isDocumentationFile(file) {
  return file === 'README.md' || file.endsWith('/README.md') || file.startsWith('docs/') || file.startsWith('cli/docs/') || /\.md$/i.test(file);
}

function isGeneratedPath(file) {
  return GENERATED_PREFIXES.some((prefix) => file.startsWith(prefix));
}

function isDependencyPath(file) {
  return DEPENDENCY_PREFIXES.some((prefix) => file.startsWith(prefix));
}

function isLockfile(file) {
  return LOCKFILE_NAMES.has(path.basename(file));
}

function isEnvFile(file) {
  return path.basename(file).startsWith('.env');
}

const SECRET_ASSIGNMENT_RE = /\b(?:const\s+|let\s+|var\s+|export\s+)?(?:OPENAI_API_KEY|SUPABASE_SERVICE_ROLE_KEY|GH_TOKEN|GITHUB_TOKEN|SUPABASE_ACCESS_TOKEN|IMPORT_REDDIT_TIPS_SECRET|NPM_TOKEN|service_role|access_token|refresh_token|client_secret|private_key|webhook_secret|api_key|authorization|bearer)\b\s*[:=]\s*["']?([^"'\s;]+)/i;

function hasAssignment(line) {
  return SECRET_ASSIGNMENT_RE.test(line);
}

function assignedValue(line) {
  const match = line.match(SECRET_ASSIGNMENT_RE);
  return match?.[1] || '';
}

function isPlaceholderValue(line) {
  const value = assignedValue(line).trim();
  return /^(YOUR_[A-Z0-9_]+_HERE|__REDACTED_VALUE__|<[^>]*secret[^>]*>|example-only|\[REDACTED\]|REDACTED|\*{3,}|xxx+|placeholder)$/i.test(value);
}

function classifyKind(line) {
  if (hasAssignment(line)) return 'secret-like value';
  return 'secret reference';
}

export function classifySecretReference({ file, line = '', pattern = '', tracked = false, rootContext = 'source file' } = {}) {
  if (!isLikelyText(file)) {
    return { category: 'ignored_binary', severity: 'skipped', status: 'skipped', kind: 'ignored binary', context: 'binary file' };
  }
  if (isDependencyPath(file) || isLockfile(file)) {
    return { category: 'dependency_or_lockfile', severity: 'skipped', status: 'skipped', kind: 'ignored dependency/lockfile', context: 'dependency or lockfile' };
  }
  if (isGeneratedPath(file)) {
    return { category: 'generated_artifact', severity: 'skipped', status: 'skipped', kind: 'ignored generated artifact', context: 'generated artifact' };
  }
  if (isEnvFile(file) && !tracked) {
    return { category: 'local_only_file', severity: 'skipped', status: 'skipped', kind: 'local-only env file', context: 'local-only file' };
  }
  if (isPlaceholderValue(line)) {
    return { category: 'placeholder_or_example', severity: 'info', status: 'info', kind: 'placeholder/example', context: classifySourceContext(file, rootContext) };
  }
  if (pattern === 'unknown_token_like') {
    return { category: 'unknown_requires_review', severity: 'review', status: 'warn', kind: 'unknown token-like content', context: classifySourceContext(file, rootContext) };
  }
  if (isDocumentationFile(file) && !hasAssignment(line)) {
    return { category: 'documentation_reference', severity: 'info', status: 'info', kind: 'documentation reference', context: 'documentation reference' };
  }
  if (isEnvFile(file) && tracked) {
    return { category: 'actionable_source_finding', severity: 'review', status: 'warn', kind: classifyKind(line), context: 'tracked env file' };
  }
  return { category: 'actionable_source_finding', severity: 'review', status: 'warn', kind: classifyKind(line), context: classifySourceContext(file, rootContext) };
}

function classifySourceContext(file, rootContext = 'source file') {
  if (file.startsWith('fixtures/') || file.startsWith('cli/fixtures/')) return 'fixture/demo file';
  if (isDocumentationFile(file)) return 'documentation reference';
  return rootContext;
}

async function classifyRootContext(root) {
  const packageFile = path.join(root, 'package.json');
  if (!(await pathExists(packageFile))) return 'source file';
  try {
    const name = (await readJson(packageFile)).name;
    return FIXTURE_PACKAGE_NAMES.has(name) ? 'fixture/demo file' : 'source file';
  } catch {
    return 'source file';
  }
}

async function isOpstruthRoot(root) {
  const packageFile = path.join(root, 'package.json');
  const cliPackageFile = path.join(root, 'cli/package.json');
  try {
    if (await pathExists(packageFile)) {
      const name = (await readJson(packageFile)).name;
      if (name === 'opstruth' || name === 'opstruth-monorepo') return true;
    }
    if (await pathExists(cliPackageFile)) {
      return (await readJson(cliPackageFile)).name === 'opstruth';
    }
  } catch {
    return false;
  }
  return false;
}

async function trackedFiles(root) {
  try {
    const { stdout } = await execFileAsync('git', ['ls-files'], { cwd: root });
    return new Set(stdout.split(/\r?\n/).filter(Boolean).map((file) => file.replaceAll('\\', '/')));
  } catch {
    return new Set();
  }
}

function emptySummary() {
  return Object.fromEntries(SECRET_CATEGORIES.map((category) => [category, 0]));
}

function summaryText(summary) {
  return [
    `Actionable findings: ${summary.actionable_source_finding || 0}`,
    `Documentation references: ${summary.documentation_reference || 0}`,
    `Placeholders/examples: ${summary.placeholder_or_example || 0}`,
    `Local-only files: ${summary.local_only_file || 0}`,
    `Generated artifacts: ${summary.generated_artifact || 0}`,
    `Dependency/lockfile paths: ${summary.dependency_or_lockfile || 0}`,
    `Ignored binaries: ${summary.ignored_binary || 0}`,
    `Unknown requiring review: ${summary.unknown_requires_review || 0}`
  ].join('; ');
}

export function formatSecretSummary(summary = emptySummary()) {
  return summaryText(summary);
}

export async function scanRiskyReferencesDetailed(root, { skipDirs = DEFAULT_SKIP_DIRS, allowlistPaths = [], allowlistPatterns = [] } = {}) {
  const files = await walkFiles(root, { skipDirs: mergeIgnores(skipDirs) });
  const records = [];
  const findings = [];
  const summary = emptySummary();
  const suppressInternalScannerDefinitions = await isOpstruthRoot(root);
  const rootContext = await classifyRootContext(root);
  const tracked = await trackedFiles(root);

  function record(item) {
    summary[item.category] = (summary[item.category] || 0) + 1;
    records.push(item);
    if (item.status === 'warn' || item.status === 'fail') findings.push(item);
  }

  for (const file of files) {
    if (suppressInternalScannerDefinitions && OPSTRUTH_SCANNER_FILES.has(file.rel)) continue;
    const isTracked = tracked.has(file.rel);
    const pathOnly = classifySecretReference({ file: file.rel, line: '', tracked: isTracked, rootContext });
    if (pathOnly.category === 'ignored_binary' || pathOnly.category === 'dependency_or_lockfile' || pathOnly.category === 'generated_artifact') {
      record({ file: file.rel, line: null, pattern: 'path', match: 'path', preview: '', excerpt: '', ...pathOnly });
      continue;
    }
    if (pathOnly.category === 'local_only_file') {
      record({ file: file.rel, line: null, pattern: 'env_file', match: 'env_file', preview: '', excerpt: '', ...pathOnly });
      continue;
    }
    if (!isLikelyText(file.rel)) continue;
    let text = '';
    try {
      text = await readText(file.full);
    } catch {
      continue;
    }
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (matchesAllowlist(file.rel, line, { allowlistPaths, allowlistPatterns })) return;
      for (const matcher of RISK_PATTERNS) {
        if (matcher.regex.test(line)) {
          const classification = classifySecretReference({ file: file.rel, line, pattern: matcher.label, tracked: isTracked, rootContext });
          record({
            file: file.rel,
            line: index + 1,
            pattern: matcher.label,
            match: matcher.label,
            preview: redact(line.trim()).slice(0, 160),
            excerpt: redact(line.trim()).slice(0, 160),
            ...classification
          });
          break;
        }
      }
    });
  }
  return { findings, records, summary, summaryText: summaryText(summary) };
}

export async function scanRiskyReferences(root, options = {}) {
  return (await scanRiskyReferencesDetailed(root, options)).findings;
}
