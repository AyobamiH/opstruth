export type DiscoveryAnalyticsBinding = {
  writeDataPoint(point: { indexes?: string[]; blobs?: string[]; doubles?: number[] }): void;
};
export type DiscoveryAnalyticsEnv = {
  DISCOVERY_ANALYTICS?: DiscoveryAnalyticsBinding;
};

const crawlerPatterns: Array<[string, string]> = [
  ["oai-searchbot", "openai_search"],
  ["chatgpt-user", "openai_user"],
  ["gptbot", "openai_gptbot"],
  ["claude-searchbot", "anthropic_search"],
  ["claude-user", "anthropic_user"],
  ["claudebot", "anthropic_bot"],
  ["perplexity-user", "perplexity_user"],
  ["perplexitybot", "perplexity_bot"],
  ["google-extended", "google_extended"],
  ["googlebot", "googlebot"],
  ["bingbot", "bingbot"],
  ["applebot-extended", "applebot_extended"],
  ["applebot", "applebot"],
];

function crawlerFamily(userAgent: string): string | null {
  const ua = userAgent.toLowerCase();
  return crawlerPatterns.find(([needle]) => ua.includes(needle))?.[1] ?? null;
}

function publicSurface(path: string): string | null {
  if (path === "/") return "product_page";
  if (path === "/agents.txt") return "agents_txt";
  if (path === "/llms.txt") return "llms_txt";
  if (path === "/robots.txt") return "robots";
  if (path === "/sitemap.xml") return "sitemap";
  if (path === "/support") return "support";
  if (path === "/privacy" || path === "/terms") return "legal";
  return null;
}

export function recordDiscoveryObservation(
  request: Request,
  status: number,
  env: DiscoveryAnalyticsEnv,
): void {
  const binding = env.DISCOVERY_ANALYTICS;
  if (!binding || !["GET", "HEAD"].includes(request.method)) return;
  let url: URL;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.hostname !== "opstruth.io") return;
  const surface = publicSurface(url.pathname);
  const crawler = crawlerFamily(request.headers.get("user-agent") ?? "");
  if (!surface || !crawler) return;
  try {
    binding.writeDataPoint({
      indexes: ["opstruth:" + crawler],
      blobs: ["agent_discovery", crawler, surface, "opstruth", request.method],
      doubles: [status],
    });
  } catch {
    // Discovery measurement must never affect the public response.
  }
}
