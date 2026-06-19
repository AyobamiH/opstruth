import { createFinding, createResult, finalizeStatus } from '../lib/result.js';
import { probeUrl } from '../lib/http.js';
import { loadRoutesConfig, findDefaultRoutesConfig } from '../lib/config.js';
import { resolveProjectBoundary } from '../lib/boundary.js';

const DEFAULT_HEADERS = ['content-security-policy', 'strict-transport-security', 'x-frame-options', 'referrer-policy'];

export function isLocalRouteUrl(value) {
  try {
    const hostname = new URL(value).hostname.replace(/^\[|\]$/g, '').toLowerCase();
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  } catch {
    return false;
  }
}

export function buildMissingHeaderFinding({ url, routePath, missingHeaders = [], evidence = [] } = {}) {
  if (!missingHeaders.length) return null;
  const localPreview = isLocalRouteUrl(url);
  const finding = localPreview
    ? `${routePath} local preview missing headers: ${missingHeaders.join(', ')}`
    : `${routePath} missing headers: ${missingHeaders.join(', ')}`;

  return createFinding({
    status: 'warn',
    area: 'routes',
    title: localPreview ? 'Local preview security headers missing' : 'Route security headers missing',
    finding,
    evidence,
    whyItMatters: localPreview
      ? 'The local preview response does not include the expected security headers. Local development and preview servers may differ from the deployed hosting layer. Production headers remain Not Verified until a production URL is checked.'
      : 'Missing browser security headers can weaken runtime protection even when the checked route is available.',
    nextSafeStep: localPreview
      ? 'Check an explicitly supplied production URL before drawing production conclusions, and configure local preview headers only when they are useful for parity.'
      : 'Add the missing headers in the app or hosting layer and rerun route probes.'
  });
}

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
  const localPreview = isLocalRouteUrl(finalBase);
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
    const headerFinding = buildMissingHeaderFinding({ url, routePath: route.path, missingHeaders, evidence });
    if (headerFinding) {
      warnings.push(headerFinding.finding);
      findings.push(headerFinding);
    }
    checks.push({ name: `${route.method || 'HEAD'} ${route.path}`, status: okStatus ? missingHeaders.length ? 'warn' : 'pass' : 'fail', message: `status=${probe.status || 'error'} latency=${probe.latencyMs}ms`, data: probe });
  }
  return finalizeStatus(createResult('routes', failures.length ? 'fail' : warnings.length ? 'warn' : 'pass', {
    summary: localPreview ? 'HEAD/GET local preview route smoke matrix completed.' : 'HEAD/GET public route smoke matrix completed.',
    verified: [
      'Project boundary: ' + boundary.root,
      localPreview ? 'Local preview routes checked with read-only HEAD/GET requests' : 'Routes checked with read-only HEAD/GET requests',
      'Response status, redirects, headers, and latency captured'
    ],
    warnings,
    failures,
    findings,
    checks,
    notVerified: localPreview ? ['Production security headers were not checked because only a local preview URL was probed'] : [],
    data: { boundary, baseUrl: finalBase, routes, requiredHeaders, scope: localPreview ? 'local_preview' : 'remote' },
    nextSafeStep: failures.length
      ? 'Investigate failing routes without deploying from opstruth.'
      : localPreview
        ? 'Check an explicit production URL to verify deployed security headers.'
        : 'Add missing required headers or attach route evidence.'
  }), { strict });
}
