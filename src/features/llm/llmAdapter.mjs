// LLM 연동 어댑터 — OpenAI 호환 GLM 엔드포인트를 서버에서만 호출한다.
//
// 동작 원칙 (docs/AI_PROVIDER_GLM.md):
// 1. 규칙 기반 파이프라인이 먼저 실행되고, LLM은 표현·요약 보강만 담당한다.
// 2. 산정 숫자는 항상 기존 산정 엔진의 결과를 기준으로 삼는다.
// 3. 호출 실패, 타임아웃, 파싱 오류는 절대 전파하지 않고 결정적 결과로 폴백한다.
// 4. API 키는 서버 런타임 내부에만 존재하며 응답 객체에 포함되지 않는다.
//
// 활성화 조건: MOLI_ENABLE_LLM=true + GLM_API_KEY 설정 (src/lib/env.mjs 의 llm 블록)

export function createLlmAdapter(llmConfig = {}, { fetchImpl } = {}) {
  const config = {
    enabled: Boolean(llmConfig.enabled),
    provider: llmConfig.provider || "glm",
    apiKey: llmConfig.apiKey || "",
    baseUrl: String(llmConfig.baseUrl || "").replace(/\/+$/, ""),
    model: llmConfig.model || "glm-4.5",
    timeoutMs: Number(llmConfig.timeoutMs) > 0 ? Number(llmConfig.timeoutMs) : 20000
  };
  const doFetch = fetchImpl || globalThis.fetch;

  function disabledReason() {
    if (!config.enabled) return "MOLI_ENABLE_LLM 플래그가 꺼져 있습니다.";
    if (!config.apiKey) return "GLM_API_KEY가 설정되지 않았습니다.";
    if (!config.baseUrl) return "GLM_BASE_URL이 설정되지 않았습니다.";
    return "";
  }

  function isReady() {
    return disabledReason() === "";
  }

  // OpenAI 호환 chat/completions 호출. 실패 시 예외를 던진다 (enhance* 계열에서 폴백 처리).
  async function chat(messages, { temperature = 0.3, maxTokens = 1024 } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutMs);
    const startedAt = Date.now();
    try {
      const response = await doFetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          temperature,
          max_tokens: maxTokens
        }),
        signal: controller.signal
      });
      if (!response.ok) {
        throw new Error(`LLM 호출 실패: HTTP ${response.status}`);
      }
      const payload = await response.json();
      const content = payload?.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content.trim()) {
        throw new Error("LLM 응답에 content가 없습니다.");
      }
      return {
        content: content.trim(),
        model: payload.model || config.model,
        latencyMs: Date.now() - startedAt
      };
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error(`LLM 호출 시간 초과 (${config.timeoutMs}ms)`);
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  // 레포트 보강: 경영진 요약을 다듬고 핵심 인사이트를 뽑는다.
  // 어떤 실패도 { ok: false, reason } 으로만 반환한다.
  async function enhanceReport(analysis, report) {
    if (!isReady()) return { ok: false, reason: disabledReason() };
    try {
      const { content, model, latencyMs } = await chat(
        buildReportMessages(analysis, report),
        { temperature: 0.3, maxTokens: 900 }
      );
      const parsed = parseEnhancementContent(content);
      return { ok: true, ...parsed, model, latencyMs };
    } catch (error) {
      return { ok: false, reason: error.message };
    }
  }

  return {
    isReady,
    disabledReason,
    chat,
    enhanceReport,
    // 상태 노출용 — 키 원문은 절대 포함하지 않는다.
    describe: () => ({
      enabled: config.enabled,
      ready: isReady(),
      provider: config.provider,
      model: config.model,
      baseUrl: config.baseUrl
    })
  };
}

// 보강 결과를 레포트에 반영한다. 실패한 보강은 결정적 레포트를 그대로 유지하며
// aiEnhancement.enabled=false 와 사유만 남긴다.
export function applyLlmEnhancement(report, enhancement) {
  if (!enhancement?.ok) {
    return {
      ...report,
      aiEnhancement: { enabled: false, reason: enhancement?.reason || "보강 결과 없음" }
    };
  }
  const aiLines = [
    "## AI 보강 요약",
    enhancement.summaryKO,
    "",
    ...enhancement.insights.map((insight) => `- ${insight}`)
  ];
  return {
    ...report,
    markdown: report.markdown.replace(
      "## 경영진 요약",
      `${aiLines.join("\n")}\n\n## 경영진 요약`
    ),
    sections: ["AI 보강 요약", ...report.sections],
    aiEnhancement: {
      enabled: true,
      summaryKO: enhancement.summaryKO,
      insights: enhancement.insights,
      model: enhancement.model,
      latencyMs: enhancement.latencyMs
    }
  };
}

function buildReportMessages(analysis, report) {
  const pkgKey = analysis.packageSummary?.selectedPackage
    || analysis.packageSummary?.recommendedPackage || "M";
  const total = analysis.packages?.[pkgKey]?.totalMM || analysis.estimation.totalMM;
  const risks = (analysis.risks || []).slice(0, 3).map((risk) => `- ${risk.title}: ${risk.reason}`);

  return [
    {
      role: "system",
      content: [
        "너는 공공 SI 입찰 제안을 검토하는 시니어 컨설턴트다.",
        "모든 답변은 한국어 존댓말로 작성한다.",
        "산정 숫자(MM, 예산, 신뢰도)는 절대 바꾸지 말고 주어진 값을 그대로 인용한다.",
        "반드시 아래 JSON 형식으로만 답한다:",
        '{"summaryKO": "3문장 이내 경영진 요약", "insights": ["핵심 인사이트 1", "핵심 인사이트 2", "핵심 인사이트 3"]}'
      ].join("\n")
    },
    {
      role: "user",
      content: [
        `사업명: ${analysis.project.title}`,
        `발주기관: ${analysis.project.agency}`,
        `권장 패키지: ${pkgKey}`,
        `예상 공수: ${total.recommended.toFixed(1)} MM (범위 ${total.min.toFixed(1)}-${total.max.toFixed(1)} MM)`,
        `산정 신뢰도: ${analysis.estimation.confidenceScore}%`,
        `포함 요구사항 수: ${analysis.requirements.filter((r) => r.included).length}`,
        "주요 리스크:",
        ...(risks.length ? risks : ["- 중대한 리스크 없음"]),
        "",
        "위 결정적 산정 결과를 바탕으로 경영진 요약과 핵심 인사이트를 작성해 주세요."
      ].join("\n")
    }
  ];
}

// 모델 응답을 관대하게 파싱한다: JSON 우선, 코드펜스 제거, 실패 시 원문을 요약으로 사용.
function parseEnhancementContent(content) {
  const stripped = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  try {
    const parsed = JSON.parse(stripped);
    const summaryKO = typeof parsed.summaryKO === "string" && parsed.summaryKO.trim()
      ? parsed.summaryKO.trim()
      : stripped;
    const insights = Array.isArray(parsed.insights)
      ? parsed.insights.filter((item) => typeof item === "string" && item.trim()).slice(0, 5)
      : [];
    return { summaryKO, insights };
  } catch {
    return { summaryKO: stripped, insights: [] };
  }
}
