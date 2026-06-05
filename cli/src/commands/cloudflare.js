import path from 'node:path';
import { createResult, finalizeStatus } from '../lib/result.js';
import { readWranglerConfig } from '../lib/config.js';
import { detectPackageScripts } from '../lib/detect.js';
import { pathExists, walkFiles, readText } from '../lib/fs.js';
import { probeUrl } from '../lib/http.js';

function extractTomlValue(text, key) {
  const line = text.split(/\r?\n/).find((item) => item.trim().startsWith(key + ' =') || item.trim().startsWith(key + '='));
  if (!line) return null;
  return line.split('=').slice(1).join('=').trim().replace(/^['"]|['"]$/g, '') || null;
}
export async function runCloudflare({ cwd = process.cwd(), url, strict = false } = {}) {
  const wrangler = await readWranglerConfig(cwd);
  const scripts = await detectPackageScripts(cwd);
  const warnings = [];
  const verified = [];
  const data = { configFile: wrangler?.file || null, workerName: null, main: null, compatibilityDate: null, routes: [], vars: [], deployScripts: [], workflows: [] };
  if (!wrangler) warnings.push('No wrangler config found');
  else {
    verified.push('Cloudflare config detected: ' + wrangler.file);
    if (wrangler.data) {
      data.workerName = wrangler.data.name || null;
      data.main = wrangler.data.main || null;
      data.compatibilityDate = wrangler.data.compatibility_date || null;
      data.routes = wrangler.data.routes || [];
      data.vars = Object.keys(wrangler.data.vars || {});
    } else {
      data.workerName = extractTomlValue(wrangler.text, 'name');
      data.main = extractTomlValue(wrangler.text, 'main');
      data.compatibilityDate = extractTomlValue(wrangler.text, 'compatibility_date');
      data.vars = [...wrangler.text.matchAll(/^\s*([A-Z0-9_]+)\s*=/gm)].map((match) => match[1]);
      data.routes = [...wrangler.text.matchAll(/route\s*=\s*["']([^"']+)/g)].map((match) => match[1]);
    }
  }
  for (const [name, script] of Object.entries(scripts)) if (/wrangler\s+deploy/.test(script)) data.deployScripts.push(name);
  const workflowRoot = path.join(cwd, '.github/workflows');
  if (await pathExists(workflowRoot)) {
    for (const file of await walkFiles(workflowRoot)) {
      const text = await readText(file.full);
      if (/wrangler|cloudflare/i.test(text)) data.workflows.push(file.rel);
    }
  }
  const checks = [{ name: 'cloudflare config inspection', status: wrangler ? 'pass' : 'warn' }];
  if (url) {
    const probe = await probeUrl(url, { method: 'HEAD' });
    checks.push({ name: 'cloudflare optional route probe', status: probe.status ? 'pass' : 'fail', message: `${url} status=${probe.status || probe.error}`, data: probe });
    if (!probe.status) warnings.push('Optional Cloudflare route probe failed');
  }
  return finalizeStatus(createResult('cloudflare', warnings.length ? 'warn' : 'pass', { summary: 'Cloudflare local configuration truth check completed. No deploy commands were run.', verified, warnings, checks, data, notVerified: ['No Cloudflare deploy was executed', 'Cloudflare dashboard state was not checked'], nextSafeStep: 'Compare declared routes/domains with a read-only route smoke check.' }), { strict });
}
