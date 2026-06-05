import path from 'node:path';
import { pathExists, readJson, listPresent, walkFiles } from './fs.js';
import { mergeIgnores } from './boundary.js';

const IMPORTANT_FILES = [
  'package.json',
  'tsconfig.json',
  'vite.config.js',
  'vite.config.ts',
  'vite.config.mjs',
  'next.config.js',
  'next.config.mjs',
  'next.config.ts',
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  'eslint.config.ts',
  '.eslintrc',
  '.eslintrc.js',
  '.eslintrc.cjs',
  '.eslintrc.json',
  'vitest.config.js',
  'vitest.config.mjs',
  'vitest.config.ts',
  'playwright.config.js',
  'playwright.config.mjs',
  'playwright.config.ts',
  'pnpm-lock.yaml',
  'yarn.lock',
  'package-lock.json',
  'bun.lockb',
  'bun.lock',
  'wrangler.toml',
  'wrangler.json',
  'wrangler.jsonc',
  'Dockerfile',
  'docker-compose.yml',
  'docker-compose.yaml',
  'README.md',
  'AGENTS.md',
  '.github/workflows',
  'supabase',
  'supabase/migrations'
];

export async function detectPackageManager(root) {
  if (await pathExists(path.join(root, 'pnpm-lock.yaml'))) return 'pnpm';
  if (await pathExists(path.join(root, 'yarn.lock'))) return 'yarn';
  if (await pathExists(path.join(root, 'bun.lockb')) || await pathExists(path.join(root, 'bun.lock'))) return 'bun';
  if (await pathExists(path.join(root, 'package-lock.json'))) return 'npm';
  if (await pathExists(path.join(root, 'package.json'))) return 'npm';
  return null;
}

export async function detectPackageScripts(root) {
  const file = path.join(root, 'package.json');
  if (!(await pathExists(file))) return {};
  try { return (await readJson(file)).scripts || {}; } catch { return {}; }
}

async function hasSourceExtension(root, extensions) {
  const files = await walkFiles(root, { skipDirs: mergeIgnores(), maxFiles: 1000 });
  return files.some((file) => extensions.some((extension) => file.rel.endsWith(extension)));
}

export async function detectStack(root) {
  const packageFile = path.join(root, 'package.json');
  let pkg = {};
  if (await pathExists(packageFile)) {
    try { pkg = await readJson(packageFile); } catch { pkg = {}; }
  }
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const files = await listPresent(root, IMPORTANT_FILES);
  const hasTsSource = await hasSourceExtension(root, ['.ts', '.tsx']);
  const isTypeScript = Boolean(files.includes('tsconfig.json') || deps.typescript || hasTsSource || files.includes('vite.config.ts') || files.includes('next.config.ts'));
  const isEsm = pkg.type === 'module' || files.some((file) => file.endsWith('.mjs'));
  const config = {
    typescript: files.filter((file) => file === 'tsconfig.json'),
    vite: files.filter((file) => file.startsWith('vite.config')),
    next: files.filter((file) => file.startsWith('next.config')),
    eslint: files.filter((file) => file.includes('eslint')),
    vitest: files.filter((file) => file.startsWith('vitest.config')),
    playwright: files.filter((file) => file.startsWith('playwright.config')),
    lockfiles: files.filter((file) => ['pnpm-lock.yaml', 'yarn.lock', 'package-lock.json', 'bun.lockb', 'bun.lock'].includes(file))
  };
  const platforms = [];
  if (isTypeScript) platforms.push('TypeScript');
  if (deps.react) platforms.push('React');
  if (deps.vite || config.vite.length) platforms.push('Vite');
  if (deps.next || config.next.length) platforms.push('Next.js');
  if (isEsm) platforms.push('Node ESM');
  if (files.some((file) => file.startsWith('wrangler'))) platforms.push('Cloudflare');
  if (files.includes('supabase') || files.includes('supabase/migrations')) platforms.push('Supabase');
  if (files.some((file) => file.toLowerCase().includes('docker'))) platforms.push('Docker');
  if (files.includes('.github/workflows')) platforms.push('GitHub Actions');
  return {
    packageName: pkg.name || null,
    packageManager: await detectPackageManager(root),
    scripts: pkg.scripts || {},
    files,
    platforms,
    language: isTypeScript ? 'TypeScript' : 'JavaScript',
    isTypeScript,
    isEsm,
    config,
    dependencies: Object.keys(deps).sort()
  };
}

export async function hasSupabase(root) { return pathExists(path.join(root, 'supabase')); }
export async function hasCloudflare(root) { return (await pathExists(path.join(root, 'wrangler.toml'))) || (await pathExists(path.join(root, 'wrangler.json'))) || (await pathExists(path.join(root, 'wrangler.jsonc'))); }
