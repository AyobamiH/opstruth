import { runCommand } from './exec.js';

export async function git(args, cwd) { return runCommand('git', args, { cwd, timeoutMs: 30000 }); }
export async function gitText(args, cwd) {
  const result = await git(args, cwd);
  return result.exitCode === 0 ? result.stdout.trim() : '';
}
export async function getGitInfo(cwd) {
  const root = await gitText(['rev-parse', '--show-toplevel'], cwd);
  const workingRoot = root || cwd;
  const [branch, latestCommit, status, diffStat, recentCommits] = await Promise.all([
    gitText(['branch', '--show-current'], workingRoot),
    gitText(['log', '-1', '--pretty=%h %s'], workingRoot),
    gitText(['status', '--short'], workingRoot),
    gitText(['diff', '--stat'], workingRoot),
    gitText(['log', '--oneline', '-5'], workingRoot)
  ]);
  return {
    root: root || null,
    branch: branch || null,
    latestCommit: latestCommit || null,
    dirtyFiles: status ? status.split(/\r?\n/).filter(Boolean) : [],
    changedFiles: status ? status.split(/\r?\n/).map((line) => line.slice(3).trim()).filter(Boolean) : [],
    diffStat: diffStat || '',
    recentCommits: recentCommits ? recentCommits.split(/\r?\n/).filter(Boolean) : []
  };
}
