import { createResult, finalizeStatus } from '../lib/result.js';
import { resolveProjectBoundary } from '../lib/boundary.js';
import { detectStack } from '../lib/detect.js';
import { PROBE_CATALOGUE, selectProbes } from '../lib/probes.js';

function countBy(items, key) {
  const counts = {};
  for (const item of items) counts[item[key] || 'unknown'] = (counts[item[key] || 'unknown'] || 0) + 1;
  return counts;
}

function summarizeCounts(label, counts) {
  return `${label}: ${Object.entries(counts).map(([name, count]) => `${name}=${count}`).join(', ')}`;
}

export async function runProbes({ cwd = process.cwd(), strict = false, skip = [], only = [] } = {}) {
  const boundary = await resolveProjectBoundary(cwd);
  const stack = await detectStack(boundary.root);
  const selection = await selectProbes({ root: boundary.root, stack, boundary, options: { skip, only } });
  const byArea = countBy(PROBE_CATALOGUE, 'area');
  const byMode = countBy(PROBE_CATALOGUE, 'defaultMode');
  const bySafety = countBy(PROBE_CATALOGUE, 'safetyLevel');
  const result = createResult('probes', 'pass', {
    summary: 'Probe catalogue inspected for the current project without running mutating actions.',
    verified: [
      'Total probes: ' + PROBE_CATALOGUE.length,
      summarizeCounts('Probes by area', byArea),
      summarizeCounts('Probes by default mode', byMode),
      summarizeCounts('Probes by safety level', bySafety),
      'Detected safe automatic probes for this project: ' + selection.selected.length,
      'Project boundary: ' + boundary.root,
      'Detected platforms: ' + (stack.platforms.length ? stack.platforms.join(', ') : 'none')
    ],
    skipped: [
      ...(boundary.message ? [boundary.message] : []),
      ...selection.skipped.slice(0, 20).map((probe) => `${probe.id}: ${probe.reason}`)
    ],
    checks: selection.selected.map((probe) => ({
      name: probe.id,
      status: 'pass',
      message: `${probe.area}/${probe.stack}: ${probe.name}`
    })),
    notVerified: ['Probe catalogue inspection does not run route, local runtime, deploy, or external service checks by itself.'],
    data: {
      boundary,
      stack,
      total: PROBE_CATALOGUE.length,
      byArea,
      byMode,
      bySafety,
      detected: selection.selected.map((probe) => ({
        id: probe.id,
        name: probe.name,
        area: probe.area,
        stack: probe.stack,
        safetyLevel: probe.safetyLevel,
        defaultMode: probe.defaultMode,
        evidenceCollected: probe.evidenceCollected,
        proves: probe.proves,
        doesNotProve: probe.doesNotProve,
        nextSafeStep: probe.nextSafeStep
      })),
      skipped: selection.skipped.map((probe) => ({ id: probe.id, area: probe.area, stack: probe.stack, reason: probe.reason }))
    },
    nextSafeStep: 'Run opstruth for selected safe probes, or add explicit route/local inputs for stronger runtime evidence.'
  });
  return finalizeStatus(result, { strict });
}
