import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createFinding, createResult, finalizeStatus } from '../lib/result.js';

export const SUPABASE_LIVE_SCHEMA_VERSION = 'opstruth.supabase-live.v1';

export const SUPABASE_LIVE_SIGNALS = [
  'function_deployed',
  'secret_name_configured',
  'missing_credential_denial',
  'incorrect_credential_denial',
  'authorised_noop',
  'scheduler_configured',
  'scheduler_autonomous_execution',
  'telemetry_count_only',
  'non_admin_authorization',
  'admin_authorization',
  'rate_limit',
  'database_effects'
];

export const SUPABASE_LIVE_STATES = [
  'verified',
  'failed',
  'not_verified',
  'not_configured',
  'not_observed',
  'unsafe_to_test',
  'authentication_unavailable',
  'metadata_unavailable',
  'external_evidence'
];

const RISKY_KEY_NAMES = new Set([
  'authorization',
  'authorizationheader',
  'authorizationheaders',
  'headers',
  'requestheaders',
  'schedulerpayload',
  'requestpayload',
  'rawpayload',
  'rawrequest',
  'rawresponse',
  'rawlogs',
  'rawlog',
  'rawcommand',
  'commandtext',
  'projectref',
  'projectreference',
  'supabaseprojectref',
  'supabaseprojectreference',
  'supabaseurl',
  'databaseurl',
  'dburl',
  'service_role',
  'servicerole'
]);

const RISKY_VALUE_PATTERNS = [
  { label: 'JWT-like value', pattern: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/ },
  { label: 'bearer token', pattern: /\bBearer\s+[A-Za-z0-9._~+/-]+=*/i },
  { label: 'authorization header', pattern: /\bauthorization\s*[:=]/i },
  { label: 'secret assignment', pattern: /\b(?:SUPABASE_ACCESS_TOKEN|SUPABASE_PROJECT_REF|IMPORT_REDDIT_TIPS_SECRET|SUPABASE_SERVICE_ROLE_KEY|GH_TOKEN|GITHUB_TOKEN|NPM_TOKEN)\s*=/i },
  { label: 'service-role assignment', pattern: /\bservice[_-]?role\s*=/i },
  { label: 'OpenAI-style secret', pattern: /\bsk-[A-Za-z0-9]/ },
  { label: 'Supabase project URL', pattern: /https:\/\/[a-z0-9]{15,}\.supabase\.co/i },
  { label: 'long token-like value', pattern: /\b[A-Za-z0-9_-]{40,}\b/ }
];

const TELEMETRY_COUNT_FIELDS = [
  'candidates',
  'candidateCount',
  'candidate_count',
  'fresh',
  'freshCount',
  'fresh_count',
  'inserted',
  'insertedCount',
  'inserted_count',
  'skipped',
  'skippedCount',
  'skipped_count',
  'accepted',
  'acceptedCount',
  'accepted_count',
  'rejected',
  'rejectedCount',
  'rejected_count'
];

const TELEMETRY_ALLOWED_STATUSES = new Set([
  'ok',
  'success',
  'failed',
  'error',
  'denied',
  'unauthorized',
  'forbidden',
  'rate_limited',
  'noop',
  'scheduled_success',
  'scheduled_failure'
]);

const TELEMETRY_ALLOWED_TRIGGERS = new Set([
  'scheduled',
  'manual',
  'missing_credential',
  'incorrect_secret',
  'admin',
  'non_admin',
  'rate_limit',
  'unknown'
]);

function normalizeKey(key = '') {
  return String(key).replace(/[^a-z0-9_]/gi, '').toLowerCase();
}

function scanForSensitiveMaterial(value, pathParts = []) {
  const findings = [];
  if (Array.isArray(value)) {
    value.forEach((item, index) => findings.push(...scanForSensitiveMaterial(item, pathParts.concat(String(index)))));
    return findings;
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      const normalized = normalizeKey(key);
      const pathLabel = pathParts.concat(key).join('.');
      if (RISKY_KEY_NAMES.has(normalized)) findings.push({ path: pathLabel, reason: 'risky field name' });
      findings.push(...scanForSensitiveMaterial(item, pathParts.concat(key)));
    }
    return findings;
  }
  if (typeof value === 'string') {
    for (const { label, pattern } of RISKY_VALUE_PATTERNS) {
      if (pattern.test(value)) findings.push({ path: pathParts.join('.') || '(root)', reason: label });
    }
  }
  return findings;
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function coerceArrayFromProviderOutput(raw) {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== 'object') return [];
  for (const key of ['events', 'logs', 'result', 'results', 'data', 'rows']) {
    if (Array.isArray(raw[key])) return raw[key];
  }
  return [];
}

