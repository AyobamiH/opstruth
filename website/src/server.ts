import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import {
  isMachineDiscoveryPath,
  recordDiscovery,
  type DiscoveryEnv,
} from "./lib/discoveryAnalytics.mjs";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);

  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("x-frame-options", "DENY");
  headers.set("strict-transport-security", "max-age=31536000");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const discoveryEnv = env && typeof env === "object" ? (env as DiscoveryEnv) : {};
    try {
      const pathname = new URL(request.url).pathname;
      if (isMachineDiscoveryPath(pathname) && discoveryEnv.ASSETS) {
        const asset = withSecurityHeaders(await discoveryEnv.ASSETS.fetch(request));
        recordDiscovery(request, asset.status, discoveryEnv);
        return asset;
      }

      const handler = await getServerEntry();
      const response = withSecurityHeaders(
        await normalizeCatastrophicSsrResponse(await handler.fetch(request, env, ctx)),
      );
      recordDiscovery(request, response.status, discoveryEnv);
      return response;
    } catch (error) {
      console.error(error);
      const response = withSecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      );
      recordDiscovery(request, response.status, discoveryEnv);
      return response;
    }
  },
};
