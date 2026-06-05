#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const websiteRoot = path.join(repoRoot, 'website');

function hasCommand(command) {
  const result = spawnSync(command, ['--version'], { stdio: 'ignore' });
  return result.status === 0;
}

function run(command, args, cwd) {
  const pretty = [command, ...args].join(' ');
  const relativeCwd = path.relative(repoRoot, cwd) || '.';
  console.log('[build-website] ' + pretty + ' (' + relativeCwd + ')');
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

const manager = hasCommand('bun') ? 'bun' : 'npm';
console.log('[build-website] package manager: ' + manager);
run(manager, ['install'], websiteRoot);
run(manager, ['run', 'build'], websiteRoot);
run(process.execPath, [path.join('scripts', 'sync-website-dist.js')], repoRoot);
