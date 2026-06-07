import { createFinding, createResult, finalizeStatus } from '../lib/result.js';
import { probeUrl } from '../lib/http.js';
import { loadRoutesConfig, findDefaultRoutesConfig } from '../lib/config.js';
import { resolveProjectBoundary } from '../lib/boundary.js';

const DEFAULT_HEADERS = ['content-security-policy', 'strict-transport-security', 'x-frame-options', 'referrer-policy'];
export async function runRoutes({ cwd = process.cwd(), baseUrl, routesFile, strict = false } = {}) {
  const boundary = await resolveProjectBoundary(cwd);
  cwd = boundary.root;
  let config = routesFile ? await loadRoutesConfig(cwd, routesFile) : null;
  const defaultConfig = config ? null : await findDefaultRoutesConfig(cwd);
  if (!config) config = defaultConfig?.config;
  if (defaultConfig?.warning) return createResult('routes', 'warn', { warnings: [defaultConfig.warning], notVerified: ['Public route availability'], nextSafeStep: 'Fix opstruth.config.json or pass --routes with valid JSON.' });
  const finalBase = baseUrl || config?.baseUrl;
  if (!finalBase) return createResult('routes', 'skipped', { skipped: ['Route checks skipped because no --base-url or route config was provided'], notVerified: ['Public route availability'], nextSafeStep: 'Run opstruth routes --base-url https://example.com or provide --routes.' });
  const routes = config?.routes?.length ? config.routes : [{ path: '/', method: 'HEAD', expectStatus: [200, 301, 302] }];
  const requiredHeaders = config?.requiredHeaders || DEFAULT_HEADERS;
  const checks = [];
  const warnings = [];
  const failures = [];
  const findings = [];
  for (const route of routes) {
    const url = new URL(route.path, finalBase).toString();
    const probe = await probeUrl(url, { method: route.method || 'HEAD' });
    const expectStatus = route.expectStatus || [200, 301, 302];
    const missingHeaders = requiredHeaders.filter((header) => !probe.headers?.[header]);
    const okStatus = probe.status && expectStatus.includes(probe.status);
    const evidence = [
      'url: ' + url,
      'method: ' + (route.method || 'HEAD'),
      'status: ' + (probe.status || probe.error),
      'latency: ' + probe.latencyMs + 'ms',
      'missing headers: ' + (missingHeaders.length ? missingHeaders.join(', ') : 'none'),
      'redirect target: ' + (probe.location || 'none')
    ];
    if (!okStatus) {
      const message = `${route.method || 'HEAD'} ${route.path} returned ${probe.status || probe.error}`;
      failures.push(message);
      findings.push(createFinding({ status: 'fail', area: 'routes', title: 'Route status did not match expectation', finding: message, evidence, whyItMatters: 'A route that fails a read-only smoke check may block users or downstream health checks.', nextSafeStep: 'Inspect the route and rerun without deploying from opstruth.' }));
    }
    if (missingHeaders.length) {
      const message = `${route.path} missing headers: ${missingHeaders.join(', ')}`;
      warnings.push(message);
      findings.push(createFinding({ status: 'warn', area: 'routes', title: 'Route security headers missing', finding: message, evidence, whyItMatters: 'Missing browser security headers can weaken runtime protection even when the route is available.', nextSafeStep: 'Add the missing headers in the app or hosting layer and rerun route probes.' }));
    }
    checks.push({ name: `${route.method || 'HEAD'} ${route.path}`, status: okStatus ? missingHeaders.length ? 'warn' : 'pass' : 'fail', message: `status=${probe.status || 'error'} latency=${probe.latencyMs}ms`, data: probe });
  }
  return finalizeStatus(createResult('routes', failures.length ? 'fail' : warnings.length ? 'warn' : 'pass', { summary: 'HEAD/GET public route smoke matrix completed.', verified: ['Project boundary: ' + boundary.root, 'Routes checked with read-only HEAD/GET requests', 'Response status, redirects, headers, and latency captured'], warnings, failures, findings, checks, data: { boundary, baseUrl: finalBase, routes, requiredHeaders }, nextSafeStep: failures.length ? 'Investigate failing routes without deploying from opstruth.' : 'Add missing required headers or attach route evidence.' }), { strict });
}
