import path from 'node:path';
import { pathExists, readJson, readText } from './fs.js';

export async function loadOpstruthConfig(root) {
  const full = path.join(root, 'opstruth.config.json');
  if (!(await pathExists(full))) return { config: null, warning: null, file: null };
  try {
    return { config: await readJson(full), warning: null, file: 'opstruth.config.json' };
  } catch (error) {
    return { config: null, warning: 'Invalid opstruth.config.json: ' + error.message, file: 'opstruth.config.json' };
  }
}

export function normalizeRoutesConfig(config) {
  if (!config) return null;
  const routesConfig = config.routes?.baseUrl !== undefined || config.routes?.paths || Array.isArray(config.routes)
    ? config.routes
    : config;
  const normalizeRoute = (route) => ({
    ...route,
    expectStatus: route.expectStatus || (Number.isFinite(route.expectedStatus) ? [route.expectedStatus] : route.expectedStatus)
  });
  if (Array.isArray(routesConfig)) return { routes: routesConfig.map(normalizeRoute) };
  if (Array.isArray(routesConfig?.routes)) return { ...routesConfig, routes: routesConfig.routes.map(normalizeRoute) };
  if (Array.isArray(routesConfig?.paths)) {
    return {
      ...routesConfig,
      routes: routesConfig.paths.map((routePath) => ({
        path: routePath,
        method: String(routePath).includes('health') ? 'GET' : 'HEAD',
        expectStatus: [200, 301, 302]
      }))
    };
  }
  return routesConfig;
}

export async function loadRoutesConfig(root, file) {
  if (!file) return null;
  const full = path.isAbsolute(file) ? file : path.join(root, file);
  if (!(await pathExists(full))) return null;
  return normalizeRoutesConfig(await readJson(full));
}
export async function findDefaultRoutesConfig(root) {
  for (const file of ['opstruth.config.json', 'opstruth.routes.json', 'routes.json']) {
    const full = path.join(root, file);
    if (await pathExists(full)) {
      try {
        const config = await readJson(full);
        return { file, config: normalizeRoutesConfig(config) };
      } catch (error) {
        return { file, config: null, warning: 'Invalid route config ' + file + ': ' + error.message };
      }
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
