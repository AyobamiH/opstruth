const VALUE_PATTERNS = [
  /(OPENAI_API_KEY\s*[=:]\s*["']?)([^"'\s;]+)/gi,
  /(SUPABASE_SERVICE_ROLE_KEY\s*[=:]\s*["']?)([^"'\s;]+)/gi,
  /(service_role\s*[=:]\s*["']?)([^"'\s;]+)/gi,
  /(access_token\s*[=:]\s*["']?)([^"'\s;]+)/gi,
  /(refresh_token\s*[=:]\s*["']?)([^"'\s;]+)/gi,
  /(client_secret\s*[=:]\s*["']?)([^"'\s;]+)/gi,
  /(private_key\s*[=:]\s*["']?)([^"'\s;]+)/gi,
  /(webhook_secret\s*[=:]\s*["']?)([^"'\s;]+)/gi,
  /(api_key\s*[=:]\s*["']?)([^"'\s;]+)/gi,
  /(authorization\s*[:=]\s*)([^\n]+)/gi,
  /(bearer\s+)([a-z0-9._~+\/-]+=*)/gi
];

export function redact(value = '') {
  let output = String(value);
  for (const pattern of VALUE_PATTERNS) output = output.replace(pattern, '$1[REDACTED]');
  output = output.replace(/([A-Za-z0-9_]{12,}\.[A-Za-z0-9_\-]{12,}\.[A-Za-z0-9_\-]{12,})/g, '[REDACTED_TOKEN]');
  return output;
}

export function redactObject(value) {
  if (Array.isArray(value)) return value.map(redactObject);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactObject(item)]));
  if (typeof value === 'string') return redact(value);
  return value;
}
