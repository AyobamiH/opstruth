const machineSurfaces = new Map([
  ["/agents.txt", "agents_txt"],
  ["/llms.txt", "llms_txt"],
  ["/robots.txt", "robots"],
  ["/sitemap.xml", "sitemap"],
]);

function crawlerFamily(userAgent) {
  const ua = userAgent.toLowerCase();
  const patterns = [
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
  return patterns.find(([needle]) => ua.includes(needle))?.[1] ?? null;
}

export function isMachineDiscoveryPath(path) {
  return machineSurfaces.has(path);
}

function surface(path) {
  const machine = machineSurfaces.get(path);
  if (machine) return machine;
  if (["/", "/privacy", "/terms", "/support"].includes(path))
    return "public_page";
  return null;
}

export function recordDiscovery(request, status, env) {
  const binding = env.DISCOVERY_ANALYTICS;
  if (!binding || !["GET", "HEAD"].includes(request.method)) return;
  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.hostname !== "opstruth.io") return;
  const publicSurface = surface(url.pathname);
  const crawler = crawlerFamily(request.headers.get("user-agent") ?? "");
  if (!publicSurface || (!crawler && !machineSurfaces.has(url.pathname)))
    return;
  try {
    binding.writeDataPoint({
      indexes: ["opstruth:" + (crawler ?? "unclassified_client")],
      blobs: [
        "agent_discovery",
        crawler ?? "unclassified_client",
        publicSurface,
        "opstruth",
        request.method,
      ],
      doubles: [status],
    });
  } catch {
    // Discovery measurement must never alter the public response.
  }
}