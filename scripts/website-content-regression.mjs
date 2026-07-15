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

if (failures.length) {
  console.error("Website content regression check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Website content regression check passed.");
