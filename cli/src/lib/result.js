export const STATUS_ORDER = ['pass', 'not_verified', 'skipped', 'warn', 'fail'];

export function worstStatus(statuses = []) {
  let worst = 'pass';
  for (const status of statuses.filter(Boolean)) {
    if (STATUS_ORDER.indexOf(status) > STATUS_ORDER.indexOf(worst)) worst = status;
  }
  return worst;
}

export function createResult(command, status = 'pass', partial = {}) {
  return {
    command,
    status,
    summary: partial.summary || '',
    verified: partial.verified || [],
    warnings: partial.warnings || [],
    failures: partial.failures || [],
    findings: partial.findings || [],
    skipped: partial.skipped || [],
    notVerified: partial.notVerified || [],
    checks: partial.checks || [],
    data: partial.data || {},
    nextSafeStep: partial.nextSafeStep || '',
    startedAt: partial.startedAt || new Date().toISOString(),
    finishedAt: partial.finishedAt || new Date().toISOString()
  };
}

export function createFinding({ status = 'warn', area = 'general', title, finding, evidence = [], whyItMatters = '', nextSafeStep = '' } = {}) {
  return {
    status,
    area,
    title: title || finding || 'Finding',
    finding: finding || title || 'Finding recorded',
    evidence,
    whyItMatters,
    nextSafeStep
  };
}

export function finalizeStatus(result, { strict = false } = {}) {
  if (result.findings?.some((finding) => finding.status === 'fail') && !result.failures?.length) {
    result.failures = result.findings.filter((finding) => finding.status === 'fail').map((finding) => finding.finding);
  }
  if (result.findings?.some((finding) => finding.status === 'warn') && !result.warnings?.length) {
    result.warnings = result.findings.filter((finding) => finding.status === 'warn').map((finding) => finding.finding);
  }
  if (result.failures?.length) result.status = 'fail';
  else if (result.warnings?.length) result.status = strict ? 'fail' : 'warn';
  else if (result.verified?.length || result.checks?.some((check) => check.status === 'pass')) result.status = 'pass';
  else if (result.skipped?.length) result.status = 'skipped';
  else result.status = result.status || 'not_verified';
  result.finishedAt = new Date().toISOString();
  return result;
}

export function exitCodeFor(result, { strict = false } = {}) {
  if (!result) return 1;
  if (result.status === 'fail') return 1;
  if (strict && result.status === 'warn') return 1;
  return 0;
}
