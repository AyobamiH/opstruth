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
import { runGitHubCi } from './commands/github-ci.js';
import { runSupabaseLive } from './commands/supabase-live.js';
import { resultToMarkdown } from './lib/markdown.js';
import { formatTerminalOutput } from './lib/terminal.js';
import { writeFileSafe } from './lib/fs.js';
import { redactObject } from './lib/redact.js';
import { exitCodeFor } from './lib/result.js';

const COMMANDS = new Set(['repo', 'quality', 'routes', 'secrets', 'supabase', 'supabase-live', 'cloudflare', 'local', 'github-ci', 'evidence', 'probes', 'welcome', 'init']);
function take(args, index) { return args[index + 1]; }
export function parseArgs(argv) {
  const options = { skip: [], only: [], port: [], protectedTable: [], include: [] };
  let command = null;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('-') && !command && COMMANDS.has(arg)) { command = arg; continue; }
    if (arg === '--help' || arg === '-h') options.help = true;
    if (arg === '--json') options.json = true;
    else if (arg === '--color') options.color = true;
    else if (arg === '--no-color') options.noColor = true;
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
    else if (arg === '--github-ci') options.githubCi = true;
    else if (arg === '--workflow') options.workflow = take(argv, i++);
    else if (arg === '--evidence-file') options.evidenceFile = take(argv, i++);
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
  if (command === 'supabase-live') return runSupabaseLive(options);
  if (command === 'cloudflare') return runCloudflare(options);
  if (command === 'local') return runLocal(options);
  if (command === 'github-ci') return runGitHubCi(options);
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
    '  supabase-live Validate redacted Supabase production evidence',
    '  cloudflare   Static Cloudflare/Wrangler checks',
    '  local        Check explicit local ports/processes/services',
    '  github-ci    Read GitHub Actions metadata for the exact local commit',
    '  evidence     Write a markdown evidence pack',
    '  probes       Inspect the stack-aware probe catalogue',
    '',
    'Global options:',
    '  --strict            Treat warnings/skips as failing confidence',
    '  --json              Print JSON output',
    '  --out <file>        Write command output/evidence',
    '  --skip <area|id>    Skip a command or probe area',
    '  --only <area|id>    Select a probe area or id',
    '  --color             Force colour for human terminal output',
    '  --no-color          Disable colour for human terminal output',
    '  -h, --help          Print help and exit 0'
  ];
  const commandHelp = {
    repo: ['Usage: opstruth repo [--json] [--strict]', 'Inspect cwd, git root, branch, latest commit, dirty files, and detected stack.'],
    quality: ['Usage: opstruth quality [--script name] [--continue] [--json]', 'Run only existing safe package scripts; missing scripts and npm placeholder tests are skipped.'],
    routes: ['Usage: opstruth routes --base-url <url> [--routes file] [--json]', 'Collect read-only URL, method, status, latency, redirect, and header evidence.'],
    secrets: ['Usage: opstruth secrets [--json]', 'Scan source text for risky secret/auth references with redacted previews; .env contents are skipped.'],
    supabase: ['Usage: opstruth supabase [--protected-table name] [--frontend-dir dir] [--migrations-dir dir]', 'Run a static Supabase migration/frontend exposure audit without credentials or database calls.'],
    'supabase-live': ['Usage: opstruth supabase-live --evidence-file <redacted.json> [--json]', 'Validate explicit redacted Supabase production evidence without credentials, mutation, or network calls.'],
    cloudflare: ['Usage: opstruth cloudflare [--url https://example.com] [--json]', 'Inspect Wrangler config, deploy scripts, and optional read-only route status; no deploy is run.'],
    local: ['Usage: opstruth local --port 3000 [--health /health] [--process name] [--service name]', 'Check explicit local runtime inputs without starting, stopping, or killing services.'],
    'github-ci': ['Usage: opstruth github-ci [--workflow CI] [--json]', 'Read GitHub Actions run metadata for the exact local commit. No logs, deploys, or production calls are made.'],
    probes: ['Usage: opstruth probes [--json] [--only area|id] [--skip area|id]', 'Inspect probe catalogue metadata, eligible probes, skipped probes, required inputs, and proof gaps.'],
    evidence: ['Usage: opstruth evidence [--title text] [--out evidence/opstruth.md] [--include file]', 'Write a markdown evidence pack with verified facts, proof gaps, boundaries, and next safe step.'],
    init: ['Usage: opstruth init [--yes]', 'Create a safe starter opstruth.config.json after confirmation.']
  };
  if (commandHelp[command]) {
    const [usage, description] = commandHelp[command];
    return [
      ASCII_HEADER,
      usage,
      '',
      description,
      '',
      'Examples:',
      '  opstruth',
      '  opstruth --base-url https://example.com',
      '  opstruth routes --base-url https://example.com',
      '  opstruth local --port 3000 --health /health',
      '  opstruth --json',
      '  opstruth --no-color',
      '  opstruth --color',
      '',
      'Options:',
      '  --json              Print JSON output',
      '  --strict            Treat warnings/skips as failing confidence',
      '  --color             Force colour for human terminal output',
      '  --no-color          Disable colour for human terminal output',
      '  -h, --help          Print help and exit 0'
    ].join('\n') + '\n';
  }
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
    '- opstruth --json',
    '- opstruth --no-color',
    '- opstruth --color',
    '- opstruth evidence --title "Release proof"',
    '',
    'Improving confidence:',
    '- provide --base-url or route config when route proof matters',
    '- provide --port and --health when local runtime proof matters',
    '- run inside a git repo for stronger change evidence',
    '- attach evidence/opstruth-report.md to reviews or CI artifacts',
    '',
    'Safety philosophy:',
    'opstruth prefers skipped or not verified over pretending something is safe. Dangerous actions require explicit approval and are not part of the default run.',
    ''
  ].join('\n');
}

const INIT_CONFIG = {
  projectName: 'example',
  routes: [
    { path: '/', expectedStatus: 200 },
    { path: '/health', expectedStatus: 200 }
  ],
  local: {
    ports: [],
    healthPaths: ['/health']
  },
  quality: {
    skipScripts: [],
    requiredScripts: []
  },
  secrets: {
    allowlistPaths: [],
    allowlistPatterns: []
  },
  supabase: {
    enabled: true,
    protectedTables: [
      'agent_jobs',
      'platform_credentials',
      'worker_logs'
    ]
  },
  cloudflare: {
    enabled: true
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
    await writeStdout(formatTerminalOutput(helpText(command), options));
    process.exitCode = 0;
    return;
  }
  const result = await dispatch(command, options);
  if (typeof result === 'string') {
    await writeStdout(formatTerminalOutput(result, options));
    process.exitCode = 0;
    return;
  }
  const output = options.json ? JSON.stringify(redactObject(result), null, 2) + '\n' : resultToMarkdown(result);
  if (options.out && command) {
    const outPath = path.isAbsolute(options.out) ? options.out : path.join(cwd, options.out);
    await writeFileSafe(outPath, output);
  }
  await writeStdout(options.json ? output : formatTerminalOutput(output, options));
  process.exitCode = exitCodeFor(result, { strict: options.strict });
}
