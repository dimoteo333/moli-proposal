import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const files = [
  ...await collect("src", /\.(mjs|js|css|html)$/),
  ...await collect("api", /\.(mjs|js)$/),
  ...await collect("tests", /\.(mjs|js)$/),
  ...await collect("harness", /\.(mjs|ts|sh|json|md)$/),
  ...await collect("docs", /\.md$/),
  ...await collect(".", /^[^/]+\.(mjs|js|ts|json|md)$/)
];

const errors = [];
for (const file of files) {
  const text = await readFile(file, "utf8");
  if (/\t/.test(text)) errors.push(`${file}: tabs are not allowed`);
  if (/[ \t]+$/m.test(text)) errors.push(`${file}: trailing whitespace`);
  if (file.startsWith("src/app") && !file.endsWith("data.js")) {
    // Strip comments before checking for English UI labels
    const stripped = text.replace(/\/\/.*$/gm, "");
    if (/>Start New Analysis|>Generate Report|>Share Settings</.test(stripped)) {
      errors.push(`${file}: UI copy must be Korean`);
    }
  }
  if (file.endsWith(".json")) {
    JSON.parse(text);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`lint passed (${files.length} files)`);

async function collect(dir, pattern) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const output = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) output.push(...await collect(path, pattern));
    if (entry.isFile() && pattern.test(path)) output.push(path);
  }
  return output;
}
