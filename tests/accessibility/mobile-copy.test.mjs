import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appHtml = () => readFile(new URL("../../src/app/index.html", import.meta.url), "utf8");
const appJs = () => readFile(new URL("../../src/app/main.js", import.meta.url), "utf8");
const appCss = () => readFile(new URL("../../src/app/styles.css", import.meta.url), "utf8");

test("UI copy and controls are Korean-first with accessible labels", async () => {
  const [html, js] = await Promise.all([appHtml(), appJs()]);
  const source = `${html}\n${js}`;

  for (const label of ["새 분석 시작", "분석 시작", "근거 보기", "패키지 비교", "레포트 생성", "공유하기", "관리자 설정"]) {
    assert.match(source, new RegExp(label));
  }

  assert.match(source, /aria-label="뒤로가기"/);
  assert.match(source, /aria-label="메뉴"/);
  assert.doesNotMatch(source, /Start New Analysis|Generate Report|Share Settings/);
});

test("mobile CSS avoids horizontal overflow and preserves reachable touch targets", async () => {
  const css = await appCss();

  assert.match(css, /overflow-x:\s*hidden/);
  assert.match(css, /width:\s*min\(100%,\s*430px\)/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /position:\s*sticky/);
});
