import { runCommand } from '../lib/exec.js';
import { gitText } from '../lib/git.js';
import { createFinding, createResult } from '../lib/result.js';
import { loadOpstruthConfig } from '../lib/config.js';
import { resolveProjectBoundary } from '../lib/boundary.js';

const TERMINAL_STATES = new Set(['completed', 'success', 'failure', 'cancelled', 'skipped', 'timed_out']);

export const GITHUB_CI_STATES = [
  'verified_success',
  'verified_failure',
  'in_progress',
  'no_run_for_commit',
  'authentication_unavailable',
  'repository_unresolved',
  'workflow_not_found',
  'commit_mismatch',
  'not_configured',
  'not_verified'
];

export function parseGitHubRemote(remote = '') {
  const value = remote.trim();
  if (!value) return null;

  const ssh = value.match(/^git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/i);
  if (ssh) return `${ssh[1]}/${ssh[2].replace(/\.git$/i, '')}`;

  const sshUrl = value.match(/^ssh:\/\/git@github\.com\/([^/]+)\/(.+?)(?:\.git)?$/i);
  if (sshUrl) return `${sshUrl[1]}/${sshUrl[2].replace(/\.git$/i, '')}`;

  try {
    const url = new URL(value);
    if (url.hostname.toLowerCase() !== 'github.com') return null;
    const parts = url.pathname.replace(/^\/|\.git$/g, '').split('/');
    if (parts.length >= 2 && parts[0] && parts[1]) return `${parts[0]}/${parts[1]}`;
  } catch {
    // Not a URL shape.
  }

  return null;
}

function normalizeConclusion(conclusion) {
  return String(conclusion || '').toLowerCase();
}

function normalizeStatus(status) {
  return String(status || '').toLowerCase();
}

function parseJsonArray(text) {
  const parsed = JSON.parse(text || '[]');
  return Array.isArray(parsed) ? parsed : [];
}

function parseJsonObject(text) {
  const parsed = JSON.parse(text || '{}');
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
}

function isAuthOrCliFailure(result) {
  const text = `${result.stderr || ''}\n${result.stdout || ''}`;
  return result.exitCode === 127
    || /not found|could not resolve to a repository|authentication|not logged in|requires authentication|HTTP 401|HTTP 403/i.test(text);
}

function runState(run) {
  const status = normalizeStatus(run.status);
  const conclusion = normalizeConclusion(run.conclusion);
  if (status && !TERMINAL_STATES.has(status)) return 'in_progress';
  if (['queued', 'in_progress', 'requested', 'waiting', 'pending'].includes(status)) return 'in_progress';
  if (conclusion === 'success') return 'verified_success';
  if (conclusion) return 'verified_failure';
  return status === 'completed' ? 'not_verified' : 'in_progress';
}

export function selectGitHubRun(runs = [], { commitSha, workflow } = {}) {
  const exact = runs.filter((run) => run.headSha === commitSha);
  if (!exact.length) {
    return {
      state: runs.length ? 'commit_mismatch' : 'no_run_for_commit',
      run: runs[0] || null
    };
  }

  const workflowMatches = workflow
    ? exact.filter((run) => String(run.workflowName || '') === workflow || String(run.name || '') === workflow)
    : exact;

  if (!workflowMatches.length) {
    return { state: 'workflow_not_found', run: exact[0] || null };
  }

  const completed = workflowMatches
    .filter((run) => normalizeStatus(run.status) === 'completed' || normalizeConclusion(run.conclusion))
    .sort((a, b) => Date.parse(b.updatedAt || b.createdAt || 0) - Date.parse(a.updatedAt || a.createdAt || 0));

  const active = workflowMatches
    .filter((run) => !completed.includes(run))
    .sort((a, b) => Date.parse(b.updatedAt || b.createdAt || 0) - Date.parse(a.updatedAt || a.createdAt || 0));

  const selected = completed[0] || active[0] || workflowMatches[0];
  return { state: runState(selected), run: selected };
}

function githubStatusForState(state) {
  if (state === 'verified_success') return 'pass';
  if (state === 'verified_failure') return 'fail';
  if (state === 'in_progress') return 'warn';
  if (state === 'not_configured' || state === 'no_run_for_commit' || state === 'workflow_not_found') return 'skipped';
  return 'not_verified';
}

function stateLabel(state) {
  return state.replace(/_/g, ' ');
}

