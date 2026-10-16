import test from "node:test";
import assert from "node:assert/strict";
import {
  isMachineDiscoveryPath,
  recordDiscovery,
} from "../src/lib/discoveryAnalytics.mjs";

test("machine surfaces are explicit", () => {
  assert.equal(isMachineDiscoveryPath("/agents.txt"), true);
  assert.equal(isMachineDiscoveryPath("/llms.txt"), true);
  assert.equal(isMachineDiscoveryPath("/private"), false);
});

test("known AI crawler writes only fixed categories", () => {
  const points = [];
  const request = new Request("https://opstruth.io/?token=private", {
    headers: {
      "user-agent":
        "Mozilla/5.0 compatible; GPTBot/1.2; +https://openai.com/gptbot",
      "cf-connecting-ip": "192.0.2.12",
      referer: "https://private.example/path?email=secret@example.com",
    },
  });
  recordDiscovery(request, 200, {
    DISCOVERY_ANALYTICS: { writeDataPoint: (point) => points.push(point) },
  });
  assert.equal(points.length, 1);
  assert.deepEqual(points[0].blobs, [
    "agent_discovery",
    "openai_gptbot",
    "public_page",
    "opstruth",
    "GET",
  ]);
  assert.equal(points[0].indexes[0], "opstruth:openai_gptbot");
  const serialised = JSON.stringify(points);
  assert.equal(serialised.includes("192.0.2.12"), false);
  assert.equal(serialised.includes("secret@example.com"), false);
  assert.equal(serialised.includes("GPTBot/1.2"), false);
});

test("unknown clients are counted only on deliberate machine discovery files", () => {
  const points = [];
  const env = {
    DISCOVERY_ANALYTICS: { writeDataPoint: (point) => points.push(point) },
  };
  recordDiscovery(
    new Request("https://opstruth.io/agents.txt", {
      headers: { "user-agent": "curl/8" },
    }),
    200,
    env,
  );
  recordDiscovery(
    new Request("https://opstruth.io/support", {
      headers: { "user-agent": "curl/8" },
    }),
    200,
    env,
  );
  assert.equal(points.length, 1);
  assert.deepEqual(points[0].blobs, [
    "agent_discovery",
    "unclassified_client",
    "agents_txt",
    "opstruth",
    "GET",
  ]);
});