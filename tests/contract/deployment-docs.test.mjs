import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("environment example includes production deployment keys without secret values", async () => {
  const text = await readFile(".env.example", "utf8");
  const requiredKeys = [
    "GLM_API_KEY=",
    "GLM_BASE_URL=",
    "GLM_MODEL=",
    "GLM_VISION_MODEL=",
    "GLM_VISION_MCP_SERVER_URL=",
    "MOLI_ENABLE_GLM_ANALYSIS=",
    "MOLI_ENABLE_GLM_VISION_MCP=",
    "SUPABASE_URL=",
    "SUPABASE_ANON_KEY=",
    "SUPABASE_SERVICE_ROLE_KEY=",
    "VERCEL_ENV="
  ];

  for (const key of requiredKeys) {
    assert.equal(text.includes(key), true, `${key} missing from .env.example`);
  }
  assert.equal(/your_api_key|sk-|secret/i.test(text), false, ".env.example should not contain realistic secrets");
});

test("deployment and quality documents cover GLM, Vercel, Supabase, and Vision MCP", async () => {
  const files = {
    glm: await readFile("docs/AI_PROVIDER_GLM.md", "utf8"),
    deploy: await readFile("docs/DEPLOYMENT_VERCEL_SUPABASE.md", "utf8"),
    vision: await readFile("docs/GLM_VISION_MCP_REVIEW.md", "utf8"),
    quality: await readFile("docs/DOCUMENT_QUALITY_PLAN.md", "utf8"),
    migration: await readFile("supabase/migrations/202605180001_initial_schema.sql", "utf8"),
    vercel: await readFile("vercel.json", "utf8")
  };

  assert.match(files.glm, /GLM API Key/);
  assert.match(files.glm, /원문.*노출되지 않는다/);
  assert.match(files.deploy, /Vercel/);
  assert.match(files.deploy, /Supabase/);
  assert.match(files.deploy, /GRANT/);
  assert.match(files.vision, /Vision MCP Server/);
  assert.match(files.vision, /extract_text_from_screenshot/);
  assert.match(files.quality, /문서 품질/);
  assert.match(files.migration, /enable row level security/i);
  assert.match(files.migration, /grant .* service_role/i);
  assert.match(files.vercel, /buildCommand/);
});
