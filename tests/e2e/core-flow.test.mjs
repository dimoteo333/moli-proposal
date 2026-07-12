import assert from "node:assert/strict";
import test from "node:test";

import { createServer } from "../../src/server/server.mjs";

test("web app shell exposes Korean core-flow screens and design-system hooks", async (t) => {
  const server = await createServer({ port: 0 });
  t.after(async () => server.close());

  const html = await (await server.fetch("/")).text();
  assert.match(html, /몰리 공공제안 에이전트/);
  assert.match(html, /data\.js/);
  assert.match(html, /components\.js/);
  assert.match(html, /screens-1\.js/);
  assert.match(html, /app\.js/);

  const css = await (await server.fetch("/styles.css")).text();
  assert.match(css, /--color-primary:\s*#6b4eff/);
  assert.match(css, /--color-shinhan:\s*#0046ff/);

  const dataJs = await (await server.fetch("/data.js")).text();
  assert.match(dataJs, /MOLI_DATA/);

  // Verify Korean UI labels exist in the JS source files
  const screens1 = await (await server.fetch("/screens-1.js")).text();
  const screens2 = await (await server.fetch("/screens-2.js")).text();
  const screens = screens1 + screens2;

  assert.match(screens, /새 분석 시작/);
  assert.match(screens, /공수 산정/);
  assert.match(screens, /레포트/);
  assert.match(screens, /공유/);

  // Verify design logo.ico is available
  const logoRes = await server.fetch("/logo.ico");
  assert.equal(logoRes.ok, true);

  // Verify brand assets (Moli character, logo, Shinhan CI) are served as PNG
  for (const asset of ["logo.png", "moli-character.png", "moli-icon-4.png", "shinhan-ci.png"]) {
    const res = await server.fetch(`/assets/${asset}`);
    assert.equal(res.ok, true, `missing /assets/${asset}`);
    assert.equal(res.headers.get("content-type"), "image/png");
  }
});
