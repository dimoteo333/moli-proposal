import { mkdir, copyFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const dist = "dist";
await mkdir(dist, { recursive: true });
await copyFile("src/app/index.html", join(dist, "index.html"));
await copyFile("src/app/styles.css", join(dist, "styles.css"));
await copyFile("src/app/main.js", join(dist, "main.js"));
await copyFile("public/logo.ico", join(dist, "logo.ico"));
await writeFile(join(dist, "build-meta.json"), JSON.stringify({
  name: "moli-public-proposal-agent",
  reportLanguage: "ko",
  builtAt: new Date().toISOString()
}, null, 2));
console.log("Build completed: dist/");
