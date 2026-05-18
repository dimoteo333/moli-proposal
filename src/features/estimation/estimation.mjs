import { deepClone, nowIso, roundOne, stableId } from "../../lib/ids.mjs";

const BASE_MM = {
  functional: 2.8,
  non_functional: 1.2,
  security: 1.8,
  infrastructure: 2.5,
  migration: 3.4,
  proposal_item: 1.9,
  documentation: 0.7
};

const ROLE_TEMPLATES = {
  functional: { pm: 0.08, architect: 0.1, backend: 0.34, frontend: 0.28, data: 0.04, infra: 0.02, security: 0.04, qa: 0.1 },
  non_functional: { pm: 0.1, architect: 0.22, backend: 0.24, frontend: 0.12, data: 0.04, infra: 0.12, security: 0.04, qa: 0.12 },
  security: { pm: 0.08, architect: 0.16, backend: 0.12, frontend: 0.02, data: 0.02, infra: 0.16, security: 0.34, qa: 0.1 },
  infrastructure: { pm: 0.08, architect: 0.2, backend: 0.04, frontend: 0, data: 0.02, infra: 0.52, security: 0.1, qa: 0.04 },
  migration: { pm: 0.08, architect: 0.12, backend: 0.16, frontend: 0, data: 0.44, infra: 0.08, security: 0.04, qa: 0.08 },
  proposal_item: { pm: 0.1, architect: 0.14, backend: 0.26, frontend: 0.24, data: 0.14, infra: 0.04, security: 0.02, qa: 0.06 },
  documentation: { pm: 0.28, architect: 0.12, backend: 0.06, frontend: 0.04, data: 0.02, infra: 0.02, security: 0.02, qa: 0.44 }
};

export function estimateAnalysis(analysis, options = {}) {
  const next = deepClone(analysis);
  const budget = options.procurementNotice?.budgetKRW ?? next.project.budgetKRW;
  const months = options.procurementNotice?.contractPeriodMonths ?? next.project.contractPeriodMonths;

  next.requirements = next.requirements.map((requirement) => estimateRequirement(requirement));
  next.functionPointCandidates = buildFunctionPointCandidates(next.requirements);
  next.estimation = buildEstimationSummary(next.requirements, {
    budget,
    months,
    procurementNotice: options.procurementNotice,
    historicalProjects: options.historicalProjects
  });
  next.status = "estimated";
  next.updatedAt = nowIso();
  next.versions = [
    ...(next.versions || []),
    {
      id: stableId("version", `${next.id}-estimate-${next.versions?.length || 0}`),
      event: "estimate_generated",
      createdAt: nowIso(),
      note: "Deterministic multi-layer MM estimate generated"
    }
  ];
  return next;
}

export function applyRequirementOverride(analysis, requirementId, override) {
  const next = deepClone(analysis);
  const requirement = next.requirements.find((item) => item.id === requirementId);
  if (!requirement) throw new Error(`Unknown requirement: ${requirementId}`);

  if (typeof override.included === "boolean") {
    requirement.included = override.included;
  }

  if (Number.isFinite(override.estimatedMM)) {
    const original = requirement.userOverride?.originalAIValue ?? requirement.estimatedMM.recommended;
    requirement.userOverride = {
      originalAIValue: original,
      estimatedMM: override.estimatedMM,
      reason: override.reason || "사용자 직접 수정",
      createdAt: nowIso()
    };
    requirement.estimatedMM = {
      min: roundOne(override.estimatedMM * 0.85),
      recommended: roundOne(override.estimatedMM),
      max: roundOne(override.estimatedMM * 1.2)
    };
    requirement.roleSplit = splitRoles(requirement.type, requirement.estimatedMM.recommended);
  }

  next.estimation = buildEstimationSummary(next.requirements, {
    budget: next.project.budgetKRW,
    months: next.project.contractPeriodMonths
  });
  next.packageSummary = null;
  next.updatedAt = nowIso();
  next.versions = [
    ...(next.versions || []),
    {
      id: stableId("version", `${next.id}-override-${requirementId}-${Date.now()}`),
      event: Number.isFinite(override.estimatedMM) ? "manual_mm_override" : "requirement_toggle",
      createdAt: nowIso(),
      requirementId,
      note: override.reason || "Checklist change"
    }
  ];
  return next;
}

function estimateRequirement(requirement) {
  const recommended = recommendedMM(requirement);
  const min = roundOne(recommended * (requirement.riskLevel === "high" ? 0.7 : 0.78));
  const max = roundOne(recommended * (requirement.riskLevel === "high" ? 1.45 : 1.28));
  return {
    ...requirement,
    estimatedMM: { min, recommended, max },
    roleSplit: splitRoles(requirement.type, recommended),
    assumptions: [
      {
        layer: "Requirement-based",
        description: `${typeLabel(requirement.type)} 기준 기본 공수와 키워드 보정을 적용했습니다.`,
        evidenceRefs: requirement.evidenceRefs
      },
      {
        layer: "Risk multiplier",
        description: `${riskLabel(requirement.riskLevel)} 리스크와 신뢰도 ${Math.round(requirement.confidence * 100)}%를 반영했습니다.`,
        evidenceRefs: requirement.evidenceRefs
      }
    ]
  };
}

