import path from 'node:path';
import { pathExists } from './fs.js';
import { isDefaultPlaceholderTestScript } from '../commands/quality.js';

function fileDetector(file) {
  return async (root) => pathExists(path.join(root, file));
}

function nodeDependencyDetector(name) {
  return async (_root, stack) => stack.dependencies?.includes(name);
}

const RAW_PROBE_CATALOGUE = [
  {
    id: 'git.status',
    name: 'Git status',
    area: 'repo',
    stack: 'git',
    description: 'Records the git branch, latest commit, dirty file count, and changed-file list from the resolved project boundary.',
    detector: async (_root, stack, boundary) => boundary.isGitRepo,
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    command: 'git status --short',
    evidenceCollected: ['cwd', 'git root', 'branch', 'latest commit', 'dirty file count'],
    proves: 'The working tree state visible to git.',
    doesNotProve: 'Whether changes are deployed or correct.',
    nextSafeStep: 'Review changed files before trusting the result.'
  },
  {
    id: 'git.diff_check',
    name: 'Git diff whitespace check',
    area: 'quality',
    stack: 'git',
    description: 'Runs `git diff --check` to catch whitespace errors and unresolved conflict markers in staged and unstaged changes.',
    detector: async (_root, _stack, boundary) => boundary.isGitRepo,
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    command: 'git diff --check',
    evidenceCollected: ['command', 'exit code', 'duration', 'excerpt'],
    proves: 'Git did not report diff-check errors.',
    doesNotProve: 'Application correctness.',
    nextSafeStep: 'Fix reported diff issues and rerun.'
  },
  {
    id: 'git.diff_stat',
    name: 'Git diff stat',
    area: 'repo',
    stack: 'git',
    description: 'Records a compact `git diff --stat` summary so reviewers can see which files moved without reading the full diff.',
    detector: async (_root, _stack, boundary) => boundary.isGitRepo,
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    command: 'git diff --stat',
    evidenceCollected: ['diff stat'],
    proves: 'A high-level changed-file summary.',
    doesNotProve: 'Semantic impact.',
    nextSafeStep: 'Inspect the files with the largest movement.'
  },
  {
    id: 'git.log',
    name: 'Git log',
    area: 'repo',
    stack: 'git',
    description: 'Captures the latest commit and recent commit context.',
    detector: async (_root, _stack, boundary) => boundary.isGitRepo,
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    command: 'git log --oneline -5',
    evidenceCollected: ['latest commit', 'recent commits'],
    proves: 'Recent repository commit context.',
    doesNotProve: 'Remote or CI state.',
    nextSafeStep: 'Compare with PR or CI evidence when needed.'
  },
  {
    id: 'git.merge_conflicts',
    name: 'Merge conflict marker scan',
    area: 'repo',
    stack: 'git',
    description: 'Scans text files inside the project boundary for unresolved merge conflict markers without reading ignored cache/build folders.',
    detector: async () => true,
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    staticCheck: true,
    evidenceCollected: ['file', 'line', 'marker preview'],
    proves: 'No obvious conflict markers were found in scanned text files.',
    doesNotProve: 'All generated/binary content is clean.',
    nextSafeStep: 'Resolve markers and rerun.'
  },
  {
    id: 'node.package_manager',
    name: 'Package manager detection',
    area: 'node',
    stack: 'node',
    description: 'Detects npm, pnpm, yarn, or bun from lockfiles/package.json.',
    detector: fileDetector('package.json'),
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    staticCheck: true,
    evidenceCollected: ['package manager', 'lockfiles'],
    proves: 'Which package command opstruth should use for read-only quality scripts.',
    doesNotProve: 'Dependency health or install reproducibility.',
    nextSafeStep: 'Keep lockfiles consistent with the chosen package manager.'
  },
  {
    id: 'node.tsconfig',
    name: 'TypeScript config detection',
    area: 'node',
    stack: 'typescript',
    description: 'Detects TypeScript through tsconfig, dependencies, source, and config files.',
    detector: async (_root, stack) => stack.isTypeScript,
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    staticCheck: true,
    evidenceCollected: ['tsconfig', 'TypeScript dependency', 'TS source presence'],
    proves: 'The repo has TypeScript indicators inside the project boundary.',
    doesNotProve: 'Types are valid unless typecheck runs.',
    nextSafeStep: 'Run the typecheck script when available.'
  },
  {
    id: 'node.vite',
    name: 'Vite detection',
    area: 'node',
    stack: 'vite',
    description: 'Detects Vite configuration or dependency.',
    detector: async (_root, stack) => stack.platforms?.includes('Vite'),
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    staticCheck: true,
    evidenceCollected: ['vite config', 'vite dependency'],
    proves: 'Vite appears relevant to this project.',
    doesNotProve: 'The Vite app builds or serves.',
    nextSafeStep: 'Run build/test scripts when present.'
  },
  {
    id: 'node.next',
    name: 'Next.js detection',
    area: 'node',
    stack: 'next',
    description: 'Detects Next.js configuration or dependency.',
    detector: async (_root, stack) => stack.platforms?.includes('Next.js'),
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    staticCheck: true,
    evidenceCollected: ['next config', 'next dependency'],
    proves: 'Next.js appears relevant to this project.',
    doesNotProve: 'Runtime routes or deployment status.',
    nextSafeStep: 'Run build and configured route probes when available.'
  },
  {
    id: 'node.react',
    name: 'React detection',
    area: 'node',
    stack: 'react',
    description: 'Detects React dependency.',
    detector: nodeDependencyDetector('react'),
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    staticCheck: true,
    evidenceCollected: ['React dependency'],
    proves: 'React appears in project dependencies.',
    doesNotProve: 'Rendered UI behavior.',
    nextSafeStep: 'Run component or browser tests if available.'
  },
  {
    id: 'node.eslint',
    name: 'ESLint config detection',
    area: 'quality',
    stack: 'eslint',
    description: 'Detects ESLint config and lint script availability.',
    detector: async (_root, stack) => Boolean(stack.config?.eslint?.length || stack.scripts?.lint),
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    staticCheck: true,
    evidenceCollected: ['ESLint config', 'lint script'],
    proves: 'Lint checks may be available.',
    doesNotProve: 'Lint is passing unless the script runs.',
    nextSafeStep: 'Run npm/pnpm/yarn/bun lint through opstruth quality.'
  },
  {
    id: 'node.vitest',
    name: 'Vitest config detection',
    area: 'quality',
    stack: 'vitest',
    description: 'Detects Vitest config or dependency.',
    detector: async (_root, stack) => Boolean(stack.config?.vitest?.length || stack.dependencies?.includes('vitest')),
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    staticCheck: true,
    evidenceCollected: ['Vitest config', 'vitest dependency'],
    proves: 'Vitest may be available.',
    doesNotProve: 'Tests are passing unless the script runs.',
    nextSafeStep: 'Run the test script through opstruth quality.'
  },
  {
    id: 'node.playwright',
    name: 'Playwright config detection',
    area: 'quality',
    stack: 'playwright',
    description: 'Detects Playwright config or dependency.',
    detector: async (_root, stack) => Boolean(stack.config?.playwright?.length || stack.dependencies?.includes('@playwright/test')),
    safetyLevel: 'safe_readonly',
    defaultMode: 'optional',
    staticCheck: true,
    evidenceCollected: ['Playwright config', 'Playwright dependency'],
    proves: 'Browser tests may be available.',
    doesNotProve: 'Browser behavior unless tests are run explicitly.',
    nextSafeStep: 'Run browser tests separately when they are safe for the environment.'
  },
  {
    id: 'quality.typecheck',
    name: 'Typecheck script',
    area: 'quality',
    stack: 'node',
    description: 'Runs the existing package `typecheck` script only when package.json exposes it; missing scripts are skipped, not failed.',
    detector: async (_root, stack) => Boolean(stack.scripts?.typecheck),
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    command: '<package-manager> run typecheck',
    evidenceCollected: ['command', 'exit code', 'duration', 'short excerpt'],
    proves: 'Configured typecheck command exits successfully.',
    doesNotProve: 'Runtime correctness.',
    nextSafeStep: 'Fix type errors and rerun.'
  },
  {
    id: 'quality.lint',
    name: 'Lint script',
    area: 'quality',
    stack: 'node',
    description: 'Runs the existing package `lint` script only when package.json exposes it; opstruth does not invent lint commands.',
    detector: async (_root, stack) => Boolean(stack.scripts?.lint),
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    command: '<package-manager> run lint',
    evidenceCollected: ['command', 'exit code', 'duration', 'short excerpt'],
    proves: 'Configured lint command exits successfully.',
    doesNotProve: 'Production behavior.',
    nextSafeStep: 'Fix lint failures and rerun.'
  },
  {
    id: 'quality.test',
    name: 'Test script',
    area: 'quality',
    stack: 'node',
    description: 'Runs the existing package `test` script only when package.json exposes a real test command; npm placeholder scripts are skipped, not failed.',
    detector: async (_root, stack) => Boolean(stack.scripts?.test && !isDefaultPlaceholderTestScript(stack.scripts.test)),
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    command: '<package-manager> run test',
    evidenceCollected: ['command', 'exit code', 'duration', 'short excerpt'],
    proves: 'Configured test command exits successfully.',
    doesNotProve: 'Untested behavior or production state.',
    nextSafeStep: 'Fix failing tests and rerun.'
  },
  {
    id: 'quality.build',
    name: 'Build script',
    area: 'quality',
    stack: 'node',
    description: 'Runs the existing package `build` script only when package.json exposes it; this proves local build command success, not deployment.',
    detector: async (_root, stack) => Boolean(stack.scripts?.build),
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    command: '<package-manager> run build',
    evidenceCollected: ['command', 'exit code', 'duration', 'short excerpt'],
    proves: 'Configured build command exits successfully.',
    doesNotProve: 'Deployment success.',
    nextSafeStep: 'Fix build failures and rerun.'
  },
  {
    id: 'quality.ci',
    name: 'CI script',
    area: 'quality',
    stack: 'node',
    description: 'Runs the existing package `ci` script only when package.json exposes it; this is optional because local CI scripts may be slower.',
    detector: async (_root, stack) => Boolean(stack.scripts?.ci),
    safetyLevel: 'safe_readonly',
    defaultMode: 'optional',
    command: '<package-manager> run ci',
    evidenceCollected: ['command', 'exit code', 'duration', 'short excerpt'],
    proves: 'Configured local CI command exits successfully.',
    doesNotProve: 'Remote CI status.',
    nextSafeStep: 'Compare with hosted CI when shipping.'
  },
  {
    id: 'routes.head_root',
    name: 'HEAD /',
    area: 'routes',
    stack: 'http',
    description: 'Sends a read-only HEAD request to the configured base URL root and records status, latency, redirects, and required security headers.',
    detector: async (_root, _stack, _boundary, options) => Boolean(options.baseUrl || options.routesFile),
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    command: 'HEAD /',
    evidenceCollected: ['URL', 'method', 'status', 'latency', 'headers', 'redirect'],
    proves: 'The configured route responded at probe time.',
    doesNotProve: 'All routes or authenticated flows.',
    nextSafeStep: 'Add important paths to opstruth.config.json.'
  },
  {
    id: 'routes.health',
    name: 'GET /health',
    area: 'routes',
    stack: 'http',
    description: 'Sends a read-only GET request to configured health-style paths and records status and latency without authenticating or mutating state.',
    detector: async (_root, _stack, _boundary, options) => Boolean(options.baseUrl || options.routesFile),
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    command: 'GET /health',
    evidenceCollected: ['URL', 'method', 'status', 'latency'],
    proves: 'The configured health endpoint responded at probe time.',
    doesNotProve: 'Deep dependency health unless the app reports it.',
    nextSafeStep: 'Expose a read-only health endpoint if useful.'
  },
  {
    id: 'local.ports',
    name: 'Listening port checks',
    area: 'local',
    stack: 'runtime',
    description: 'Checks only explicitly provided local ports with listening-port inspection; it does not start, restart, or kill processes.',
    detector: async (_root, _stack, _boundary, options) => Boolean(options.port?.length),
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    command: 'ss -ltnp',
    evidenceCollected: ['port', 'probe type', 'result'],
    proves: 'A configured local port appears to be listening.',
    doesNotProve: 'Application correctness.',
    nextSafeStep: 'Add a health path for stronger local runtime evidence.'
  },
  {
    id: 'local.health',
    name: 'Local health endpoint checks',
    area: 'local',
    stack: 'runtime',
    description: 'Checks only explicitly provided local health URLs on 127.0.0.1 and records HTTP status, latency, and probe result.',
    detector: async (_root, _stack, _boundary, options) => Boolean(options.port?.length && options.health),
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    command: 'GET http://127.0.0.1:<port>/<health>',
    evidenceCollected: ['port', 'health URL', 'status', 'latency'],
    proves: 'The configured local health endpoint responded.',
    doesNotProve: 'Production health.',
    nextSafeStep: 'Run against the runtime that matters.'
  },
  {
    id: 'secrets.patterns',
    name: 'Secret pattern scan',
    area: 'secrets',
    stack: 'all',
    description: 'Scans project text files for risky secret, token, bearer, service-role, and authorization references with redacted previews.',
    detector: async () => true,
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    staticCheck: true,
    evidenceCollected: ['file', 'line', 'pattern', 'redacted preview'],
    proves: 'No configured risky patterns appeared in scanned text files.',
    doesNotProve: 'Absence of all secrets.',
    nextSafeStep: 'Review findings and move real secrets to secret storage.'
  },
  {
    id: 'supabase.migrations',
    name: 'Supabase migrations detection',
    area: 'supabase',
    stack: 'supabase',
    description: 'Detects Supabase migration files and records static RLS, policy, protected-table, and security-definer heuristics without connecting to a database.',
    detector: fileDetector('supabase/migrations'),
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    staticCheck: true,
    evidenceCollected: ['migration files', 'RLS/policy/security-definer heuristics'],
    proves: 'Supabase migrations exist and static heuristics were inspected.',
    doesNotProve: 'Database runtime policy state.',
    nextSafeStep: 'Review migrations and verify database state separately.'
  },
  {
    id: 'cloudflare.wrangler',
    name: 'Wrangler config detection',
    area: 'cloudflare',
    stack: 'cloudflare',
    description: 'Detects Wrangler configuration files and records declared Worker entry, compatibility date, routes, and deploy-script references. Does not prove the Worker is currently deployed unless route checks are configured.',
    detector: async (root) => (await fileDetector('wrangler.toml')(root)) || (await fileDetector('wrangler.json')(root)) || (await fileDetector('wrangler.jsonc')(root)),
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    staticCheck: true,
    evidenceCollected: ['wrangler config', 'compatibility date', 'route declarations', 'secret names only'],
    proves: 'Cloudflare configuration is present.',
    doesNotProve: 'Deployed Worker/Pages state.',
    nextSafeStep: 'Verify deployed routes separately.'
  },
  {
    id: 'docker.compose',
    name: 'Docker Compose detection',
    area: 'docker',
    stack: 'docker',
    description: 'Detects docker-compose files and service names without starting containers.',
    detector: async (root) => (await fileDetector('docker-compose.yml')(root)) || (await fileDetector('docker-compose.yaml')(root)),
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    staticCheck: true,
    evidenceCollected: ['compose file', 'service names'],
    proves: 'Compose configuration exists.',
    doesNotProve: 'Containers are running or healthy.',
    nextSafeStep: 'Run explicit local runtime probes for running containers.'
  },
  {
    id: 'docker.dockerfile',
    name: 'Dockerfile detection',
    area: 'docker',
    stack: 'docker',
    description: 'Detects Dockerfile presence.',
    detector: fileDetector('Dockerfile'),
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    staticCheck: true,
    evidenceCollected: ['Dockerfile path'],
    proves: 'A Docker build recipe exists.',
    doesNotProve: 'Image builds or runs.',
    nextSafeStep: 'Run build checks outside opstruth when appropriate.'
  },
  {
    id: 'github.workflows',
    name: 'GitHub Actions workflow detection',
    area: 'github',
    stack: 'github-actions',
    description: 'Detects GitHub Actions workflow files and records CI/deploy workflow heuristics plus secret-reference patterns without calling GitHub.',
    detector: fileDetector('.github/workflows'),
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    staticCheck: true,
    evidenceCollected: ['workflow files', 'deploy heuristic', 'secret references'],
    proves: 'Workflow files exist and static heuristics were inspected.',
    doesNotProve: 'Remote CI status.',
    nextSafeStep: 'Check hosted CI for authoritative status.'
  },
  {
    id: 'hosting.vercel',
    name: 'Vercel config detection',
    area: 'hosting',
    stack: 'vercel',
    description: 'Detects `vercel.json` hosting configuration and records that Vercel may be relevant; it does not call Vercel or prove deployment state.',
    detector: fileDetector('vercel.json'),
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    staticCheck: true,
    evidenceCollected: ['vercel.json'],
    proves: 'Vercel configuration exists.',
    doesNotProve: 'Deployment status.',
    nextSafeStep: 'Verify the deployed URL separately.'
  },
  {
    id: 'hosting.netlify',
    name: 'Netlify config detection',
    area: 'hosting',
    stack: 'netlify',
    description: 'Detects `netlify.toml` hosting configuration and records that Netlify may be relevant; it does not call Netlify or prove deployment state.',
    detector: fileDetector('netlify.toml'),
    safetyLevel: 'safe_readonly',
    defaultMode: 'automatic',
    staticCheck: true,
    evidenceCollected: ['netlify.toml'],
    proves: 'Netlify configuration exists.',
    doesNotProve: 'Deployment status.',
    nextSafeStep: 'Verify the deployed URL separately.'
  }
];

