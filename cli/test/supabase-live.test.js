import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { runCli } from '../src/cli.js';
import { resultToMarkdown } from '../src/lib/markdown.js';
import {
  SUPABASE_LIVE_SCHEMA_VERSION,
  runSupabaseLive,
  summarizeSupabaseTelemetryOutput,
  validateSupabaseLiveEvidence
} from '../src/commands/supabase-live.js';

const ANSI_RE = /\x1B\[[0-?]*[ -/]*[@-~]/;
const TEST_ROOT = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = path.join(TEST_ROOT, 'fixtures');
const execFileAsync = promisify(execFile);

async function fixtureDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'opstruth-supabase-live-'));
}

async function writeJson(root, name, value) {
  const file = path.join(root, name);
  await fs.writeFile(file, JSON.stringify(value, null, 2) + '\n');
  return file;
}

async function captureCli(args, cwd) {
  let output = '';
  const originalWrite = process.stdout.write;
  process.stdout.write = (chunk, _encoding, callback) => {
    output += String(chunk);
    if (typeof _encoding === 'function') _encoding();
    if (typeof callback === 'function') callback();
    return true;
  };
  const originalExitCode = process.exitCode;
  process.exitCode = 0;
  try {
    await runCli(args, cwd);
    return { stdout: output, exitCode: process.exitCode };
  } finally {
    process.stdout.write = originalWrite;
    process.exitCode = originalExitCode;
  }
}

function validEvidence(overrides = {}) {
  return {
    schemaVersion: SUPABASE_LIVE_SCHEMA_VERSION,
    collectedAt: '2026-06-28T10:00:00.000Z',
    repositoryCommit: '0aebc52',
    functionName: 'import-reddit-tips',
    schedulerJob: 'import-reddit-tips-daily',
    evidenceSource: 'redacted local operator evidence',
    manualOrAutonomous: 'autonomous',
    databaseScope: {
      table: 'pet_tips',
      rowCountsOnly: true,
      rowsDumped: false
    },
    signals: {
      function_deployed: { state: 'verified', summary: 'function listed by metadata' },
      secret_name_configured: { state: 'verified', summary: 'secret name listed, value not inspected' },
      missing_credential_denial: { state: 'verified', summary: '401 observed' },
      incorrect_credential_denial: { state: 'verified', summary: '403 observed' },
      authorised_noop: { state: 'verified', summary: '200 with zero candidates and zero inserts' },
      scheduler_configured: { state: 'verified', summary: 'one intended job configured' },
      scheduler_autonomous_execution: { state: 'verified', summary: 'pg_cron run history observed' },
      telemetry_count_only: { state: 'not_verified', summary: 'filtered function logs unavailable' },
      non_admin_authorization: { state: 'authentication_unavailable', summary: 'no safe existing non-admin identity' },
      admin_authorization: { state: 'authentication_unavailable', summary: 'no safe existing admin identity' },
      rate_limit: { state: 'unsafe_to_test', summary: 'would update production rate limit rows' },
      database_effects: { state: 'verified', summary: 'count-only table scope stayed unchanged' }
    },
    redactionsApplied: ['headers omitted', 'project reference omitted', 'raw logs omitted'],
    notVerified: ['function log telemetry', 'admin branch', 'non-admin branch', 'rate-limit branch'],
    ...overrides
  };
}

test('supabase-live skips by default and makes no network request', async () => {
  const result = await runSupabaseLive();
  assert.equal(result.status, 'skipped');
  assert.equal(result.data.networkRequests, 0);
  assert.equal(result.data.mutations, 0);
  assert.ok(result.skipped.some((item) => item.includes('--evidence-file')));
});

