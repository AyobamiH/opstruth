// Optional public-site measurement. Never pass form values, repository data or arbitrary URLs here.
const ALLOWED_SOURCES = new Set([
  "linkedin",
  "threads",
  "reddit",
  "github",
  "google",
  "chatgpt",
  "claude",
  "perplexity",
  "proofandstate",
  "opstruth",
]);
const ALLOWED_CAMPAIGNS = new Set([
  "chatgpt_plugins_2026q4",
  "opstruth_2026q4",
  "agent_discovery_2026q4",
  "plugin_discovery_2026q4",
]);

function pageGroup(pathname) {
  if (pathname === "/") return "home";
  if (pathname === "/support") return "support";
  if (pathname === "/privacy" || pathname === "/terms") return "legal";
  return null;
}

function attribution(search) {
  const params = new URLSearchParams(search || "");
  const source = params.get("utm_source");
  const campaign = params.get("utm_campaign");
  const medium = params.get("utm_medium");
  if (
    source &&
    campaign &&
    ALLOWED_SOURCES.has(source) &&
    ALLOWED_CAMPAIGNS.has(campaign) &&
    ["organic_social", "referral", "organic_search"].includes(medium || "")
  )
    return { source, campaign, medium };
  return { source: "unattributed", campaign: "none", medium: "none" };
}

function classifyAction(href, origin, pluginUrl) {
  let target;
  try {
    target = new URL(href, origin);
  } catch {
    return null;
  }
  if (target.origin === origin) return null;
  const host = target.hostname.toLowerCase();
  const path = target.pathname;
  const plugin = new URL(pluginUrl);
  if (target.origin + path === plugin.origin + plugin.pathname)
    return { interactionType: "directory", outboundTarget: "opstruth_plugin" };
  if (host === "mcp.opstruth.io") return { interactionType: "mcp", outboundTarget: "opstruth_mcp" };
  if (host === "github.com") {
    if (path.startsWith("/marketplace/actions/opstruth-evidence"))
      return { interactionType: "marketplace", outboundTarget: "opstruth_marketplace" };
    if (path.startsWith("/AyobamiH/opstruth/releases"))
      return { interactionType: "release", outboundTarget: "opstruth_release" };
    if (path.startsWith("/AyobamiH/opstruth"))
      return { interactionType: "github", outboundTarget: "opstruth_source" };
  }
  if ((host === "npmjs.com" || host === "www.npmjs.com") && path.includes("opstruth"))
    return { interactionType: "npm", outboundTarget: "opstruth_npm" };
  if (host === "proofandstate.com")
    return { interactionType: "parent_site", outboundTarget: "proof_and_state" };
  return null;
}

export function createMarketingAnalytics({
  measurementId,
  origin,
  paths,
  pluginUrl,
  key,
  win = window,
  doc = document,
}) {
  let granted = false;
  let loaded = false;
  let lastPage = "";
  let scrolledPage = "";
  let diagnostic = false;
  try {
    diagnostic = win.sessionStorage?.getItem("opstruth:analytics-diagnostic") === "operator";
  } catch {}

  const privacySignal = () =>
    win.navigator.globalPrivacyControl === true || win.navigator.doNotTrack === "1";
  const allowed = () =>
    win.location.origin === origin &&
    paths.includes(win.location.pathname) &&
    pageGroup(win.location.pathname) !== null;

  const send = (name, fields = {}) => {
    const group = pageGroup(win.location.pathname);
    if (!granted || !allowed() || !group || privacySignal()) return;
    const attr = attribution(win.location.search);
    win.gtag("event", diagnostic ? "opstruth_diagnostic" : name, {
      send_to: measurementId,
      page_location: origin + win.location.pathname,
      page_referrer: "",
      page_title: "",
      product_surface: "opstruth",
      page_group: group,
      discovery_source: attr.source,
      discovery_campaign: attr.campaign,
      ...(attr.source !== "unattributed"
        ? {
            campaign_source: attr.source,
            campaign_medium: attr.medium,
            campaign_name: attr.campaign,
          }
        : {}),
      ...(diagnostic ? { interaction_type: name, outbound_target: "operator_acceptance" } : {}),
      ...fields,
    });
  };

  function readConsent() {
    try {
      return !privacySignal() && win.localStorage.getItem(key) === "granted";
    } catch {
      return false;
    }
  }

  function refresh() {
    granted = readConsent();
    win["ga-disable-" + measurementId] = !granted || !allowed();
    if (!granted || !allowed()) return;
    if (!loaded) {
      loaded = true;
      win.dataLayer = win.dataLayer || [];
      win.gtag =
        win.gtag ||
        function () {
          win.dataLayer.push(arguments);
        };
      win.gtag("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      win.gtag("consent", "update", { analytics_storage: "granted" });
      win.gtag("js", new Date());
      win.gtag("config", measurementId, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: origin + win.location.pathname,
        page_referrer: "",
        page_title: "",
      });
      const script = doc.createElement("script");
      script.async = true;
      script.referrerPolicy = "no-referrer";
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + measurementId;
      doc.head.appendChild(script);
    }
    if (lastPage !== win.location.pathname) {
      lastPage = win.location.pathname;
      send("page_view");
    }
  }

  function choose(accept) {
    try {
      win.localStorage.setItem(key, accept && !privacySignal() ? "granted" : "denied");
    } catch {
      return;
    }
    if (!accept && loaded) {
      granted = false;
      win["ga-disable-" + measurementId] = true;
      for (const cookie of doc.cookie.split(";")) {
        const name = cookie.trim().split("=")[0];
        if (!/^_ga(?:_|$)/.test(name)) continue;
        for (const domain of [
          "",
          win.location.hostname,
          "." + win.location.hostname.replace(/^www\./, ""),
        ]) {
          doc.cookie = name + "=; Max-Age=0; Path=/" + (domain ? "; Domain=" + domain : "");
        }
      }
      win.location.reload();
      return;
    }
    refresh();
  }

  function click(event) {
    const link = event.target?.closest?.("a[href]");
    if (!link) return;
    const action = classifyAction(link.href, origin, pluginUrl);
    if (!action) return;
    send("product_action", {
      interaction_type: action.interactionType,
      outbound_target: action.outboundTarget,
    });
  }

  function scroll() {
    const height = doc.documentElement.scrollHeight - win.innerHeight;
    if (
      height > 0 &&
      win.scrollY / height >= 0.9 &&
      scrolledPage !== win.location.pathname &&
      granted &&
      allowed()
    ) {
      scrolledPage = win.location.pathname;
      send("scroll", { percent_scrolled: 90 });
    }
  }

  return {
    readConsent,
    choose,
    refresh,
    start() {
      refresh();
      doc.addEventListener("click", click);
      win.addEventListener("scroll", scroll, { passive: true });
      return () => {
        doc.removeEventListener("click", click);
        win.removeEventListener("scroll", scroll);
      };
    },
  };
}
