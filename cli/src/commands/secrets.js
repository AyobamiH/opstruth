import { createFinding, createResult, finalizeStatus } from '../lib/result.js';
import { scanRiskyReferences } from '../lib/scan.js';
import { resolveProjectBoundary } from '../lib/boundary.js';

export async function runSecrets({ cwd = process.cwd(), strict = false } = {}) {
  const boundary = await resolveProjectBoundary(cwd);
  const findings = await scanRiskyReferences(boundary.root);
  const findingObjects = findings.map((item) => createFinding({
    status: 'warn',
    area: 'secrets',
    title: 'Risky secret or auth reference',
    finding: `${item.file}:${item.line} matched ${item.pattern}`,
    evidence: [
      'file: ' + item.file,
      'line: ' + item.line,
      'pattern: ' + item.pattern,
      'redacted preview: ' + item.preview
    ],
    whyItMatters: 'Secret-like values and service-role references can create account, data, or infrastructure exposure if committed or exposed to browsers.',
    nextSafeStep: 'Confirm whether this is a harmless reference. Move real secrets to secret storage and keep only names/placeholders in source.'
  }));
  const result = createResult('secrets', findings.length ? 'warn' : 'pass', {
    summary: 'Redacted risky secret/reference scan completed. .env file contents are skipped.',
    verified: ['Project boundary scanned: ' + boundary.root, 'Source files scanned with redaction', '.env contents were not printed'],
    warnings: findingObjects.map((finding) => finding.finding),
    findings: findingObjects,
    skipped: boundary.message ? [boundary.message] : [],
    checks: [{ name: 'secret reference scan', status: findings.length ? 'warn' : 'pass', message: findings.length + ' finding(s)' }],
    data: { boundary, findings },
    nextSafeStep: findings.length ? 'Review whether each reference is expected and move real secrets to safe storage.' : 'Keep secrets out of source and rerun before publishing.'
  });
  return finalizeStatus(result, { strict });
}