function jobSummary(jobs = []) {
  return jobs.map((job) => ({
    name: job.name,
    status: job.status,
    conclusion: job.conclusion,
    startedAt: job.startedAt,
    completedAt: job.completedAt
  }));
}

async function defaultGhRunner(args, cwd) {
  return runCommand('gh', args, { cwd, timeoutMs: 30000, redactStdout: false, redactStderr: true });
}

export async function resolveGitHubContext({ cwd, commitSha, remoteUrl } = {}) {
  const boundary = await resolveProjectBoundary(cwd || process.cwd());
  const root = boundary.root;
  const sha = commitSha || await gitText(['rev-parse', 'HEAD'], root, { redactStdout: false });
  const remote = remoteUrl || await gitText(['remote', 'get-url', 'origin'], root, { redactStdout: false });
  const repository = parseGitHubRemote(remote || '');
  return { boundary, root, commitSha: sha || null, remoteUrl: remote || null, repository };
}

function baseData({ state, context, workflow, run, jobs, exactCommitMatch }) {
  return {
    githubCi: {
      state,
      repository: context.repository,
      localCommitSha: context.commitSha,
      workflow: workflow || null,
      runId: run?.databaseId || run?.id || null,
      runUrl: run?.url || null,
      event: run?.event || null,
      status: run?.status || null,
      conclusion: run?.conclusion || null,
      workflowName: run?.workflowName || null,
      headSha: run?.headSha || null,
      exactCommitMatch,
      createdAt: run?.createdAt || null,
      updatedAt: run?.updatedAt || null,
      jobs: jobSummary(jobs)
    }
  };
}

function resultForState({ state, context, workflow, run = null, jobs = [], details = [] }) {
  const exactCommitMatch = Boolean(run?.headSha && context.commitSha && run.headSha === context.commitSha);
  const checks = [];
  const verified = [];
  const warnings = [];
  const failures = [];
  const skipped = [];
  const notVerified = [];
  const findings = [];

  checks.push({
    name: 'github repository resolution',
    status: context.repository ? 'pass' : 'not_verified',
    message: context.repository || 'origin remote did not resolve to GitHub'
  });
  checks.push({
    name: 'github ci exact commit',
    status: state === 'verified_success' ? 'pass' : state === 'verified_failure' ? 'fail' : githubStatusForState(state),
    message: `${stateLabel(state)}${workflow ? `; workflow=${workflow}` : ''}`
  });

  if (state === 'verified_success') {
    verified.push(`GitHub repository resolved: ${context.repository}`);
    verified.push(`Exact local commit matched GitHub Actions run: ${context.commitSha}`);
    verified.push(`Workflow run succeeded: ${run.workflowName || workflow || 'not specified'}`);
    if (jobs.length) verified.push(`Workflow jobs inspected: ${jobs.map((job) => `${job.name}:${job.conclusion || job.status}`).join(', ')}`);
  } else if (state === 'verified_failure') {
    failures.push(`GitHub Actions run for exact commit did not succeed: ${run?.conclusion || run?.status || 'unknown'}`);
    findings.push(createFinding({
      status: 'fail',
      area: 'github',
      title: 'GitHub Actions exact-commit run failed',
      finding: `GitHub Actions run for ${context.commitSha || 'current commit'} did not succeed.`,
      evidence: [
        `repository: ${context.repository || 'unresolved'}`,
        `workflow: ${run?.workflowName || workflow || 'not specified'}`,
        `run id: ${run?.databaseId || run?.id || 'not available'}`,
        `status: ${run?.status || 'unknown'}`,
        `conclusion: ${run?.conclusion || 'unknown'}`
      ],
      whyItMatters: 'CI failure is local/hosted quality evidence for the exact commit, not a deploy or production proof.',
      nextSafeStep: 'Inspect the failing check in GitHub and fix it before relying on this commit.'
    }));
  } else if (state === 'in_progress') {
    warnings.push('GitHub Actions run for the exact commit is still in progress');
  } else if (state === 'repository_unresolved') {
    notVerified.push('GitHub repository could not be resolved from origin remote');
  } else if (state === 'authentication_unavailable') {
    notVerified.push('GitHub authentication or gh CLI was unavailable');
  } else if (state === 'workflow_not_found') {
    skipped.push(`No GitHub Actions run matched workflow ${workflow}`);
    notVerified.push('Configured GitHub Actions workflow was not verified for this commit');
  } else if (state === 'no_run_for_commit') {
    skipped.push('No GitHub Actions run was found for the current local commit');
    notVerified.push('GitHub CI did not provide proof for this checkout');
  } else if (state === 'commit_mismatch') {
    notVerified.push('GitHub Actions metadata did not match the current local commit');
  } else {
    notVerified.push('GitHub Actions proof was not verified');
  }

  for (const detail of details) notVerified.push(detail);

  return createResult('github-ci', githubStatusForState(state), {
    summary: 'Read-only GitHub Actions exact-commit proof check completed.',
    verified,
    warnings,
    failures,
    skipped,
    notVerified: [
      ...notVerified,
      'GitHub CI does not prove production deployment, Supabase state, scheduler state, production headers, or function behavior'
    ],
    findings,
    checks,
    data: baseData({ state, context, workflow, run, jobs, exactCommitMatch }),
    nextSafeStep: state === 'verified_success'
      ? 'Treat CI as hosted quality proof only; verify production separately when needed.'
      : 'Resolve the GitHub CI proof gap or inspect the matching workflow in GitHub.'
  });
}

