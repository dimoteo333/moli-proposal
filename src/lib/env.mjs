export function getRuntimeConfig(env = process.env) {
  const glmApiKey = readString(env.GLM_API_KEY);
  const supabaseAnonKey = readString(env.SUPABASE_ANON_KEY);
  const supabaseServiceRoleKey = readString(env.SUPABASE_SERVICE_ROLE_KEY);
  const visionMcpServerUrl = readString(env.GLM_VISION_MCP_SERVER_URL);
  // MOLI_ENABLE_LLM 이 기본 플래그, MOLI_ENABLE_GLM_ANALYSIS 는 하위호환 별칭
  const llmFlag = readString(env.MOLI_ENABLE_LLM) || readString(env.MOLI_ENABLE_GLM_ANALYSIS);
  const llmEnabled = readBoolean(llmFlag);

  return {
    app: {
      port: readNumber(env.PORT, 3000),
      fixture: readString(env.MOLI_FIXTURE, "sample-public-si-rfp.md"),
      reportLanguage: readString(env.MOLI_REPORT_LANGUAGE, "ko"),
      shareDefaultDays: readNumber(env.MOLI_SHARE_DEFAULT_DAYS, 7)
    },
    llm: {
      enabled: llmEnabled,
      provider: readString(env.MOLI_LLM_PROVIDER, "glm"),
      apiKey: glmApiKey,
      apiKeySet: Boolean(glmApiKey),
      baseUrl: readString(env.GLM_BASE_URL, "https://open.bigmodel.cn/api/paas/v4"),
      model: readString(env.GLM_MODEL, "glm-4.5"),
      timeoutMs: readNumber(env.MOLI_LLM_TIMEOUT_MS, 20000)
    },
    glm: {
      apiKey: glmApiKey,
      apiKeySet: Boolean(glmApiKey),
      apiKeyPreview: maskSecret(glmApiKey),
      baseUrl: readString(env.GLM_BASE_URL, "https://open.bigmodel.cn/api/paas/v4"),
      model: readString(env.GLM_MODEL, "glm-4.5"),
      visionModel: readString(env.GLM_VISION_MODEL, "glm-4.5v"),
      enableAnalysis: llmEnabled,
      visionMcpEnabled: readBoolean(env.MOLI_ENABLE_GLM_VISION_MCP),
      visionMcpServerUrl
    },
    supabase: {
      url: readString(env.SUPABASE_URL),
      urlSet: Boolean(readString(env.SUPABASE_URL)),
      anonKey: supabaseAnonKey,
      anonKeySet: Boolean(supabaseAnonKey),
      serviceRoleKey: supabaseServiceRoleKey,
      serviceRoleKeySet: Boolean(supabaseServiceRoleKey),
      serviceRoleKeyPreview: maskSecret(supabaseServiceRoleKey)
    },
    vercel: {
      env: readString(env.VERCEL_ENV, "local")
    }
  };
}

export function publicRuntimeConfig(config = getRuntimeConfig()) {
  return {
    app: {
      fixture: config.app.fixture,
      reportLanguage: config.app.reportLanguage,
      shareDefaultDays: config.app.shareDefaultDays
    },
    llm: {
      enabled: config.llm.enabled,
      ready: config.llm.enabled && config.llm.apiKeySet,
      provider: config.llm.provider,
      model: config.llm.model,
      baseUrl: config.llm.baseUrl
    },
    glm: {
      apiKeySet: config.glm.apiKeySet,
      apiKeyPreview: config.glm.apiKeyPreview,
      baseUrl: config.glm.baseUrl,
      model: config.glm.model,
      visionModel: config.glm.visionModel,
      enableAnalysis: config.glm.enableAnalysis,
      visionMcpEnabled: config.glm.visionMcpEnabled,
      visionMcpServerConfigured: Boolean(config.glm.visionMcpServerUrl)
    },
    supabase: {
      urlSet: config.supabase.urlSet,
      anonKeySet: config.supabase.anonKeySet,
      serviceRoleKeySet: config.supabase.serviceRoleKeySet,
      serviceRoleKeyPreview: config.supabase.serviceRoleKeyPreview
    },
    vercel: {
      env: config.vercel.env
    }
  };
}

export function maskSecret(value) {
  const normalized = readString(value);
  if (!normalized) return "";
  if (normalized.length < 12) return "set";
  return `${normalized.slice(0, 4)}...${normalized.slice(-4)}`;
}

function readString(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function readNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readBoolean(value) {
  return String(value).toLowerCase() === "true";
}
