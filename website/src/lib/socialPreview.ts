// Centralised, crawler-safe social preview values shared by all routes.
// Social crawlers require a publicly accessible, absolute image URL.
export const SOCIAL_PREVIEW = {
  imageUrl: "https://opstruth.io/og-card-v2.png",
  imageAlt:
    "OpsTruth verification emblem and wordmark. Operational proof for AI-assisted engineering.",
  width: "1200",
  height: "630",
} as const;
