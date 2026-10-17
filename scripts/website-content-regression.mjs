import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const files = [
  "website/src/components/site/Hero.tsx",
  "website/src/components/site/CurrentTruthFilm.tsx",
  "website/src/components/site/Problem.tsx",
  "website/src/components/site/ProofGap.tsx",
  "website/src/components/site/GitHubWorkflow.tsx",
  "website/src/components/site/EvidencePack.tsx",
  "website/src/components/site/WillNotDo.tsx",
  "website/src/components/site/Community.tsx",
  "website/src/routes/index.tsx",
  "website/src/routes/__root.tsx",
  "website/src/styles.css",
  "website/public/llms.txt",
  "website/public/sitemap.xml",
  "website/public/agents.txt",
  "website/public/robots.txt",
];

const failures = [];

function textFor(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

for (const relativePath of files) {
  const text = textFor(relativePath);
  const publicText = text
    .split("\n")
    .filter(
      (line) =>
        !/^\s*(const .*Src\s*=\s*|src:\s*)["']\/demo\/.*\.(mp4|webm)["'],?;?\s*$/.test(
          line,
        ),
    )
    .join("\n");

  const checks = [
    [/\/demo\/.*\.(mp4|webm)/, "visible demo asset path"],
    [
      /One markdown file\. Reviewable\. Attachable\./i,
      "old evidence-pack headline",
    ],
    [
      /Bring messy repos\. File false positives\. Request probes\./i,
      "old terse community CTA",
    ],
    [/The repo is part of the product\./i, "old abstract repo headline"],
    [/What opstruth will never do\./, "lowercase brand boundary heading"],
    [
      /opstruth checks what is true afterward\./,
      "lowercase hero brand sentence",
    ],
    [
      /opstruth (is|answers|separates|was|will|checks) /,
      "lowercase brand in prose",
    ],
    [/overflow-x-hidden/, "global horizontal overflow hiding"],
  ];

  for (const [pattern, label] of checks) {
    if (pattern.test(publicText)) {
      failures.push(`${relativePath}: ${label}`);
    }
  }
}

const hero = textFor("website/src/components/site/Hero.tsx");
const film = textFor("website/src/components/site/CurrentTruthFilm.tsx");

if (!hero.includes("OpsTruth checks what is actually true afterwards.")) {
  failures.push("Hero headline does not use the revised OpsTruth copy.");
}

const expectedCurrentVideoLabels = [
  "Current product video set",
  "Product proof demo",
  "Product tour",
  "Mobile proof short",
];

for (const label of expectedCurrentVideoLabels) {
  if (!film.includes(label)) {
    failures.push(`Current product video section is missing "${label}".`);
  }
}

if (
  !hero.includes("Current product demo") ||
  !hero.includes("Mobile proof short")
) {
  failures.push("Hero does not expose the desktop and mobile video labels.");
}

const staleVideoPaths = [
  "opstruth-current-runtime-truth.mp4",
  "opstruth-hero-runtime-truth.mp4",
  "opstruth-runtime-truth-extended.mp4",
  "opstruth-runtime-truth.mp4",
];

for (const stalePath of staleVideoPaths) {
  if (hero.includes(stalePath) || film.includes(stalePath)) {
    failures.push(`Active website components still reference ${stalePath}.`);
  }
}



const indexRoute = textFor("website/src/routes/index.tsx");
if (!indexRoute.includes('{ rel: "canonical", href: "https://opstruth.io/" }')) {
  failures.push("index route canonical root link missing");
}

const robots = textFor("website/public/robots.txt");
for (const crawler of [
  "OAI-SearchBot",
  "GPTBot",
  "Claude-SearchBot",
  "ClaudeBot",
  "PerplexityBot",
  "Googlebot",
  "bingbot",
  "Applebot",
]) {
  if (!robots.includes(`User-agent: ${crawler}`)) failures.push(`robots missing ${crawler}`);
}
if (!robots.includes("User-agent: *") || !robots.includes("Allow: /")) {
  failures.push("robots public wildcard policy missing");
}
if (!robots.includes("Sitemap: https://opstruth.io/sitemap.xml")) {
  failures.push("robots sitemap pointer missing");
}

const agents = textFor("website/public/agents.txt");
if (!agents.includes("local, read-only verification CLI")) {
  failures.push("agents.txt capability identity missing");
}
if (!agents.includes("Missing evidence stays unknown")) {
  failures.push("agents.txt evidence boundary missing");
}

const sitemap = textFor("website/public/sitemap.xml");
for (const path of ["/agents.txt", "/llms.txt"]) {
  if (!sitemap.includes(`https://opstruth.io${path}`)) failures.push(`sitemap missing ${path}`);
}

// Social card URL and dimensions must match what bots receive in server-rendered head.
const rootRoute = textFor("website/src/routes/__root.tsx");
const socialPreview = textFor("website/src/lib/socialPreview.ts");
const previewUrl = socialPreview.match(/imageUrl:\s*"([^"]+)"/);
if (!previewUrl || previewUrl[1] !== "https://opstruth.io/og-card-v2.png") {
  failures.push("Social preview URL is not the absolute production HTTPS image URL.");
} else {
  const path = new URL(previewUrl[1]).pathname;
  const png = readFileSync(join(root, "website/public", path.slice(1)));
  if (png.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    failures.push("Social preview image must be a PNG.");
  } else if (png.readUInt32BE(16) !== 1200 || png.readUInt32BE(20) !== 630) {
    failures.push("Social preview image dimensions differ from 1200x630 metadata.");
  }
}
if (!rootRoute.includes('import { SOCIAL_PREVIEW } from "@/lib/socialPreview"')) {
  failures.push("Root route must use shared social preview metadata.");
}
for (const field of [
  'property: "og:image", content: SOCIAL_PREVIEW.imageUrl',
  'property: "og:image:secure_url", content: SOCIAL_PREVIEW.imageUrl',
  'property: "og:image:type", content: "image/png"',
  'property: "og:image:width", content: SOCIAL_PREVIEW.width',
  'property: "og:image:height", content: SOCIAL_PREVIEW.height',
  'property: "og:image:alt", content: SOCIAL_PREVIEW.imageAlt',
  'name: "twitter:card", content: "summary_large_image"',
  'name: "twitter:image", content: SOCIAL_PREVIEW.imageUrl',
  'name: "twitter:image:alt", content: SOCIAL_PREVIEW.imageAlt',
]) {
  if (!rootRoute.includes(field)) failures.push("Missing social metadata: " + field);
}
for (const shadowed of ['property: "og:image"', 'name: "twitter:image"']) {
  if (indexRoute.includes(shadowed)) {
    failures.push("Homepage overrides the shared social image: " + shadowed);
  }
}

if (failures.length) {
  console.error("Website content regression check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Website content regression check passed.");
