import { spawnSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const roots = ["src", "api", "tests", "harness/scripts", "scripts"];
const files = [];
for (const root of roots) {
  files.push(...await collect(root, /\.(mjs|js|ts|json)$/));
}
files.push(...await collect(".", /^[^/]+\.(mjs|js|ts|json)$/));

for (const file of files) {
  if (file.endsWith(".json")) {
    JSON.parse(await readFile(file, "utf8"));
    continue;
  }
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exit(result.status || 1);
  }
}

console.log(`typecheck passed (${files.length} files)`);

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
