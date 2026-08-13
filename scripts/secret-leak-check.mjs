import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const trackedFiles = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((file) => !file.startsWith("package-lock.json"));

const secretPatterns = [
  { name: "GitHub token", pattern: /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/g },
  { name: "OpenAI API key", pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/g },
  { name: "Google OAuth access token", pattern: /\bya29\.[A-Za-z0-9_-]{20,}\b/g },
  { name: "AWS access key", pattern: /\bAKIA[0-9A-Z]{16}\b/g },
  { name: "Private key block", pattern: /-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY-----/g },
  { name: "JWT", pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g }
];

const allowlist = [
  "GOOGLE_CALENDAR_ACCESS_TOKEN=ya29...",
  "GMAIL_ACCESS_TOKEN=ya29...",
  "GOOGLE_DRIVE_ACCESS_TOKEN=ya29..."
];

const findings = [];

for (const file of trackedFiles) {
  const absolute = resolve(root, file);
  const content = readFileSync(absolute, "utf8");
  for (const { name, pattern } of secretPatterns) {
    for (const match of content.matchAll(pattern)) {
      const value = match[0];
      if (allowlist.some((allowed) => content.includes(allowed) && allowed.includes(value))) continue;
      const line = content.slice(0, match.index).split("\n").length;
      findings.push(`${name} in ${relative(root, absolute)}:${line}`);
    }
  }
}

if (findings.length > 0) {
  console.error("Potential secret leak detected:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log("No committed secret patterns detected.");
