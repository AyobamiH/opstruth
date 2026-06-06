import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { CurrentTruthFilm } from "@/components/site/CurrentTruthFilm";
import { Problem } from "@/components/site/Problem";
import { WhatItChecks } from "@/components/site/WhatItChecks";
import { ProofGap } from "@/components/site/ProofGap";
import { WillNotDo } from "@/components/site/WillNotDo";
import { ExampleOutput } from "@/components/site/ExampleOutput";
import { EvidencePack } from "@/components/site/EvidencePack";
import { GitHubWorkflow } from "@/components/site/GitHubWorkflow";
import { Community } from "@/components/site/Community";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "opstruth — Operational proof for AI-assisted engineering" },
      {
        name: "description",
        content:
          "opstruth is a local, read-only CLI that verifies what is actually true after AI-assisted changes. Evidence-backed findings, honest proof gaps, zero deploys.",
      },
      { property: "og:title", content: "opstruth — Operational proof for AI-assisted engineering" },
      {
        property: "og:description",
        content:
          "Read-only operational truth checks for AI-assisted engineering. One command. Evidence, not vibes.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/og-card.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/og-card.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "opstruth",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Windows, macOS, Linux",
          description:
            "A local, read-only CLI that verifies what is actually true after AI-assisted changes. Evidence-backed findings, honest proof gaps, zero deploys.",
          url: "https://github.com/ayobamih/opstruth",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <CurrentTruthFilm />
        <Problem />
        <ProofGap />
        <WhatItChecks />
        <ExampleOutput />
        <GitHubWorkflow />
        <WillNotDo />
        <EvidencePack />
        <Community />
      </main>
      <SiteFooter />
    </div>
  );
}
