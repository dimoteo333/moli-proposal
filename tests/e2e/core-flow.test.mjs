import assert from "node:assert/strict";
import test from "node:test";

import { createServer } from "../../src/server/server.mjs";

test("web app shell exposes Korean core-flow screens and design-system hooks", async (t) => {
  const server = await createServer({ port: 0 });
  t.after(async () => server.close());

  const html = await (await server.fetch("/")).text();
  assert.match(html, /몰리 공공제안 에이전트/);
  assert.match(html, /새 분석 시작/);
  assert.match(html, /공수 산정/);
  assert.match(html, /레포트/);
  assert.match(html, /공유 설정/);
  assert.match(html, /design\/logo.ico|\/logo.ico/);

  const css = await (await server.fetch("/styles.css")).text();
  assert.match(css, /--color-primary:\s*#0046ff/);
  assert.match(css, /max-width:\s*430px/);
  assert.match(css, /min-height:\s*44px/);
});