function recommendedMM(requirement) {
  const base = BASE_MM[requirement.type] ?? 1.5;
  let factor = 1;
  if (/AI|모델|GPU|MLOps|예측|상담/.test(requirement.title)) factor += 0.65;
  if (/이중화|클라우드|운영, 검증, 개발|환경/.test(requirement.title)) factor += 0.28;
  if (/개인정보|접근|권한|취약점|MFA|감사/.test(requirement.title)) factor += 0.22;
  if (/이관|첨부파일|데이터셋/.test(requirement.title)) factor += 0.3;
  if (requirement.riskLevel === "high") factor += 0.18;
  if (requirement.aiRecommendation === "human_review") factor += 0.12;
  return roundOne(base * factor);
}

function splitRoles(type, mm) {
  const template = ROLE_TEMPLATES[type] || ROLE_TEMPLATES.functional;
  return Object.fromEntries(
    Object.entries(template).map(([role, share]) => [role, roundOne(mm * share)])
  );
}

function buildEstimationSummary(requirements, context) {
  const included = requirements.filter((requirement) => requirement.included);
  const totalMM = sumMM(included);
  const confidenceScore = included.length
    ? Math.round((included.reduce((sum, requirement) => sum + requirement.confidence, 0) / included.length) * 100)
    : 0;
  const riskScore = Math.min(100, Math.round(included.reduce((sum, requirement) => {
    const risk = requirement.riskLevel === "high" ? 8 : requirement.riskLevel === "medium" ? 4 : 1.5;
    return sum + risk;
  }, 0)));
  const impliedMM = context.budget
    ? roundOne((context.budget * (context.procurementNotice?.softwarePortionRatio ?? 0.72)) / 12500000)
    : null;

  return {
    totalMM,
    includedRequirementCount: included.length,
    budgetAdequacyScore: impliedMM ? Math.max(0, Math.min(100, Math.round((impliedMM / totalMM.recommended) * 100))) : null,
    riskScore,
    confidenceScore,
    methodology: {
      requirementBasedApplied: true,
      functionPointCandidateApplied: true,
      kosaApplied: true,
      isbsgApplied: true,
      procurementReverseApplied: Boolean(context.budget),
      internalCalibrationApplied: Boolean(context.historicalProjects?.some((project) => project.validated))
    },
    assumptions: [
      {
        layer: "KOSA",
        description: "KOSA 기준 역할 단가를 직접 확정하지 않고 12.5M KRW/MM 검토 기준으로 예산 역산만 수행했습니다.",
        value: "12.5M KRW/MM 검토 기준"
      },
      {
        layer: "ISBSG",
        description: "생산성 범위는 요구사항 복잡도와 리스크 등급에 따라 min/recommended/max 범위로 표현했습니다.",
        value: `${totalMM.min}-${totalMM.max} MM`
      },
      {
        layer: "Procurement reverse",
        description: context.budget ? "공고 예산과 사업 기간으로 예산 적정성을 역산했습니다." : "예산 정보가 없어 역산 레이어를 건너뛰었습니다.",
        value: impliedMM ? `${impliedMM} implied MM` : "skipped"
      },
      {
        layer: "Internal historical",
        description: context.historicalProjects?.some((project) => project.validated)
          ? "검증된 내부 과거 프로젝트를 보정 참고값으로만 사용했습니다."
          : "검증된 내부 과거 프로젝트가 없어 보정을 적용하지 않았습니다.",
        value: context.historicalProjects?.some((project) => project.validated) ? "applied" : "not_applied"
      }
    ],
    rateTableVersion: "MOLI-2026.1"
  };
}

function sumMM(requirements) {
  return requirements.reduce((total, requirement) => ({
    min: roundOne(total.min + requirement.estimatedMM.min),
    recommended: roundOne(total.recommended + requirement.estimatedMM.recommended),
    max: roundOne(total.max + requirement.estimatedMM.max)
  }), { min: 0, recommended: 0, max: 0 });
}

function buildFunctionPointCandidates(requirements) {
  return requirements
    .filter((requirement) => requirement.type === "functional" || requirement.type === "proposal_item")
    .map((requirement) => ({
      id: stableId("fp", requirement.id),
      requirementId: requirement.id,
      type: /대시보드|리포트|다운로드/.test(requirement.title) ? "External Output" : "External Input",
      complexity: /AI|통합|연계/.test(requirement.title) ? "high" : "medium",
      count: 1,
      provisional: true,
      evidenceRefs: requirement.evidenceRefs
    }));
}

function typeLabel(type) {
  const labels = {
    functional: "기능",
    non_functional: "비기능",
    security: "보안",
    infrastructure: "인프라",
    migration: "데이터 이관",
    proposal_item: "제안 아이템",
    documentation: "문서화"
  };
  return labels[type] || type;
}

function riskLabel(risk) {
  return risk === "high" ? "높음" : risk === "medium" ? "보통" : "낮음";
}

