import test from "node:test";
import assert from "node:assert/strict";
import { createMarketingAnalytics } from "../src/lib/marketingAnalytics.mjs";

function fixture({
  consent,
  pathname = "/",
  search = "?email=private@example.com",
  navigator = {},
} = {}) {
  const stored = new Map(consent ? [["consent", consent]] : []);
  const scripts = [],
    calls = [],
    listeners = new Map();
  let reloads = 0;
  const win = {
    navigator,
    location: {
      origin: "https://example.com",
      hostname: "example.com",
      pathname,
      search,
      reload: () => reloads++,
    },
    localStorage: { getItem: (k) => stored.get(k) ?? null, setItem: (k, v) => stored.set(k, v) },
    gtag: (...args) => calls.push(args),
    innerHeight: 100,
    scrollY: 900,
    addEventListener: (k, v) => listeners.set(k, v),
    removeEventListener: (k) => listeners.delete(k),
  };
  const doc = {
    cookie: "_ga=old; _ga_TEST=old; essential=keep",
    documentElement: { scrollHeight: 1100 },
    createElement: () => ({}),
    head: { appendChild: (v) => scripts.push(v) },
    addEventListener: (k, v) => listeners.set(k, v),
    removeEventListener: (k) => listeners.delete(k),
  };
  const analytics = createMarketingAnalytics({
    measurementId: "G-TEST",
    origin: "https://example.com",
    paths: ["/", "/privacy"],
    pluginUrl: "https://chatgpt.com/plugins/fixed",
    key: "consent",
    win,
    doc,
  });
  const events = () => calls.filter((c) => c[0] === "event");
  const click = (href) => listeners.get("click")({ target: { closest: () => ({ href }) } });
  return {
    analytics,
    win,
    doc,
    scripts,
    calls,
    listeners,
    events,
    click,
    stored,
    reloads: () => reloads,
  };
}

test("unknown and declined consent do not load Google or send events", () => {
  for (const consent of [undefined, "denied"]) {
    const f = fixture({ consent });
    f.analytics.start();
    f.click("https://chatgpt.com/plugins/fixed");
    f.listeners.get("scroll")();
    f.analytics.refresh();
    assert.equal(f.scripts.length, 0);
    assert.equal(f.calls.length, 0);
  }
});
test("DNT and GPC override both stored and newly requested consent", () => {
  for (const navigator of [{ doNotTrack: "1" }, { globalPrivacyControl: true }]) {
    const f = fixture({ consent: "granted", navigator });
    f.analytics.start();
    f.analytics.choose(true);
    assert.equal(f.scripts.length, 0);
    assert.equal(f.calls.length, 0);
    assert.equal(f.stored.get("consent"), "denied");
  }
});
test("consent loads one tag and exactly one sanitised page view per public navigation", () => {
  const f = fixture();
  const stop = f.analytics.start();
  f.analytics.choose(true);
  f.analytics.refresh();
  assert.equal(f.scripts.length, 1);
  assert.equal(f.events().length, 1);
  assert.equal(f.events()[0][2].page_location, "https://example.com/");
  assert.ok(!JSON.stringify(f.calls).includes("private@example.com"));
  const config = f.calls.find((c) => c[0] === "config")[2];
  assert.equal(config.send_page_view, false);
  f.win.location.pathname = "/privacy";
  f.analytics.refresh();
  assert.equal(f.events().length, 2);
  f.win.location.pathname = "/account/private";
  f.analytics.refresh();
  f.click("https://chatgpt.com/plugins/fixed");
  assert.equal(f.events().length, 2);
  assert.equal(f.win["ga-disable-G-TEST"], true);
  f.win.location.pathname = "/";
  f.analytics.refresh();
  assert.equal(f.events().length, 3);
  stop();
  assert.equal(f.listeners.size, 0);
});
test("account pages cannot initialise a tag even with stored consent", () => {
  const f = fixture({ consent: "granted", pathname: "/auth" });
  f.analytics.start();
  assert.equal(f.scripts.length, 0);
  assert.equal(f.calls.length, 0);
});
test("only the fixed listing is counted; no outbound URL or text is sent", () => {
  const f = fixture({ consent: "granted" });
  f.analytics.start();
  f.click("https://example.org/private?token=secret");
  f.click("https://chatgpt.com/plugins/other");
  assert.equal(f.events().length, 1);
  f.click("https://chatgpt.com/plugins/fixed?prompt=secret");
  assert.equal(f.events()[1][1], "plugin_listing_click");
  assert.ok(!JSON.stringify(f.calls).includes("secret"));
});
test("ninety-percent scroll is counted once per page", () => {
  const f = fixture({ consent: "granted" });
  f.analytics.start();
  f.listeners.get("scroll")();
  f.listeners.get("scroll")();
  assert.equal(f.events().filter((e) => e[1] === "scroll").length, 1);
});
test("withdrawal disables collection immediately and reloads without the tag", () => {
  const f = fixture({ consent: "granted" });
  f.analytics.start();
  f.analytics.choose(false);
  assert.equal(f.stored.get("consent"), "denied");
  assert.equal(f.win["ga-disable-G-TEST"], true);
  assert.equal(f.reloads(), 1);
  f.analytics.refresh();
  f.click("https://chatgpt.com/plugins/fixed");
  assert.equal(f.events().length, 1);
  assert.ok(f.doc.cookie.startsWith("_ga_TEST=; Max-Age=0;"));
});
test("only a fixed campaign vocabulary is measured", () => {
  const f = fixture({
    consent: "granted",
    search:
      "?utm_source=linkedin&utm_medium=organic_social&utm_campaign=chatgpt_plugins_2026q4&utm_content=opstruth_evidence_check_01&email=secret",
  });
  f.analytics.start();
  assert.equal(f.events()[0][2].campaign_content, "opstruth_evidence_check_01");
  assert.ok(!JSON.stringify(f.calls).includes("secret"));
  const bad = fixture({
    consent: "granted",
    search: "?utm_source=private@example.com&utm_content=secret",
  });
  bad.analytics.start();
  assert.equal(bad.events()[0][2].campaign_source, undefined);
  assert.ok(!JSON.stringify(bad.calls).includes("secret"));
});
