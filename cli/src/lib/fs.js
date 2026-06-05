import fs from 'node:fs/promises';
import path from 'node:path';
import { isIgnoredExtension } from './boundary.js';

export async function pathExists(filePath) {
  try { await fs.access(filePath); return true; } catch { return false; }
}
export async function readText(filePath) { return fs.readFile(filePath, 'utf8'); }
export async function readJson(filePath) { return JSON.parse(await readText(filePath)); }
export async function writeFileSafe(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf8');
}
export async function listPresent(root, files) {
  const present = [];
  for (const file of files) if (await pathExists(path.join(root, file))) present.push(file);
  return present;
}
export async function walkFiles(root, { skipDirs = [], maxFiles = 5000, skipBinary = true } = {}) {
  const results = [];
  async function walk(dir) {
    if (results.length >= maxFiles) return;
    let entries = [];
    try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full).replaceAll('\\', '/');
      if (entry.isDirectory()) {
        if (!skipDirs.includes(entry.name) && !skipDirs.includes(rel)) await walk(full);
      } else if (entry.isFile() && (!skipBinary || !isIgnoredExtension(entry.name))) results.push({ full, rel });
      if (results.length >= maxFiles) return;
    }
  }
  await walk(root);
  return results;
}
