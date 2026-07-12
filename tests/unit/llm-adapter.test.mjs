import assert from "node:assert/strict";
import test from "node:test";

import { createLlmAdapter, applyLlmEnhancement } from "../../src/features/llm/llmAdapter.mjs";
import { getRuntimeConfig } from "../../src/lib/env.mjs";

const sampleAnalysis = {
  project: { title: "테스트 사업", agency: "테스트 기관" },
  estimation: { totalMM: { min: 10, recommended: 12, max: 15 }, confidenceScore: 80 },
  requirements: [{ included: true }, { included: false }],
  risks: [{ title: "이관 범위 불명확", reason: "원문에 수치 없음" }]
};

const sampleReport = {
  markdown: "# 테스트 보고서\n\n## 경영진 요약\n본문",
  sections: ["경영진 요약"],
  emailDraft: { subject: "s", to: "t", body: "b" }
};

function okFetch(content, capture = {}) {
  return async (url, options) => {
    capture.url = url;
    capture.options = options;
    return {
      ok: true,
      json: async () => ({ model: "glm-4.5", choices: [{ message: { content } }] })
    };
  };
}

test("MOLI_ENABLE_LLM 플래그가 llm.enabled 를 제어하고 레거시 별칭도 지원한다", () => {
  const off = getRuntimeConfig({});
  assert.equal(off.llm.enabled, false);

  const on = getRuntimeConfig({ MOLI_ENABLE_LLM: "true", GLM_API_KEY: "k" });
  assert.equal(on.llm.enabled, true);
  assert.equal(on.llm.apiKeySet, true);

  const legacy = getRuntimeConfig({ MOLI_ENABLE_GLM_ANALYSIS: "true" });
  assert.equal(legacy.llm.enabled, true);

  // 새 플래그가 명시되면 레거시 값보다 우선한다
  const override = getRuntimeConfig({ MOLI_ENABLE_LLM: "false", MOLI_ENABLE_GLM_ANALYSIS: "true" });
  assert.equal(override.llm.enabled, false);
});

test("플래그가 꺼져 있거나 키가 없으면 어댑터는 준비되지 않고 사유를 알려준다", async () => {
  const disabled = createLlmAdapter({ enabled: false });
  assert.equal(disabled.isReady(), false);
  assert.match(disabled.disabledReason(), /MOLI_ENABLE_LLM/);

  const noKey = createLlmAdapter({ enabled: true, baseUrl: "https://api.example" });
  assert.equal(noKey.isReady(), false);
  assert.match(noKey.disabledReason(), /GLM_API_KEY/);

  const result = await disabled.enhanceReport(sampleAnalysis, sampleReport);
  assert.equal(result.ok, false);
});

test("준비된 어댑터는 OpenAI 호환 형식으로 호출하고 JSON 응답을 파싱한다", async () => {
  const capture = {};
  const content = JSON.stringify({
    summaryKO: "보강된 요약입니다.",
    insights: ["인사이트 A", "인사이트 B"]
  });
  const adapter = createLlmAdapter(
    { enabled: true, apiKey: "secret-key", baseUrl: "https://api.example/v4/", model: "glm-4.5" },
    { fetchImpl: okFetch(content, capture) }
  );

  assert.equal(adapter.isReady(), true);
  const result = await adapter.enhanceReport(sampleAnalysis, sampleReport);

  assert.equal(result.ok, true);
  assert.equal(result.summaryKO, "보강된 요약입니다.");
  assert.deepEqual(result.insights, ["인사이트 A", "인사이트 B"]);
  assert.equal(capture.url, "https://api.example/v4/chat/completions");

  const requestBody = JSON.parse(capture.options.body);
  assert.equal(requestBody.model, "glm-4.5");
  assert.equal(capture.options.headers.authorization, "Bearer secret-key");
  // 프롬프트에 산정 숫자가 그대로 들어간다
  assert.match(requestBody.messages[1].content, /12\.0 MM/);
});

test("HTTP 오류·네트워크 오류는 예외 없이 폴백 사유로 반환된다", async () => {
  const httpError = createLlmAdapter(
    { enabled: true, apiKey: "k", baseUrl: "https://api.example" },
    { fetchImpl: async () => ({ ok: false, status: 429 }) }
  );
  const httpResult = await httpError.enhanceReport(sampleAnalysis, sampleReport);
  assert.equal(httpResult.ok, false);
  assert.match(httpResult.reason, /429/);

  const networkError = createLlmAdapter(
    { enabled: true, apiKey: "k", baseUrl: "https://api.example" },
    { fetchImpl: async () => { throw new Error("ECONNREFUSED"); } }
  );
  const networkResult = await networkError.enhanceReport(sampleAnalysis, sampleReport);
  assert.equal(networkResult.ok, false);
  assert.match(networkResult.reason, /ECONNREFUSED/);
});

test("코드펜스·비JSON 응답도 관대하게 파싱한다", async () => {
  const fenced = "```json\n{\"summaryKO\": \"펜스 요약\", \"insights\": []}\n```";
  const adapter = createLlmAdapter(
    { enabled: true, apiKey: "k", baseUrl: "https://api.example" },
    { fetchImpl: okFetch(fenced) }
  );
  const result = await adapter.enhanceReport(sampleAnalysis, sampleReport);
  assert.equal(result.ok, true);
  assert.equal(result.summaryKO, "펜스 요약");

  const plain = createLlmAdapter(
    { enabled: true, apiKey: "k", baseUrl: "https://api.example" },
    { fetchImpl: okFetch("그냥 문장 응답") }
  );
  const plainResult = await plain.enhanceReport(sampleAnalysis, sampleReport);
  assert.equal(plainResult.ok, true);
  assert.equal(plainResult.summaryKO, "그냥 문장 응답");
});

test("applyLlmEnhancement 는 성공 시 AI 섹션을 삽입하고 실패 시 원본을 유지한다", () => {
  const enhanced = applyLlmEnhancement(sampleReport, {
    ok: true, summaryKO: "요약", insights: ["a"], model: "glm-4.5", latencyMs: 120
  });
  assert.equal(enhanced.aiEnhancement.enabled, true);
  assert.match(enhanced.markdown, /## AI 보강 요약/);
  assert.equal(enhanced.sections[0], "AI 보강 요약");
  // AI 섹션은 경영진 요약 앞에 삽입된다
  assert.ok(enhanced.markdown.indexOf("## AI 보강 요약") < enhanced.markdown.indexOf("## 경영진 요약"));

  const fallback = applyLlmEnhancement(sampleReport, { ok: false, reason: "플래그 꺼짐" });
  assert.equal(fallback.aiEnhancement.enabled, false);
  assert.equal(fallback.markdown, sampleReport.markdown);
  assert.equal(fallback.aiEnhancement.reason, "플래그 꺼짐");
});

test("어댑터 상태 노출(describe)에 API 키 원문이 포함되지 않는다", () => {
  const adapter = createLlmAdapter({ enabled: true, apiKey: "super-secret", baseUrl: "https://api.example" });
  const described = JSON.stringify(adapter.describe());
  assert.ok(!described.includes("super-secret"));
  assert.equal(adapter.describe().ready, true);
});
