import { createFinding, createResult, finalizeStatus } from '../lib/result.js';
import { formatSecretSummary, scanRiskyReferencesDetailed } from '../lib/scan.js';
import { resolveProjectBoundary } from '../lib/boundary.js';
import { loadOpstruthConfig } from '../lib/config.js';

function secretFindingTitle(item) {
  if (item.category === 'actionable_source_finding') return 'Actionable secret finding';
  if (item.category === 'unknown_requires_review') return 'Unknown token-like content';
  return 'Secret/reference classification';
}

export async function runSecrets({ cwd = process.cwd(), strict = false } = {}) {
  const boundary = await resolveProjectBoundary(cwd);
  const loaded = await loadOpstruthConfig(boundary.root);
  const secretConfig = loaded.config?.secrets || {};
  const scan = await scanRiskyReferencesDetailed(boundary.root, {
    allowlistPaths: secretConfig.allowlistPaths || [],
    allowlistPatterns: secretConfig.allowlistPatterns || []
  });
  const findingObjects = scan.findings.map((item) => createFinding({
    status: 'warn',
    area: 'secrets',
    title: secretFindingTitle(item),
    finding: `${item.file}:${item.line} matched ${item.pattern}`,
    evidence: [
      'file: ' + item.file,
      'line: ' + item.line,
      'pattern: ' + item.pattern,
      'category: ' + item.category,
      'severity: ' + item.severity,
      'kind: ' + item.kind,
      'context: ' + item.context,
      'redacted preview: ' + item.preview
    ],
    whyItMatters: 'Secret-like values and service-role references can create account, data, or infrastructure exposure if committed or exposed to browsers.',
    nextSafeStep: 'Review actionable and unknown findings first. Move real secrets to secret storage and keep only names/placeholders in source.'
  }));
  const secretSummary = formatSecretSummary(scan.summary);
  const result = createResult('secrets', loaded.warning || scan.findings.length ? 'warn' : 'pass', {
    summary: 'Redacted secret/reference scan completed with grouped categories. .env file contents are skipped unless tracked.',
    verified: ['Project boundary scanned: ' + boundary.root, 'Source files scanned with redaction', '.env contents were not printed', 'Secret references grouped: ' + secretSummary],
    warnings: [...(loaded.warning ? [loaded.warning] : []), ...findingObjects.map((finding) => finding.finding)],
    findings: findingObjects,
    skipped: boundary.message ? [boundary.message] : [],
    checks: [{ name: 'secret reference scan', status: scan.findings.length ? 'warn' : 'pass', message: secretSummary }],
    data: {
      boundary,
      configFile: loaded.file,
      allowlistPaths: secretConfig.allowlistPaths || [],
      allowlistPatterns: secretConfig.allowlistPatterns || [],
      secretSummary: scan.summary,
      classifiedFindings: scan.records,
      findings: scan.findings
    },
    nextSafeStep: scan.findings.length ? 'Review actionable and unknown findings first; treat documentation references and placeholders as context unless they contain real values.' : 'Keep secrets out of source and rerun before publishing.'
  });
  return finalizeStatus(result, { strict });
}
