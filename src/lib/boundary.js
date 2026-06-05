import path from 'node:path';
import { runCommand } from './exec.js';

export const DEFAULT_IGNORED_DIRS = [
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  'coverage',
  '.cache',
  '.config',
  '.local',
  '.npm',
  '.pnpm-store',
  '.yarn',
  '.bun',
  '.vscode-server',
  '.cursor',
  '.agents',
  'Downloads',
  'Desktop',
  'Documents',
  'Pictures',
  'Videos',
  'Music',
  'evidence'
];

export const DEFAULT_BINARY_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ico',
  '.pdf',
  '.zip',
  '.gz',
  '.tgz',
  '.br',
  '.sqlite',
  '.db',
  '.wasm',
  '.lockb'
];

export async function resolveProjectBoundary(cwd = process.cwd()) {
  const git = await runCommand('git', ['rev-parse', '--show-toplevel'], { cwd, timeoutMs: 10000 });
  if (git.exitCode === 0 && git.stdout.trim()) {
    return {
      cwd,
      root: git.stdout.trim(),
      gitRoot: git.stdout.trim(),
      isGitRepo: true,
      message: ''
    };
  }
  return {
    cwd,
    root: cwd,
    gitRoot: null,
    isGitRepo: false,
    message: 'No git repository detected. opstruth is scanning the current directory with safety ignores. For best results, run inside a project repo.'
  };
}

export function mergeIgnores(extra = []) {
  return [...new Set([...DEFAULT_IGNORED_DIRS, ...(extra || [])])];
}

export function isIgnoredExtension(file) {
  return DEFAULT_BINARY_EXTENSIONS.includes(path.extname(file).toLowerCase());
}
