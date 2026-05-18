import { nowIso, stableId } from "../../lib/ids.mjs";

export function generateKoreanReport(analysis) {
  const pkgKey = analysis.packageSummary?.selectedPackage || analysis.packageSummary?.recommendedPackage || "M";
  const pkg = analysis.packages?.[pkgKey];
  const total = pkg?.totalMM || analysis.estimation.totalMM;
  const majorRisks = analysis.risks?.slice(0, 5) || [];
  const included = analysis.requirements.filter((requirement) => requirement.included);
  const evidenceMap = Object.fromEntries((analysis.evidence || []).map((evidence) => [evidence.id, evidence]));

  const markdown = [
    `# ${analysis.project.title} 제안 검토 보고서`,
    "",
    "## 경영진 요약",
    `${analysis.project.agency}의 ${analysis.project.title} 사업은 ${packageLabel(pkgKey)} 전략 기준으로 검토하는 것이 적합합니다. 예상 공수는 ${total.recommended.toFixed(1)} MM이며 범위는 ${total.min.toFixed(1)}-${total.max.toFixed(1)} MM입니다.`,
    "",
    "## 사업 개요",
    `- 발주기관: ${analysis.project.agency}`,
    `- 사업예산: ${formatKRW(analysis.project.budgetKRW)}`,
    `- 계약기간: ${analysis.project.contractPeriodMonths ?? "확인 필요"}개월`,
    `- 입찰방식: ${analysis.project.bidMethod}`,
    `- 제안 마감일: ${analysis.project.proposalDeadline}`,
    "",
    "## 범위 해석",
    `${included.length}개 요구사항을 제안 범위에 포함했습니다. 필수 요구사항은 기본 포함하고, 선택 제안 항목은 평가 차별화 가능성과 리스크를 기준으로 패키지에 반영했습니다.`,
    "",
    "## 입찰 권고",
    `${packageLabel(pkgKey)} 패키지를 우선 검토하되, 예산 압박이 발생하면 선택 제안 아이템을 줄여 Small 범위로 낮출 수 있습니다.`,
    "",
    "## 요구사항 분해",
    ...included.slice(0, 12).map((requirement) => `- ${requirement.title}: ${requirement.estimatedMM.recommended.toFixed(1)} MM, ${riskLabel(requirement.riskLevel)}, 근거 ${requirement.evidenceRefs.length}건`),
    "",
    "## 공수 산정 요약",
    `- 최소: ${total.min.toFixed(1)} MM`,
    `- 권장: ${total.recommended.toFixed(1)} MM`,
    `- 최대: ${total.max.toFixed(1)} MM`,
    `- 신뢰도: ${analysis.estimation.confidenceScore}%`,
    `- 예산 적정성: ${analysis.estimation.budgetAdequacyScore ?? "확인 필요"}`,
    "",
    "## 산정 방법론",
    ...analysis.estimation.assumptions.map((assumption) => `- ${assumption.layer}: ${assumption.description}`),
    "",
    "## 인프라 및 비용 가정",
    "- 공공 클라우드 또는 기존 운영 환경 제약은 인프라 요구사항에 별도 공수로 반영했습니다.",
    "- KOSA 단가를 최종 견적 단가로 확정하지 않고 예산 역산 검토 기준으로만 사용했습니다.",
    "",
    "## 제안 차별화 항목",
    ...analysis.requirements
      .filter((requirement) => requirement.type === "proposal_item")
      .map((requirement) => `- ${requirement.title}: ${requirement.included ? "포함" : "제외"} (${requirement.recommendationReason})`),
    "",
    "## WBS",
    "- 착수 및 요구사항 확정: 2주",
    "- 설계 및 아키텍처 확정: 4주",
    "- 기능 개발 및 연계: 12주",
    "- 보안/인프라 구성: 6주",
    "- 통합 테스트 및 안정화: 6주",
    "- 교육 및 인수인계: 2주",
    "",
    "## 투입 계획",
    `- 권장 투입: ${pkg?.recommendedStaffing || "PM, 아키텍트, 백엔드, 프론트엔드, 데이터, 인프라, 보안, QA 역할 혼합"}`,
    "- 고위험 요구사항은 사전 질의와 가정 명시 후 제안서에 반영합니다.",
    "",
    "## 리스크 및 대응",
    ...(majorRisks.length ? majorRisks.map((risk) => `- ${risk.title}: ${risk.reason}`) : ["- 현재 고위험 항목은 제한적입니다."]),
    "",
    "## 사람 검토가 필요한 질문",
    ...humanReviewQuestions(analysis),
    "",
    "## 근거 부록",
    ...evidenceAppendix(included, evidenceMap),
    "",
    `생성 시각: ${nowIso()}`
  ].join("\n");

  const emailDraft = {
    subject: `[제안 검토] ${analysis.project.title} (${packageLabel(pkgKey)}, ${total.recommended.toFixed(1)} MM)`,
    to: "review-lead@example.org",
    body: [
      "안녕하세요.",
      "",
      `${analysis.project.title} 사업에 대한 1차 제안 검토 결과를 공유드립니다.`,
      "",
      `권장 패키지: ${packageLabel(pkgKey)}`,
      `예상 공수: ${total.recommended.toFixed(1)} MM (범위 ${total.min.toFixed(1)}-${total.max.toFixed(1)} MM)`,
      `주요 리스크: ${majorRisks[0]?.title || "중대한 리스크 없음"}`,
      "",
      "첨부된 보고서의 요구사항별 근거와 산정 가정을 확인해 주시고, 조정이 필요한 항목을 회신 부탁드립니다.",
      "",
      "감사합니다.",
      "MOLI 공공제안 에이전트"
    ].join("\n")
  };

  return {
    id: stableId("report", `${analysis.id}-${pkgKey}`),
    language: "ko",
    format: "markdown",
    markdown,
    emailDraft,
    generatedAt: nowIso(),
    sections: [
      "경영진 요약",
      "사업 개요",
      "범위 해석",
      "입찰 권고",
      "요구사항 분해",
      "공수 산정 요약",
      "산정 방법론",
      "인프라 및 비용 가정",
      "제안 차별화 항목",
      "WBS",
      "투입 계획",
      "리스크 및 대응",
      "사람 검토가 필요한 질문",
      "근거 부록"
    ]
  };
}

