import { createFinding, createResult, finalizeStatus } from '../lib/result.js';
import { runCommand } from '../lib/exec.js';
import { probeUrl } from '../lib/http.js';

export async function runLocal({ cwd = process.cwd(), port = [], health = '/', process: processName, service, strict = false } = {}) {
  const ports = Array.isArray(port) ? port : [port].filter(Boolean);
  if (!ports.length && !processName && !service) return createResult('local', 'skipped', { skipped: ['Local runtime checks skipped because no --port, --process, or --service was provided'], notVerified: ['Local runtime liveness'], nextSafeStep: 'Run opstruth local --port 3000 --health /health when the app is running.' });
  const checks = [];
  const warnings = [];
  const verified = [];
  const findings = [];
  for (const item of ports) {
    const portNumber = String(item);
    const ss = await runCommand('sh', ['-lc', `ss -ltnp 2>/dev/null | grep -E '[:.]${portNumber}\\s' || true`], { cwd, timeoutMs: 10000 });
    const listening = Boolean(ss.stdout.trim());
    checks.push({ name: 'port ' + portNumber + ' listening', status: listening ? 'pass' : 'warn', command: 'ss -ltnp', message: listening ? 'listening' : 'not listening' });
    if (listening) verified.push('Port listening: ' + portNumber); else {
      const message = 'Port not listening: ' + portNumber;
      warnings.push(message);
      findings.push(createFinding({ status: 'warn', area: 'local', title: 'Local port not listening', finding: message, evidence: ['port: ' + portNumber, 'probe type: listening port', 'result: not listening'], whyItMatters: 'A local runtime that is not listening cannot provide live confidence for this change.', nextSafeStep: 'Start the runtime yourself and rerun opstruth local.' }));
    }
    if (health) {
      const probe = await probeUrl(`http://127.0.0.1:${portNumber}${health.startsWith('/') ? health : '/' + health}`, { method: 'GET', timeoutMs: 5000 });
      checks.push({ name: 'health ' + portNumber, status: probe.status && probe.status < 500 ? 'pass' : 'warn', message: 'status=' + (probe.status || probe.error), data: probe });
      if (!probe.status || probe.status >= 500) {
        const message = 'Health check failed for port ' + portNumber;
        warnings.push(message);
        findings.push(createFinding({ status: 'warn', area: 'local', title: 'Local health check failed', finding: message, evidence: ['port: ' + portNumber, 'health URL: ' + probe.url, 'probe type: GET', 'result: ' + (probe.status || probe.error)], whyItMatters: 'A failing health endpoint limits confidence that the local runtime is usable.', nextSafeStep: 'Start or repair the local service and rerun the health probe.' }));
      }
    }
  }
  if (processName) {
    const ps = await runCommand('pgrep', ['-af', processName], { cwd, timeoutMs: 10000 });
    checks.push({ name: 'process match ' + processName, status: ps.exitCode === 0 ? 'pass' : 'warn', command: ps.command });
    if (ps.exitCode === 0) verified.push('Process matched: ' + processName); else warnings.push('No process matched: ' + processName);
  }
  if (service) {
    const svc = await runCommand('systemctl', ['--user', 'status', service, '--no-pager'], { cwd, timeoutMs: 10000 });
    checks.push({ name: 'systemd user service ' + service, status: svc.exitCode === 0 ? 'pass' : 'warn', command: svc.command });
    if (svc.exitCode === 0) verified.push('Systemd user service visible: ' + service); else warnings.push('Systemd user service not active/visible: ' + service);
  }
  return finalizeStatus(createResult('local', warnings.length ? 'warn' : 'pass', { summary: 'Local runtime checks completed without killing or restarting services.', verified, warnings, findings, checks, notVerified: ['Process ownership may be incomplete on restricted systems'], nextSafeStep: warnings.length ? 'Start the runtime yourself and rerun opstruth local.' : 'Attach local liveness evidence if this runtime matters.' }), { strict });
}
