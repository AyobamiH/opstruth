import path from 'node:path';
import { pathExists, readJson, readText } from './fs.js';

export async function loadRoutesConfig(root, file) {
  if (!file) return null;
  const full = path.isAbsolute(file) ? file : path.join(root, file);
  if (!(await pathExists(full))) return null;
  return readJson(full);
}
export async function findDefaultRoutesConfig(root) {
  for (const file of ['opstruth.config.json', 'opstruth.routes.json', 'routes.json']) {
    const full = path.join(root, file);
    if (await pathExists(full)) {
      const config = await readJson(full);
      return { file, config: config.routes?.baseUrl !== undefined || config.routes?.paths ? config.routes : config };
    }
  }
  return null;
}
export async function readWranglerConfig(root) {
  for (const file of ['wrangler.json', 'wrangler.jsonc']) {
    const full = path.join(root, file);
    if (await pathExists(full)) {
      const text = await readText(full);
      return { file, text, data: JSON.parse(text.replace(/\/\/.*$/gm, '')) };
    }
  }
  const toml = path.join(root, 'wrangler.toml');
  if (await pathExists(toml)) return { file: 'wrangler.toml', text: await readText(toml), data: null };
  return null;
}