function lookupValue(record, keys) {
  if (!record || typeof record !== 'object') return undefined;
  for (const key of keys) {
    if (Object.hasOwn(record, key)) return record[key];
  }
  return undefined;
}

function normalizeTelemetryStatus(value) {
  const status = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  return TELEMETRY_ALLOWED_STATUSES.has(status) ? status : null;
}

function normalizeTelemetryTrigger(value) {
  const trigger = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  return TELEMETRY_ALLOWED_TRIGGERS.has(trigger) ? trigger : null;
}

function normalizeTelemetryEventName(record) {
  const raw = lookupValue(record, ['eventName', 'event_name', 'event', 'message']);
  const text = String(raw || '').trim();
  if (!text) return null;
  if (/IMPORT_REDDIT_TIPS_PIPELINE_TELEMETRY/i.test(text)) return 'import_reddit_tips_pipeline_telemetry';
  if (/authorization.*den/i.test(text)) return 'authorization_denial';
  if (/scheduled.*trigger/i.test(text)) return 'scheduled_trigger';
  if (/rate.*limit/i.test(text)) return 'rate_limit';
  return null;
}

function normalizeSafeCorrelationId(value) {
  const id = String(value || '').trim();
  if (!id) return null;
  if (/^[A-Za-z0-9_-]{1,36}$/.test(id)) return id;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return id;
  return null;
}

function normalizeCount(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0) return value;
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value);
  return null;
}

function collectTelemetryCounts(record) {
  const counts = {};
  const nested = record && typeof record.counts === 'object' && !Array.isArray(record.counts)
    ? record.counts
    : {};
  for (const key of TELEMETRY_COUNT_FIELDS) {
    const value = normalizeCount(record?.[key] ?? nested[key]);
    if (value === null) continue;
    const normalizedKey = key
      .replace(/Count$/, '')
      .replace(/_count$/, '')
      .toLowerCase();
    counts[normalizedKey] = value;
  }
  return counts;
}

function normalizeTelemetryEvent(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return null;
  const counts = collectTelemetryCounts(record);
  const eventName = normalizeTelemetryEventName(record);
  const trigger = normalizeTelemetryTrigger(lookupValue(record, ['trigger', 'caller', 'source']));
  const status = normalizeTelemetryStatus(lookupValue(record, ['status', 'statusClassification', 'status_classification', 'result']));
  const timestamp = lookupValue(record, ['timestamp', 'time', 'created_at']);
  const correlationId = normalizeSafeCorrelationId(lookupValue(record, ['requestId', 'request_id', 'correlationId', 'correlation_id']));
  if (!Object.keys(counts).length && !eventName && !trigger && !status) return null;
  const event = {};
  if (typeof timestamp === 'string' && timestamp.length <= 40) event.timestamp = timestamp;
  if (eventName) event.eventName = eventName;
  if (trigger) event.trigger = trigger;
  if (status) event.status = status;
  if (correlationId) event.correlationId = correlationId;
  if (Object.keys(counts).length) event.counts = counts;
  return Object.keys(event).length ? event : null;
}

export function summarizeSupabaseTelemetryOutput(raw) {
  const errors = [];
  const sensitive = scanForSensitiveMaterial(raw);
  for (const item of sensitive) errors.push(`Sensitive material rejected at ${item.path}: ${item.reason}`);
  if (errors.length) return { ok: false, errors };

  const records = coerceArrayFromProviderOutput(raw);
  if (!records.length) {
    return {
      ok: true,
      signal: {
        state: 'not_observed',
        summary: 'No allowlisted telemetry records were present in the local provider output.'
      },
      telemetry: {
        source: 'local telemetry file',
        eventCount: 0,
        events: [],
        discardedUnknownFields: true,
        rawOutputPrinted: false
      }
    };
  }

  const events = records
    .map((record) => normalizeTelemetryEvent(record))
    .filter(Boolean);
  if (!events.length) {
    return {
      ok: true,
      signal: {
        state: 'not_observed',
        summary: 'Provider output was readable, but no count-only allowlisted telemetry event was found.'
      },
      telemetry: {
        source: 'local telemetry file',
        eventCount: 0,
        events: [],
        discardedUnknownFields: true,
        rawOutputPrinted: false
      }
    };
  }

  const aggregateCounts = {};
  for (const event of events) {
    for (const [key, value] of Object.entries(event.counts || {})) {
      aggregateCounts[key] = (aggregateCounts[key] || 0) + value;
    }
  }

  return {
    ok: true,
    signal: {
      state: 'verified',
      summary: `${events.length} count-only telemetry event${events.length === 1 ? '' : 's'} parsed from local provider output.`,
      evidence: [
        'raw provider output was read locally',
        'unknown fields were discarded',
        'only allowlisted count/status fields were emitted'
      ],
      source: 'telemetry-file'
    },
    telemetry: {
      source: 'local telemetry file',
      eventCount: events.length,
      aggregateCounts,
      events,
      discardedUnknownFields: true,
      rawOutputPrinted: false
    }
  };
}

