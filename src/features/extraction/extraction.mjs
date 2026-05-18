import { stableId, toNumber, nowIso } from "../../lib/ids.mjs";

const FIELD_MAP = new Map([
  ["사업명", "title"],
  ["발주기관", "agency"],
  ["사업예산", "budgetKRW"],
  ["계약기간", "contractPeriodMonths"],
  ["입찰방식", "bidMethod"],
  ["제안마감일", "proposalDeadline"],
  ["업무도메인", "businessDomain"],
  ["사업유형", "projectType"]
]);

const SECTION_TYPES = [
  { pattern: /비기능 요구사항/, type: "non_functional", mandatory: true },
  { pattern: /기능 요구사항/, type: "functional", mandatory: true },
  { pattern: /보안 요구사항/, type: "security", mandatory: true },
  { pattern: /인프라 요구사항/, type: "infrastructure", mandatory: true },
  { pattern: /데이터 이관/, type: "migration", mandatory: true },
  { pattern: /제안 아이템/, type: "proposal_item", mandatory: false },
  { pattern: /산출물/, type: "documentation", mandatory: true }
];

export function extractAnalysisModel(parsedFile) {
  if (!parsedFile || parsedFile.status !== "parsed") {
    throw new Error("Cannot extract analysis from an unparsed file");
  }

  const project = extractProject(parsedFile.textBlocks);
  const evidenceById = Object.fromEntries(parsedFile.evidenceAnchors.map((anchor) => [anchor.id, anchor]));
  const requirements = extractRequirements(parsedFile.textBlocks, evidenceById);
  const missingFields = Object.entries(project)
    .filter(([, value]) => value === "unknown" || value === null)
    .map(([key]) => key);

  const analysis = {
    id: stableId("analysis", `${project.title}-${project.agency}`),
    title: project.title,
    status: "extracted",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    sourceUrl: "",
    files: [
      {
        id: parsedFile.fileId,
        name: parsedFile.fileName,
        parser: parsedFile.parser,
        status: parsedFile.status,
        confidence: parsedFile.confidence
      }
    ],
    project,
    parsedText: {
      textBlockCount: parsedFile.textBlocks.length,
      evidenceAnchorCount: parsedFile.evidenceAnchors.length
    },
    evidence: parsedFile.evidenceAnchors,
    requirements,
    infrastructureItems: requirements.filter((item) => item.type === "infrastructure"),
    proposalItems: requirements.filter((item) => item.type === "proposal_item"),
    risks: buildRisks(requirements, missingFields),
    estimation: null,
    packages: {},
    packageSummary: null,
    report: null,
    versions: [
      {
        id: stableId("version", `${project.title}-initial-extraction`),
        event: "initial_parse",
        createdAt: nowIso(),
        note: "Markdown fixture parsed and deterministically extracted"
      }
    ],
    missingFields
  };

  return analysis;
}

function extractProject(blocks) {
  const project = {
    title: "unknown",
    agency: "unknown",
    budgetKRW: null,
    contractPeriodMonths: null,
    bidMethod: "unknown",
    proposalDeadline: "unknown",
    businessDomain: "unknown",
    projectType: "unknown"
  };

  for (const block of blocks) {
    if (block.section !== "사업 개요") continue;
    const match = block.text.match(/^([^:：]+)[:：]\s*(.+)$/);
    if (!match) continue;
    const key = FIELD_MAP.get(match[1].trim());
    if (!key) continue;
    const value = match[2].trim();
    if (key === "budgetKRW") {
      project[key] = toNumber(value);
    } else if (key === "contractPeriodMonths") {
      project[key] = toNumber(value);
    } else {
      project[key] = value;
    }
  }

  return project;
}

function extractRequirements(blocks, evidenceById) {
  const requirements = [];

  for (const block of blocks) {
    if (block.type !== "list_item") continue;
    const section = SECTION_TYPES.find((candidate) => candidate.pattern.test(block.section));
    if (!section) continue;

    const evidence = evidenceById[block.evidenceRef];
    const confidence = confidenceFor(block.text, section.type, evidence?.confidence);
    const riskLevel = riskFor(block.text, section.type, confidence);
    const recommendation = recommendationFor(section, block.text, confidence);
    const requirement = {
      id: stableId("req", `${block.section}-${block.text}`),
      title: normalizeTitle(block.text),
      description: block.text,
      type: section.type,
      mandatory: section.mandatory,
      included: section.mandatory || section.type === "proposal_item",
      aiRecommendation: recommendation.value,
      recommendationReason: recommendation.reason,
      estimatedMM: null,
      roleSplit: null,
      confidence,
      riskLevel,
      evidenceRefs: evidence ? [evidence.id] : [],
      assumptions: [],
      sourceOrder: requirements.length + 1
    };
    requirements.push(requirement);
  }

  return requirements;
}

function normalizeTitle(text) {
  return text.replace(/(한다|제공한다|적용한다|구성한다|관리한다|지원한다|수행한다)\.?$/, "").trim();
}

function confidenceFor(text, type, parserConfidence = 0.8) {
  const lowConfidence = /불명확|사전 정비|확인|일부|추정/.test(text);
  const typePenalty = type === "proposal_item" ? 0.06 : 0;
  return Math.max(0.52, Math.round((parserConfidence - (lowConfidence ? 0.22 : 0) - typePenalty) * 100) / 100);
}

function riskFor(text, type, confidence) {
  if (confidence < 0.68 || /불명확|개인정보|취약점|MFA|AI|GPU|이관/.test(text)) return "high";
  if (type === "security" || type === "migration" || type === "infrastructure") return "medium";
  return "low";
}

function recommendationFor(section, text, confidence) {
  if (confidence < 0.68) {
    return {
      value: "human_review",
      reason: "원문 근거는 있으나 범위나 수량이 불명확해 사람의 검토가 필요합니다."
    };
  }
  if (section.type === "proposal_item") {
    return {
      value: /AI|대시보드|런북|교육/.test(text) ? "recommend" : "optional",
      reason: "입찰 차별화 가능성이 있어 선택 제안 항목으로 검토할 수 있습니다."
    };
  }
  if (section.mandatory) {
    return {
      value: "strong_recommend",
      reason: "RFP 본문에 명시된 필수 과업으로 기본 제안 범위에 포함해야 합니다."
    };
  }
  return {
    value: "optional",
    reason: "필수 범위는 아니지만 사업 목적과 연결되는 선택 항목입니다."
  };
}

function buildRisks(requirements, missingFields) {
  const risks = requirements
    .filter((requirement) => requirement.riskLevel === "high" || requirement.aiRecommendation === "human_review")
    .map((requirement) => ({
      id: stableId("risk", requirement.id),
      title: requirement.title,
      level: requirement.riskLevel,
      reason: requirement.recommendationReason,
      evidenceRefs: requirement.evidenceRefs
    }));

  for (const field of missingFields) {
    risks.push({
      id: stableId("risk", `missing-${field}`),
      title: `${field} 값 확인 필요`,
      level: "medium",
      reason: "RFP에서 신뢰할 수 있는 값을 찾지 못했습니다.",
      evidenceRefs: []
    });
  }

  return risks;
}