test('supabase-live validates redacted evidence and preserves proof gaps', async () => {
  const root = await fixtureDir();
  const evidenceFile = await writeJson(root, 'evidence.json', validEvidence());
  const result = await runSupabaseLive({ cwd: root, evidenceFile });
  assert.equal(result.status, 'warn');
  assert.equal(result.data.networkRequests, 0);
  assert.equal(result.data.signals.function_deployed.state, 'verified');
  assert.equal(result.data.signals.scheduler_autonomous_execution.state, 'verified');
  assert.equal(result.data.signals.telemetry_count_only.state, 'not_verified');
  assert.ok(result.verified.some((item) => item.includes('function deployed')));
  assert.ok(result.notVerified.some((item) => item.includes('telemetry count only')));
});

test('supabase-live reports missing evidence file', async () => {
  const result = await runSupabaseLive({ evidenceFile: '/tmp/does-not-exist-opstruth-supabase-live.json' });
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((item) => item.includes('missing file')));
});

test('supabase-live reports malformed JSON', async () => {
  const root = await fixtureDir();
  const file = path.join(root, 'bad.json');
  await fs.writeFile(file, '{ nope');
  const result = await runSupabaseLive({ cwd: root, evidenceFile: file });
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((item) => item.includes('malformed JSON')));
});

test('supabase-live rejects unsupported schema and unsupported signals', () => {
  const validation = validateSupabaseLiveEvidence(validEvidence({
    schemaVersion: 'v0',
    signals: { unknown_signal: { state: 'verified' } }
  }));
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((item) => item.includes('Unsupported schemaVersion')));
  assert.ok(validation.errors.some((item) => item.includes('Unsupported signal')));
});

test('supabase-live rejects secret-like values, JWTs, authorization headers, and project-reference fields', () => {
  const jwtLike = ['ey', 'Jabc.ey', 'Jdef.abc12345678901234567890'].join('');
  const checks = [
    { token: 'x'.repeat(44) },
    { jwt: jwtLike },
    { header: 'Authorization: Bearer abcdefghijklmnopqrstuvwxyz1234567890' },
    { projectRef: 'exampleprojectrefvalue' },
    { url: 'https://abcdefghijklmnopqrst.supabase.co/functions/v1/import-reddit-tips' }
  ];
  for (const item of checks) {
    const validation = validateSupabaseLiveEvidence(validEvidence({ extra: item }));
    assert.equal(validation.ok, false);
  }
});

test('supabase-live distinguishes manual and autonomous scheduler classification', async () => {
  const root = await fixtureDir();
  const manualFile = await writeJson(root, 'manual.json', validEvidence({ manualOrAutonomous: 'manual' }));
  const manual = await runSupabaseLive({ cwd: root, evidenceFile: manualFile });
  assert.equal(manual.status, 'warn');
  assert.ok(manual.warnings.some((item) => item.includes('manual')));

  const autonomousFile = await writeJson(root, 'autonomous.json', validEvidence());
  const autonomous = await runSupabaseLive({ cwd: root, evidenceFile: autonomousFile });
  assert.equal(autonomous.data.manualOrAutonomous, 'autonomous');
  assert.equal(autonomous.data.signals.scheduler_autonomous_execution.state, 'verified');
});

test('supabase-live captures deployment metadata without runtime proof as not verified', async () => {
  const root = await fixtureDir();
  const file = await writeJson(root, 'metadata-only.json', validEvidence({
    signals: {
      ...validEvidence().signals,
      function_deployed: { state: 'verified', summary: 'metadata listed' },
      authorised_noop: { state: 'not_verified', summary: 'runtime path not called' },
      scheduler_autonomous_execution: { state: 'not_observed', summary: 'no pg_cron run history' }
    }
  }));
  const result = await runSupabaseLive({ cwd: root, evidenceFile: file });
  assert.ok(result.verified.some((item) => item.includes('function deployed')));
  assert.ok(result.notVerified.some((item) => item.includes('authorised noop')));
  assert.ok(result.skipped.some((item) => item.includes('scheduler autonomous execution')));
});

