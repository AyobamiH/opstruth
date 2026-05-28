import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { Problem } from "@/components/site/Problem";
import { WhatItChecks } from "@/components/site/WhatItChecks";
import { WillNotDo } from "@/components/site/WillNotDo";
import { ExampleOutput } from "@/components/site/ExampleOutput";
import { EvidencePack } from "@/components/site/EvidencePack";
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
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <Problem />
        <WhatItChecks />
        <ExampleOutput />
        <WillNotDo />
        <EvidencePack />
        <Community />
      </main>
      <SiteFooter />
    </div>
  );
}