function formatKRW(value) {
  return Number.isFinite(value) ? `${value.toLocaleString("ko-KR")}원` : "확인 필요";
}

function packageLabel(key) {
  if (key === "S") return "Small 최소 범위";
  if (key === "L") return "Large 전략 제안";
  return "Medium 균형 제안";
}

function riskLabel(level) {
  if (level === "high") return "리스크 높음";
  if (level === "medium") return "리스크 보통";
  return "리스크 낮음";
}

function humanReviewQuestions(analysis) {
  const questions = analysis.requirements
    .filter((requirement) => requirement.aiRecommendation === "human_review" || requirement.confidence < 0.7)
    .map((requirement) => `- ${requirement.title}: 범위, 수량, 책임 경계를 발주처에 확인해야 합니다.`);
  return questions.length ? questions : ["- 현재 사람 검토가 필요한 낮은 신뢰도 항목은 없습니다."];
}

function evidenceAppendix(requirements, evidenceMap) {
  const rows = [];
  for (const requirement of requirements.slice(0, 16)) {
    for (const evidenceId of requirement.evidenceRefs) {
      const evidence = evidenceMap[evidenceId];
      if (!evidence) continue;
      rows.push(`- ${requirement.title}: ${evidence.sourceFileName} ${evidence.section} ${evidence.lineStart}행, "${evidence.quote}"`);
    }
  }
  return rows.length ? rows : ["- 근거 없음"];
}