function normalizeSignal(raw, key) {
  if (typeof raw === 'string') return { state: raw, summary: key };
  if (raw && typeof raw === 'object') {
    return {
      state: raw.state,
      summary: raw.summary || raw.reason || key,
      evidence: Array.isArray(raw.evidence) ? raw.evidence : [],
      source: raw.source || null
    };
  }
  return { state: 'not_verified', summary: key };
}

export function validateSupabaseLiveEvidence(evidence) {
  const errors = [];
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) {
    return { ok: false, errors: ['Evidence must be a JSON object'] };
  }
  if (evidence.schemaVersion !== SUPABASE_LIVE_SCHEMA_VERSION) {
    errors.push(`Unsupported schemaVersion: ${evidence.schemaVersion || 'missing'}`);
  }
  if (!evidence.signals || typeof evidence.signals !== 'object' || Array.isArray(evidence.signals)) {
    errors.push('signals must be an object');
  }
  const sensitive = scanForSensitiveMaterial(evidence);
  for (const item of sensitive) errors.push(`Sensitive material rejected at ${item.path}: ${item.reason}`);
  if (evidence.signals && typeof evidence.signals === 'object' && !Array.isArray(evidence.signals)) {
    for (const [key, raw] of Object.entries(evidence.signals)) {
      if (!SUPABASE_LIVE_SIGNALS.includes(key)) errors.push(`Unsupported signal: ${key}`);
      const signal = normalizeSignal(raw, key);
      if (!SUPABASE_LIVE_STATES.includes(signal.state)) errors.push(`Unsupported state for ${key}: ${signal.state || 'missing'}`);
    }
  }
  return { ok: errors.length === 0, errors };
}

function applyTelemetrySummary(evidence, telemetrySummary) {
  const next = cloneJson(evidence);
  next.signals = { ...(next.signals || {}) };
  next.signals.telemetry_count_only = telemetrySummary.signal;
  next.telemetry = telemetrySummary.telemetry;
  const redactions = new Set(next.redactionsApplied || []);
  redactions.add('raw telemetry provider output omitted');
  redactions.add('unknown telemetry fields discarded');
  next.redactionsApplied = Array.from(redactions);
  return next;
}

function telemetryOnlyEvidence(telemetrySummary) {
  return applyTelemetrySummary({
    schemaVersion: SUPABASE_LIVE_SCHEMA_VERSION,
    collectedAt: null,
    repositoryCommit: null,
    functionName: null,
    schedulerJob: null,
    evidenceSource: 'local telemetry provider output',
    manualOrAutonomous: 'not_specified',
    databaseScope: null,
    signals: Object.fromEntries(SUPABASE_LIVE_SIGNALS.map((key) => [key, { state: 'not_verified', summary: `${key} not supplied` }])),
    redactionsApplied: [],
    notVerified: SUPABASE_LIVE_SIGNALS.filter((key) => key !== 'telemetry_count_only')
  }, telemetrySummary);
}

