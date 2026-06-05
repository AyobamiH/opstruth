import path from 'node:path';
import { walkFiles, readText, readJson, pathExists } from './fs.js';
import { redact } from './redact.js';
import { mergeIgnores } from './boundary.js';

export const DEFAULT_SKIP_DIRS = mergeIgnores();
export const RISK_PATTERNS = [/OPENAI_API_KEY/i, /SUPABASE_SERVICE_ROLE_KEY/i, /service_role/i, /access_token/i, /refresh_token/i, /client_secret/i, /private_key/i, /webhook_secret/i, /api_key/i, /bearer/i, /authorization/i];
const OPSTRUTH_SCANNER_FILES = new Set([
  'src/lib/redact.js',
  'src/lib/scan.js',
  'src/lib/probes.js',
  'test/typescript-compatibility.test.js',
  'fixtures/risky-secret-app/src/config.js'
]);

export function isLikelyText(file) { return /\.(js|mjs|cjs|ts|tsx|jsx|json|jsonc|toml|yml|yaml|md|txt|env|sql|html|css)$/i.test(file) || !path.extname(file); }

async function isOpstruthRoot(root) {
  const packageFile = path.join(root, 'package.json');
  if (!(await pathExists(packageFile))) return false;
  try { return (await readJson(packageFile)).name === 'opstruth'; } catch { return false; }
}

export async function scanRiskyReferences(root, { skipDirs = DEFAULT_SKIP_DIRS } = {}) {
  const files = await walkFiles(root, { skipDirs: mergeIgnores(skipDirs) });
  const findings = [];
  const suppressInternalScannerDefinitions = await isOpstruthRoot(root);
  for (const file of files) {
    if (suppressInternalScannerDefinitions && OPSTRUTH_SCANNER_FILES.has(file.rel)) continue;
    if (!isLikelyText(file.rel)) continue;
    if (path.basename(file.rel).startsWith('.env')) continue;
    let text = '';
    try { text = await readText(file.full); } catch { continue; }
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const pattern of RISK_PATTERNS) {
        if (pattern.test(line)) {
          findings.push({
            file: file.rel,
            line: index + 1,
            pattern: pattern.source.replaceAll('\\', ''),
            match: pattern.source.replaceAll('\\', ''),
            preview: redact(line.trim()).slice(0, 160),
            excerpt: redact(line.trim()).slice(0, 160),
            severity: 'review'
          });
          break;
        }
      }
    });
  }
  return findings;
}
