#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const websiteDist = path.join(repoRoot, 'website', 'dist');
const websiteClient = path.join(websiteDist, 'client');
const websiteServer = path.join(websiteDist, 'server');
const rootDist = path.join(repoRoot, 'dist');
const rootClient = path.join(rootDist, 'client');
const rootServer = path.join(rootDist, 'server');

function relative(target) {
  return path.relative(repoRoot, target) || '.';
}

function fail(message) {
  console.error('[sync-website-dist] ' + message);
  process.exit(1);
}

if (!fs.existsSync(websiteClient)) {
  fail(relative(websiteClient) + ' does not exist. Run the website build before syncing.');
}

fs.rmSync(rootDist, { recursive: true, force: true });
fs.mkdirSync(rootDist, { recursive: true });

fs.cpSync(websiteClient, rootClient, { recursive: true });
console.log('[sync-website-dist] copied ' + relative(websiteClient) + ' -> ' + relative(rootClient));

if (fs.existsSync(websiteServer)) {
  fs.cpSync(websiteServer, rootServer, { recursive: true });
  console.log('[sync-website-dist] copied ' + relative(websiteServer) + ' -> ' + relative(rootServer));
} else {
  console.log('[sync-website-dist] website/dist/server not found; synced client output only.');
}

console.log('[sync-website-dist] root dist is ready for deployment checks.');
