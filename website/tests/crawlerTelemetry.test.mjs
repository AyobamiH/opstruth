import test from "node:test";
import assert from "node:assert/strict";
import {
  MACHINE_DISCOVERY_PATHS,
  classifyAgentCrawler,
  isMachineDiscoveryPath,
  crawlerPathGroup,
  crawlerTelemetryPoint,
  recordAgentCrawler,
} from "../src/lib/crawlerTelemetry.mjs";

test("recognises named AI crawlers", () => {
  assert.equal(classifyAgentCrawler("GPTBot/1.2"), "gptbot");
  assert.equal(classifyAgentCrawler("OAI-SearchBot/1.0"), "oai_search");
  assert.equal(classifyAgentCrawler("ClaudeBot/1.0"), "claude_bot");
  assert.equal(classifyAgentCrawler("PerplexityBot/1.0"), "perplexity_bot");
  assert.equal(classifyAgentCrawler("Mozilla/5.0"), null);
});

test("groups public and machine discovery paths", () => {
  assert.deepEqual(MACHINE_DISCOVERY_PATHS, [
    "/agents.txt",
    "/llms.txt",
    "/robots.txt",
    "/sitemap.xml",
  ]);
  assert.equal(isMachineDiscoveryPath("/llms.txt"), true);
  assert.equal(isMachineDiscoveryPath("/support"), false);
  assert.equal(crawlerPathGroup("/"), "home");
  assert.equal(crawlerPathGroup("/agents.txt"), "machine_discovery");
  assert.equal(crawlerPathGroup("/llms.txt"), "machine_discovery");
  assert.equal(crawlerPathGroup("/support"), "support");
  assert.equal(crawlerPathGroup("/privacy"), "legal");
});

test("writes only coarse crawler dimensions", () => {
  const request = new Request("https://opstruth.io/llms.txt?token=private", {
    headers: { "user-agent": "OAI-SearchBot/1.0", "cf-connecting-ip": "203.0.113.9" },
  });
  assert.deepEqual(crawlerTelemetryPoint(request, 200), {
    crawler: "oai_search",
    productSurface: "opstruth",
    pageGroup: "machine_discovery",
    method: "GET",
    status: 200,
  });
  let point;
  const dataset = {
    writeDataPoint(value) {
      point = value;
    },
  };
  assert.equal(recordAgentCrawler(request, 200, dataset), true);
  assert.deepEqual(point.indexes, ["oai_search"]);
  assert.deepEqual(point.blobs, [
    "opstruth.io",
    "oai_search",
    "opstruth",
    "machine_discovery",
    "GET",
  ]);
  assert.equal(JSON.stringify(point).includes("203.0.113.9"), false);
  assert.equal(JSON.stringify(point).includes("token"), false);
  assert.equal(JSON.stringify(point).includes("OAI-SearchBot/1.0"), false);
});
