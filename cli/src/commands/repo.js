import { createResult, finalizeStatus } from '../lib/result.js';
import { getGitInfo } from '../lib/git.js';
import { detectStack } from '../lib/detect.js';
import { resolveProjectBoundary } from '../lib/boundary.js';

export async function runRepo({ cwd = process.cwd(), strict = false } = {}) {
  const boundary = await resolveProjectBoundary(cwd);
  const git = await getGitInfo(boundary.root);
  const root = boundary.root;
  const stack = await detectStack(root);
  const detected = [
    'Project language detected: ' + stack.language,
    'Node module mode detected: ' + (stack.isEsm ? 'ESM' : 'not declared ESM'),
    'Package manager detected: ' + (stack.packageManager || 'none'),
    'Platforms detected: ' + (stack.platforms.length ? stack.platforms.join(', ') : 'none')
  ];
  if (stack.isTypeScript) detected.push('TypeScript project detected via tsconfig, TypeScript dependency, .ts/.tsx source, or TS config files');
  const configNotes = Object.entries(stack.config)
    .filter(([, values]) => values.length)
    .map(([name, values]) => `${name} config/files: ${values.join(', ')}`);
  const result = createResult('repo', 'pass', {
    summary: 'Read-only repository inspection completed. ' + detected.join(' | '),
    verified: ['Current working directory inspected: ' + cwd, 'Git root checked: ' + (git.root || 'not a git repository'), 'Important repo files checked', ...detected, ...configNotes],
    warnings: git.root ? [] : [boundary.message],
    checks: [{ name: 'repo inspection', status: 'pass' }, { name: 'typescript project detection', status: stack.isTypeScript ? 'pass' : 'not_verified', message: stack.isTypeScript ? 'TypeScript-based project' : 'No TypeScript indicators detected' }],
    data: { cwd, projectRoot: root, gitRoot: git.root, branch: git.branch, latestCommit: git.latestCommit, dirtyFiles: git.dirtyFiles, changedFiles: git.changedFiles, diffStat: git.diffStat, recentCommits: git.recentCommits, packageManager: stack.packageManager, scripts: stack.scripts, importantFiles: stack.files, platforms: stack.platforms, language: stack.language, isTypeScript: stack.isTypeScript, isEsm: stack.isEsm, config: stack.config },
    nextSafeStep: 'Review dirty files and run opstruth quality before trusting the change.'
  });
  return finalizeStatus(result, { strict });
}