function inputsRequiredFor(probe) {
  if (probe.id.startsWith('routes.')) return ['--base-url or route config'];
  if (probe.id === 'local.ports') return ['--port or local config'];
  if (probe.id === 'local.health') return ['--port and --health or local config'];
  if (probe.id === 'supabase.migrations') return ['supabase/migrations directory'];
  if (probe.id === 'cloudflare.wrangler') return ['wrangler.toml, wrangler.json, or wrangler.jsonc'];
  if (probe.id.startsWith('quality.')) return ['matching package.json script'];
  if (probe.id.startsWith('node.')) return ['matching package metadata/config/source'];
  if (probe.id.startsWith('git.')) return ['git repository'];
  return [];
}

function skipReasonFor(probe) {
  if (probe.id.startsWith('routes.')) return 'Requires --base-url, --routes, or opstruth.config.json route entries';
  if (probe.id === 'local.ports') return 'Requires --port or opstruth.config.json local ports';
  if (probe.id === 'local.health') return 'Requires --port with --health or opstruth.config.json local health paths';
  if (probe.id === 'supabase.migrations') return 'Requires a Supabase migrations directory';
  if (probe.id === 'cloudflare.wrangler') return 'Requires Wrangler configuration';
  if (probe.id.startsWith('quality.')) return 'Requires a matching non-placeholder package.json script';
  if (probe.id.startsWith('git.')) return 'Requires a git repository';
  return 'Not relevant to detected stack or missing configuration';
}

