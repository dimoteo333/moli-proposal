import assert from "node:assert/strict";
import test from "node:test";

import { getRuntimeConfig, maskSecret, publicRuntimeConfig } from "../../src/lib/env.mjs";

test("runtime config reads GLM, Supabase, and Vercel env without exposing secrets", () => {
  const config = getRuntimeConfig({
    PORT: "4010",
    MOLI_FIXTURE: "sample-ai-platform-rfp.md",
    MOLI_REPORT_LANGUAGE: "ko",
    MOLI_SHARE_DEFAULT_DAYS: "14",
    MOLI_ENABLE_GLM_ANALYSIS: "true",
    MOLI_ENABLE_GLM_VISION_MCP: "true",
    GLM_API_KEY: "glm-secret-123456",
    GLM_BASE_URL: "https://glm.example.test/api",
    GLM_MODEL: "glm-test",
    GLM_VISION_MODEL: "glm-vision-test",
    GLM_VISION_MCP_SERVER_URL: "stdio:npx:@z_ai/mcp-server",
    SUPABASE_URL: "https://project.supabase.co",
    SUPABASE_ANON_KEY: "anon-secret-abcdef",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-secret-abcdef",
    VERCEL_ENV: "preview"
  });

  assert.equal(config.app.port, 4010);
  assert.equal(config.app.fixture, "sample-ai-platform-rfp.md");
  assert.equal(config.app.shareDefaultDays, 14);
  assert.equal(config.glm.apiKeySet, true);
  assert.equal(config.glm.baseUrl, "https://glm.example.test/api");
  assert.equal(config.glm.model, "glm-test");
  assert.equal(config.glm.visionModel, "glm-vision-test");
  assert.equal(config.glm.enableAnalysis, true);
  assert.equal(config.glm.visionMcpEnabled, true);
  assert.equal(config.supabase.urlSet, true);
  assert.equal(config.supabase.anonKeySet, true);
  assert.equal(config.supabase.serviceRoleKeySet, true);
  assert.equal(config.vercel.env, "preview");

  const publicConfig = publicRuntimeConfig(config);
  const serialized = JSON.stringify(publicConfig);
  assert.equal(publicConfig.glm.apiKeySet, true);
  assert.equal(publicConfig.supabase.serviceRoleKeySet, true);
  assert.equal(serialized.includes("glm-secret-123456"), false);
  assert.equal(serialized.includes("service-role-secret-abcdef"), false);
  assert.equal(serialized.includes("anon-secret-abcdef"), false);
});

test("maskSecret keeps only a short diagnostic preview", () => {
  assert.equal(maskSecret(""), "");
  assert.equal(maskSecret("short"), "set");
  assert.equal(maskSecret("sk-1234567890abcdef"), "sk-1...cdef");
});