export async function runGitHubCi({
  cwd = process.cwd(),
  workflow,
  ghRunner = defaultGhRunner,
  commitSha,
  remoteUrl
} = {}) {
  const loaded = await loadOpstruthConfig(cwd);
  const configuredWorkflow = workflow || loaded.config?.github?.ci?.workflow;
  let context;
  try {
    context = await resolveGitHubContext({ cwd, commitSha, remoteUrl });
  } catch (error) {
    context = { root: cwd, commitSha: commitSha || null, remoteUrl: remoteUrl || null, repository: null };
  }

  if (!context.repository || !context.commitSha) {
    return resultForState({
      state: 'repository_unresolved',
      context,
      workflow: configuredWorkflow,
      details: loaded.warning ? [loaded.warning] : []
    });
  }

  const listArgs = [
    'run',
    'list',
    '--repo',
    context.repository,
    '--commit',
    context.commitSha,
    '--limit',
    '20',
    '--json',
    'databaseId,headSha,conclusion,status,event,createdAt,updatedAt,workflowName,url'
  ];

  const list = await ghRunner(listArgs, context.root);
  if (list.exitCode !== 0) {
    const state = isAuthOrCliFailure(list) ? 'authentication_unavailable' : 'not_verified';
    return resultForState({ state, context, workflow: configuredWorkflow, details: [list.stderr || list.stdout || 'GitHub CLI query failed'] });
  }

  let runs;
  try {
    runs = parseJsonArray(list.stdout);
  } catch (error) {
    return resultForState({ state: 'not_verified', context, workflow: configuredWorkflow, details: ['GitHub CLI returned malformed workflow JSON'] });
  }

  const selection = selectGitHubRun(runs, { commitSha: context.commitSha, workflow: configuredWorkflow });
  if (!selection.run || !['verified_success', 'verified_failure', 'in_progress'].includes(selection.state)) {
    return resultForState({ state: selection.state, context, workflow: configuredWorkflow, run: selection.run });
  }

  const runId = selection.run.databaseId || selection.run.id;
  if (!runId) return resultForState({ state: selection.state, context, workflow: configuredWorkflow, run: selection.run });

  const view = await ghRunner([
    'run',
    'view',
    String(runId),
    '--repo',
    context.repository,
    '--json',
    'databaseId,conclusion,status,event,headSha,workflowName,jobs,url,createdAt,updatedAt'
  ], context.root);

  if (view.exitCode !== 0) {
    const state = isAuthOrCliFailure(view) ? 'authentication_unavailable' : selection.state;
    return resultForState({ state, context, workflow: configuredWorkflow, run: selection.run, details: [view.stderr || view.stdout || 'GitHub CLI run detail query failed'] });
  }

  let run;
  try {
    run = parseJsonObject(view.stdout);
  } catch {
    return resultForState({ state: 'not_verified', context, workflow: configuredWorkflow, run: selection.run, details: ['GitHub CLI returned malformed run detail JSON'] });
  }

  if (run.headSha !== context.commitSha) {
    return resultForState({ state: 'commit_mismatch', context, workflow: configuredWorkflow, run });
  }

  return resultForState({
    state: runState(run),
    context,
    workflow: configuredWorkflow,
    run,
    jobs: Array.isArray(run.jobs) ? run.jobs : []
  });
}
