export async function probeUrl(url, { method = 'HEAD', timeoutMs = 15000 } = {}) {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { method, redirect: 'manual', signal: controller.signal });
    const headers = Object.fromEntries(response.headers.entries());
    return { url, method, status: response.status, ok: response.ok, redirected: response.status >= 300 && response.status < 400, location: headers.location || null, headers, latencyMs: Date.now() - started };
  } catch (error) {
    return { url, method, status: null, ok: false, error: error.message, latencyMs: Date.now() - started };
  } finally {
    clearTimeout(timer);
  }
}
