const REQUIRED_REPORT_SECTIONS = [
  "경영진 요약",
  "사업 개요",
  "범위 해석",
  "입찰 권고",
  "요구사항 분해",
  "공수 산정 요약",
  "산정 방법론",
  "리스크 및 대응",
  "근거 부록"
];

export function validateAnalysis(analysis) {
  const errors = [];
  if (!analysis || typeof analysis !== "object") errors.push("analysis must be an object");
  if (!analysis?.id) errors.push("analysis.id is required");
  if (!analysis?.project?.title || analysis.project.title === "unknown") errors.push("project.title is required");
  if (!Array.isArray(analysis?.requirements) || analysis.requirements.length === 0) errors.push("requirements must be non-empty");

  for (const requirement of analysis?.requirements || []) {
    if (!requirement.id) errors.push("requirement.id is required");
    if (!requirement.title) errors.push(`requirement ${requirement.id} title is required`);
    if (!requirement.type) errors.push(`requirement ${requirement.id} type is required`);
    if (!requirement.estimatedMM) errors.push(`requirement ${requirement.id} estimatedMM is required`);
    if (!Number.isFinite(requirement.confidence)) errors.push(`requirement ${requirement.id} confidence is required`);
    if ((!requirement.evidenceRefs || requirement.evidenceRefs.length === 0) && requirement.aiRecommendation !== "human_review") {
      errors.push(`requirement ${requirement.id} must have evidence or human_review flag`);
    }
  }

  if (!analysis?.estimation?.totalMM) errors.push("estimation.totalMM is required");
  if (!Array.isArray(analysis?.estimation?.assumptions) || analysis.estimation.assumptions.length < 3) {
    errors.push("estimation assumptions must expose calculation layers");
  }

  return { valid: errors.length === 0, errors };
}

export function validateReport(report) {
  const errors = [];
  if (report?.language !== "ko") errors.push("report.language must be ko");
  if (!report?.markdown) errors.push("report.markdown is required");
  if (!report?.emailDraft?.subject || !report?.emailDraft?.body) errors.push("email draft subject and body are required");
  for (const section of REQUIRED_REPORT_SECTIONS) {
    if (!report?.markdown?.includes(`## ${section}`)) errors.push(`missing report section: ${section}`);
  }
  if (/Executive Summary|Bid\/No-Bid|Generated Report/.test(report?.markdown || "")) {
    errors.push("report body must be Korean for this implementation");
  }
  if (!/안녕하세요|감사합니다/.test(report?.emailDraft?.body || "")) {
    errors.push("email draft body must be Korean");
  }
  return { valid: errors.length === 0, errors };
}

