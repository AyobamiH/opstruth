import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, normalize, relative, resolve } from "node:path";

const repositoryRoot = process.cwd();
const pluginRoot = resolve(repositoryRoot, process.argv[2] ?? "plugins/opstruth");
const manifestPath = join(pluginRoot, ".codex-plugin", "plugin.json");
const failures = [];

const expectedSkills = [
  "build-verify",
  "git-preflight",
  "llm-drift-control",
  "repo-map",
  "runtime-truth",
  "secret-audit",
];

const categories = new Set([
  "Productivity",
  "Creativity",
  "Developer Tools",
  "Business & Operations",
  "Data & Analytics",
  "Communication",
  "Education & Research",
  "Security",
  "Finance",
  "Healthcare",
  "Travel",
  "Entertainment",
  "Other",
]);

function fail(message) {
  failures.push(message);
}

function requireString(value, label, maximum) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${label} must be a non-empty string.`);
    return;
  }
  if (maximum && value.length > maximum) {
    fail(`${label} must be ${maximum} characters or fewer.`);
  }
}

function resolveDeclaredPath(value, label) {
  requireString(value, label);
  if (typeof value !== "string") return null;
  if (!value.startsWith("./") || value.split("/").includes("..")) {
    fail(`${label} must be a safe ./ path inside the plugin.`);
    return null;
  }

  const target = resolve(pluginRoot, value);
  const targetRelative = relative(pluginRoot, target);
  if (targetRelative.startsWith("..") || normalize(targetRelative) === "..") {
    fail(`${label} resolves outside the plugin.`);
    return null;
  }
  if (!existsSync(target)) {
    fail(`${label} references a missing file: ${value}`);
    return null;
  }
  return target;
}

function validatePng(path, label) {
  const bytes = readFileSync(path);
  if (bytes.length > 5 * 1024 * 1024) fail(`${label} exceeds 5 MiB.`);
  if (extname(path).toLowerCase() !== ".png") {
    fail(`${label} must use the packaged PNG logo.`);
    return;
  }
  const signature = "89504e470d0a1a0a";
  if (bytes.subarray(0, 8).toString("hex") !== signature || bytes.length < 24) {
    fail(`${label} is not a readable PNG.`);
    return;
  }
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width !== height) fail(`${label} must be square.`);
  if (width < 48 || width > 4096) {
    fail(`${label} dimensions must be between 48 and 4096 pixels.`);
  }
}

function parseFrontmatter(markdown, label) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    fail(`${label} must start with closed YAML frontmatter.`);
    return null;
  }

  const fields = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    fields[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  if (!match[2].trim()) fail(`${label} must contain instructions.`);
  return fields;
}

function validateMarkdownLinks(skillRoot, markdown, label) {
  for (const match of markdown.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const href = match[1].trim();
    if (/^(https?:|mailto:|#)/.test(href)) continue;
    if (href.split("/").includes("..")) {
      fail(`${label} contains an unsafe parent link: ${href}`);
      continue;
    }
    if (!existsSync(resolve(skillRoot, href))) {
      fail(`${label} references a missing resource: ${href}`);
    }
  }
}

if (!existsSync(manifestPath)) {
  fail("Missing .codex-plugin/plugin.json.");
} else {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (error) {
    fail(`Plugin manifest is not valid JSON: ${error.message}`);
  }

  if (manifest) {
    requireString(manifest.name, "name", 64);
    if (typeof manifest.name === "string" && !/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(manifest.name)) {
      fail("name must use the public plugin identifier format.");
    }
    requireString(manifest.version, "version", 64);
    if (typeof manifest.version === "string" && !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(manifest.version)) {
      fail("version must use semantic versioning.");
    }
    requireString(manifest.description, "description", 1024);
    requireString(manifest.author?.name, "author.name", 80);

    const interfaceData = manifest.interface ?? {};
    requireString(interfaceData.displayName, "interface.displayName", 30);
    requireString(interfaceData.shortDescription, "interface.shortDescription", 30);
    requireString(interfaceData.longDescription, "interface.longDescription", 4000);
    requireString(interfaceData.developerName, "interface.developerName", 80);
    if (manifest.author?.name !== interfaceData.developerName) {
      fail("author.name and interface.developerName must match.");
    }
    if (!categories.has(interfaceData.category)) {
      fail("interface.category is not a supported public category.");
    }

    if (!Array.isArray(interfaceData.capabilities) || interfaceData.capabilities.length === 0) {
      fail("interface.capabilities must contain at least one capability.");
    } else if (interfaceData.capabilities.length > 20) {
      fail("interface.capabilities must contain 20 entries or fewer.");
    } else {
      interfaceData.capabilities.forEach((entry, index) =>
        requireString(entry, `interface.capabilities[${index}]`, 120),
      );
    }

    const prompts = Array.isArray(interfaceData.defaultPrompt)
      ? interfaceData.defaultPrompt
      : [interfaceData.defaultPrompt];
    if (prompts.length > 3) fail("interface.defaultPrompt must contain at most three prompts.");
    prompts.forEach((prompt, index) => {
      requireString(prompt, `interface.defaultPrompt[${index}]`, 128);
      if (typeof prompt === "string" && prompt.includes("@")) {
        fail(`interface.defaultPrompt[${index}] must not contain an @mention.`);
      }
    });

    for (const field of ["websiteURL", "privacyPolicyURL", "termsOfServiceURL", "supportURL"]) {
      const value = interfaceData[field];
      requireString(value, `interface.${field}`, 1024);
      if (typeof value === "string" && !/^https:\/\/[^\s/]+/.test(value)) {
        fail(`interface.${field} must be an HTTPS URL.`);
      }
    }

    const logo = resolveDeclaredPath(interfaceData.logo, "interface.logo");
    const composerIcon = resolveDeclaredPath(interfaceData.composerIcon, "interface.composerIcon");
    if (logo) validatePng(logo, "interface.logo");
    if (composerIcon) validatePng(composerIcon, "interface.composerIcon");

    if (manifest.skills !== "./skills/") {
      fail('skills must be declared as "./skills/".');
    }
  }
}

const skillsRoot = join(pluginRoot, "skills");
if (!existsSync(skillsRoot)) {
  fail("Missing skills directory.");
} else {
  const skillDirectories = readdirSync(skillsRoot)
    .filter((name) => statSync(join(skillsRoot, name)).isDirectory())
    .sort();
  if (JSON.stringify(skillDirectories) !== JSON.stringify(expectedSkills)) {
    fail(`Expected skills ${expectedSkills.join(", ")}; found ${skillDirectories.join(", ")}.`);
  }

  const names = new Set();
  for (const directory of skillDirectories) {
    const skillRoot = join(skillsRoot, directory);
    const skillPath = join(skillRoot, "SKILL.md");
    if (!existsSync(skillPath)) {
      fail(`${directory} is missing SKILL.md.`);
      continue;
    }

    const markdown = readFileSync(skillPath, "utf8");
    const fields = parseFrontmatter(markdown, `${directory}/SKILL.md`);
    if (!fields) continue;
    requireString(fields.name, `${directory} skill name`);
    requireString(fields.description, `${directory} skill description`, 1024);
    if (fields.name !== directory) fail(`${directory} skill name must match its directory.`);
    if (names.has(fields.name)) fail(`Duplicate skill name: ${fields.name}`);
    names.add(fields.name);
    if (`opstruth:${fields.name}`.length > 64) {
      fail(`Combined plugin and skill identity is too long: opstruth:${fields.name}`);
    }
    validateMarkdownLinks(skillRoot, markdown, `${directory}/SKILL.md`);

    const agentPath = join(skillRoot, "agents", "openai.yaml");
    if (!existsSync(agentPath)) {
      fail(`${directory} is missing agents/openai.yaml.`);
    } else {
      const agent = readFileSync(agentPath, "utf8");
      for (const key of ["display_name", "short_description", "default_prompt"]) {
        if (!new RegExp(`^\\s{2}${key}:\\s+\"[^\"]+\"$`, "m").test(agent)) {
          fail(`${directory}/agents/openai.yaml is missing interface.${key}.`);
        }
      }
      if (!agent.includes(`$${directory}`)) {
        fail(`${directory}/agents/openai.yaml default_prompt must mention $${directory}.`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error("ChatGPT plugin validation failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`ChatGPT plugin validation passed for ${expectedSkills.length} skills.`);
