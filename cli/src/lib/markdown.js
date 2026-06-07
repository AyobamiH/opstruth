import { redactObject } from './redact.js';

const ASCII_HEADER = `   ____        _______          __  __
  / __ \\____  / ____(_)___  ____/ /_/ /
 / / / / __ \\/ /_  / / __ \\/ __  / __/
/ /_/ / /_/ / __/ / / / / / /_/ / /_
\\____/ .___/_/   /_/_/ /_/\\__,_/\\__/
    /_/

Operational truth checks for AI-assisted engineering.`;

export function statusLabel(status) {
  if (status === 'pass') return 'Pass';
  if (status === 'warn') return 'Partial pass';
  if (status === 'fail') return 'Fail';
  if (status === 'skipped') return 'Skipped';
  return 'Not verified';
}

function list(items = [], fallback = '- None', limit = 12) {
  if (!items.length) return fallback;
  const shown = items.slice(0, limit).map((item) => '- ' + String(item).replace(/\n/g, ' '));
  const remaining = items.length - shown.length;
  if (remaining > 0) shown.push('- +' + remaining + ' more');
  return shown.join('\n');
}

function findingList(findings = [], limit = 8) {
  if (!findings.length) return '- None';
  const lines = [];
  for (const finding of findings.slice(0, limit)) {
    lines.push('- [' + (finding.status || 'warn') + '] ' + finding.title + ': ' + finding.finding);
    for (const evidence of (finding.evidence || []).slice(0, 6)) lines.push('  evidence: ' + String(evidence).replace(/\n/g, ' '));
    if (finding.whyItMatters) lines.push('  why it matters: ' + finding.whyItMatters);
    if (finding.nextSafeStep) lines.push('  next safe step: ' + finding.nextSafeStep);
  }
  if (findings.length > limit) lines.push('- +' + (findings.length - limit) + ' more findings in JSON output/evidence data');
  return lines.join('\n');
}

function table(headers, rows) {
  if (!rows.length) return '- None';
  const head = '| ' + headers.join(' | ') + ' |';
  const divider = '| ' + headers.map(() => '---').join(' | ') + ' |';
  const body = rows.map((row) => '| ' + row.map((cell) => String(cell ?? '').replace(/\n/g, ' ')).join(' | ') + ' |');
  return [head, divider, ...body].join('\n');
}

function checkList(checks = [], limit = 12) {
  if (!checks.length) return '- None';
  return table(['Status', 'Check', 'Detail'], checks.slice(0, limit).map((check) => [
    check.status || 'not_verified',
    check.name || check.command || 'check',
    [Number.isFinite(check.exitCode) ? 'exit ' + check.exitCode : '', Number.isFinite(check.durationMs) ? check.durationMs + 'ms' : '', check.message || ''].filter(Boolean).join(', ')
  ])).concat(checks.length > limit ? '\n- +' + (checks.length - limit) + ' more checks in JSON output/evidence data' : '');
}

function confidenceFor(result) {
  if (result.failures?.length) return 'Blocked: at least one check failed. Fix failures before trusting this change.';
  if (result.warnings?.length) return 'Good for local iteration. Some proof gaps remain before production confidence.';
  if (result.skipped?.length || result.notVerified?.length) return 'Basic checks passed. Runtime or production verification may still be incomplete.';
  return 'Strong local confidence for the checks opstruth can perform read-only.';
}

function summarizeChildren(result) {
  const children = result.data?.childResults || [];
  return table(['Area', 'Status', 'What happened'], children.map((child) => [
    child.command,
    statusLabel(child.status),
    child.failures?.[0] || child.warnings?.[0] || child.skipped?.[0] || child.verified?.[0] || child.summary || 'Completed'
  ]));
}

function orchestratorMarkdown(raw) {
  const result = redactObject(raw);
  const evidencePath = result.data?.evidence?.out;
  return [
    ASCII_HEADER,
    '',
    'Welcome to opstruth.',
    '',
    'This tool runs read-only operational checks to help you understand:',
    '- what changed',
    '- what is configured',
    '- what looks risky',
    '- what was verified',
    '- what was not verified',
    '',
    'It will not deploy, mutate databases, trigger jobs, publish content, restart services, call OpenAI, or print raw secrets.',
    '',
    '# opstruth',
    '',
    'STATUS: ' + statusLabel(result.status),
    '',
    'One-command operational truth check completed. opstruth only ran read-only checks.',
    '',
    '## What Matters Most',
    list(result.failures, '- No failures', 5),
    '',
    '## Verified',
    list(result.verified, '- None', 8),
    '',
    '## Warnings',
    list(result.warnings, '- None', 8),
    '',
    '## Failures',
    list(result.failures, '- None', 8),
    '',
    '## Skipped Or Not Configured',
    list(result.skipped, '- None', 8),
    '',
    '## Not Verified',
    list(result.notVerified, '- None', 8),
    '',
    '## Check Summary',
    summarizeChildren(result),
    '',
    '## Why You Can Trust This Result',
    '- Project boundary was resolved before stack detection',
    '- Probes are read-only by default',
    '- Warnings and failures include evidence where available',
    '- Skipped checks are reported separately from failures',
    '- Not verified is reported as a proof gap, not as safe',
    '',
    '## Evidence Available',
    list((result.data?.probes?.selected || []).slice(0, 12).map((probe) => `${probe.id}: ${probe.evidenceCollected?.join(', ') || 'metadata'}`), '- None'),
    '',
    '## What opstruth Did Not Do',
    '- No deploys were run',
    '- No database mutations were run',
    '- No queues or jobs were triggered',
    '- No OpenAI or external AI API calls were made',
    '- No raw secrets were printed',
    '',
    '## Overall Confidence',
    confidenceFor(result),
    '',
    '## Evidence',
    findingList(result.findings),
    '',
    evidencePath ? '- Evidence written to: ' + evidencePath : '- Evidence file was not written',
    '',
    '## Next Safe Step',
    result.nextSafeStep || 'Run the narrowest missing read-only check with explicit inputs.'
  ].join('\n') + '\n';
}

