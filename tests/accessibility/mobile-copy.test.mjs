import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSrc = (name) => readFile(new URL(`../../src/app/${name}`, import.meta.url), "utf8");

test("UI copy and controls are Korean-first with accessible labels", async () => {
  const [data, components, screens1, screens2] = await Promise.all([
    readSrc("data.js"),
    readSrc("components.js"),
    readSrc("screens-1.js"),
    readSrc("screens-2.js")
  ]);
  const source = `${data}\n${components}\n${screens1}\n${screens2}`;

  for (const label of ["새 분석 시작", "분석 시작", "근거 보기", "패키지 비교", "레포트 생성", "공유", "관리자"]) {
    assert.match(source, new RegExp(label));
  }

  assert.match(source, /aria-label="뒤로가기"/);
  assert.match(source, /aria-label="닫기"/);

  // No English primary UI text (allowing comments and string identifiers)
  // The design uses English comments for section dividers; only check rendered labels
  const renderedLabels = source.replace(/\/\/.*$/gm, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  assert.doesNotMatch(renderedLabels, />Start New Analysis|>Generate Report|>Share Settings</);
});

test("mobile CSS avoids horizontal overflow and preserves reachable touch targets", async () => {
  const css = await readSrc("styles.css");

  assert.match(css, /overflow-x:\s*hidden/);
  assert.match(css, /max-width:\s*100%/);
  assert.match(css, /height:\s*44px/);
  assert.match(css, /position:\s*sticky/);
});
