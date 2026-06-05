import path from 'node:path';
import { createResult, finalizeStatus } from '../lib/result.js';
import { walkFiles, readText, pathExists } from '../lib/fs.js';

const DEFAULT_PROTECTED = ['agent_jobs', 'platform_credentials', 'worker_logs'];
export async function runSupabase({ cwd = process.cwd(), protectedTable = DEFAULT_PROTECTED, frontendDir = 'src', migrationsDir = 'supabase/migrations', strict = false } = {}) {
  const protectedTables = Array.isArray(protectedTable) ? protectedTable : [protectedTable];
  const migrationRoot = path.join(cwd, migrationsDir);
  const frontendRoot = path.join(cwd, frontendDir);
  const warnings = [];
  const verified = [];
  const data = { protectedTables, policies: [], frontendAccess: [], riskyWrites: [] };
  if (await pathExists(migrationRoot)) {
    const migrations = await walkFiles(migrationRoot, { skipDirs: [] });
    for (const file of migrations.filter((item) => item.rel.endsWith('.sql'))) {
      const text = await readText(file.full);
      const lower = text.toLowerCase();
      data.policies.push({ file: path.join(migrationsDir, file.rel), createPolicy: /create\s+policy/i.test(text), enableRls: /alter\s+table[\s\S]+enable\s+row\s+level\s+security/i.test(text), grant: /\bgrant\b/i.test(text), revoke: /\brevoke\b/i.test(text), securityDefiner: /security\s+definer/i.test(text), functions: (lower.match(/create\s+(or\s+replace\s+)?function/g) || []).length });
    }
    verified.push('Supabase migrations inspected: ' + data.policies.length);
  } else warnings.push('Supabase migrations directory not found: ' + migrationsDir);
  if (await pathExists(frontendRoot)) {
    const files = await walkFiles(frontendRoot, { skipDirs: ['node_modules', 'dist', 'build', '.next', 'coverage'] });
    for (const file of files.filter((item) => /\.(js|jsx|ts|tsx)$/.test(item.rel))) {
      const text = await readText(file.full);
      for (const table of protectedTables) {
        const fromPattern = new RegExp(`\\.from\\([\"']${table}[\"']\\)`, 'g');
        if (fromPattern.test(text)) data.frontendAccess.push({ file: path.join(frontendDir, file.rel), table });
      }
      if (/\.(insert|update|delete|upsert)\s*\(/.test(text)) data.riskyWrites.push({ file: path.join(frontendDir, file.rel), operation: 'frontend write method' });
    }
    verified.push('Frontend Supabase references inspected');
  } else warnings.push('Frontend directory not found: ' + frontendDir);
  for (const access of data.frontendAccess) warnings.push(`Protected table referenced from frontend: ${access.table} in ${access.file}`);
  for (const write of data.riskyWrites) warnings.push(`Frontend write call found: ${write.file}`);
  const noRls = data.policies.filter((item) => !item.enableRls && !item.createPolicy);
  if (data.policies.length && noRls.length) warnings.push('Some migration files did not include obvious RLS policy statements');
  return finalizeStatus(createResult('supabase', warnings.length ? 'warn' : 'pass', { summary: 'Static Supabase exposure audit completed without connecting to Supabase.', verified, warnings, checks: [{ name: 'supabase static audit', status: warnings.length ? 'warn' : 'pass' }], data, notVerified: ['Live Supabase permissions were not checked', 'No migrations were applied'], nextSafeStep: 'Review protected table findings and run a live permission audit outside opstruth if needed.' }), { strict });
}