test('supabase-live human and JSON rendering are parseable and ANSI-free', async () => {
  const root = await fixtureDir();
  const evidenceFile = await writeJson(root, 'evidence.json', validEvidence());
  const result = await runSupabaseLive({ cwd: root, evidenceFile });
  const human = resultToMarkdown(result);
  assert.match(human, /opstruth supabase-live/);
  assert.match(human, /function deployed/);

  const { stdout, exitCode } = await captureCli(['supabase-live', '--evidence-file', evidenceFile, '--json'], root);
  assert.equal(exitCode, 0);
  assert.doesNotMatch(stdout, ANSI_RE);
  const parsed = JSON.parse(stdout);
  assert.equal(parsed.command, 'supabase-live');
  assert.equal(parsed.data.networkRequests, 0);
  assert.equal(parsed.data.signals.database_effects.state, 'verified');
});

test('supabase-live telemetry parser emits count-only allowlisted events', async () => {
  const raw = JSON.parse(await fs.readFile(path.join(FIXTURE_ROOT, 'supabase-telemetry-count-only.json'), 'utf8'));
  const summary = summarizeSupabaseTelemetryOutput(raw);
  assert.equal(summary.ok, true);
  assert.equal(summary.signal.state, 'verified');
  assert.equal(summary.telemetry.eventCount, 1);
  assert.equal(summary.telemetry.aggregateCounts.inserted, 0);
  assert.equal(summary.telemetry.events[0].eventName, 'import_reddit_tips_pipeline_telemetry');
  assert.equal(summary.telemetry.events[0].ignored_provider_field, undefined);
  assert.equal(summary.telemetry.rawOutputPrinted, false);
});

test('supabase-live telemetry parser rejects headers and sensitive raw provider output', async () => {
  const raw = JSON.parse(await fs.readFile(path.join(FIXTURE_ROOT, 'supabase-telemetry-unsafe.json'), 'utf8'));
  const summary = summarizeSupabaseTelemetryOutput(raw);
  assert.equal(summary.ok, false);
  assert.ok(summary.errors.some((item) => item.includes('risky field name')));
});

test('supabase-live can render telemetry-only proof without network requests', async () => {
  const telemetryFile = path.join(FIXTURE_ROOT, 'supabase-telemetry-count-only.json');
  const result = await runSupabaseLive({ telemetryFile });
  assert.equal(result.data.networkRequests, 0);
  assert.equal(result.data.mutations, 0);
  assert.equal(result.data.signals.telemetry_count_only.state, 'verified');
  assert.equal(result.data.telemetry.eventCount, 1);
  assert.ok(result.notVerified.some((item) => item.includes('function deployed')));
});

test('supabase-live merges telemetry summary into a redacted evidence file', async () => {
  const root = await fixtureDir();
  const evidenceFile = await writeJson(root, 'evidence.json', validEvidence());
  const telemetryFile = path.join(FIXTURE_ROOT, 'supabase-telemetry-count-only.json');
  const result = await runSupabaseLive({ cwd: root, evidenceFile, telemetryFile });
  assert.equal(result.data.signals.telemetry_count_only.state, 'verified');
  assert.equal(result.data.telemetry.eventCount, 1);
  assert.ok(result.data.redactionsApplied.includes('raw telemetry provider output omitted'));
});

test('supabase-live CLI accepts telemetry file and keeps JSON ANSI-free', async () => {
  const telemetryFile = path.join(FIXTURE_ROOT, 'supabase-telemetry-count-only.json');
  const binPath = path.join(TEST_ROOT, '..', 'bin', 'opstruth.js');
  const { stdout } = await execFileAsync(process.execPath, [binPath, 'supabase-live', '--telemetry-file', telemetryFile, '--json'], {
    cwd: path.join(TEST_ROOT, '..')
  });
  assert.doesNotMatch(stdout, ANSI_RE);
  const parsed = JSON.parse(stdout);
  assert.equal(parsed.data.networkRequests, 0);
  assert.equal(parsed.data.signals.telemetry_count_only.state, 'verified');
});
