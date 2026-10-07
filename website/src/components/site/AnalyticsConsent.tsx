import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { createMarketingAnalytics } from "@/lib/marketingAnalytics.mjs";

let analytics: ReturnType<typeof createMarketingAnalytics> | undefined;
export function AnalyticsConsent() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  useEffect(() => {
    analytics ??= createMarketingAnalytics({
      measurementId: "G-55ENMEPB2Y",
      origin: "https://opstruth.io",
      paths: ["/", "/privacy", "/terms", "/support"],
      pluginUrl: "https://chatgpt.com/plugins/plugins_6a8d4dc60bf081918a06094873890eb4",
      key: "opstruth-marketing-consent-v1",
    });
    let saved = false;
    try {
      saved = window.localStorage.getItem("opstruth-marketing-consent-v1") !== null;
    } catch {
      /* Remain opted out. */
    }
    setOpen(!saved);
    return analytics.start();
  }, []);
  useEffect(() => {
    analytics?.refresh();
  }, [pathname]);
  function choose(accept: boolean) {
    analytics?.choose(accept);
    setOpen(false);
  }
  return (
    <aside
      aria-label="Website analytics preferences"
      className="border-t border-border bg-background px-4 py-4 text-sm"
    >
      {open ? (
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4">
          <p className="flex-1">
            Allow optional Google Analytics cookies to measure visits to public pages and clicks to
            the ChatGPT listing? We do not send prompts, form answers or account details.{" "}
            <a href="/privacy" className="underline">
              Privacy details
            </a>
            .
          </p>
          <button
            type="button"
            className="min-h-11 rounded border border-border px-4"
            onClick={() => choose(false)}
          >
            Decline analytics
          </button>
          <button
            type="button"
            className="min-h-11 rounded border border-border px-4"
            onClick={() => choose(true)}
          >
            Allow analytics
          </button>
        </div>
      ) : (
        <button type="button" className="min-h-11 underline" onClick={() => setOpen(true)}>
          Analytics preferences
        </button>
      )}
    </aside>
  );
}