function normalizeProbe(probe) {
  const inputsRequired = probe.inputsRequired || inputsRequiredFor(probe);
  return {
    ...probe,
    mode: probe.mode || probe.defaultMode,
    mutability: probe.mutability || 'none',
    inputsRequired,
    evidenceExpectation: probe.evidenceExpectation || probe.evidenceCollected || [],
    skipReason: probe.skipReason || skipReasonFor(probe),
    proofLimitation: probe.proofLimitation || probe.doesNotProve,
    supportedStacks: probe.supportedStacks || [probe.stack],
    notVerified: probe.notVerified || [probe.doesNotProve],
    falsePositiveRisk: probe.falsePositiveRisk || 'Low to medium; depends on project conventions and fixture/demo content.',
    falseNegativeRisk: probe.falseNegativeRisk || 'Does not prove absence outside scanned files, configured inputs, or supported stack heuristics.'
  };
}

export const PROBE_CATALOGUE = RAW_PROBE_CATALOGUE.map(normalizeProbe);

export async function selectProbes({ root, stack, boundary, options = {} }) {
  const only = new Set(options.only || []);
  const skip = new Set(options.skip || []);
  const selected = [];
  const skipped = [];
  for (const probe of PROBE_CATALOGUE) {
    if (only.size && !only.has(probe.id) && !only.has(probe.area) && !only.has(probe.stack)) {
      skipped.push({ ...probe, reason: 'Skipped by --only filter' });
      continue;
    }
    if (skip.has(probe.id) || skip.has(probe.area) || skip.has(probe.stack)) {
      skipped.push({ ...probe, reason: 'Skipped by user request' });
      continue;
    }
    if (probe.safetyLevel !== 'safe_readonly' || probe.defaultMode === 'manual_only') {
      skipped.push({ ...probe, reason: 'Requires explicit approval or manual execution' });
      continue;
    }
    const relevant = await probe.detector(root, stack, boundary, options);
    if (relevant) selected.push(probe);
    else skipped.push({ ...probe, reason: probe.skipReason || 'Not relevant to detected stack or missing configuration' });
  }
  return { selected, skipped, catalogueSize: PROBE_CATALOGUE.length };
}
