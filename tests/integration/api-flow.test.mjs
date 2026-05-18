import assert from "node:assert/strict";
import test from "node:test";

import { createServer } from "../../src/server/server.mjs";

test("API exposes runtime provider readiness without raw keys", async (t) => {
  const server = await createServer({
    port: 0,
    env: {
      GLM_API_KEY: "glm-secret-123456",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-secret-abcdef"
    }
  });
  t.after(async () => server.close());

  const response = await server.fetch("/api/runtime/config");
  const payload = await response.json();
  const serialized = JSON.stringify(payload);

  assert.equal(response.ok, true, serialized);
  assert.equal(payload.glm.apiKeySet, true);
  assert.equal(payload.supabase.serviceRoleKeySet, true);
  assert.equal(serialized.includes("glm-secret-123456"), false);
  assert.equal(serialized.includes("service-role-secret-abcdef"), false);
});

test("API supports the full fixture-backed analysis flow", async (t) => {
  const server = await createServer({ port: 0 });
  t.after(async () => server.close());
  const created = await post(server, "/api/analysis", {
    sourceUrl: "https://www.g2b.go.kr/sample-notice",
    analysisMode: "standard",
    projectCategory: "공공 SI"
  });
  assert.equal(created.status, "draft");

  const uploaded = await post(server, `/api/analysis/${created.analysisId}/files`, {
    fixture: "sample-public-si-rfp.md"
  });
  assert.equal(uploaded.files.length, 1);

  const parsed = await post(server, `/api/analysis/${created.analysisId}/parse`, {});
  assert.equal(parsed.status, "parsed");

  const extracted = await post(server, `/api/analysis/${created.analysisId}/extract`, {});
  assert.ok(extracted.requirementCount >= 20);

  const estimated = await post(server, `/api/analysis/${created.analysisId}/estimate`, {});
  assert.ok(estimated.totalMM.recommended > 0);

  const report = await post(server, `/api/analysis/${created.analysisId}/report`, {});
  assert.match(report.markdown, /## 경영진 요약/);

  const share = await post(server, `/api/analysis/${created.analysisId}/share`, {
    permission: "editable_recalculation",
    expiresInDays: 7
  });
  assert.match(share.url, /\/shared\//);

  const derived = await post(server, `/api/shared/${share.shareId}/recalculate`, {
    requirementId: estimated.optionalRequirementId,
    included: false
  });
  assert.equal(derived.parentAnalysisId, created.analysisId);
  assert.notEqual(derived.analysisId, created.analysisId);
});

async function post(server, path, body) {
  const response = await server.fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json();
  assert.equal(response.ok, true, JSON.stringify(payload));
  return payload;
}
