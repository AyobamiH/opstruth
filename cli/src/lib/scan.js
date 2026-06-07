import path from 'node:path';
import { walkFiles, readText, readJson, pathExists } from './fs.js';
import { redact } from './redact.js';
import { mergeIgnores } from './boundary.js';

export const DEFAULT_SKIP_DIRS = mergeIgnores();
export const RISK_PATTERNS = [/OPENAI_API_KEY/i, /SUPABASE_SERVICE_ROLE_KEY/i, /service_role/i, /access_token/i, /refresh_token/i, /client_secret/i, /private_key/i, /webhook_secret/i, /api_key/i, /bearer/i, /authorization/i];
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

export function isLikelyText(file) { return /\.(js|mjs|cjs|ts|tsx|jsx|json|jsonc|toml|yml|yaml|md|txt|env|sql|html|css)$/i.test(file) || !path.extname(file); }

function matchesAllowlist(file, line, { allowlistPaths = [], allowlistPatterns = [] } = {}) {
  if (allowlistPaths.some((item) => file === item || file.startsWith(item.replace(/\/$/, '') + '/'))) return true;
  return allowlistPatterns.some((pattern) => {
    try { return new RegExp(pattern).test(line) || new RegExp(pattern).test(file); } catch { return false; }
  });
}

function classifySecretLine(line) {
  if (/[=:]\s*["']?[^"'\s;]+/.test(line)) return 'secret-like value';
  return 'secret reference';
}

function classifySourceContext(file, rootContext = 'source file') {
  if (file.startsWith('fixtures/') || file.startsWith('cli/fixtures/')) return 'fixture/demo file';
  if (file.startsWith('docs/') || file.startsWith('cli/docs/')) return 'documentation reference';
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

export async function scanRiskyReferences(root, { skipDirs = DEFAULT_SKIP_DIRS, allowlistPaths = [], allowlistPatterns = [] } = {}) {
  const files = await walkFiles(root, { skipDirs: mergeIgnores(skipDirs) });
  const findings = [];
  const suppressInternalScannerDefinitions = await isOpstruthRoot(root);
  const rootContext = await classifyRootContext(root);
  for (const file of files) {
    if (suppressInternalScannerDefinitions && OPSTRUTH_SCANNER_FILES.has(file.rel)) continue;
    if (!isLikelyText(file.rel)) continue;
    if (path.basename(file.rel).startsWith('.env')) continue;
    let text = '';
    try { text = await readText(file.full); } catch { continue; }
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (matchesAllowlist(file.rel, line, { allowlistPaths, allowlistPatterns })) return;
      for (const pattern of RISK_PATTERNS) {
        if (pattern.test(line)) {
          findings.push({
            file: file.rel,
            line: index + 1,
            pattern: pattern.source.replaceAll('\\', ''),
            match: pattern.source.replaceAll('\\', ''),
            kind: classifySecretLine(line),
            context: classifySourceContext(file.rel, rootContext),
            preview: redact(line.trim()).slice(0, 160),
            excerpt: redact(line.trim()).slice(0, 160),
            severity: 'review'
          });
          break;
        }
      }
    });
  }
  return findings;
}
