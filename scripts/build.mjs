import { mkdir, copyFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const dist = "dist";
await mkdir(dist, { recursive: true });

const files = [
  "src/app/index.html",
  "src/app/styles.css",
  "src/app/data.js",
  "src/app/components.js",
  "src/app/screens-1.js",
  "src/app/screens-2.js",
  "src/app/app.js"
];

for (const f of files) {
  await copyFile(f, join(dist, f.replace("src/app/", "")));
}

await copyFile("public/logo.ico", join(dist, "logo.ico"));

await writeFile(join(dist, "build-meta.json"), JSON.stringify({
  name: "moli-public-proposal-agent",
  reportLanguage: "ko",
  builtAt: new Date().toISOString()
}, null, 2));
console.log("Build completed: dist/");
