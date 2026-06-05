import { spawn } from 'node:child_process';
import { redact } from './redact.js';

export function runCommand(command, args = [], { cwd = process.cwd(), timeoutMs = 120000 } = {}) {
  const started = Date.now();
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, shell: false, windowsHide: true });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => child.kill('SIGTERM'), timeoutMs);
    child.stdout?.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr?.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ command: [command, ...args].join(' '), exitCode: 127, durationMs: Date.now() - started, stdout: '', stderr: redact(error.message) });
    });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      resolve({ command: [command, ...args].join(' '), exitCode: code ?? (signal ? 124 : 1), signal, durationMs: Date.now() - started, stdout: redact(stdout), stderr: redact(stderr) });
    });
  });
}

export function excerpt(text = '', lines = 30) {
  const clean = redact(text).trim();
  if (!clean) return '';
  return clean.split(/\r?\n/).slice(-lines).join('\n');
}
