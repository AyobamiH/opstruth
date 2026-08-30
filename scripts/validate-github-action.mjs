import { spawnSync } from "node:child_process";
import { cp, mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const action = await readFile(new URL("../action.yml", import.meta.url), "utf8");
const runner = await readFile(new URL("./run-github-action.sh", import.meta.url), "utf8");
const failures = [];
const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const requireText = (value, message) => {
  if (!action.includes(value)) failures.push(message);
};

requireText("name: OpsTruth evidence", "Marketplace action name is missing");
requireText("description: Produce a read-only evidence report", "Action description must state the read-only outcome");
requireText("using: composite", "Action must remain a composite action");
requireText('bash "$GITHUB_ACTION_PATH/scripts/run-github-action.sh"', "Action must execute the bundled runner");

const requireRunnerText = (value, message) => {
  if (!runner.includes(value)) failures.push(message);
};

requireRunnerText('args=(--out "$OPSTRUTH_ACTION_OUTPUT_PATH" --no-color)', "Output path must be passed through a quoted shell array");
requireRunnerText('node "$GITHUB_ACTION_PATH/cli/bin/opstruth.js" "${args[@]}"', "Runner must execute the bundled, reviewed CLI source");
requireRunnerText('output_path must be a non-empty repository-relative path', "Output path must reject absolute, empty, or multiline values");
requireRunnerText('output_path must not escape the repository workspace', "Output path must reject parent-directory traversal");
requireRunnerText("strict must be 'true' or 'false'", "Strict input must fail closed");
requireRunnerText("base_url must be an HTTPS URL on one line", "Route observations must require an HTTPS URL without output injection characters");
requireRunnerText("report_path=%s", "Runner must expose the generated report path");

if (/run:[\s\S]*\$\{\{\s*inputs\./.test(action)) {
  failures.push("Inputs must enter the shell through environment variables, not expression interpolation");
}

if (/curl|wget|npm\s+(?:install|publish)|npx|git\s+(?:push|commit|tag)|wrangler|gh\s+/.test(`${action}\n${runner}`)) {
  failures.push("Action metadata contains a forbidden network, install, publish, or mutation command");
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

const fixture = await mkdtemp(join(tmpdir(), "opstruth-action-fixture-"));
await cp(join(repositoryRoot, "fixtures", "vite-react-app"), fixture, { recursive: true });
spawnSync("git", ["init", "-q"], { cwd: fixture });

const runAction = (overrides = {}) => {
  const outputFile = join(fixture, "github-output.txt");
  return spawnSync("bash", [join(repositoryRoot, "scripts", "run-github-action.sh")], {
    cwd: fixture,
    encoding: "utf8",
    env: {
      ...process.env,
      GITHUB_ACTION_PATH: repositoryRoot,
      GITHUB_WORKSPACE: fixture,
      GITHUB_OUTPUT: outputFile,
      OPSTRUTH_ACTION_OUTPUT_PATH: "evidence/opstruth.md",
      OPSTRUTH_ACTION_STRICT: "false",
      OPSTRUTH_ACTION_BASE_URL: "",
      ...overrides,
    },
  });
};

const validRun = runAction();
if (validRun.status !== 0) {
  console.error(validRun.stderr || validRun.stdout);
  console.error("Bundled action runner failed its isolated fixture execution");
  process.exit(1);
}

await stat(join(fixture, "evidence", "opstruth.md"));

const invalidRuns = [
  { OPSTRUTH_ACTION_OUTPUT_PATH: "../escape.md" },
  { OPSTRUTH_ACTION_OUTPUT_PATH: "/tmp/escape.md" },
  { OPSTRUTH_ACTION_OUTPUT_PATH: "evidence/report.md\ninjected=true" },
  { OPSTRUTH_ACTION_STRICT: "yes" },
  { OPSTRUTH_ACTION_BASE_URL: "http://example.com" },
];

for (const invalid of invalidRuns) {
  const result = runAction(invalid);
  if (result.status !== 2) {
    console.error(`Unsafe action input did not fail closed: ${JSON.stringify(invalid)}`);
    process.exit(1);
  }
}

console.log("GitHub Action validation passed: isolated evidence run, bounded inputs, no publish or target-mutation commands");
