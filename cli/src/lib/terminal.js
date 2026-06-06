const ANSI_PATTERN = /\x1B\[[0-?]*[ -/]*[@-~]/g;

const RESET = '\x1b[0m';

// Website-derived terminal approximations from website/src/styles.css.
// The website tokens are OKLCH; these RGB values keep the same calm dark,
// muted, evidence-first feel in common ANSI terminals.
export const THEME = {
  heading: ['\x1b[1m', '\x1b[38;2;235;237;240m'],
  muted: ['\x1b[38;2;150;154;163m'],
  accent: ['\x1b[38;2;126;190;164m'],
  success: ['\x1b[38;2;104;194;142m'],
  warning: ['\x1b[38;2;219;178;80m'],
  failure: ['\x1b[38;2;221;105;92m'],
  code: ['\x1b[38;2;226;229;232m'],
  border: ['\x1b[38;2;82;87;96m']
};

function hasAnsi(text) {
  return ANSI_PATTERN.test(text);
}

export function stripAnsi(text) {
  return String(text).replace(ANSI_PATTERN, '');
}

export function supportsColor(options = {}, stream = process.stdout, env = process.env) {
  if (options.json || options.noColor) return false;
  if (options.color) return true;
  if ('NO_COLOR' in env) return false;
  if (env.TERM === 'dumb') return false;
  return Boolean(stream?.isTTY);
}

export function style(text, token, options = {}) {
  if (!options.colorEnabled) return String(text);
  const open = THEME[token] || THEME.heading;
  return open.join('') + text + RESET;
}

function statusToken(label = '') {
  const normalized = label.toLowerCase();
  if (normalized === 'pass' || normalized === 'verified') return 'success';
  if (normalized === 'partial pass' || normalized === 'warn' || normalized === 'warning') return 'warning';
  if (normalized === 'fail' || normalized === 'failure') return 'failure';
  if (normalized === 'skipped' || normalized === 'not verified' || normalized === 'not_verified') return 'muted';
  return 'heading';
}

function sectionToken(line) {
  if (/^## Verified\b/.test(line)) return 'success';
  if (/^## Warnings\b/.test(line)) return 'warning';
  if (/^## Failures\b/.test(line)) return 'failure';
  if (/^## Skipped\b/.test(line)) return 'muted';
  if (/^## Not Verified\b/.test(line)) return 'warning';
  if (/^## Evidence\b/.test(line)) return 'accent';
  if (/^## Next Safe Step\b/.test(line)) return 'accent';
  if (/^## Overall Confidence\b/.test(line)) return 'accent';
  if (/^## Checks\b|^## Check Summary\b|^## What Matters Most\b/.test(line)) return 'heading';
  return 'heading';
}

function colorStatusWords(line, options) {
  return line.replace(/\b(Partial pass|Not verified|Pass|Fail|Skipped|pass|warn|fail|skipped|not_verified)\b/g, (label) => {
    return style(label, statusToken(label), options);
  });
}

function colorTableLine(line, options) {
  if (/^\| [-| ]+\|$/.test(line) || /^\| Status \|/.test(line) || /^\| Area \|/.test(line)) {
    return style(line, 'border', options);
  }
  return line.replace(/\| (Partial pass|Not verified|Pass|Fail|Skipped|pass|warn|fail|skipped|not_verified) \|/g, (_, label) => {
    return '| ' + style(label, statusToken(label), options) + ' |';
  });
}

function colorEvidenceLine(line, options) {
  const fileMatch = line.match(/^(\s*evidence: )(file:)(\s+)(.+)$/);
  if (fileMatch) {
    return style(fileMatch[1], 'muted', options) + style(fileMatch[2], 'accent', options) + fileMatch[3] + style(fileMatch[4], 'code', options);
  }
  const writtenMatch = line.match(/^(.*Evidence written to:\s+)(.+)$/);
  if (writtenMatch) {
    return style(writtenMatch[1], 'accent', options) + style(writtenMatch[2], 'code', options);
  }
  let formatted = line.replace(/^(\s*evidence: )([^:]+:)/, (_, prefix, key) => {
    return style(prefix, 'muted', options) + style(key, 'accent', options);
  });
  formatted = formatted.replace(/^(\s*(why it matters|next safe step):)/, (match) => style(match, 'accent', options));
  return colorStatusWords(formatted, options);
}

function colorLine(line, options) {
  if (!line || hasAnsi(line)) return line;
  if (/^   ____|^  \/|^ \/ |^\/ \/_|^\\____|^    \/_/.test(line)) return style(line, 'accent', options);
  if (/^Operational truth checks/.test(line)) return style(line, 'muted', options);
  if (/^# /.test(line)) return style(line.replace(/^# /, ''), 'heading', options);
  if (/^## /.test(line)) return style(line.replace(/^## /, ''), sectionToken(line), options);
  if (/^STATUS: /.test(line)) {
    const label = line.slice('STATUS: '.length);
    return style('STATUS:', 'muted', options) + ' ' + style(label, statusToken(label), options);
  }
  if (/^\|/.test(line)) return colorTableLine(line, options);
  if (/^- \[(pass|warn|fail|skipped|not_verified)\]/.test(line)) return colorStatusWords(line, options);
  if (/^\s*(evidence|why it matters|next safe step):/.test(line)) return colorEvidenceLine(line, options);
  if (/Evidence written to:|Evidence file was not written/.test(line)) return colorEvidenceLine(line, options);
  if (/^Usage:|^Commands:|^Global options:|^Options:|^Common workflows:|^Safety philosophy:/.test(line)) return style(line, 'heading', options);
  if (/^\s{2}(opstruth|--|-h|npm|npx)\b/.test(line) || /^- opstruth\b/.test(line)) return style(line, 'code', options);
  if (/^- None$|^- No failures$/.test(line)) return style(line, 'muted', options);
  return line;
}

export function formatTerminalOutput(text, options = {}) {
  const colorEnabled = supportsColor(options);
  if (!colorEnabled) return String(text);
  const styleOptions = { ...options, colorEnabled };
  return String(text).split('\n').map((line) => colorLine(line, styleOptions)).join('\n');
}