export function summarizeSupabaseLiveEvidence(evidence) {
  const signals = Object.fromEntries(
    SUPABASE_LIVE_SIGNALS.map((key) => [key, normalizeSignal(evidence.signals?.[key] ?? 'not_verified', key)])
  );
  const verified = [];
  const failures = [];
  const warnings = [];
  const notVerified = [];
  const skipped = [];
  const checks = [];
  const findings = [];

  for (const key of SUPABASE_LIVE_SIGNALS) {
    const signal = signals[key];
    const label = key.replaceAll('_', ' ');
    const checkStatus = signal.state === 'verified' || signal.state === 'external_evidence'
      ? 'pass'
      : signal.state === 'failed'
        ? 'fail'
        : ['not_configured', 'not_observed'].includes(signal.state)
          ? 'skipped'
          : 'not_verified';
    checks.push({ name: label, status: checkStatus, message: signal.state });
    if (signal.state === 'verified') verified.push(`${label}: verified`);
    else if (signal.state === 'external_evidence') verified.push(`${label}: external evidence attached`);
    else if (signal.state === 'failed') {
      const message = `${label}: failed`;
      failures.push(message);
      findings.push(createFinding({
        status: 'fail',
        area: 'supabase-live',
        title: `${label} failed`,
        finding: signal.summary || message,
        evidence: signal.evidence || [],
        whyItMatters: 'A failed production proof signal is a blocker until reviewed.',
        nextSafeStep: 'Inspect the redacted source evidence and rerun the narrowest safe production check.'
      }));
    } else if (['not_configured', 'not_observed'].includes(signal.state)) {
      skipped.push(`${label}: ${signal.state}`);
      notVerified.push(`${label}: ${signal.summary || signal.state}`);
    } else {
      notVerified.push(`${label}: ${signal.summary || signal.state}`);
      if (['unsafe_to_test', 'authentication_unavailable', 'metadata_unavailable'].includes(signal.state)) {
        warnings.push(`${label}: ${signal.state}`);
      }
    }
  }

  const manualOrAutonomous = evidence.manualOrAutonomous || 'not_specified';
  const schedulerSignal = signals.scheduler_autonomous_execution;
  if (manualOrAutonomous === 'manual' && schedulerSignal.state === 'verified') {
    warnings.push('scheduler autonomous execution is marked verified but evidence classification is manual');
    notVerified.push('Autonomous scheduler execution needs autonomous pg_cron evidence, not a manual invocation');
  }

  return {
    signals,
    verified,
    failures,
    warnings,
    skipped,
    notVerified,
    checks,
    findings,
    data: {
      schemaVersion: evidence.schemaVersion,
      collectedAt: evidence.collectedAt || null,
      repositoryCommit: evidence.repositoryCommit || null,
      functionName: evidence.functionName || null,
      schedulerJob: evidence.schedulerJob || null,
      evidenceSource: evidence.evidenceSource || null,
      manualOrAutonomous,
      databaseScope: evidence.databaseScope || null,
      redactionsApplied: evidence.redactionsApplied || [],
      notVerified: evidence.notVerified || [],
      telemetry: evidence.telemetry || null,
      signals
    }
  };
}

async function loadTelemetrySummary({ cwd, telemetryFile }) {
  if (!telemetryFile) return null;
  const filePath = path.isAbsolute(telemetryFile) ? telemetryFile : path.join(cwd, telemetryFile);
  let parsed;
  try {
    parsed = JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    return {
      ok: false,
      errors: [`Telemetry file error: ${error.code === 'ENOENT' ? 'missing file' : 'malformed JSON or unreadable file'}`]
    };
  }
  return summarizeSupabaseTelemetryOutput(parsed);
}

