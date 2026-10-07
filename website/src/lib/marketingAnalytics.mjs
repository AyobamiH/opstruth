// Optional public-site measurement. Never pass form values or arbitrary URLs here.
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
  // Only our published campaign vocabulary can become attribution data.
  const campaign = {};
  const params = new URLSearchParams(win.location.search || "");
  if (
    params.get("utm_source") === "linkedin" &&
    params.get("utm_medium") === "organic_social" &&
    params.get("utm_campaign") === "chatgpt_plugins_2026q4"
  ) {
    Object.assign(campaign, {
      campaign_source: "linkedin",
      campaign_medium: "organic_social",
      campaign_name: "chatgpt_plugins_2026q4",
    });
    const content = params.get("utm_content");
    if (
      ["oneclick_brief_demo_01", "opstruth_evidence_check_01", "founder_plugin_launch_01"].includes(
        content,
      )
    )
      campaign.campaign_content = content;
  }
  const privacySignal = () =>
    win.navigator.globalPrivacyControl === true || win.navigator.doNotTrack === "1";
  const allowed = () => win.location.origin === origin && paths.includes(win.location.pathname);
  const send = (name, fields = {}) => {
    if (!granted || !allowed() || privacySignal()) return;
    win.gtag("event", name, {
      send_to: measurementId,
      page_location: origin + win.location.pathname,
      page_referrer: "",
      page_title: "",
      ...campaign,
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
        ...campaign,
      });
      const script = doc.createElement("script");
      script.async = true;
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
      // A new document removes the tag and its listeners after withdrawal.
      win.location.reload();
      return;
    }
    refresh();
  }
  function click(event) {
    const link = event.target?.closest?.("a[href]");
    if (!link) return;
    let target;
    try {
      target = new URL(link.href, origin);
    } catch {
      return;
    }
    // Fixed catalogue destination only: no link text, query strings or other URLs.
    if (target.origin + target.pathname === pluginUrl)
      send("plugin_listing_click", { product: key });
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
