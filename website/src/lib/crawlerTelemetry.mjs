const CRAWLERS = [
  ["oai_search", /(?:^|\s|\()oai-searchbot(?:\/|\s|\)|$)/i],
  ["gptbot", /(?:^|\s|\()gptbot(?:\/|\s|\)|$)/i],
  ["chatgpt_user", /(?:^|\s|\()chatgpt-user(?:\/|\s|\)|$)/i],
  ["claude_search", /(?:^|\s|\()claude-searchbot(?:\/|\s|\)|$)/i],
  ["claude_user", /(?:^|\s|\()claude-user(?:\/|\s|\)|$)/i],
  ["claude_bot", /(?:^|\s|\()claudebot(?:\/|\s|\)|$)/i],
  ["perplexity_user", /(?:^|\s|\()perplexity-user(?:\/|\s|\)|$)/i],
  ["perplexity_bot", /(?:^|\s|\()perplexitybot(?:\/|\s|\)|$)/i],
  ["google_extended", /(?:^|\s|\()google-extended(?:\/|\s|\)|$)/i],
  ["applebot_extended", /(?:^|\s|\()applebot-extended(?:\/|\s|\)|$)/i],
];

export function classifyAgentCrawler(userAgent) {
  if (typeof userAgent !== "string" || userAgent.length > 1024) return null;
  return CRAWLERS.find(([, pattern]) => pattern.test(userAgent))?.[0] ?? null;
}

export function crawlerPathGroup(pathname) {
  if (pathname === "/") return "home";
  if (["/agents.txt", "/llms.txt", "/robots.txt", "/sitemap.xml"].includes(pathname))
    return "machine_discovery";
  if (pathname === "/support") return "support";
  if (pathname === "/privacy" || pathname === "/terms") return "legal";
  return "other_public";
}

export function crawlerTelemetryPoint(request, status) {
  if (!request || !["GET", "HEAD"].includes(request.method)) return null;
  let url;
  try {
    url = new URL(request.url);
  } catch {
    return null;
  }
  if (url.hostname !== "opstruth.io") return null;
  const crawler = classifyAgentCrawler(request.headers.get("user-agent") || "");
  if (!crawler) return null;
  return {
    crawler,
    productSurface: "opstruth",
    pageGroup: crawlerPathGroup(url.pathname),
    method: request.method,
    status: Number.isInteger(status) ? status : 0,
  };
}

export function recordAgentCrawler(request, status, dataset) {
  const point = crawlerTelemetryPoint(request, status);
  if (!point || !dataset?.writeDataPoint) return false;
  try {
    dataset.writeDataPoint({
      indexes: [point.crawler],
      blobs: ["opstruth.io", point.crawler, "opstruth", point.pageGroup, point.method],
      doubles: [point.status, 1],
    });
    return true;
  } catch {
    return false;
  }
}
