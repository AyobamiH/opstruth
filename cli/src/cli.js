import path from 'node:path';
import { readFile } from 'node:fs/promises';
import readline from 'node:readline/promises';
import { runOrchestrator } from './orchestrator.js';
import { runRepo } from './commands/repo.js';
import { runQuality } from './commands/quality.js';
import { runRoutes } from './commands/routes.js';
import { runSecrets } from './commands/secrets.js';
import { runSupabase } from './commands/supabase.js';
import { runCloudflare } from './commands/cloudflare.js';
import { runLocal } from './commands/local.js';
import { runEvidence } from './commands/evidence.js';
import { runProbes } from './commands/probes.js';
import { resultToMarkdown } from './lib/markdown.js';
import { writeFileSafe } from './lib/fs.js';
import { redactObject } from './lib/redact.js';
import { exitCodeFor } from './lib/result.js';

const COMMANDS = new Set(['repo', 'quality', 'routes', 'secrets', 'supabase', 'cloudflare', 'local', 'evidence', 'probes', 'welcome', 'init']);
function take(args, index) { return args[index + 1]; }
export function parseArgs(argv) {
  const options = { skip: [], only: [], port: [], protectedTable: [], include: [] };
  let command = null;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('-') && !command && COMMANDS.has(arg)) { command = arg; continue; }
    if (arg === '--help' || arg === '-h') options.help = true;
    if (arg === '--json') options.json = true;
    else if (arg === '--out') options.out = take(argv, i++);
    else if (arg === '--base-url') options.baseUrl = take(argv, i++);
    else if (arg === '--routes') options.routesFile = take(argv, i++);
    else if (arg === '--port') options.port.push(take(argv, i++));
    else if (arg === '--health') { options.health = take(argv, i++); options.healthProvided = true; }
    else if (arg === '--skip') options.skip.push(take(argv, i++));
    else if (arg === '--only') options.only.push(take(argv, i++));
    else if (arg === '--yes' || arg === '-y') options.yes = true;
    else if (arg === '--strict') options.strict = true;
    else if (arg === '--continue') options.continueOnFailure = true;
    else if (arg === '--protected-table') options.protectedTable.push(take(argv, i++));
    else if (arg === '--frontend-dir') options.frontendDir = take(argv, i++);
    else if (arg === '--migrations-dir') options.migrationsDir = take(argv, i++);
    else if (arg === '--url') options.url = take(argv, i++);
    else if (arg === '--title') options.title = take(argv, i++);
    else if (arg === '--phase') options.phase = take(argv, i++);
    else if (arg === '--include') options.include.push(take(argv, i++));
    else if (arg === '--process') options.process = take(argv, i++);
    else if (arg === '--service') options.service = take(argv, i++);
    else if (arg === '--script') { options.scripts ||= []; options.scripts.push(take(argv, i++)); }
  }
  if (!options.protectedTable.length) delete options.protectedTable;
  return { command, options };
}
async function dispatch(command, options) {
  if (command === 'welcome') return welcomeText();
  if (command === 'init') return runInit(options);
  if (!command) return runOrchestrator(options);
  if (command === 'repo') return runRepo(options);
  if (command === 'quality') return runQuality(options);
  if (command === 'routes') return runRoutes(options);
  if (command === 'secrets') return runSecrets(options);
  if (command === 'supabase') return runSupabase(options);
  if (command === 'cloudflare') return runCloudflare(options);
  if (command === 'local') return runLocal(options);
  if (command === 'evidence') return runEvidence(options);
  if (command === 'probes') return runProbes(options);
  throw new Error('Unknown command: ' + command);
}

function writeStdout(text) {
  return new Promise((resolve) => {
    process.stdout.write(text, resolve);
  });
}

const ASCII_HEADER = `   ____        _______          __  __
  / __ \\____  / ____(_)___  ____/ /_/ /
 / / / / __ \\/ /_  / / __ \\/ __  / __/
/ /_/ / /_/ / __/ / / / / / /_/ / /_
\\____/ .___/_/   /_/_/ /_/\\__,_/\\__/
    /_/

Operational truth checks for AI-assisted engineering.
`;