export async function runSupabaseLive({ cwd = process.cwd(), evidenceFile, telemetryFile, strict = false } = {}) {
  if (!evidenceFile && !telemetryFile) {
    return createResult('supabase-live', 'skipped', {
      summary: 'Supabase live proof is explicit opt-in and requires a local redacted evidence or telemetry file. No Supabase network request was made.',
      skipped: ['No --evidence-file or --telemetry-file was provided'],
      notVerified: SUPABASE_LIVE_SIGNALS.map((signal) => signal.replaceAll('_', ' ')),
      checks: [{ name: 'local evidence input provided', status: 'skipped', message: 'missing --evidence-file or --telemetry-file' }],
      data: { boundary: 'local evidence file only', networkRequests: 0, mutations: 0 },
      nextSafeStep: 'Collect redacted production evidence separately, then run opstruth supabase-live --evidence-file <file> or --telemetry-file <file>.'
    });
  }

  const telemetrySummary = await loadTelemetrySummary({ cwd, telemetryFile });
  if (telemetrySummary && !telemetrySummary.ok) {
    return finalizeStatus(createResult('supabase-live', 'fail', {
      summary: 'Supabase telemetry provider output was rejected before rendering. No Supabase network request was made.',
      failures: telemetrySummary.errors,
      checks: [{ name: 'telemetry schema and redaction validation', status: 'fail', message: telemetrySummary.errors[0] }],
      data: { boundary: 'local evidence file only', networkRequests: 0, mutations: 0, rejected: true },
      nextSafeStep: 'Store raw provider output under /tmp, remove sensitive material, and rerun with an allowlisted telemetry file.'
    }), { strict });
  }

  if (!evidenceFile && telemetrySummary) {
    const evidence = telemetryOnlyEvidence(telemetrySummary);
    const validation = validateSupabaseLiveEvidence(evidence);
    if (!validation.ok) {
      return finalizeStatus(createResult('supabase-live', 'fail', {
        summary: 'Supabase telemetry evidence was rejected before rendering. No Supabase network request was made.',
        failures: validation.errors,
        checks: [{ name: 'telemetry evidence validation', status: 'fail', message: validation.errors[0] }],
        data: { boundary: 'local evidence file only', networkRequests: 0, mutations: 0, rejected: true },
        nextSafeStep: 'Review the telemetry allowlist and remove unsupported fields.'
      }), { strict });
    }
    const summary = summarizeSupabaseLiveEvidence(evidence);
    return finalizeStatus(createResult('supabase-live', summary.failures.length ? 'fail' : summary.warnings.length ? 'warn' : 'pass', {
      summary: 'Supabase telemetry proof loaded from a local provider-output file. No Supabase network request was made.',
      verified: summary.verified,
      failures: summary.failures,
      warnings: summary.warnings,
      skipped: summary.skipped,
      notVerified: summary.notVerified,
      checks: summary.checks,
      findings: summary.findings,
      data: { ...summary.data, boundary: 'local evidence file only', networkRequests: 0, mutations: 0 },
      nextSafeStep: 'Merge the telemetry signal into a full redacted evidence file when production context is ready.'
    }), { strict });
  }

  const filePath = path.isAbsolute(evidenceFile) ? evidenceFile : path.join(cwd, evidenceFile);
  let parsed;
  try {
    parsed = JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    return finalizeStatus(createResult('supabase-live', 'fail', {
      summary: 'Supabase live proof evidence file could not be loaded or parsed. No Supabase network request was made.',
      failures: [`Evidence file error: ${error.code === 'ENOENT' ? 'missing file' : 'malformed JSON or unreadable file'}`],
      checks: [{ name: 'evidence file parse', status: 'fail', message: error.code === 'ENOENT' ? 'missing file' : 'parse/read failure' }],
      data: { boundary: 'local evidence file only', networkRequests: 0, mutations: 0 },
      nextSafeStep: 'Provide a valid redacted JSON evidence file.'
    }), { strict });
  }

  const evidence = telemetrySummary ? applyTelemetrySummary(parsed, telemetrySummary) : parsed;
  const validation = validateSupabaseLiveEvidence(evidence);
  if (!validation.ok) {
    return finalizeStatus(createResult('supabase-live', 'fail', {
      summary: 'Supabase live proof evidence was rejected before rendering. No Supabase network request was made.',
      failures: validation.errors,
      checks: [{ name: 'evidence schema and redaction validation', status: 'fail', message: validation.errors[0] }],
      data: { boundary: 'local evidence file only', networkRequests: 0, mutations: 0, rejected: true },
      nextSafeStep: 'Remove raw identifiers, credentials, headers, payloads, logs, and unsupported fields; rerun with redacted evidence.'
    }), { strict });
  }

  const summary = summarizeSupabaseLiveEvidence(evidence);
  return finalizeStatus(createResult('supabase-live', summary.failures.length ? 'fail' : summary.warnings.length ? 'warn' : 'pass', {
    summary: 'Supabase live proof loaded from a local redacted evidence file. No Supabase network request was made.',
    verified: summary.verified,
    failures: summary.failures,
    warnings: summary.warnings,
    skipped: summary.skipped,
    notVerified: summary.notVerified,
    checks: summary.checks,
    findings: summary.findings,
    data: { ...summary.data, boundary: 'local evidence file only', networkRequests: 0, mutations: 0 },
    nextSafeStep: summary.failures.length
      ? 'Review failed production signals before trusting the Supabase state.'
      : summary.notVerified.length
        ? 'Treat not-verified Supabase properties as proof gaps and collect the narrowest safe evidence.'
        : 'Attach the redacted evidence file to the review record.'
  }), { strict });
}
