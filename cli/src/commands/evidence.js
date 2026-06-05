import path from 'node:path';
import { createResult, finalizeStatus } from '../lib/result.js';
import { readText, writeFileSafe, pathExists } from '../lib/fs.js';
import { getGitInfo } from '../lib/git.js';
import { evidenceMarkdown } from '../lib/markdown.js';

export async function runEvidence({ cwd = process.cwd(), title = 'opstruth Evidence Pack', phase = 'local proof run', include = [], out = 'evidence/opstruth-report.md', strict = false, aggregate } = {}) {
  const git = await getGitInfo(cwd);
  const included = [];
  for (const item of include) {
    const full = path.isAbsolute(item) ? item : path.join(cwd, item);
    if (await pathExists(full)) included.push({ file: item, content: await readText(full) });
  }
  const commandsRun = aggregate?.checks?.map((check) => check.command).filter(Boolean) || included.map((item) => 'included ' + item.file);
  const checks = aggregate ? aggregate.checks.map((check) => `${check.status}: ${check.name || check.command}`) : included.map((item) => 'included evidence file: ' + item.file);
  const findingEvidence = aggregate?.findings?.flatMap((finding) => [
    `${finding.status}: ${finding.finding}`,
    ...(finding.evidence || []).map((item) => `  evidence: ${item}`),
    ...(finding.whyItMatters ? [`  why it matters: ${finding.whyItMatters}`] : []),
    ...(finding.nextSafeStep ? [`  next safe step: ${finding.nextSafeStep}`] : [])
  ]) || [];
  const risks = aggregate ? [...findingEvidence, ...aggregate.warnings, ...aggregate.failures, ...aggregate.notVerified] : ['Unverified claims remain unless backed by attached command output'];
  const markdown = evidenceMarkdown({
    title,
    status: aggregate?.status || 'not_verified',
    scope: ['Phase: ' + phase, 'Working directory: ' + cwd, 'Git root: ' + (git.root || 'not a git repository')],
    filesChanged: git.changedFiles,
    commandsRun,
    checks,
    liveVerification: aggregate?.verified || [],
    safetyBoundaries: ['Read-only checks only', 'No deploy commands run by opstruth', 'No database mutation commands run by opstruth', 'No OpenAI calls run by opstruth', 'No secrets printed by opstruth'],
    risks,
    nextSafeStep: aggregate?.nextSafeStep || 'Run the narrowest missing read-only check and attach it to this evidence pack.'
  });
  const outputPath = path.isAbsolute(out) ? out : path.join(cwd, out);
  await writeFileSafe(outputPath, markdown);
  return finalizeStatus(createResult('evidence', 'pass', { summary: 'Evidence pack written: ' + outputPath, verified: ['Evidence pack created', 'Safety-sensitive defaults separated from verified facts'], checks: [{ name: 'evidence writer', status: 'pass' }], data: { out: outputPath, included: included.map((item) => item.file), markdown }, nextSafeStep: 'Share the evidence pack with the change or CI artifact.' }), { strict });
}