function helpText(command) {
  const common = [
    ASCII_HEADER,
    'Usage:',
    '  opstruth [--strict] [--json] [--out file]',
    '  opstruth <command> [options]',
    '',
    'Commands:',
    '  welcome      Explain what opstruth is and how to use it',
    '  init         Create opstruth.config.json after confirmation',
    '  repo         Inspect git/repo/stack facts',
    '  quality      Run safe package quality scripts that exist',
    '  routes       Probe configured HTTP routes with HEAD/GET',
    '  secrets      Scan source for risky references with redaction',
    '  supabase     Static Supabase safety checks',
    '  cloudflare   Static Cloudflare/Wrangler checks',
    '  local        Check explicit local ports/processes/services',
    '  evidence     Write a markdown evidence pack',
    '  probes       Inspect the stack-aware probe catalogue',
    '',
    'Global options:',
    '  --strict            Treat warnings/skips as failing confidence',
    '  --json              Print JSON output',
    '  --out <file>        Write command output/evidence',
    '  --skip <area|id>    Skip a command or probe area',
    '  --only <area|id>    Select a probe area or id',
    '  -h, --help          Print help and exit 0'
  ];
  const route = [
    ASCII_HEADER,
    'Usage: opstruth routes --base-url <url> [--routes file] [--strict]',
    '',
    'Read-only route probes collect URL, method, status, latency, redirects, and security-header evidence.',
    '',
    'Options:',
    '  --base-url <url>    Base URL to probe',
    '  --routes <file>     JSON route config',
    '  --json              Print JSON output',
    '  -h, --help          Print help and exit 0'
  ];
  const repo = [
    ASCII_HEADER,
    'Usage: opstruth repo [--json] [--strict]',
    '',
    'Read-only repository inspection reports cwd, git root, branch, latest commit, dirty files, and detected stack.',
    '',
    'Options:',
    '  --json              Print JSON output',
    '  -h, --help          Print help and exit 0'
  ];
  if (command === 'routes') return route.join('\n') + '\n';
  if (command === 'repo') return repo.join('\n') + '\n';
  return common.join('\n') + '\n';
}

function welcomeText() {
  return [
    ASCII_HEADER,
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
    'Common workflows:',
    '- opstruth',
    '- opstruth --strict',
    '- opstruth routes --base-url https://example.com',
    '- opstruth local --port 3000 --health /health',
    '- opstruth evidence --title "Release proof"',
    '',
    'Safety philosophy:',
    'opstruth prefers skipped or not verified over pretending something is safe. Dangerous actions require explicit approval and are not part of the default run.',
    ''
  ].join('\n');
}

const INIT_CONFIG = {
  routes: {
    baseUrl: '',
    paths: ['/', '/login', '/healthz'],
    requiredHeaders: [
      'content-security-policy',
      'strict-transport-security',
      'x-frame-options',
      'referrer-policy'
    ]
  },
  local: {
    ports: [],
    healthPath: '/health'
  },
  supabase: {
    protectedTables: [
      'agent_jobs',
      'platform_credentials',
      'worker_logs'
    ]
  },
  ignore: [
    '.cache',
    '.agents',
    'node_modules',
    'dist',
    'build'
  ]
};

async function readStdin() {
  if (process.stdin.isTTY) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      return await rl.question('');
    } finally {
      rl.close();
    }
  }
  return new Promise((resolve) => {
    let input = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { input += chunk; });
    process.stdin.on('end', () => resolve(input));
  });
}

async function runInit(options) {
  const cwd = options.cwd || process.cwd();
  const outPath = path.join(cwd, 'opstruth.config.json');
  try {
    await readFile(outPath, 'utf8');
    return 'opstruth.config.json already exists. No changes made.\n';
  } catch {
    // Continue when the file is absent.
  }
  if (!options.yes) {
    process.stdout.write('Create opstruth.config.json in this directory? Type yes to continue: ');
    const answer = (await readStdin()).trim().toLowerCase();
    if (answer !== 'yes') return 'No changes made.\n';
  }
  await writeFileSafe(outPath, JSON.stringify(INIT_CONFIG, null, 2) + '\n');
  return 'Created opstruth.config.json\n';
}

export async function runCli(argv, cwd = process.cwd()) {
  const { command, options } = parseArgs(argv);
  options.cwd = cwd;
  if (options.help) {
    await writeStdout(helpText(command));
    process.exitCode = 0;
    return;
  }
  const result = await dispatch(command, options);
  if (typeof result === 'string') {
    await writeStdout(result);
    process.exitCode = 0;
    return;
  }
  const output = options.json ? JSON.stringify(redactObject(result), null, 2) + '\n' : resultToMarkdown(result);
  if (options.out && command) {
    const outPath = path.isAbsolute(options.out) ? options.out : path.join(cwd, options.out);
    await writeFileSafe(outPath, output);
  }
  await writeStdout(output);
  process.exitCode = exitCodeFor(result, { strict: options.strict });
}