export function resultToMarkdown(raw) {
  const result = redactObject(raw);
  if (result.command === 'opstruth') return orchestratorMarkdown(result);
  const title = 'opstruth ' + result.command;
  const lines = ['# ' + title, '', 'STATUS: ' + statusLabel(result.status)];
  if (result.summary) lines.push('', result.summary, '');
  lines.push('## Verified', list(result.verified, '- None', 8), '', '## Warnings', list(result.warnings, '- None', 8), '', '## Failures', list(result.failures, '- None', 8), '', '## Skipped', list(result.skipped, '- None', 8), '', '## Not Verified', list(result.notVerified, '- None', 8), '', '## Checks', checkList(result.checks), '', '## Evidence', findingList(result.findings), '', '## Overall Confidence', confidenceFor(result), '', '## Next Safe Step', result.nextSafeStep || 'Review warnings and run the narrowest missing read-only check.');
  return lines.join('\n') + '\n';
}

export function evidenceMarkdown({ title = 'opstruth Evidence Pack', status = 'not_verified', scope = [], filesChanged = [], commandsRun = [], checks = [], liveVerification = [], safetyBoundaries = [], risks = [], nextSafeStep = '' } = {}) {
  const riskRows = risks.length ? risks.map((risk) => ['Review', risk]) : [['None recorded', 'No warnings or failures were provided to this evidence pack']];
  return [
    '# ' + title,
    '',
    '## Status',
    statusLabel(status),
    '',
    '## Operator Summary',
    'This evidence pack separates verified facts from unverified claims. opstruth is read-only and does not prove production state unless route or runtime checks were explicitly configured.',
    '',
    '## Scope',
    list(scope, '- Not specified'),
    '',
    '## Files Changed',
    list(filesChanged, '- No changed files detected', 20),
    '',
    '## Commands Run',
    list(commandsRun, '- No command evidence attached', 20),
    '',
    '## Check Results',
    list(checks, '- No checks attached', 25),
    '',
    '## Probe Results',
    list(checks, '- No probe results attached', 25),
    '',
    '## Verified Facts',
    list(liveVerification, '- No live verification evidence attached', 20),
    '',
    '## Warnings',
    list(risks.filter((risk) => /warn|warning|review/i.test(risk)), '- None recorded', 20),
    '',
    '## Failures',
    list(risks.filter((risk) => /fail|failure|blocked/i.test(risk)), '- None recorded', 20),
    '',
    '## Skipped / Not Configured',
    'Skipped checks are proof gaps, not failures. See command output for skipped probe IDs and reasons.',
    '',
    '## Not Verified',
    'Production, local runtime, database state, queues, publishing, and external AI usage are not verified unless explicit read-only inputs or external evidence are attached.',
    '',
    '## Risks And Gaps',
    table(['Severity', 'Finding'], riskRows.slice(0, 25)),
    '',
    '## What Was Not Done',
    '| Area | opstruth result |',
    '| --- | --- |',
    '| Jobs or queues | Not triggered by opstruth; not verified unless separate evidence is attached |',
    '| OpenAI or external AI calls | Not called by opstruth; usage not monitored |',
    '| Publishing | Not changed by opstruth |',
    '| Deploys | No deploy command run by opstruth |',
    '| Database mutations | No database mutation command run by opstruth |',
    '',
    '## Safety Boundaries',
    list(safetyBoundaries, '- Read-only checks only'),
    '',
    '## Evidence Files / Paths',
    list(scope.concat(filesChanged).filter(Boolean), '- No evidence paths attached', 30),
    '',
    '## Confidence',
    confidenceFor({ status, failures: risks.filter((risk) => /fail|failure|blocked/i.test(risk)), warnings: risks, skipped: [], notVerified: [] }),
    '',
    '## Next Safe Step',
    nextSafeStep || 'Run the narrowest missing read-only verification and attach the result.'
  ].join('\n') + '\n';
}
