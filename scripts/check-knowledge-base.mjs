import fs from "node:fs";

const requiredFiles = [
  "docs/KNOWLEDGE-BASE.md",
  "README.md",
  "AGENTS.md",
  "docs/completion-gate.md",
  "docs/evidence-pack-standard.md",
  "docs/github-actions.md",
  "docs/github-actions-proof.md",
  "docs/cloudflare-deployment.md",
  "docs/deployment.md",
  "docs/configuration.md",
];
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Knowledge-base canonical source missing: ${file}`);
}

const kb = fs.readFileSync("docs/KNOWLEDGE-BASE.md", "utf8");
const agents = fs.readFileSync("AGENTS.md", "utf8");
const readme = fs.readFileSync("README.md", "utf8");

for (const token of [
  "independent, read-only verification layer",
  "Missing evidence is a proof gap",
  "subject mismatch fails closed",
  "donestate.verification-contract.v2",
  "DoneState cannot self-verify",
  "completion gate",
]) {
  if (!kb.includes(token)) throw new Error(`Knowledge base missing product-boundary token: ${token}`);
}

if (!agents.includes("Treat warnings as unresolved proof gaps, not success.")) {
  throw new Error("AGENTS.md no longer preserves the proof-gap invariant");
}
if (!readme.includes("read-only")) throw new Error("README no longer preserves the read-only product boundary");

console.log("OpsTruth knowledge-base closure passed");
